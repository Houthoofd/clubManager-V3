/**
 * invitations.register.spec.ts
 * Tests E2E — Inscription via invitation (INV7–INV10)
 *
 * Projet Playwright : chromium-no-auth
 *   (fichier dans tests/auth/ - capture par testMatch: tests/auth/.*)
 *
 * Scénarios couverts :
 *   INV7  : /register sans token → écran "invitation uniquement"
 *   INV8  : /register avec token invalide → écran "lien invalide ou expiré"
 *   INV9  : /register avec token valide → formulaire visible + email pré-rempli et locked
 *   INV10 : Flux complet — token valide → inscription réussie → redirect /login
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
    status: "pending",
    expires_at: expiresAt,
  });

  return { token, id };
}

/** Supprime les invitations et les comptes de test en DB */
async function cleanUp(
  db: import("../../fixtures/db.fixture").DbHelper,
  emails: string[],
): Promise<void> {
  for (const email of emails) {
    await db.query("DELETE FROM invitations WHERE email = ?", [email]);
    // Supprimer le compte régistration (sans filtre userId pour couvrir tous les cas)
    await db.query(
      "DELETE FROM utilisateurs WHERE email = ?",
      [email],
    );
  }
}

const TEST_INVITE_EMAIL = "invite-e2e-form@test.local";
const TEST_REGISTER_EMAIL = "invite-e2e-register@test.local";

// ─── INV7 & INV8 : Accès /register sans token / token invalide ───────────────

test.describe("Invitations — RegisterPage (sans token / token invalide)", () => {
  // ── INV7 : Pas de token → écran erreur ────────────────────────────────────
  test("INV7 : /register sans token → écran invitation uniquement", async ({
    page,
  }) => {
    await page.goto("/register");
    await page.waitForLoadState("domcontentloaded");

    const form = page.locator('[data-testid="register-form"]');
    const errorScreen = page.locator('[data-testid="register-invitation-error"]');

    // Attendre l'un ou l'autre (le spinner disparaît rapidement sans token)
    await Promise.race([
      form.waitFor({ state: "visible", timeout: 8_000 }).catch(() => {}),
      errorScreen.waitFor({ state: "visible", timeout: 8_000 }).catch(() => {}),
    ]);

    await expect(errorScreen).toBeVisible();
    await expect(form).not.toBeVisible();
  });

  // ── INV8 : Token invalide → écran erreur ──────────────────────────────────
  test("INV8 : /register avec token invalide → écran lien invalide", async ({
    page,
  }) => {
    await page.goto("/register?token=tokeninvalide1234567890abcdef");
    await page.waitForLoadState("domcontentloaded");

    const errorScreen = page.locator('[data-testid="register-invitation-error"]');
    await errorScreen.waitFor({ state: "visible", timeout: 10_000 });
    await expect(errorScreen).toBeVisible();

    // Le formulaire ne doit pas être visible
    await expect(page.locator('[data-testid="register-form"]')).not.toBeVisible();
  });
});

// ─── INV9 & INV10 : RegisterPage avec token valide ───────────────────────────

test.describe("Invitations — RegisterPage (token valide)", () => {
  test.afterEach(async ({ db }) => {
    await cleanUp(db, [TEST_INVITE_EMAIL, TEST_REGISTER_EMAIL]);
  });

  // ── INV9 : Token valide → formulaire + email pré-rempli et locked ─────────
  test("INV9 : /register avec token valide → formulaire visible + email pré-rempli", async ({
    page,
    db,
  }) => {
    // Récupérer l'id DB de l'admin e2e
    const [adminRow] = await db.query<{ id: number }>(
      "SELECT id FROM utilisateurs WHERE email = ?",
      [E2E_ADMIN.email],
    );
    const { token } = await insertInvitation(db, {
      email: TEST_INVITE_EMAIL,
      invitedById: adminRow!.id,
    });

    await page.goto(`/register?token=${token}`);
    await page.waitForLoadState("domcontentloaded");

    // Attendre que le formulaire soit visible (après validation du token côté API)
    const form = page.locator('[data-testid="register-form"]');
    await form.waitFor({ state: "visible", timeout: 10_000 });
    await expect(form).toBeVisible();

    // L'email doit être pré-rempli avec la valeur de l'invitation
    const emailInput = page.locator('[data-testid="register-email-input"]');
    await expect(emailInput).toHaveValue(TEST_INVITE_EMAIL);

    // L'email doit être en lecture seule (locked)
    await expect(emailInput).toHaveAttribute("readonly", "");
  });

  // ── INV10 : Flux complet ──────────────────────────────────────────────────
  test("INV10 : flux complet — token valide → inscription réussie → redirect /login", async ({
    page,
    db,
  }) => {
    // Récupérer l'id DB de l'admin e2e
    const [adminRow] = await db.query<{ id: number }>(
      "SELECT id FROM utilisateurs WHERE email = ?",
      [E2E_ADMIN.email],
    );
    const { token, id: invitId } = await insertInvitation(db, {
      email: TEST_REGISTER_EMAIL,
      invitedById: adminRow!.id,
    });

    // Naviguer vers le formulaire d'inscription avec le token valide
    await page.goto(`/register?token=${token}`);

    const form = page.locator('[data-testid="register-form"]');
    await form.waitFor({ state: "visible", timeout: 10_000 });

    // Remplir le formulaire
    await page.locator('[data-testid="register-firstname-input"]').fill("Invite");
    await page.locator('[data-testid="register-lastname-input"]').fill("Testeur");
    await page.locator('[data-testid="register-username-input"]').fill(`inv_user_${Date.now()}`);

    // L'email est déjà pré-rempli (readonly) — vérification rapide
    await expect(
      page.locator('[data-testid="register-email-input"]'),
    ).toHaveValue(TEST_REGISTER_EMAIL);

    // Date de naissance
    await page.locator('[data-testid="register-dob-input"]').fill("1990-06-15");

    // Genre (premier disponible dans le select)
    const genreSelect = page.locator('[data-testid="register-gender-select"]');
    const firstOption = genreSelect.locator("option").nth(1);
    const optionValue = await firstOption.getAttribute("value");
    if (optionValue) await genreSelect.selectOption(optionValue);

    // Mot de passe valide
    await page
      .locator('[data-testid="register-password-input"]')
      .fill("Invitation@E2E2024!");

    // Soumettre et attendre la réponse API
    const responsePromise = page.waitForResponse(
      (r) =>
        r.url().includes("/api/auth/register") &&
        r.request().method() === "POST",
      { timeout: 15_000 },
    );
    await page.locator('[data-testid="register-submit-btn"]').click();
    const response = await responsePromise;
    if (response.status() !== 201) {
      console.log("API Error Body:", await response.text());
    }

    expect(response.status()).toBe(201);

    // Redirection vers /login après inscription réussie
    await page.waitForURL("**/login", { timeout: 10_000 });
    expect(page.url()).toContain("/login");

    // Vérifier que l'invitation est marquée comme acceptée en DB
    const [inv] = await db.query<{ status: string }>(
      "SELECT status FROM invitations WHERE id = ?",
      [invitId],
    );
    expect(inv?.status).toBe("accepted");
  });
});
