/**
 * invitations.admin.spec.ts
 * Tests E2E — Système d'invitation, côté administrateur (INV1–INV6)
 *
 * Projet Playwright : chromium-admin
 *   (storageState admin injecté par le projet, aucun test.use() ici)
 *
 * Scénarios couverts :
 *   INV1 : Bouton "Inviter un membre" visible dans /users
 *   INV2 : Clic Inviter → modal d'invitation visible
 *   INV3 : Envoyer une invitation (email valide) → modal se ferme (succès)
 *   INV4 : Invitation en double → réponse 409 + modal reste ouverte
 *   INV5 : GET /api/invitations retourne la liste (invitation insérée en DB)
 *   INV6 : Révoquer une invitation pending → status revoked en DB
 */

import { test, expect } from "../../fixtures";
import { E2E_ADMIN } from "../../setup/e2e-credentials";
import crypto from "crypto";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Insère une invitation directement en DB et retourne le token en clair + l'id */
async function insertInvitation(
  db: import("../../fixtures/db.fixture").DbHelper,
  opts: {
    email: string;
    invitedById: number;
    status?: "pending" | "accepted" | "revoked";
    expiresInDays?: number;
  },
): Promise<{ token: string; id: number }> {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(
    Date.now() + (opts.expiresInDays ?? 7) * 24 * 60 * 60 * 1000,
  );

  const id = await db.insertOne("invitations", {
    token_hash: tokenHash,
    email: opts.email,
    invited_by: opts.invitedById,
    status: opts.status ?? "pending",
    expires_at: expiresAt,
  });

  return { token, id };
}

/** Supprime les invitations de test en DB */
async function cleanInvitations(
  db: import("../../fixtures/db.fixture").DbHelper,
  emails: string[],
): Promise<void> {
  for (const email of emails) {
    await db.query("DELETE FROM invitations WHERE email = ?", [email]);
  }
}

const TEST_INVITE_EMAIL = "invite-e2e-admin@test.local";

// ─── Tests ───────────────────────────────────────────────────────────────────

