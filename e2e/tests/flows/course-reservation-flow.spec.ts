import { test, expect } from '@playwright/test';

test.describe('Course Reservation and Attendance Flow', () => {
  test.describe.configure({ mode: 'serial' });

  test('Member reserves a spot in a course', async ({ browser }) => {
    const memberContext = await browser.newContext({ baseURL: 'http://localhost:5174' });
    const memberPage = await memberContext.newPage();

    await memberPage.goto('/login');
    await memberPage.fill('[data-testid="login-userid-input"]', 'e2e_member@test.local');
    await memberPage.fill('[data-testid="login-password-input"]', 'Member@E2E2024!');
    await memberPage.click('[data-testid="login-submit-btn"]');

    // Naviguer vers le calendrier
    await memberPage.goto('/courses');

    // Trouver un cours disponible et s'y inscrire
    const firstCourse = memberPage.locator('.course-card:has-text("S\'inscrire")').first();
    // Cliquer sur le bouton s'inscrire
    await firstCourse.locator('button:has-text("S\'inscrire")').click();

    // Confirmer l'inscription dans la modale
    await memberPage.click('button:has-text("Confirmer")');

    // Succès
    await expect(memberPage.locator('text="Inscription confirmée"')).toBeVisible();

    await memberContext.close();
  });

  test('Professor logs in and marks attendance', async ({ browser }) => {
    const profContext = await browser.newContext({ baseURL: 'http://localhost:5174' });
    const profPage = await profContext.newPage();

    await profPage.goto('/login');
    await profPage.fill('[data-testid="login-userid-input"]', 'e2e_prof@test.local');
    await profPage.fill('[data-testid="login-password-input"]', 'Prof@E2E2024!');
    await profPage.click('[data-testid="login-submit-btn"]');

    // Professeur va sur son calendrier
    await profPage.goto('/professor/courses');

    // Sélectionne le cours
    const course = profPage.locator('.course-card').first();
    await course.locator('button:has-text("Gérer la séance")').click();

    // Trouve l'élève (member) dans la liste d'appel
    const studentRow = profPage.locator('tr:has-text("e2e_member@test.local")');
    // Coche la présence
    await studentRow.locator('input[type="checkbox"]').check();

    // Sauvegarde l'appel
    await profPage.click('button:has-text("Enregistrer les présences")');

    // Succès
    await expect(profPage.locator('text="Présences mises à jour"')).toBeVisible();

    await profContext.close();
  });
});
