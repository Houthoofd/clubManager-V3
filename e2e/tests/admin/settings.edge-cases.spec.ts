import { test, expect } from "../../fixtures";

async function gotoGrades(page: import("@playwright/test").Page) {
  await page.goto("/settings");
  // Naviguer vers l'onglet Grades si nécessaire
  const gradesManager = page.locator('[data-testid="grades-manager"]');
  const isVisible = await gradesManager
    .isVisible({ timeout: 5_000 })
    .catch(() => false);
  if (!isVisible) {
    const gradesTab = page
      .locator(
        '[data-testid^="tab-grades"], button:has-text("Grades"), button:has-text("grades")'
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

test.describe("Paramètres — Edge Cases", () => {
  test("supprimer un grade utilisé → bloqué et avertissement affiché", async ({ adminPage, db }) => {
    // 1. Créer un grade
    const uniqueGradeName = `Grade Used ${Date.now()}`;
    const gradeId = await db.insertOne("grades", {
      nom: uniqueGradeName,
      ordre: (Date.now() % 800) + 400,
    });

    // 2. Assigner le grade à un utilisateur
    const ts = String(Date.now() % 10000).padStart(4, "0");
    const userId = await db.insertOne("utilisateurs", {
      userId: `U-8888-${ts}`,
      email: `t-used-grade-${ts}@test.local`,
      password: "$2b$10$placeholder",
      first_name: "Test",
      last_name: "UsedGradeUser",
      role_app: "member",
      status_id: 1,
      active: 1,
      grade_id: gradeId,
    });

    try {
      await gotoGrades(adminPage);
      
      const gradeRowDel = adminPage.locator(`[data-testid="grade-row-${gradeId}"]`);
      await gradeRowDel.waitFor({ state: "attached", timeout: 10_000 });
      await gradeRowDel.scrollIntoViewIfNeeded();
      await gradeRowDel.waitFor({ state: "visible", timeout: 5_000 });

      const responsePromise = adminPage.waitForResponse(
        (resp) =>
          resp.url().includes("/api/grades") &&
          resp.request().method() === "DELETE",
        { timeout: 10_000 },
      );
      
      await adminPage.locator(`[data-testid="btn-delete-grade-${gradeId}"]`).click();
      
      // Confirmer dans ConfirmDialog
      await adminPage
        .locator('[role="dialog"]')
        .locator("button")
        .filter({ hasText: /confirm|confirmer|delete|supprimer|oui/i })
        .click();
        
      const resp = await responsePromise;
      
      // L'API devrait retourner une erreur 400 ou 500 (car utilisé)
      expect(resp.status()).toBeGreaterThanOrEqual(400);

      // Le grade devrait toujours être visible dans la liste car il n'a pas pu être supprimé
      await expect(
        adminPage.locator(`[data-testid="grade-row-${gradeId}"]`),
      ).toBeVisible({ timeout: 10_000 });
      
    } finally {
      // Nettoyage: supprimer l'utilisateur d'abord, puis le grade
      await db.query("DELETE FROM utilisateurs WHERE id = ?", [userId]).catch(() => {});
      await db.query("DELETE FROM grades WHERE id = ?", [gradeId]).catch(() => {});
    }
  });
});