test.describe("Invitations — Admin", () => {
  test.beforeEach(async ({ db }) => {
    await cleanInvitations(db, [TEST_INVITE_EMAIL]);
  });

  test.afterEach(async ({ db }) => {
    await cleanInvitations(db, [TEST_INVITE_EMAIL]);
  });

  // ── INV1 : Bouton visible ──────────────────────────────────────────────────
  test("INV1 : bouton Inviter un membre visible dans /users", async ({
    adminPage,
  }) => {
    await adminPage.goto("/users");
    await adminPage.waitForLoadState("networkidle");

    const btn = adminPage.locator('[data-testid="btn-invite-member"]');
    await btn.waitFor({ state: "visible", timeout: 8_000 });
    await expect(btn).toBeVisible();
  });

  // ── INV2 : Ouvrir la modal ─────────────────────────────────────────────────
  test("INV2 : clic Inviter → modal d'invitation visible", async ({
    adminPage,
  }) => {
    await adminPage.goto("/users");
    await adminPage.waitForLoadState("networkidle");

    await adminPage.locator('[data-testid="btn-invite-member"]').click();

    const modal = adminPage.locator('[data-testid="invite-modal"]');
    await modal.waitFor({ state: "visible", timeout: 5_000 });
    await expect(modal).toBeVisible();
    await expect(
      adminPage.locator('[data-testid="invite-email-input"]'),
    ).toBeVisible();
    await expect(
      adminPage.locator('[data-testid="invite-submit-btn"]'),
    ).toBeVisible();
  });

  // ── INV3 : Envoyer une invitation valide ──────────────────────────────────
  test("INV3 : envoyer une invitation valide → modal se ferme (succès)", async ({
    adminPage,
  }) => {
    await adminPage.goto("/users");
    await adminPage.waitForLoadState("networkidle");

    await adminPage.locator('[data-testid="btn-invite-member"]').click();
    await adminPage
      .locator('[data-testid="invite-modal"]')
      .waitFor({ state: "visible", timeout: 5_000 });

    // Saisir l'email et soumettre
    await adminPage
      .locator('[data-testid="invite-email-input"]')
      .fill(TEST_INVITE_EMAIL);

    const responsePromise = adminPage.waitForResponse(
      (r) =>
        r.url().includes("/api/invitations") &&
        r.request().method() === "POST",
      { timeout: 10_000 },
    );
    await adminPage.locator('[data-testid="invite-submit-btn"]').click();
    const response = await responsePromise;

    expect(response.status()).toBe(201);

    // La modal doit se fermer après succès
    await adminPage
      .locator('[data-testid="invite-modal"]')
      .waitFor({ state: "hidden", timeout: 5_000 });
  });

  // ── INV4 : Double invitation → erreur 409 ────────────────────────────────
  test("INV4 : invitation en double → réponse 409 + modal reste ouverte", async ({
    adminPage,
    db,
  }) => {
    // Prérequis : invitation pending déjà en DB
    const [adminRow] = await db.query<{ id: number }>(
      "SELECT id FROM utilisateurs WHERE email = ?",
      [E2E_ADMIN.email],
    );
    await insertInvitation(db, {
      email: TEST_INVITE_EMAIL,
      invitedById: adminRow!.id,
    });

    await adminPage.goto("/users");
    await adminPage.waitForLoadState("networkidle");
    await adminPage.locator('[data-testid="btn-invite-member"]').click();
    await adminPage
      .locator('[data-testid="invite-modal"]')
      .waitFor({ state: "visible" });

    await adminPage
      .locator('[data-testid="invite-email-input"]')
      .fill(TEST_INVITE_EMAIL);

    const responsePromise = adminPage.waitForResponse(
      (r) =>
        r.url().includes("/api/invitations") &&
        r.request().method() === "POST",
      { timeout: 10_000 },
    );
    await adminPage.locator('[data-testid="invite-submit-btn"]').click();
    const response = await responsePromise;

    expect(response.status()).toBe(409);

    // La modal reste ouverte avec un message d'erreur
    await expect(
      adminPage.locator('[data-testid="invite-modal"]'),
    ).toBeVisible();
  });

  // ── INV5 : Liste des invitations ──────────────────────────────────────────
  test("INV5 : GET /api/invitations retourne la liste avec l'invitation insérée", async ({
    adminPage,
    db,
  }) => {
    // Insérer une invitation de test
    const [adminRow] = await db.query<{ id: number }>(
      "SELECT id FROM utilisateurs WHERE email = ?",
      [E2E_ADMIN.email],
    );
    await insertInvitation(db, {
      email: TEST_INVITE_EMAIL,
      invitedById: adminRow!.id,
    });

    // Naviguer vers /users pour initialiser le contexte de page (localStorage disponible)
    await adminPage.goto("/users");
    await adminPage.waitForLoadState("networkidle");

    // Appel API authentifié via fetch() dans le contexte de la page
    // (lit le JWT depuis localStorage puis ajoute l'Authorization header)
    const result = await adminPage.evaluate(async () => {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/invitations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return { status: res.status, body: await res.json() };
    });

    expect(result.status).toBe(200);
    expect(result.body.success).toBe(true);
    expect(Array.isArray(result.body.data.data)).toBe(true);
    expect(
      result.body.data.data.some(
        (i: { email: string }) => i.email === TEST_INVITE_EMAIL,
      ),
    ).toBe(true);
  });

  // ── INV6 : Révoquer une invitation ────────────────────────────────────────
  test("INV6 : révoquer une invitation pending → status revoked en DB", async ({
    adminPage,
    db,
  }) => {
    const [adminRow] = await db.query<{ id: number }>(
      "SELECT id FROM utilisateurs WHERE email = ?",
      [E2E_ADMIN.email],
    );
    const { id: invitId } = await insertInvitation(db, {
      email: TEST_INVITE_EMAIL,
      invitedById: adminRow!.id,
    });

    // Naviguer vers /users pour initialiser le contexte de page (localStorage disponible)
    await adminPage.goto("/users");
    await adminPage.waitForLoadState("networkidle");

    // Appel DELETE authentifié via fetch() dans le contexte de la page
    const result = await adminPage.evaluate(async (id: number) => {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`/api/invitations/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      return { status: res.status };
    }, invitId);

    expect(result.status).toBe(200);

    // Vérifier le statut en DB
    const [row] = await db.query<{ status: string }>(
      "SELECT status FROM invitations WHERE id = ?",
      [invitId],
    );
    expect(row?.status).toBe("revoked");
  });
});
