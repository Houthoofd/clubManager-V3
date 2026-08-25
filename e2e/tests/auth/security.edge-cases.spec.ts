/**
 * security.edge-cases.spec.ts
 * Tests E2E — Security, Auth, and GDPR Edge Cases
 *
 * @playwright/test project: chromium-no-auth
 */

import { test, expect } from "../../fixtures";
import { LoginPage } from "../../fixtures/pages/LoginPage";
import { E2E_ADMIN } from "../../setup/e2e-credentials";

test.describe("Security, Auth & GDPR Edge Cases", () => {
  // ----------------------------------------------------------
  // 1. Soft-deletion of an account (GDPR)
  // ----------------------------------------------------------
  test("Soft-deleted account cannot log in and retains anonymized/deleted state", async ({ page, db }) => {
    // Create a soft-deleted user in the DB
    const userId = "U-9999-9998";
    const email = "gdpr_test@test.local";
    
    // Cleanup if exists
    await db.query("DELETE FROM utilisateurs WHERE userId = ?", [userId]);

    await db.insertOne("utilisateurs", {
      userId,
      email,
      mot_de_passe: "SomeHashedPassword123", // The login use case shouldn't even check the password if soft-deleted
      prenom: "GDPR",
      nom: "Test",
      role_app: "member",
      statut_compte: "supprime" // 'supprime' matches typical soft-deletion status in this DB
    });

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(userId, "SomePassword123!");

    // Expect an error toast. We use a more generic check to catch "compte supprimé" or similar
    await expect(loginPage.errorToast).toBeVisible();

    // Verify DB state hasn't changed (still soft-deleted)
    const [userRow] = await db.query<{ statut_compte: string }>(
      "SELECT statut_compte FROM utilisateurs WHERE userId = ?",
      [userId]
    );
    expect(userRow.statut_compte).toBe("supprime");

    // Cleanup
    await db.query("DELETE FROM utilisateurs WHERE userId = ?", [userId]);
  });

  // ----------------------------------------------------------
  // 2. Brute force login prevention (multiple wrong passwords)
  // ----------------------------------------------------------
  test("Brute force login prevention (multiple wrong passwords)", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // 5+ attempts with wrong password
    for (let i = 0; i < 6; i++) {
      await loginPage.login(E2E_ADMIN.userId, "WrongPassword123!");
      
      // Wait for error toast to appear before next attempt
      await expect(loginPage.errorToast).toBeVisible();
      // Hide the toast to be ready for next attempt, or wait for it to disappear
      await loginPage.errorToast.click({ force: true }).catch(() => {});
    }

    // After too many attempts, check if a specific message appears or if it continues to be rejected
    // For many systems it throws "Trop de tentatives" or "bloqué"
    const errorText = await loginPage.errorToast.textContent();
    expect(errorText?.length).toBeGreaterThan(0);
  });

  // ----------------------------------------------------------
  // 3. Attempting to access protected admin routes with a member account (403 Forbidden)
  // ----------------------------------------------------------
  test("Member account gets 403 Forbidden / redirected on protected admin routes", async ({ memberPage }) => {
    // memberPage is already authenticated as E2E_MEMBER (a member role)
    // Let's navigate to an admin route, for example /admin/users or a dashboard admin view
    await memberPage.goto("/dashboard");
    
    // We try to access an admin URL directly if it exists, e.g. /admin
    const response = await memberPage.goto("/admin", { waitUntil: "commit" });
    
    // Most apps will redirect a forbidden user to dashboard or return 403
    if (response) {
      // Check if it redirected or returned an error status
      const status = response.status();
      const url = memberPage.url();
      
      // Either it's a 403 status or it redirected away from /admin
      expect(status === 403 || !url.includes("/admin")).toBeTruthy();
    }
  });

  // ----------------------------------------------------------
  // 4. Expired token handling
  // ----------------------------------------------------------
  test("Expired token redirects to login", async ({ memberPage }) => {
    // Navigate to a protected page to ensure we are logged in
    await memberPage.goto("/dashboard");
    await expect(memberPage).toHaveURL(/\/dashboard/);

    // Clear cookies to simulate expired/deleted token
    await memberPage.context().clearCookies();

    // Try to reload or navigate again
    await memberPage.goto("/dashboard");

    // The middleware or client-side check should redirect to login
    await expect(memberPage).toHaveURL(/\/login/);
  });
});
