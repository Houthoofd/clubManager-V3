/**
 * reservations.professor.spec.ts
 * Tests E2E — Flux professeur : Gestion des réservations
 */

import { test, expect } from "../../fixtures";

test.describe("Professor Reservations Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Navigation vers la page de réservations en tant que professeur
    await page.goto("/reservations");
    await page.waitForURL("**/reservations");
    await expect(page.getByTestId("reservations-page")).toBeVisible();
  });

  test("devrait afficher les réservations des membres et la zone de filtres", async ({ page }) => {
    // Un prof doit voir la zone de filtre
    await expect(page.getByRole("combobox")).toBeVisible();
    
    // Un prof doit voir la colonne "Membre"
    await expect(page.getByRole('columnheader', { name: 'Membre' })).toBeVisible();

    // Il doit voir la réservation de l'admin et du membre (ex: e2e_member)
    await expect(page.getByText("e2e_member").first()).toBeVisible();
  });

  test("ne devrait pas avoir accès au bouton de création de réservation", async ({ page }) => {
    // Le bouton de création est réservé à l'administrateur
    await expect(page.getByTestId("btn-create-reservation")).not.toBeVisible();
  });
});
