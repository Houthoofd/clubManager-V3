/**
 * edge-cases.spec.ts
 * Tests E2E — Edge cases for Auth module
 *
 * @playwright/test project: chromium-no-auth
 */

import { test, expect } from "../../fixtures";
import { E2E_ADMIN, E2E_DB_USER_IDS } from "../../setup/e2e-credentials";
import crypto from "crypto";

// ============================================================
// Helpers
// ============================================================

/** Insère une invitation et retourne l'URL avec token */
async function gotoRegister(
  page: import("@playwright/test").Page,
  db: import("../../fixtures/db.fixture").DbHelper,
  email: string
): Promise<void> {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  
  const [adminRow] = await db.query<{ id: number }>(
    "SELECT id FROM utilisateurs WHERE email = ?",
    [E2E_ADMIN.email]
  );

  await db.insertOne("invitations", {
    token_hash: tokenHash,
    email: email,
    invited_by: adminRow!.id,
    status: "pending",
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  await page.goto(`/register?token=${token}`);
  await page.waitForLoadState("domcontentloaded");
}

// ============================================================
// Tests
// ============================================================

test.describe("Auth Edge Cases", () => {
  // ----------------------------------------------------------
  // Test 1 : Invalid/Expired password reset token
  // ----------------------------------------------------------
  test("invalid or expired password reset token shows error", async ({ page }) => {
    await page.goto("/reset-password?token=invalid_token");
    
    // The form should be visible
    await expect(
      page.locator('[data-testid="reset-password-form"]')
    ).toBeVisible({ timeout: 10_000 });

    // Fill the new password
    await page
      .locator('[data-testid="input-new-password"]')
      .pressSequentially("NewPassword1!");
    await page
      .locator('[data-testid="input-confirm-password"]')
      .pressSequentially("NewPassword1!");

    // Submit the form
    await page.locator('[data-testid="btn-submit-reset"]').click();

    // Verify error toast/message is displayed
    const errorVisible = await page
      .locator('[data-sonner-toast][data-type="error"]')
      .waitFor({ state: "visible", timeout: 10_000 })
      .then(() => true)
      .catch(() => false);

    expect(errorVisible).toBe(true);
  });

  // ----------------------------------------------------------
  // Test 2 : Username/Email Conflict during registration
  // ----------------------------------------------------------
  test("register with already taken username (email) shows error", async ({ page, db }) => {
    // 1. Register the first user
    const email = `conflict_user_${Date.now()}@test.local`;
    await gotoRegister(page, db, email);
    await page.locator('[data-testid="register-firstname-input"]').fill("John");
    await page.locator('[data-testid="register-lastname-input"]').fill("Doe");
    await page.locator('[data-testid="register-username-input"]').fill("johndoe");
    await page.locator('[data-testid="register-dob-input"]').fill("1990-01-01");
    await page.waitForFunction(
      () =>
        (document.querySelector("#genre_id") as HTMLSelectElement)?.options
          .length > 1,
      { timeout: 8_000 }
    );
    await page.selectOption("#genre_id", { index: 1 });
    await page.locator('[data-testid="register-password-input"]').fill("ValidPass@E2E2024!");
    await page.locator('[data-testid="register-submit-btn"]').click();
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });

    // 2. Try to register a second user with the same email
    // This simulates the scenario where an invitation was sent to an already registered email,
    // or a user tries to register again with the same email.
    await gotoRegister(page, db, email);
    await page.locator('[data-testid="register-firstname-input"]').fill("Jane");
    await page.locator('[data-testid="register-lastname-input"]').fill("Doe");
    await page.locator('[data-testid="register-username-input"]').fill("janedoe");
    await page.locator('[data-testid="register-dob-input"]').fill("1992-02-02");
    await page.waitForFunction(
      () =>
        (document.querySelector("#genre_id") as HTMLSelectElement)?.options
          .length > 1,
      { timeout: 8_000 }
    );
    await page.selectOption("#genre_id", { index: 1 });
    await page.locator('[data-testid="register-password-input"]').fill("ValidPass@E2E2024!");
    await page.locator('[data-testid="register-submit-btn"]').click();

    // Expect an error toast for conflict
    const errorVisible = await page
      .locator('[data-sonner-toast][data-type="error"]')
      .waitFor({ state: "visible", timeout: 10_000 })
      .then(() => true)
      .catch(() => false);

    expect(errorVisible).toBe(true);
  });
});

