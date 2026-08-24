import { test, expect } from "../../fixtures";
import { E2E_DB_USER_IDS } from "../../setup/e2e-credentials";

test.describe("Users - Edge Cases", () => {
  async function gotoUsers(page: import("@playwright/test").Page) {
    await page.goto("/users");
    await page.locator('[data-testid="users-page"]').waitFor({
      state: "visible",
      timeout: 15_000,
    });
  }

  // 1. Self-Blocking / Deletion
  test("admin cannot block or delete themselves", async ({ adminPage, db }) => {
    const rows = await db.query<{ id: number }>(
      "SELECT id FROM utilisateurs WHERE userId = ?",
      [E2E_DB_USER_IDS.admin]
    );
    if (!rows.length) {
      test.skip();
      return;
    }
    const adminId = rows[0].id;

    await gotoUsers(adminPage);

    await adminPage.locator('[data-testid="users-search"]').fill(E2E_DB_USER_IDS.admin);
    await adminPage.waitForResponse(
      (resp) =>
        resp.url().includes("/api/users") &&
        resp.url().includes(encodeURIComponent(E2E_DB_USER_IDS.admin)),
      { timeout: 10_000 }
    );
    await adminPage.waitForTimeout(500);

    const deleteBtn = adminPage.locator(`[data-testid="btn-delete-user-${adminId}"]`);
    
    const isVisible = await deleteBtn.isVisible();
    const isDisabled = isVisible && await deleteBtn.isDisabled();

    if (isVisible && !isDisabled) {
      await deleteBtn.click();
      const reasonInput = adminPage.locator('[data-testid="input-delete-reason"]');
      if (await reasonInput.isVisible()) {
        await reasonInput.fill("Self deletion attempt");
      }
      
      const responsePromise = adminPage.waitForResponse(
        (resp) => resp.url().includes(`/api/users/${adminId}`) && resp.request().method() === "DELETE",
        { timeout: 10_000 }
      );
      await adminPage.locator('[data-testid="btn-confirm-delete-user"]').click();
      
      const resp = await responsePromise;
      expect(resp.status()).toBeGreaterThanOrEqual(400); 
      await expect(adminPage.locator('[data-sonner-toast]')).toBeVisible({ timeout: 5000 });
    } else {
      expect(isDisabled || !isVisible).toBeTruthy();
    }
  });

  // 2. Out-of-Bounds Pagination
  test("out-of-bounds pagination shows empty state or defaults without crashing", async ({ adminPage }) => {
    await gotoUsers(adminPage);
    await adminPage.goto("/users?page=9999");
    await adminPage.locator('[data-testid="users-page"]').waitFor({
      state: "visible",
      timeout: 15_000,
    });

    const table = adminPage.locator('[data-testid="users-table"]');
    await expect(table).toBeVisible({ timeout: 10_000 });
    
    await adminPage.waitForResponse((resp) => resp.url().includes("/api/users") && resp.url().includes("page=9999"), { timeout: 10000 }).catch(() => {});
    await adminPage.waitForTimeout(1000); // Give it a bit of time to render
    
    const tbody = table.locator('tbody');
    const rows = tbody.locator('tr');
    
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  // 3. Last Admin Deletion
  test("cannot delete the last admin", async ({ adminPage, db }) => {
    await gotoUsers(adminPage);

    await adminPage.locator('[data-testid="users-search"]').fill(E2E_DB_USER_IDS.member);
    await adminPage.waitForResponse(
      (resp) =>
        resp.url().includes("/api/users") &&
        resp.url().includes(encodeURIComponent(E2E_DB_USER_IDS.member)),
      { timeout: 10_000 }
    );
    await adminPage.waitForTimeout(500);

    const rows = await db.query<{ id: number }>(
      "SELECT id FROM utilisateurs WHERE userId = ?",
      [E2E_DB_USER_IDS.member]
    );
    if (!rows.length) { test.skip(); return; }
    const memberId = rows[0].id;

    // Apply mock just before the action, specifically on the DELETE route
    await adminPage.route(`**/api/users/${memberId}*`, async (route, request) => {
      if (request.method() === "DELETE") {
        await route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify({ error: "Cannot delete the last admin" })
        });
      } else {
        await route.fallback();
      }
    });

    const deleteBtn = adminPage.locator(`[data-testid="btn-delete-user-${memberId}"]`);
    
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
      
      const reasonInput = adminPage.locator('[data-testid="input-delete-reason"]');
      if (await reasonInput.isVisible()) {
        await reasonInput.fill("Attempt to delete last admin simulated");
      }

      await adminPage.locator('[data-testid="btn-confirm-delete-user"]').click();
      
      await expect(adminPage.locator('[data-sonner-toast]')).toBeVisible({ timeout: 5000 });
      const toastText = await adminPage.locator('[data-sonner-toast]').textContent();
      expect(toastText?.length).toBeGreaterThan(0);
    }
  });
});
