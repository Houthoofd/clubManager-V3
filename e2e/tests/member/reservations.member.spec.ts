/**
 * reservations.member.spec.ts
 * Tests E2E — Flux membre : Gestion des réservations
 */

import { test, expect } from "../../fixtures";
import { E2E_DB_USER_IDS } from "../../setup/e2e-credentials";

test.describe("Member Reservations Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Navigation vers la page de réservations (vérifier si le header a un lien direct, sinon via dashboard)
    // On peut naviguer directement via l'URL
    await page.goto("/reservations");
    await page.waitForURL("**/reservations");
    // S'assurer que le tableau est chargé
    await expect(page.getByTestId("reservations-page")).toBeVisible();
    await expect(page.getByTestId("reservations-table")).toBeVisible();
  });

  test("devrait afficher la liste des réservations du membre", async ({ page }) => {
    // Vérifier la présence du badge de statut confirmé pour la réservation de seed
    // Le seed a créé une réservation sur le cours 9999 (type_cours = 'karate')
    await expect(page.getByText("karate").first()).toBeVisible();
  });

  test("devrait pouvoir annuler une réservation existante", async ({ page }) => {
    // Intercepter la requête d'annulation
    const cancelPromise = page.waitForResponse(
      (resp) => resp.url().includes("/reservations/") && resp.request().method() === "PATCH" && resp.status() === 200
    );

    // On clique sur le bouton d'annulation (le premier disponible)
    const cancelBtn = page.locator('[data-testid^="btn-cancel-reservation-"]').first();
    await expect(cancelBtn).toBeVisible();
    await cancelBtn.click();

    // Modale de confirmation
    // On cible le bouton explicitement dans la modale
    const confirmBtn = page.getByRole("dialog").getByRole("button", { name: /Annuler/i });
    await expect(confirmBtn).toBeVisible();
    await confirmBtn.click();

    // Attendre la réponse
    await cancelPromise;
  });

  test("ne devrait pas avoir accès aux fonctionnalités administrateur", async ({ page }) => {
    // Vérifier l'absence du bouton de création
    await expect(page.getByTestId("btn-create-reservation")).not.toBeVisible();

    // Vérifier l'absence de la zone de filtres statut
    await expect(page.getByRole("combobox")).not.toBeVisible();

    // Vérifier l'absence de la colonne "Membre"
    await expect(page.getByRole('columnheader', { name: 'Membre' })).not.toBeVisible();
    
    // Vérifier que le nom du prof n'apparait pas (isolement des données)
    // Le prof s'appelle "e2e_prof"
    await expect(page.getByText("e2e_prof")).not.toBeVisible();
  });
});
