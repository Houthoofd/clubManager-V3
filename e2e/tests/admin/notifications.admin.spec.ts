/**
 * notifications.admin.spec.ts
 * Tests E2E — Broadcast Notifications (vue admin)
 * Phase E12
 *
 * data-testid utilisés :
 *   broadcast-notification-btn → bouton "Broadcast" dans NotificationsPage
 *   broadcast-notification-form → formulaire dans BroadcastNotificationModal
 */

import { test, expect } from "../../fixtures";

async function gotoNotifications(page: import("@playwright/test").Page) {
  await page.goto("/notifications");
  await page.waitForLoadState("load");
  await page.waitForTimeout(1000);
}

test.describe("Notifications — Broadcast admin", () => {
  // ----------------------------------------------------------
  // Test 1 : Bouton Broadcast visible (admin)
  // ----------------------------------------------------------
  test("bouton Broadcast visible pour l'admin", async ({ adminPage }) => {
    await gotoNotifications(adminPage);

    await expect(
      adminPage.locator('[data-testid="broadcast-notification-btn"]'),
    ).toBeVisible({ timeout: 10_000 });
  });

  // ----------------------------------------------------------
  // Test 2 : Clic Broadcast → modal visible
  // ----------------------------------------------------------
  test("clic Broadcast → modal de broadcast visible", async ({ adminPage }) => {
    await gotoNotifications(adminPage);

    await adminPage
      .locator('[data-testid="broadcast-notification-btn"]')
      .waitFor({ state: "visible", timeout: 10_000 });
    await adminPage
      .locator('[data-testid="broadcast-notification-btn"]')
      .click();

    await expect(
      adminPage.locator('[data-testid="broadcast-notification-form"]'),
    ).toBeVisible({ timeout: 5_000 });
  });

  // ----------------------------------------------------------
  // Test 3 : Envoyer un broadcast → API appelée avec succès
  // ----------------------------------------------------------
  test("envoyer un broadcast → notification envoyée", async ({ adminPage }) => {
    await gotoNotifications(adminPage);

    await adminPage
      .locator('[data-testid="broadcast-notification-btn"]')
      .waitFor({ state: "visible", timeout: 10_000 });
    await adminPage
      .locator('[data-testid="broadcast-notification-btn"]')
      .click();

    const form = adminPage.locator('[data-testid="broadcast-notification-form"]');
    await form.waitFor({ state: "visible", timeout: 5_000 });

    // Remplir le titre
    await form
      .locator('input[type="text"]')
      .fill("Test broadcast E2E");

    // Remplir le contenu
    await form.locator("textarea").fill("Contenu du broadcast de test E2E");

    // Envoyer
    const responsePromise = adminPage.waitForResponse(
      (resp) =>
        resp.url().includes("/api/notifications") &&
        resp.url().includes("broadcast") &&
        resp.request().method() === "POST",
      { timeout: 10_000 },
    );
    await form
      .locator('button[type="submit"]')
      .click();
    const resp = await responsePromise;
    expect(resp.status()).toBeLessThan(300);
  });
});
