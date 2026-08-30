import { test, expect } from "../../fixtures";

test.describe("Profile and Settings Edge Cases", () => {
  // Test 1: Editing profile information
  test("Editing profile information", async ({ memberPage }) => {
    await memberPage.goto("/profile");
    
    // Attendre que la page soit visible
    await expect(memberPage.locator('[data-testid="profile-save-btn"]')).toBeVisible({ timeout: 10_000 });

    // Modifier le prénom
    await memberPage.locator('[data-testid="profile-firstname-input"]').fill("JaneEdge");
    
    // Sauvegarder
    const responsePromise = memberPage.waitForResponse(
      (resp) => resp.url().includes("/profile") && resp.request().method() === "PATCH",
      { timeout: 10_000 },
    );
    await memberPage.locator('[data-testid="profile-save-btn"]').click();
    const resp = await responsePromise;
    expect(resp.status()).toBeLessThan(300);
    
    // Vérifier que le toast de succès apparaît
    await expect(memberPage.locator("text=/Profil mis à jour/i")).toBeVisible({ timeout: 10_000 });
  });

  // Test 2: Uploading a profile picture (simulated)
  test("Uploading a profile picture (simulated)", async ({ memberPage }) => {
    await memberPage.goto("/profile");
    
    await expect(memberPage.locator('[data-testid="profile-save-btn"]')).toBeVisible({ timeout: 10_000 });
    
    // Remplir l'URL de la photo (Simulation d'upload en entrant une URL)
    await memberPage.locator('input#photo_url').fill("https://example.com/avatar.jpg");
    
    const responsePromise = memberPage.waitForResponse(
      (resp) => resp.url().includes("/profile") && resp.request().method() === "PATCH",
      { timeout: 10_000 },
    );
    await memberPage.locator('[data-testid="profile-save-btn"]').click();
    const resp = await responsePromise;
    expect(resp.status()).toBeLessThan(300);
    
    await expect(memberPage.locator("text=/Profil mis à jour/i")).toBeVisible({ timeout: 10_000 });
  });

  // Test 3: Changing preferences/settings
  test("Changing preferences/settings", async ({ adminPage }) => {
    // Les préférences globales du club sont dans les paramètres pour un administrateur
    await adminPage.goto("/settings");
    
    await expect(adminPage.locator('[data-testid="settings-page"]')).toBeVisible({ timeout: 10_000 });
    
    // Naviguer vers l'onglet "apparence" pour changer une préférence
    await adminPage.locator('button:has-text("Apparence")').click();
    
    // Remplir une nouvelle couleur primaire
    await adminPage.locator('input[name="theme_primary_color"]').fill("#3b82f6");
    
    // Sauvegarder
    await adminPage.locator('button:has-text("Enregistrer")').first().click();
    
    // Vérifier le message de succès
    await expect(adminPage.locator("text=/Paramètres sauvegardés|Enregistrement réussi/i").first()).toBeVisible({ timeout: 10_000 });
  });

  // Test 4: Trying to change email to an already taken email
  test("Trying to change email to an already taken email", async ({ memberPage, db }) => {
    // On s'assure qu'un autre utilisateur avec cet email existe
    const takenEmail = "taken@example.com";
    await db.query(
      `INSERT IGNORE INTO utilisateurs (userId, email, first_name, last_name, role_app) 
       VALUES ('U-TAKEN', ?, 'Taken', 'User', 'member')`,
      [takenEmail]
    );

    await memberPage.goto("/profile");
    await memberPage.locator("#tab-security").click();
    await memberPage
      .locator('[data-testid="profile-security-tab"]')
      .waitFor({ state: "visible", timeout: 10_000 });

    await memberPage.locator('[data-testid="input-new-email"]').fill(takenEmail);
    await memberPage.locator('[data-testid="input-confirm-email"]').fill(takenEmail);

    const responsePromise = memberPage.waitForResponse(
      (resp) => resp.url().includes("/api/auth/change-email") && resp.request().method() === "POST",
      { timeout: 10_000 },
    );
    await memberPage.locator('[data-testid="btn-submit-change-email"]').click();
    
    const resp = await responsePromise;
    // L'API devrait retourner une erreur (400 ou 409)
    expect(resp.status()).toBeGreaterThanOrEqual(400);

    // Vérifier que le message d'erreur est affiché à l'utilisateur
    await expect(memberPage.locator("text=/Cet email est déjà utilisé|Email indisponible/i")).toBeVisible({ timeout: 10_000 });
  });
});
