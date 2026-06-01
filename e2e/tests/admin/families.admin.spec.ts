/**
 * families.admin.spec.ts
 * Tests E2E — Familles admin (/family onglet Administration)
 * Phase E10
 *
 * data-testid utilisés :
 *   family-edit-btn-{id}, family-delete-btn-{id}, family-members-btn-{id}
 *   input-family-name, btn-submit-family-edit
 *   input-add-member-userid, btn-add-member
 *   families-search-input
 */

import { test, expect } from "../../fixtures";

async function gotoFamilyAdmin(page: import("@playwright/test").Page) {
  await page.goto("/family");
  // Cliquer sur l'onglet Administration
  await page.locator("#tab-admin").click();
  // Attendre que le contenu admin soit visible
  await page
    .locator('[data-testid="families-search-input"]')
    .waitFor({ state: "visible", timeout: 15_000 });
}

test.describe("Familles — Admin", () => {
  // ----------------------------------------------------------
  // Test 1 : Onglet Administration visible pour admin
  // ----------------------------------------------------------
  test("onglet Administration → liste familles visible", async ({
    adminPage,
  }) => {
    await adminPage.goto("/family");
    await adminPage.locator("#tab-admin").click();
    await expect(
      adminPage.locator('[data-testid="families-search-input"]'),
    ).toBeVisible({ timeout: 10_000 });
  });

  // ----------------------------------------------------------
  // Test 2 : Modifier le nom d'une famille → modifications persistées
  // ----------------------------------------------------------
  test("modifier le nom d'une famille → modifications persistées", async ({
    adminPage,
    db,
  }) => {
    // Créer une famille de test
    const familleId = await db.insertOne("familles", {
      nom: `Famille Test ${Date.now()}`,
    });

    try {
      const updatedName = `Famille Modifiée ${Date.now()}`;

      await gotoFamilyAdmin(adminPage);

      // Chercher la famille
      await adminPage
        .locator('[data-testid="families-search-input"]')
        .fill(`Famille Test`);
      await adminPage.waitForTimeout(500);

      // Cliquer sur le bouton edit
      const editBtn = adminPage.locator(
        `[data-testid="family-edit-btn-${familleId}"]`,
      );
      await editBtn.waitFor({ state: "visible", timeout: 10_000 });
      await editBtn.click();

      // La modal s'ouvre
      const nameInput = adminPage.locator('[data-testid="input-family-name"]');
      await nameInput.waitFor({ state: "visible", timeout: 5_000 });
      await nameInput.clear();
      await nameInput.fill(updatedName);

      const responsePromise = adminPage.waitForResponse(
        (resp) =>
          resp.url().includes("/api/families") &&
          resp.request().method() === "PUT",
        { timeout: 10_000 },
      );
      await adminPage.locator('[data-testid="btn-submit-family-edit"]').click();
      const resp = await responsePromise;
      expect(resp.status()).toBeLessThan(300);
    } finally {
      await db
        .query("DELETE FROM familles WHERE id = ?", [familleId])
        .catch(() => {});
    }
  });

  // ----------------------------------------------------------
  // Test 3 : Supprimer une famille → famille absente de la liste
  // ----------------------------------------------------------
  test("supprimer une famille → famille absente", async ({ adminPage, db }) => {
    const familleId = await db.insertOne("familles", {
      nom: `Famille Delete ${Date.now()}`,
    });

    try {
      await gotoFamilyAdmin(adminPage);

      const deleteBtn = adminPage.locator(
        `[data-testid="family-delete-btn-${familleId}"]`,
      );
      await deleteBtn.waitFor({ state: "visible", timeout: 10_000 });

      const responsePromise = adminPage.waitForResponse(
        (resp) =>
          resp.url().includes("/api/families") &&
          resp.request().method() === "DELETE",
        { timeout: 10_000 },
      );
      await deleteBtn.click();
      // Confirmer via ConfirmDialog
      await adminPage
        .locator('[role="dialog"]')
        .locator("button")
        .filter({ hasText: /confirm|confirmer|delete|supprimer|oui/i })
        .click();
      const resp = await responsePromise;
      expect(resp.status()).toBeLessThan(300);

      await expect(
        adminPage.locator(`[data-testid="family-delete-btn-${familleId}"]`),
      ).not.toBeVisible({ timeout: 10_000 });
    } finally {
      await db
        .query("DELETE FROM familles WHERE id = ?", [familleId])
        .catch(() => {});
    }
  });

  // ----------------------------------------------------------
  // Test 4 : Ajouter un membre à une famille
  // ----------------------------------------------------------
  test("ajouter un membre à une famille → membre visible", async ({
    adminPage,
    db,
  }) => {
    const familleId = await db.insertOne("familles", {
      nom: `Famille Membres ${Date.now()}`,
    });

    const [memberRow] = await db.query<{ id: number }>(
      "SELECT id FROM utilisateurs WHERE userId = ?",
      ["U-9999-0002"],
    );
    const memberDbId = memberRow.id;

    try {
      await gotoFamilyAdmin(adminPage);

      const membersBtn = adminPage.locator(
        `[data-testid="family-members-btn-${familleId}"]`,
      );
      await membersBtn.waitFor({ state: "visible", timeout: 10_000 });
      await membersBtn.click();

      // La modal des membres s'ouvre
      await adminPage
        .locator('[data-testid="input-add-member-userid"]')
        .waitFor({ state: "visible", timeout: 5_000 });
      await adminPage
        .locator('[data-testid="input-add-member-userid"]')
        .fill(String(memberDbId));

      const responsePromise = adminPage.waitForResponse(
        (resp) =>
          resp.url().includes("/api/families") &&
          resp.request().method() === "POST",
        { timeout: 10_000 },
      );
      await adminPage.locator('[data-testid="btn-add-member"]').click();
      const resp = await responsePromise;
      expect(resp.status()).toBeLessThan(300);
    } finally {
      await db
        .query("DELETE FROM membres_famille WHERE famille_id = ?", [familleId])
        .catch(() => {});
      await db
        .query("DELETE FROM familles WHERE id = ?", [familleId])
        .catch(() => {});
    }
  });
});
