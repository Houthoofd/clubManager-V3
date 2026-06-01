/**
 * settings.grades.spec.ts
 * Tests E2E — Gestion des grades (/settings onglet Grades)
 * Phase E10
 *
 * data-testid utilisés :
 *   grades-manager, btn-create-grade
 *   grade-row-{id}, btn-edit-grade-{id}, btn-delete-grade-{id}
 *   grade-form-modal, input-grade-name, btn-submit-grade
 */

import { test, expect } from "../../fixtures";

async function gotoGrades(page: import("@playwright/test").Page) {
  await page.goto("/settings");
  // Naviguer vers l'onglet Grades si nécessaire
  const gradesManager = page.locator('[data-testid="grades-manager"]');
  const isVisible = await gradesManager
    .isVisible({ timeout: 5_000 })
    .catch(() => false);
  if (!isVisible) {
    // Chercher le tab grades dans les onglets settings
    const gradesTab = page
      .locator(
        '[data-testid^="tab-grades"], button:has-text("Grades"), button:has-text("grades")',
      )
      .first();
    const tabExists = await gradesTab
      .isVisible({ timeout: 3_000 })
      .catch(() => false);
    if (tabExists) await gradesTab.click();
  }
  await page
    .locator('[data-testid="grades-manager"]')
    .waitFor({ state: "visible", timeout: 15_000 });
}

test.describe("Paramètres — Grades", () => {
  // Nettoyage préventif des grades orphelins laissés par de précédents runs
  test.beforeEach(async ({ db }) => {
    await db
      .query(
        "DELETE FROM grades WHERE nom LIKE 'Grade E2E %' OR nom LIKE 'Grade Edit %' OR nom LIKE 'Grade Delete %' OR nom LIKE 'Grade Modifi% %'",
      )
      .catch(() => {});
  });
  // ----------------------------------------------------------
  // Test 1 : Onglet Grades → GradesManager visible
  // ----------------------------------------------------------
  test("onglet Grades → GradesManager visible", async ({ adminPage }) => {
    await gotoGrades(adminPage);
    await expect(
      adminPage.locator('[data-testid="grades-manager"]'),
    ).toBeVisible();
    await expect(
      adminPage.locator('[data-testid="btn-create-grade"]'),
    ).toBeVisible();
  });

  // ----------------------------------------------------------
  // Test 2 : Créer un grade → grade visible dans la liste
  // ----------------------------------------------------------
  test("créer un grade → grade visible dans la liste", async ({
    adminPage,
    db,
  }) => {
    const uniqueName = `Grade E2E ${Date.now()}`;
    const uniqueOrdre = String((Date.now() % 800) + 100); // ordre 100-899 unique

    await gotoGrades(adminPage);
    await adminPage.locator('[data-testid="btn-create-grade"]').click();
    await adminPage
      .locator('[data-testid="grade-form-modal"]')
      .waitFor({ state: "visible", timeout: 10_000 });

    await adminPage.locator("#grade-nom").fill(uniqueName);
    // Remplir l'ordre (champ obligatoire)
    await adminPage.locator("#grade-ordre").fill(uniqueOrdre);

    const responsePromise = adminPage.waitForResponse(
      (resp) =>
        resp.url().includes("/api/grades") &&
        resp.request().method() === "POST",
      { timeout: 10_000 },
    );
    await adminPage.locator('[data-testid="btn-submit-grade"]').click();
    const resp = await responsePromise;
    expect(resp.status()).toBeLessThan(300);

    try {
      await expect(
        adminPage
          .locator('[data-testid="grades-manager"]')
          .getByText(uniqueName),
      ).toBeVisible({ timeout: 10_000 });
    } finally {
      await db
        .query("DELETE FROM grades WHERE nom = ?", [uniqueName])
        .catch(() => {});
    }
  });

  // ----------------------------------------------------------
  // Test 3 : Modifier un grade → nom mis à jour
  // ----------------------------------------------------------
  test("modifier un grade → nom mis à jour", async ({ adminPage, db }) => {
    const id = await db.insertOne("grades", {
      nom: `Grade Edit ${Date.now()}`,
      ordre: (Date.now() % 800) + 200, // ordre dynamique pour éviter les conflits
    });

    try {
      const updatedName = `Grade Modifié ${Date.now()}`;

      await gotoGrades(adminPage);
      // Scroller vers l'élément si nécessaire (liste peut être longue)
      const gradeRow = adminPage.locator(`[data-testid="grade-row-${id}"]`);
      await gradeRow.waitFor({ state: "attached", timeout: 10_000 });
      await gradeRow.scrollIntoViewIfNeeded();
      await gradeRow.waitFor({ state: "visible", timeout: 5_000 });

      await adminPage.locator(`[data-testid="btn-edit-grade-${id}"]`).click();
      await adminPage
        .locator('[data-testid="grade-form-modal"]')
        .waitFor({ state: "visible", timeout: 10_000 });

      const nameInput = adminPage.locator("#grade-nom");
      await nameInput.clear();
      await nameInput.fill(updatedName);

      const responsePromise = adminPage.waitForResponse(
        (resp) =>
          resp.url().includes("/api/grades") &&
          resp.request().method() === "PUT",
        { timeout: 10_000 },
      );
      await adminPage.locator('[data-testid="btn-submit-grade"]').click();
      const resp = await responsePromise;
      expect(resp.status()).toBeLessThan(300);

      await expect(
        adminPage
          .locator('[data-testid="grades-manager"]')
          .getByText(updatedName),
      ).toBeVisible({ timeout: 10_000 });
    } finally {
      await db.query("DELETE FROM grades WHERE id = ?", [id]).catch(() => {});
    }
  });

  // ----------------------------------------------------------
  // Test 4 : Supprimer un grade → grade absent
  // ----------------------------------------------------------
  test("supprimer un grade → grade absent", async ({ adminPage, db }) => {
    const id = await db.insertOne("grades", {
      nom: `Grade Delete ${Date.now()}`,
      ordre: (Date.now() % 800) + 300, // ordre dynamique pour éviter les conflits
    });

    try {
      await gotoGrades(adminPage);
      // Scroller vers l'élément si nécessaire
      const gradeRowDel = adminPage.locator(`[data-testid="grade-row-${id}"]`);
      await gradeRowDel.waitFor({ state: "attached", timeout: 10_000 });
      await gradeRowDel.scrollIntoViewIfNeeded();
      await gradeRowDel.waitFor({ state: "visible", timeout: 5_000 });

      const responsePromise = adminPage.waitForResponse(
        (resp) =>
          resp.url().includes("/api/grades") &&
          resp.request().method() === "DELETE",
        { timeout: 10_000 },
      );
      await adminPage.locator(`[data-testid="btn-delete-grade-${id}"]`).click();
      // Confirmer dans ConfirmDialog
      await adminPage
        .locator('[role="dialog"]')
        .locator("button")
        .filter({ hasText: /confirm|confirmer|delete|supprimer|oui/i })
        .click();
      const resp = await responsePromise;
      expect(resp.status()).toBeLessThan(300);

      await expect(
        adminPage.locator(`[data-testid="grade-row-${id}"]`),
      ).not.toBeVisible({ timeout: 10_000 });
    } finally {
      await db.query("DELETE FROM grades WHERE id = ?", [id]).catch(() => {});
    }
  });
});
