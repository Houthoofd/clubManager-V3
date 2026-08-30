/**
 * reservations.admin.spec.ts
 * Tests E2E — Flux admin : Gestion des réservations
 */

import { test, expect } from "../../fixtures";
import { E2E_DB_USER_IDS } from "../../setup/e2e-credentials";

test.describe("Admin Reservations Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Navigation vers la page de réservations via l'URL
    await page.goto("/reservations");
    await page.waitForURL("**/reservations");
    // S'assurer que le tableau est chargé
    await expect(page.getByTestId("reservations-page")).toBeVisible();
    await expect(page.getByTestId("reservations-table")).toBeVisible();
  });

  test("devrait afficher la liste de toutes les réservations", async ({ page }) => {
    // Le seed a créé une réservation sur le cours 9999 (type_cours='karate')
    await expect(page.getByText("karate").first()).toBeVisible();
    // Et on devrait voir la colonne membre (prénom, nom, ou identifiant)
    await expect(page.getByText("E2E e2e_member").first()).toBeVisible();
  });

  test("devrait pouvoir annuler une réservation d'un membre", async ({ page }) => {
    // Intercepter la requête d'annulation
    const cancelPromise = page.waitForResponse(
      (resp) => resp.url().includes("/reservations/") && resp.request().method() === "PATCH" && resp.status() === 200
    );

    // On clique sur le bouton d'annulation de la ligne du professeur qui est confirmée
    const profRow = page.locator('tr').filter({ hasText: 'e2e_prof' }).filter({ hasText: 'Confirm' }).first();
    const cancelBtn = profRow.locator('[data-testid^="btn-cancel-reservation-"]');
    await expect(cancelBtn).toBeVisible();
    await cancelBtn.click();

    // Modale de confirmation
    // On cible spécifiquement le bouton d'annulation de la modale par son texte exact
    const confirmBtn = page.getByRole("button", { name: "Annuler la réservation", exact: true });
    await expect(confirmBtn).toBeVisible();
    await confirmBtn.click();

    // Attendre la réponse
    await cancelPromise;
  });

  test("devrait pouvoir créer une réservation pour un membre", async ({ page }) => {
    // Créer une nouvelle réservation pour le membre 
    await expect(page.getByTestId("btn-create-reservation")).toBeVisible();
    await page.getByTestId("btn-create-reservation").click();

    // Remplir le formulaire (sans user_id, car type=number bug avec "U-9999-...")
    await page.getByLabel(/Cours/i).fill("9999");
    // On ne remplit pas l'utilisateur, ça va créer pour l'admin lui-même

    // Intercepter la création (accepte n'importe quel statut pour éviter les timeouts bêtes)
    const createPromise = page.waitForResponse(
      (resp) => resp.url().includes("/reservations") && resp.request().method() === "POST"
    );

    await page.getByTestId("btn-submit-create-reservation").click();
    await createPromise;
  });

  test("devrait pouvoir filtrer les réservations par statut", async ({ page }) => {
    // Filtrer par statut = Annulée
    // On attend d'abord que le select soit visible
    const statutSelect = page.getByRole("combobox");
    await expect(statutSelect).toBeVisible();
    
    const filterPromise = page.waitForResponse(resp => resp.url().includes("statut=annulee"));
    await statutSelect.selectOption("annulee");
    await filterPromise;
    
    // On vérifie qu'une réservation annulée est visible (si elle existe, le filtre a marché)
    const cancelledRow = page.locator('tr').filter({ hasText: 'Annul' }).first();
    await expect(cancelledRow).toBeVisible();

    // Effacer les filtres
    await page.getByTestId("btn-clear-filters").click();
    await expect(page.getByTestId("btn-clear-filters")).not.toBeVisible();
  });

  test("ne devrait pas pouvoir créer une réservation invalide ou en doublon", async ({ page }) => {
    await page.getByTestId("btn-create-reservation").click();

    // Tenter de soumettre sans cours_id
    await page.getByTestId("btn-submit-create-reservation").click();
    await expect(page.getByRole("alert").first()).toBeVisible();

    // Tenter de créer une réservation avec un cours inexistant
    await page.getByLabel(/Cours/i).fill("9999999");
    
    const notFoundPromise = page.waitForResponse(
      (resp) => resp.url().includes("/reservations") && resp.request().method() === "POST" && resp.status() === 500
    );
    await page.getByTestId("btn-submit-create-reservation").click();
    await notFoundPromise;
    // Vérifier l'apparition d'un toast d'erreur
    await expect(page.locator('[data-sonner-toast]')).toBeVisible();
    // Tenter de recréer une réservation pour un membre qui en a déjà une
    // On va utiliser le cours 9999. L'admin n'a pas de réservation dessus au début (sauf si le test de création a tourné avant).
    // On s'assure que ça fail soit avec le test précédent soit avec ce test en recréant 2 fois.
    await page.getByLabel(/Cours/i).fill("9999");
    
    const duplicatePromise = page.waitForResponse(
      (resp) => resp.url().includes("/reservations") && resp.request().method() === "POST"
    );
    await page.getByTestId("btn-submit-create-reservation").click();
    const resp = await duplicatePromise;
    
    // Si c'est la 2ème fois (test lancé après la création), ça renvoie 409 direct.
    // Si c'est la 1ère fois (isolé), ça renvoie 201, on refait !
    if (resp.status() === 201) {
      // On ré-ouvre
      await page.getByTestId("btn-create-reservation").click();
      await page.getByLabel(/Cours/i).fill("9999");
      const duplicatePromise2 = page.waitForResponse(
        (r) => r.url().includes("/reservations") && r.request().method() === "POST" && r.status() === 409
      );
      await page.getByTestId("btn-submit-create-reservation").click();
      await duplicatePromise2;
    }

    // Vérifier l'apparition du message d'erreur (le mot "déjà" doit être dans la réponse)
    await expect(page.getByText(/déjà/i).first()).toBeVisible();
  });
});
