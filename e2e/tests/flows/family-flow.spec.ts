/**
 * family-flow.spec.ts
 * Tests E2E — Flux métier croisé : Gestion des familles (/family)
 * Phase E5
 *
 * Projet Playwright : chromium-admin (testIgnore dans playwright.config.ts)
 *
 * Scénarios :
 *   1. Le membre accède à /family → page visible.
 *   2. Famille créée en DB → visible sur /family pour le responsable.
 *   3. Flux complet (création / ajout membre) → fixme.
 */

import { test, expect } from "../../fixtures";
import { E2E_DB_USER_IDS } from "../../setup/e2e-credentials";
import type { DbHelper } from "../../fixtures/db.fixture";

// ============================================================
// Helpers
// ============================================================

async function getMemberDbId(db: DbHelper): Promise<number> {
  const rows = await db.query<{ id: number }>(
    "SELECT id FROM utilisateurs WHERE userId = ?",
    [E2E_DB_USER_IDS.member],
  );
  const id = rows[0]?.id;
  if (!id) throw new Error("Membre e2e introuvable en DB");
  return id;
}

// ============================================================
// Tests
// ============================================================

test.describe("Flux famille — E2E croisé", () => {
  // ----------------------------------------------------------
  // Test 1 : Membre accède à /family → page visible
  // ----------------------------------------------------------
  test("membre navigue vers /family → page visible", async ({ memberPage }) => {
    await memberPage.goto("/family");
    await memberPage.waitForLoadState("load");

    // La page doit charger sans redirection (families est dans ACTIVE_MODULES)
    await expect(memberPage).toHaveURL(/\/family/, { timeout: 15_000 });

    // Un contenu quelconque doit être rendu
    const pageContent = memberPage.locator("h1, h2, main, [class*='family']");
    await expect(pageContent.first()).toBeVisible({ timeout: 15_000 });
  });

  // ----------------------------------------------------------
  // Test 2 : Famille créée en DB → visible pour le membre responsable
  // ----------------------------------------------------------
  test("famille créée en DB → visible sur /family", async ({
    memberPage,
    db,
  }) => {
    const memberId = await getMemberDbId(db);
    const ts = Date.now();

    // Insérer une famille avec le membre comme participant
    // Note : la table `familles` ne possède pas de colonne responsable_id.
    // Le "responsable" est déduit du pivot membres_famille.
    const familleId = await db.insertOne("familles", {
      nom: `Famille E2E ${ts}`,
    });

    // Insérer le membre dans cette famille
    await db.insertOne("membres_famille", {
      famille_id: familleId,
      user_id: memberId,
    });

    try {
      await memberPage.goto("/family");
      await memberPage.waitForLoadState("load");

      // La famille créée doit être visible sur la page
      await expect(memberPage.getByText(`Famille E2E ${ts}`)).toBeVisible({
        timeout: 15_000,
      });
    } finally {
      // Nettoyage
      await db.query("DELETE FROM membres_famille WHERE famille_id = ?", [
        familleId,
      ]);
      await db.query("DELETE FROM familles WHERE id = ?", [familleId]);
    }
  });

  // ----------------------------------------------------------
  // Test 3 : Flux UI création famille — EmptyState → modal visible
  // ----------------------------------------------------------
  test("membre sans famille voit l'EmptyState et peut ouvrir le modal de création", async ({
    memberPage,
    db,
  }) => {
    const memberId = await getMemberDbId(db);

    // 1. Nettoyage : supprimer toute famille existante pour ce membre
    const existingFamilies = await db.query<{ famille_id: number }>(
      "SELECT DISTINCT famille_id FROM membres_famille WHERE user_id = ?",
      [memberId],
    );
    if (existingFamilies.length > 0) {
      const familleIds = existingFamilies.map((r) => r.famille_id);
      const placeholders = familleIds.map(() => "?").join(",");
      await db.query(
        `DELETE FROM membres_famille WHERE famille_id IN (${placeholders})`,
        familleIds,
      );
      await db.query(
        `DELETE FROM familles WHERE id IN (${placeholders})`,
        familleIds,
      );
    }

    // 2. Naviguer vers /family
    await memberPage.goto("/family");
    await memberPage.waitForLoadState("load");
    await expect(memberPage).toHaveURL(/\/family/, { timeout: 15_000 });

    // 3. Vérifier l'EmptyState : le bouton de création doit être visible
    const createBtn = memberPage.locator('[data-testid="family-create-btn"]');
    await expect(createBtn).toBeVisible({ timeout: 15_000 });

    // 4. Cliquer sur le bouton pour ouvrir le modal
    await createBtn.click();

    // 5. Attendre que le formulaire soit visible
    const createForm = memberPage.locator('[data-testid="family-create-form"]');
    await expect(createForm).toBeVisible({ timeout: 10_000 });

    // 6. Vérifier la présence des champs du formulaire
    await expect(memberPage.locator("#first_name")).toBeVisible();
    await expect(memberPage.locator("#last_name")).toBeVisible();
    await expect(memberPage.locator("#date_of_birth")).toBeVisible();

    // Vérifier le bouton de soumission
    await expect(
      memberPage.locator('[data-testid="family-create-submit"]'),
    ).toBeVisible();

    // 7. Fermer le modal via Escape sans soumettre
    await memberPage.keyboard.press("Escape");
    await expect(createForm).not.toBeVisible({ timeout: 5_000 });
  });

  // ----------------------------------------------------------
  // Test 4 : Admin retire un membre via le panneau admin → membre ne voit
  //          plus la famille dans son onglet "Ma famille"
  // ----------------------------------------------------------
  test("responsable retire un membre → membre ne voit plus la famille", async ({
    adminPage,
    memberPage,
    db,
  }) => {
    const memberDbId = await getMemberDbId(db);
    const ts = Date.now();

    // ── 1. Seed : famille + membre ────────────────────────────────────────
    const familleId = await db.insertOne("familles", {
      nom: `Famille Retrait ${ts}`,
    });

    // Ajouter uniquement le membre e2e à cette famille
    await db.insertOne("membres_famille", {
      famille_id: familleId,
      user_id: memberDbId,
      role: "autre",
      est_responsable: false,
    });

    try {
      // ── 2. Flux admin : retrait via le panneau d'administration ──────────
      await adminPage.goto("/family");
      await adminPage.waitForLoadState("load");
      await expect(adminPage).toHaveURL(/\/family/, { timeout: 15_000 });

      // Basculer sur l'onglet administration (id="tab-admin" dans TabGroup)
      await adminPage.locator("#tab-admin").click();

      // Rechercher la famille par son nom pour éviter les problèmes de pagination
      const searchInput = adminPage.locator(
        '[data-testid="families-search-input"]',
      );
      await expect(searchInput).toBeVisible({ timeout: 10_000 });
      await searchInput.fill(`Famille Retrait ${ts}`);

      // Attendre que le bouton "voir membres" de la famille apparaisse
      const viewMembersBtn = adminPage.locator(
        `[data-testid="family-members-btn-${familleId}"]`,
      );
      await expect(viewMembersBtn).toBeVisible({ timeout: 15_000 });
      await viewMembersBtn.click();

      // Attendre que le bouton de retrait du membre soit visible dans la modal
      const removeMemberBtn = adminPage.locator(
        `[data-testid="remove-member-btn-${memberDbId}"]`,
      );
      await expect(removeMemberBtn).toBeVisible({ timeout: 10_000 });

      // Déclencher le retrait et attendre la réponse API
      const [deleteResponse] = await Promise.all([
        adminPage.waitForResponse(
          (resp) =>
            resp
              .url()
              .includes(`/families/${familleId}/members/${memberDbId}`) &&
            resp.request().method() === "DELETE" &&
            resp.status() === 200,
          { timeout: 15_000 },
        ),
        removeMemberBtn.click(),
      ]);

      expect(deleteResponse.ok()).toBe(true);

      // ── 3. Flux membre : vérifier que la famille a disparu ───────────────
      await memberPage.goto("/family");
      await memberPage.waitForLoadState("load");
      await expect(memberPage).toHaveURL(/\/family/, { timeout: 15_000 });

      // La famille ne doit plus apparaître
      await expect(
        memberPage.getByText(`Famille Retrait ${ts}`),
      ).not.toBeVisible({ timeout: 10_000 });
    } finally {
      // ── Nettoyage (au cas où la suppression via UI aurait échoué) ────────
      await db.query("DELETE FROM membres_famille WHERE famille_id = ?", [
        familleId,
      ]);
      await db.query("DELETE FROM familles WHERE id = ?", [familleId]);
    }
  });
});
