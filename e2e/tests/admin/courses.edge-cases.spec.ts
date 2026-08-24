/**
 * courses.edge-cases.spec.ts
 * Tests E2E — Flux admin : Edge cases pour la gestion des cours
 */

import { test, expect } from "../../fixtures";

async function gotoCourses(page: import("@playwright/test").Page) {
  await page.route("**/api/users/*/tutorials", async (route, req) => {
    if (req.method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, tutorials: ['courses_admin_intro', 'courses_user_intro'] }),
      });
    } else {
      await route.continue();
    }
  });

  await page.goto("/courses");
  await page.addStyleTag({ content: '#react-joyride-portal { display: none !important; }' });
  await page.locator('[data-testid="courses-page"]').waitFor({ state: "visible", timeout: 15_000 });
}

test.describe("Cours — Flux admin — Edge Cases", () => {
  test("Génération de sessions en double sur la même période (Mock 409)", async ({
    adminPage,
  }) => {
    await adminPage.route("**/api/courses/sessions/generate", async (route) => {
      await route.fulfill({
        status: 409,
        contentType: "application/json",
        body: JSON.stringify({ message: "Des sessions existent déjà sur cette période." }),
      });
    });

    // Mock GET before gotoCourses
    await adminPage.route("**/api/courses", async (route, req) => {
      if (req.method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: [{ id: 9999, type_cours: "Krav Maga", jour_semaine: 1, heure_debut: "10:00:00", heure_fin: "11:00:00", active: true, professeurs_noms: [] }]
          }),
        });
      } else {
        await route.continue();
      }
    });

    await gotoCourses(adminPage);
    await adminPage.locator('[data-testid="course-generate-sessions-btn"]').waitFor({ state: "visible" });
    await adminPage.locator('[data-testid="course-generate-sessions-btn"]').click();
    
    await adminPage.locator('[data-testid="generate-courses-form"]').waitFor({ state: "visible" });
    await adminPage.locator('[data-testid="generate-recurrent-select"]').selectOption("9999");
    await adminPage.locator('[data-testid="generate-date-debut-input"]').fill("2026-01-01");
    await adminPage.locator('[data-testid="generate-date-fin-input"]').fill("2026-12-31");
    
    await adminPage.locator('[data-testid="generate-courses-submit-btn"]').click();

    // Verify error toast or alert banner
    const toast = adminPage.locator('[data-sonner-toast]');
    await expect(toast).toBeVisible({ timeout: 5000 });
    expect(await toast.textContent()).toContain("Des sessions existent");
  });

  test("Suppression d'un cours récurrent ayant des sessions générées (Mock 400)", async ({
    adminPage,
  }) => {
    await adminPage.route("**/api/courses", async (route, req) => {
      if (req.method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: [{ id: 9998, type_cours: "Boxe", jour_semaine: 2, heure_debut: "12:00:00", heure_fin: "13:00:00", active: true, professeurs_noms: [] }]
          }),
        });
      } else {
        await route.continue();
      }
    });

    await adminPage.route("**/api/courses/9998", async (route, req) => {
      if (req.method() === "DELETE") {
        await route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify({ message: "Impossible de supprimer ce cours car des sessions futures y sont rattachées." }),
        });
      } else {
        await route.continue();
      }
    });

    await gotoCourses(adminPage);

    await adminPage.locator(`[data-testid="course-delete-btn-9998"]`).waitFor({ state: "visible" });
    await adminPage.locator(`[data-testid="course-delete-btn-9998"]`).click();

    const confirmBtn = adminPage.locator(`[data-testid="course-delete-btn-9998-confirm-btn"]`);
    const confirmBtnVisible = await confirmBtn.isVisible({ timeout: 1_000 }).catch(() => false);

    if (confirmBtnVisible) {
      await confirmBtn.click();
    } else {
      await adminPage.locator('[role="dialog"]').waitFor({ state: "visible" });
      await adminPage.locator('[role="dialog"]').locator("button").last().click();
    }

    const toast = adminPage.locator('[data-sonner-toast]');
    await expect(toast).toBeVisible({ timeout: 5000 });
    expect(await toast.textContent()).toContain("Impossible de supprimer");
  });

  test("Unassigning a professor right before their class causes error (Mock 409)", async ({
    adminPage,
  }) => {
    // We mock the professor unassign endpoint (assuming it's DELETE /api/courses/professors/ID or similar)
    await adminPage.route("**/api/courses/professors/*", async (route, req) => {
      if (req.method() === "DELETE") {
        await route.fulfill({
          status: 409,
          contentType: "application/json",
          body: JSON.stringify({ message: "Le professeur est assigné à une session imminente." }),
        });
      } else {
        await route.continue();
      }
    });

    await adminPage.route("**/api/courses/professors", async (route, req) => {
      if (req.method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: [{ id: 777, nom_complet: "Prof Edge", email: "prof@edge.com", telephone: "", actif: true }]
          }),
        });
      } else {
        await route.continue();
      }
    });

    await gotoCourses(adminPage);
    await adminPage.locator("#tab-professeurs").click();

    await adminPage.locator(`[data-testid="professor-delete-btn-777"]`).waitFor({ state: "visible" });
    await adminPage.locator(`[data-testid="professor-delete-btn-777"]`).click();

    // Confirm dialog
    await adminPage.locator('[role="dialog"]').waitFor({ state: "visible" });
    await adminPage.locator('[role="dialog"]').locator("button").last().click();

    const toast = adminPage.locator('[data-sonner-toast]');
    await expect(toast).toBeVisible({ timeout: 5000 });
    expect(await toast.textContent()).toContain("imminente");
  });
});
