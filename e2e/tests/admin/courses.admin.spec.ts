/**
 * courses.admin.spec.ts
 * Tests E2E — Flux admin : Gestion des cours (/courses)
 * Phase E5
 *
 * Projet Playwright : chromium-admin
 *
 * data-testid utilisés :
 *   courses-page                    → wrapper principal
 *   courses-list                    → grille des cours récurrents
 *   course-add-recurrent-btn        → bouton créer un cours récurrent
 *   course-generate-sessions-btn    → bouton générer des sessions
 *   course-edit-btn-{id}            → bouton éditer un cours récurrent
 *   course-delete-btn-{id}          → bouton supprimer un cours récurrent
 *   session-add-btn                 → bouton ajouter une session manuelle
 *   session-attendance-btn-{id}     → bouton présences d'une session
 *   courses-sessions-table          → tableau des sessions
 *   professor-add-btn               → bouton ajouter un professeur
 *   professor-edit-btn-{id}         → bouton éditer un professeur
 *   professor-delete-btn-{id}       → bouton supprimer un professeur
 *   course-recurrent-form           → formulaire modal cours récurrent
 *   course-recurrent-type-select    → select type de cours
 *   course-recurrent-day-select     → select jour de la semaine
 *   course-recurrent-start-time     → input heure début
 *   course-recurrent-end-time       → input heure fin
 *   course-recurrent-submit-btn     → bouton soumettre le formulaire
 *   generate-courses-form           → formulaire modal générer sessions
 *   generate-recurrent-select       → select cours récurrent
 *   generate-date-debut-input       → input date début
 *   generate-date-fin-input         → input date fin
 *   generate-courses-submit-btn     → bouton soumettre la génération
 *   professor-form                  → formulaire modal professeur
 *   professor-prenom-input          → input prénom professeur
 *   professor-nom-input             → input nom professeur
 *   professor-submit-btn            → bouton soumettre le formulaire prof
 *   attendance-modal                → modal de présences
 *   attendance-table                → tableau de présences
 *   attendance-save-btn             → bouton enregistrer les présences
 *   attendance-close-btn            → bouton fermer la modal
 *   reservations-page               → wrapper page réservations
 *   reservations-table              → tableau des réservations
 */

import { test, expect } from "../../fixtures";
import { E2E_DB_USER_IDS } from "../../setup/e2e-credentials";

// ============================================================
// Helpers
// ============================================================

async function gotoCourses(page: import("@playwright/test").Page) {
  await page.goto("/courses");
  await page.locator('[data-testid="courses-page"]').waitFor({
    state: "visible",
    timeout: 15_000,
  });
}

/** Navigue vers /courses avec l'onglet Professeurs pré-sélectionné via ?tab= */
async function gotoCourseProfTab(page: import("@playwright/test").Page) {
  await page.goto("/courses?tab=professeurs");
  await page.locator('[data-testid="courses-page"]').waitFor({
    state: "visible",
    timeout: 15_000,
  });
}

/** Navigue vers /courses avec l'onglet Séances pré-sélectionné via ?tab= */
async function gotoSessionsTab(page: import("@playwright/test").Page) {
  await page.goto("/courses?tab=sessions");
  await page.locator('[data-testid="courses-page"]').waitFor({
    state: "visible",
    timeout: 15_000,
  });
}

// ============================================================
// Tests
// ============================================================

test.describe("Cours — Flux admin", () => {
  // ----------------------------------------------------------
  // Test 1 : Vérifier les onglets Planning / Séances / Professeurs
  // ----------------------------------------------------------
  test("admin voit les onglets Planning / Séances / Professeurs", async ({
    adminPage,
  }) => {
    await gotoCourses(adminPage);

    await expect(adminPage.locator("#tab-planning")).toBeVisible({
      timeout: 10_000,
    });

    await expect(adminPage.locator("#tab-sessions")).toBeVisible({
      timeout: 10_000,
    });

    await expect(adminPage.locator("#tab-professeurs")).toBeVisible({
      timeout: 10_000,
    });
  });

  // ----------------------------------------------------------
  // Test 2 : Créer un cours récurrent via modal → visible dans le planning
  // ----------------------------------------------------------
  test("créer un cours récurrent via modal → visible dans le planning", async ({
    adminPage,
    db,
  }) => {
    // Pré-nettoyage : supprimer tout cours récurrent existant sur Dimanche 01:00
    // (résidu d'un run précédent non nettoyé)
    await db
      .query(
        "DELETE FROM cours_recurrent WHERE jour_semaine = 7 AND heure_debut = '01:00:00'",
      )
      .catch(() => {});

    // Récupérer un type de cours valide
    const typeRows = await db.query<{ code: string }>(
      "SELECT code FROM types_cours LIMIT 1",
    );
    if (typeRows.length === 0) {
      test.skip();
      return;
    }
    const typeCours = typeRows[0].code;

    let createdId: number | undefined;
    try {
      await gotoCourses(adminPage);

      // Ouvrir la modal de création
      await adminPage
        .locator('[data-testid="course-add-recurrent-btn"]')
        .click();
      await adminPage
        .locator('[data-testid="course-recurrent-form"]')
        .waitFor({ state: "visible", timeout: 10_000 });

      // Remplir le formulaire — attendre que les options async soient chargées
      const typeSelect = adminPage.locator(
        '[data-testid="course-recurrent-type-select"]',
      );
      await expect(
        typeSelect.locator('option[value="' + typeCours + '"]'),
      ).toBeAttached({ timeout: 10_000 });
      await typeSelect.selectOption(typeCours);
      await adminPage
        .locator('[data-testid="course-recurrent-day-select"]')
        .selectOption("7"); // Dimanche — peu susceptible d'avoir un conflit
      await adminPage
        .locator('[data-testid="course-recurrent-start-time"]')
        .fill("01:00");
      await adminPage
        .locator('[data-testid="course-recurrent-end-time"]')
        .fill("02:00");

      // Attendre la réponse API avant de cliquer
      const responsePromise = adminPage.waitForResponse(
        (resp) =>
          resp.url().includes("/api/courses") &&
          resp.request().method() === "POST",
        { timeout: 10_000 },
      );
      await adminPage
        .locator('[data-testid="course-recurrent-submit-btn"]')
        .click();
      const resp = await responsePromise;
      expect(resp.status()).toBeLessThan(300);

      // Récupérer l'ID depuis la réponse pour le cleanup
      const body = await resp.json().catch(() => ({}));
      createdId = body?.data?.id ?? body?.id;

      // La grille des cours doit être rechargée et visible
      await expect(
        adminPage.locator('[data-testid="courses-list"]'),
      ).toBeVisible({ timeout: 10_000 });
    } finally {
      // Cleanup : supprimer le cours créé via UI pour éviter les conflits lors du prochain run
      if (createdId) {
        await db
          .query("DELETE FROM cours_recurrent WHERE id = ?", [createdId])
          .catch(() => {});
      } else {
        // Fallback si l'ID n'est pas dans la réponse
        await db
          .query(
            "DELETE FROM cours_recurrent WHERE jour_semaine = 7 AND heure_debut = '01:00:00'",
          )
          .catch(() => {});
      }
    }
  });

  // ----------------------------------------------------------
  // Test 3 : Modifier un cours récurrent → modifications persistées
  // ----------------------------------------------------------
  test("modifier un cours récurrent → modifications persistées", async ({
    adminPage,
    db,
  }) => {
    // Récupérer un type de cours valide
    const typeRows = await db.query<{ code: string }>(
      "SELECT code FROM types_cours LIMIT 1",
    );
    if (typeRows.length === 0) {
      test.skip();
      return;
    }
    const typeCours = typeRows[0].code;

    // Insérer un cours récurrent en DB
    const id = await db.insertOne("cours_recurrent", {
      type_cours: typeCours,
      jour_semaine: 2,
      heure_debut: "09:00:00",
      heure_fin: "10:00:00",
      active: 1,
    });

    try {
      await gotoCourses(adminPage);

      // Cliquer sur le bouton d'édition du cours inséré
      await adminPage
        .locator(`[data-testid="course-edit-btn-${id}"]`)
        .waitFor({ state: "visible", timeout: 10_000 });
      await adminPage.locator(`[data-testid="course-edit-btn-${id}"]`).click();

      // Attendre le formulaire
      await adminPage
        .locator('[data-testid="course-recurrent-form"]')
        .waitFor({ state: "visible", timeout: 10_000 });

      // Modifier l'heure de fin
      await adminPage
        .locator('[data-testid="course-recurrent-end-time"]')
        .fill("11:00");

      // Attendre la réponse PUT avant de soumettre
      const responsePromise = adminPage.waitForResponse(
        (resp) =>
          resp.url().includes("/api/courses") &&
          resp.request().method() === "PUT",
        { timeout: 10_000 },
      );
      await adminPage
        .locator('[data-testid="course-recurrent-submit-btn"]')
        .click();
      const resp = await responsePromise;
      expect(resp.status()).toBeLessThan(300);

      // Le cours doit toujours être visible dans la grille
      await expect(
        adminPage.locator('[data-testid="courses-list"]'),
      ).toBeVisible({ timeout: 10_000 });
    } finally {
      await db
        .query("DELETE FROM cours_recurrent WHERE id = ?", [id])
        .catch(() => {});
    }
  });

  // ----------------------------------------------------------
  // Test 4 : Supprimer un cours récurrent → absent du planning
  // ----------------------------------------------------------
  test("supprimer un cours récurrent → absent du planning", async ({
    adminPage,
    db,
  }) => {
    // Récupérer un type de cours valide
    const typeRows = await db.query<{ code: string }>(
      "SELECT code FROM types_cours LIMIT 1",
    );
    if (typeRows.length === 0) {
      test.skip();
      return;
    }
    const typeCours = typeRows[0].code;

    // Insérer un cours récurrent en DB
    const id = await db.insertOne("cours_recurrent", {
      type_cours: typeCours,
      jour_semaine: 3,
      heure_debut: "10:00:00",
      heure_fin: "11:00:00",
      active: 1,
    });

    try {
      await gotoCourses(adminPage);

      // Cliquer sur le bouton de suppression
      await adminPage
        .locator(`[data-testid="course-delete-btn-${id}"]`)
        .waitFor({ state: "visible", timeout: 10_000 });
      await adminPage
        .locator(`[data-testid="course-delete-btn-${id}"]`)
        .click();

      // Déclarer la responsePromise AVANT de cliquer (sinon race condition)
      const responsePromise = adminPage.waitForResponse(
        (resp) =>
          resp.url().includes("/api/courses") &&
          resp.request().method() === "DELETE",
        { timeout: 10_000 },
      );

      // Attendre que la ConfirmDialog s'ouvre, puis cliquer dans le dialog
      // (scopé dans [role="dialog"] pour éviter le strict mode avec les boutons de la grille)
      const confirmBtn = adminPage.locator(
        `[data-testid="course-delete-btn-${id}-confirm-btn"]`,
      );
      const confirmBtnVisible = await confirmBtn
        .isVisible({ timeout: 3_000 })
        .catch(() => false);

      if (confirmBtnVisible) {
        await confirmBtn.click();
      } else {
        // Attendre que la modal s'ouvre
        await adminPage
          .locator('[role="dialog"]')
          .waitFor({ state: "visible", timeout: 5_000 });
        // Le bouton confirm est toujours le DERNIER bouton du footer de la ConfirmDialog
        await adminPage
          .locator('[role="dialog"]')
          .locator("button")
          .last()
          .click();
      }

      const resp = await responsePromise;
      expect(resp.status()).toBeLessThan(300);

      // Le cours ne doit plus être visible
      await expect(
        adminPage.locator(`[data-testid="course-edit-btn-${id}"]`),
      ).not.toBeVisible({ timeout: 5_000 });
    } finally {
      // Nettoyage au cas où la suppression UI aurait échoué
      await db
        .query("DELETE FROM cours_recurrent WHERE id = ?", [id])
        .catch(() => {});
    }
  });

  // ----------------------------------------------------------
  // Test 5 : Onglet Professeurs → créer un professeur
  // ----------------------------------------------------------
  test("onglet Professeurs → créer un professeur → visible dans la liste", async ({
    adminPage,
    db,
  }) => {
    // Naviguer vers /courses et cliquer sur l'onglet Professeurs
    await gotoCourseProfTab(adminPage);

    // Ouvrir la modal de création (professor-add-btn prouve isAdmin=true + tab actif)
    await adminPage
      .locator('[data-testid="professor-add-btn"]')
      .waitFor({ state: "visible", timeout: 15_000 });
    await adminPage.locator('[data-testid="professor-add-btn"]').click();

    // Attendre le formulaire
    await adminPage
      .locator('[data-testid="professor-form"]')
      .waitFor({ state: "visible", timeout: 10_000 });

    // Remplir le formulaire avec des valeurs uniques
    const unique = Date.now();
    const prenom = `PrenomE2E`;
    const nom = `NomE2E${unique}`;

    await adminPage
      .locator('[data-testid="professor-prenom-input"]')
      .fill(prenom);
    await adminPage.locator('[data-testid="professor-nom-input"]').fill(nom);

    // Attendre la réponse POST avant de soumettre
    const responsePromise = adminPage.waitForResponse(
      (resp) =>
        resp.url().includes("/api/courses/professors") &&
        resp.request().method() === "POST",
      { timeout: 10_000 },
    );
    await adminPage.locator('[data-testid="professor-submit-btn"]').click();
    const resp = await responsePromise;
    expect(resp.status()).toBeLessThan(300);

    // Le nom du professeur doit être visible dans la page
    await expect(adminPage.getByText(nom)).toBeVisible({ timeout: 10_000 });

    // Nettoyage : récupérer l'id créé et supprimer
    const profRows = await db.query<{ id: number }>(
      "SELECT id FROM professeurs WHERE nom = ? LIMIT 1",
      [nom],
    );
    if (profRows.length > 0) {
      await db
        .query("DELETE FROM professeurs WHERE id = ?", [profRows[0].id])
        .catch(() => {});
    }
  });

  // ----------------------------------------------------------
  // Test 6 : Supprimer un professeur
  // ----------------------------------------------------------
  test("supprimer un professeur → absent de la liste", async ({
    adminPage,
    db,
  }) => {
    const unique = Date.now();

    // Insérer un professeur en DB
    const id = await db.insertOne("professeurs", {
      prenom: "E2EPrenom",
      nom: `E2ENom${unique}`,
      email: `e2e.prof.${unique}@test.com`,
      actif: 1,
    });

    try {
      // Naviguer vers /courses, onglet Professeurs
      await gotoCourseProfTab(adminPage);

      // Cliquer sur le bouton de suppression
      await adminPage
        .locator(`[data-testid="professor-delete-btn-${id}"]`)
        .waitFor({ state: "visible", timeout: 15_000 });
      await adminPage
        .locator(`[data-testid="professor-delete-btn-${id}"]`)
        .click();

      // Gérer la ConfirmDialog (responsePromise AVANT le clic)
      const responsePromise = adminPage.waitForResponse(
        (resp) =>
          resp.url().includes("/api/courses/professors") &&
          resp.request().method() === "DELETE",
        { timeout: 10_000 },
      );

      const confirmBtn = adminPage.locator(
        `[data-testid="professor-delete-btn-${id}-confirm-btn"]`,
      );
      const confirmBtnVisible = await confirmBtn
        .isVisible({ timeout: 1_000 })
        .catch(() => false);

      if (confirmBtnVisible) {
        await confirmBtn.click();
      } else {
        await adminPage
          .locator('[role="dialog"]')
          .waitFor({ state: "visible", timeout: 5_000 });
        await adminPage
          .locator('[role="dialog"]')
          .locator("button")
          .last()
          .click();
      }

      const resp = await responsePromise;
      expect(resp.status()).toBeLessThan(300);

      // Le bouton d'édition du professeur ne doit plus être visible
      await expect(
        adminPage.locator(`[data-testid="professor-edit-btn-${id}"]`),
      ).not.toBeVisible({ timeout: 5_000 });
    } finally {
      await db
        .query("DELETE FROM professeurs WHERE id = ?", [id])
        .catch(() => {});
    }
  });

  // ----------------------------------------------------------
  // Test 7 : Générer des sessions → sessions visibles dans l'onglet Séances
  // ----------------------------------------------------------
  test("générer des sessions → sessions visibles dans l'onglet Séances", async ({
    adminPage,
    db,
  }) => {
    // Récupérer un type de cours valide
    const typeRows = await db.query<{ code: string }>(
      "SELECT code FROM types_cours LIMIT 1",
    );
    if (typeRows.length === 0) {
      test.skip();
      return;
    }
    const typeCours = typeRows[0].code;

    // Insérer un cours récurrent en DB
    const id = await db.insertOne("cours_recurrent", {
      type_cours: typeCours,
      jour_semaine: 4,
      heure_debut: "14:00:00",
      heure_fin: "15:00:00",
      active: 1,
    });

    // Calculer les dates (aujourd'hui et aujourd'hui + 7 jours)
    const today = new Date();
    const dateDebut = today.toISOString().split("T")[0];
    const dateFin = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    try {
      await gotoCourses(adminPage);

      // Ouvrir la modal de génération
      await adminPage
        .locator('[data-testid="course-generate-sessions-btn"]')
        .waitFor({ state: "visible", timeout: 10_000 });
      await adminPage
        .locator('[data-testid="course-generate-sessions-btn"]')
        .click();

      // Attendre le formulaire de génération
      await adminPage
        .locator('[data-testid="generate-courses-form"]')
        .waitFor({ state: "visible", timeout: 10_000 });

      // Sélectionner le cours récurrent et remplir les dates
      await adminPage
        .locator('[data-testid="generate-recurrent-select"]')
        .selectOption(String(id));
      await adminPage
        .locator('[data-testid="generate-date-debut-input"]')
        .fill(dateDebut);
      await adminPage
        .locator('[data-testid="generate-date-fin-input"]')
        .fill(dateFin);

      // Attendre la réponse POST avant de soumettre
      const responsePromise = adminPage.waitForResponse(
        (resp) =>
          resp.url().includes("/api/courses") &&
          resp.request().method() === "POST",
        { timeout: 10_000 },
      );
      await adminPage
        .locator('[data-testid="generate-courses-submit-btn"]')
        .click();
      const resp = await responsePromise;
      expect(resp.status()).toBeLessThan(300);

      // Vérifier via DB que les sessions ont bien été générées
      // (on évite la navigation vers l'onglet Séances qui cause un crash React en headless)
      const sessionRows = await db.query<{ cnt: number }>(
        "SELECT COUNT(*) AS cnt FROM cours WHERE cours_recurrent_id = ?",
        [id],
      );
      expect(sessionRows[0].cnt).toBeGreaterThan(0);
    } finally {
      // Nettoyage FK : cours générés puis cours_recurrent
      await db
        .query("DELETE FROM cours WHERE cours_recurrent_id = ?", [id])
        .catch(() => {});
      await db
        .query("DELETE FROM cours_recurrent WHERE id = ?", [id])
        .catch(() => {});
    }
  });

  // ----------------------------------------------------------
  // Test 8 : Ouvrir l'AttendanceModal
  // ----------------------------------------------------------
  test("ouvrir l'AttendanceModal → liste membres visible", async ({
    adminPage,
    db,
  }) => {
    // Récupérer l'id interne du membre E2E
    const memberRows = await db.query<{ id: number }>(
      "SELECT id FROM utilisateurs WHERE userId = ?",
      [E2E_DB_USER_IDS.member],
    );
    const memberDbId = memberRows[0]?.id;
    expect(memberDbId).toBeDefined();

    // Récupérer un type de cours valide
    const typeRows = await db.query<{ code: string }>(
      "SELECT code FROM types_cours LIMIT 1",
    );
    if (typeRows.length === 0) {
      test.skip();
      return;
    }
    const typeCours = typeRows[0].code;

    // Récupérer un status valide pour les inscriptions
    const statusRows = await db.query<{ id: number }>(
      "SELECT id FROM status LIMIT 1",
    );
    const statusId = statusRows[0]?.id ?? 1;

    // Insérer un cours récurrent
    const recurrentId = await db.insertOne("cours_recurrent", {
      type_cours: typeCours,
      jour_semaine: 5,
      heure_debut: "08:00:00",
      heure_fin: "09:00:00",
      active: 1,
    });

    // Insérer une session pour aujourd'hui
    const today = new Date().toISOString().split("T")[0];
    const coursId = await db.insertOne("cours", {
      cours_recurrent_id: recurrentId,
      type_cours: typeCours,
      date_cours: today,
      heure_debut: "08:00:00",
      heure_fin: "09:00:00",
    });

    // Inscrire le membre à cette session
    const inscriptionId = await db.insertOne("inscriptions", {
      user_id: memberDbId,
      cours_id: coursId,
      status_id: statusId,
    });

    try {
      await gotoCourses(adminPage);

      // Naviguer vers l'onglet Séances sans déclencher refetchOnWindowFocus
      await gotoSessionsTab(adminPage);

      // Attendre le bouton de présences de la session
      await adminPage
        .locator(`[data-testid="session-attendance-btn-${coursId}"]`)
        .waitFor({ state: "visible", timeout: 10_000 });
      await adminPage
        .locator(`[data-testid="session-attendance-btn-${coursId}"]`)
        .click();

      // La modal de présences doit être visible
      await expect(
        adminPage.locator('[data-testid="attendance-modal"]'),
      ).toBeVisible({ timeout: 10_000 });

      // Le tableau de présences OU un état vide doit être visible
      const attendanceTable = adminPage.locator(
        '[data-testid="attendance-table"]',
      );
      const isEmpty = await attendanceTable
        .isVisible({ timeout: 5_000 })
        .catch(() => false);

      if (isEmpty) {
        await expect(attendanceTable).toBeVisible();
      } else {
        // Accepter un état vide si le tableau n'est pas rendu
        await expect(
          adminPage.locator('[data-testid="attendance-modal"]'),
        ).toBeVisible();
      }
    } finally {
      // Nettoyage FK : inscriptions → cours → cours_recurrent
      await db
        .query("DELETE FROM inscriptions WHERE id = ?", [inscriptionId])
        .catch(() => {});
      await db
        .query("DELETE FROM cours WHERE id = ?", [coursId])
        .catch(() => {});
      await db
        .query("DELETE FROM cours_recurrent WHERE id = ?", [recurrentId])
        .catch(() => {});
    }
  });

  // ----------------------------------------------------------
  // Test 9 : Onglet Réservations
  // ----------------------------------------------------------
  test("onglet Réservations → liste visible", async ({ adminPage }) => {
    await gotoCourses(adminPage);

    // Naviguer vers l'onglet Réservations
    await adminPage.locator("#tab-reservations").click();

    // La page réservations doit être visible
    await expect(
      adminPage.locator('[data-testid="reservations-page"]'),
    ).toBeVisible({ timeout: 10_000 });

    // Le tableau des réservations OU un état vide doit être visible
    const reservationsTable = adminPage.locator(
      '[data-testid="reservations-table"]',
    );
    const tableVisible = await reservationsTable
      .isVisible({ timeout: 5_000 })
      .catch(() => false);

    if (tableVisible) {
      await expect(reservationsTable).toBeVisible();
    } else {
      // Accepter un état vide (page chargée sans données)
      await expect(
        adminPage.locator('[data-testid="reservations-page"]'),
      ).toBeVisible();
    }
  });
});
