/**
 * enrollment-flow.spec.ts
 * Tests E2E — Flux métier croisé : Inscription à un cours
 * Phase E5
 *
 * Projet Playwright : chromium-admin (testIgnore dans playwright.config.ts)
 *
 * Scénarios couverts :
 *   1. L'admin navigue vers la page des cours et voit la liste.
 *   2. Le membre vérifie que la page /my-courses charge correctement.
 *
 * ⚠️ Les flux complets (admin crée cours → génère sessions → membre s'inscrit)
 * nécessitent une infrastructure de données plus élaborée.
 * Ces tests marqués test.fixme() seront activés lors d'une prochaine session.
 */

import { test, expect } from "../../fixtures";
import { E2E_DB_USER_IDS } from "../../setup/e2e-credentials";

// ============================================================
// Tests
// ============================================================

test.describe("Flux inscription cours — E2E croisé", () => {
  // ----------------------------------------------------------
  // Test 1 : Admin navigue vers /courses → page visible
  // ----------------------------------------------------------
  test("admin voit la page des cours", async ({ adminPage }) => {
    await adminPage.goto("/courses");
    await expect(adminPage.locator('[data-testid="courses-page"]')).toBeVisible(
      { timeout: 15_000 },
    );
  });

  // ----------------------------------------------------------
  // Test 2 : Membre navigue vers l'onglet Mes inscriptions
  // MyCoursesPage est dans l'onglet #tab-myEnrollments de /courses,
  // pas dans une route /my-courses séparée.
  // ----------------------------------------------------------
  test("membre voit la page Mes cours", async ({ memberPage }) => {
    await memberPage.goto("/courses");
    await memberPage
      .locator('[data-testid="courses-page"]')
      .waitFor({ state: "visible", timeout: 15_000 });

    const myEnrollmentsTab = memberPage.locator("#tab-myEnrollments");
    await myEnrollmentsTab.waitFor({ state: "visible", timeout: 10_000 });
    await myEnrollmentsTab.click();

    await expect(
      memberPage.locator('[data-testid="my-courses-page"]'),
    ).toBeVisible({ timeout: 10_000 });
  });

  // ----------------------------------------------------------
  // Test 3 : Flux complet inscription via DB seed
  //
  // Stratégie :
  //   - Insérer un cours récurrent + une session en DB (via db fixture).
  //   - Inscrire le membre à cette session.
  //   - Vérifier que la session apparaît dans /my-courses du membre.
  //   - Nettoyage complet en fin de test.
  // ----------------------------------------------------------
  test("membre inscrit via DB → visible dans /my-courses", async ({
    memberPage,
    db,
  }) => {
    // Récupérer l'ID interne du membre
    const memberRows = await db.query<{ id: number }>(
      "SELECT id FROM utilisateurs WHERE userId = ?",
      [E2E_DB_USER_IDS.member],
    );
    const memberDbId = memberRows[0]?.id;
    expect(memberDbId).toBeDefined();

    // Trouver ou créer un type de cours valide
    const typeRows = await db.query<{ id: number; code: string }>(
      "SELECT id, code FROM types_cours LIMIT 1",
    );

    if (typeRows.length === 0) {
      // Pas de type de cours en DB — skip ce test
      test.skip();
      return;
    }
    const typeCours = typeRows[0].code;

    // Trouver ou créer un status valide pour les inscriptions
    const statusRows = await db.query<{ id: number }>(
      "SELECT id FROM status LIMIT 1",
    );
    const statusId = statusRows[0]?.id ?? 1;

    // Insérer un cours récurrent
    const recurrentId = await db.insertOne("cours_recurrent", {
      type_cours: typeCours,
      jour_semaine: 1, // Lundi
      heure_debut: "09:00:00",
      heure_fin: "10:00:00",
      active: 1,
    });

    // Insérer une session (cours) liée au cours récurrent
    const today = new Date();
    const futureDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 jours
    const dateCours = futureDate.toISOString().split("T")[0];

    const courseId = await db.insertOne("cours", {
      cours_recurrent_id: recurrentId,
      type_cours: typeCours,
      date_cours: dateCours,
      heure_debut: "09:00:00",
      heure_fin: "10:00:00",
    });

    // Inscrire le membre à cette session
    const inscriptionId = await db.insertOne("inscriptions", {
      user_id: memberDbId,
      cours_id: courseId,
      status_id: statusId,
    });

    try {
      // Naviguer vers /courses → onglet Mes inscriptions
      await memberPage.goto("/courses");
      await memberPage
        .locator('[data-testid="courses-page"]')
        .waitFor({ state: "visible", timeout: 15_000 });

      const myEnrollmentsTab = memberPage.locator("#tab-myEnrollments");
      await myEnrollmentsTab.waitFor({ state: "visible", timeout: 10_000 });
      await myEnrollmentsTab.click();

      // La table des inscriptions doit être visible avec au moins une ligne
      const table = memberPage.locator('[data-testid="my-courses-table"]');
      await expect(table).toBeVisible({ timeout: 10_000 });

      // Vérifier qu'une ligne est présente (pas d'état vide)
      // On cherche une cellule de la DataTable (un <td> ou un élément de ligne)
      const firstRow = table.locator('tbody tr, [class*="row"], td').first();
      await expect(firstRow).toBeVisible({ timeout: 10_000 });
    } finally {
      // Nettoyage dans l'ordre des dépendances FK
      await db.query("DELETE FROM inscriptions WHERE id = ?", [inscriptionId]);
      await db.query("DELETE FROM cours WHERE id = ?", [courseId]);
      await db.query("DELETE FROM cours_recurrent WHERE id = ?", [recurrentId]);
    }
  });

  // ----------------------------------------------------------
  // Test 4 : Flux complet annulation
  // ----------------------------------------------------------
  test("membre inscrit peut se désinscrire → place libérée", async ({
    memberPage,
    db,
  }) => {
    // ── Setup : même données que le test 3 ───────────────────
    const memberRows = await db.query<{ id: number }>(
      "SELECT id FROM utilisateurs WHERE userId = ?",
      [E2E_DB_USER_IDS.member],
    );
    const memberDbId = memberRows[0]?.id;
    expect(memberDbId).toBeDefined();

    const typeRows = await db.query<{ id: number; code: string }>(
      "SELECT id, code FROM types_cours LIMIT 1",
    );
    if (typeRows.length === 0) {
      test.skip();
      return;
    }
    const typeCours = typeRows[0].code;

    const statusRows = await db.query<{ id: number }>(
      "SELECT id FROM status LIMIT 1",
    );
    const statusId = statusRows[0]?.id ?? 1;

    const recurrentId = await db.insertOne("cours_recurrent", {
      type_cours: typeCours,
      jour_semaine: 2,
      heure_debut: "10:00:00",
      heure_fin: "11:00:00",
      active: 1,
    });

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 14);
    const dateCours = futureDate.toISOString().split("T")[0];

    const courseId = await db.insertOne("cours", {
      cours_recurrent_id: recurrentId,
      type_cours: typeCours,
      date_cours: dateCours,
      heure_debut: "10:00:00",
      heure_fin: "11:00:00",
    });

    const inscriptionId = await db.insertOne("inscriptions", {
      user_id: memberDbId,
      cours_id: courseId,
      status_id: statusId,
    });

    try {
      // ── Navigation ──────────────────────────────────────────
      await memberPage.goto("/courses");
      await memberPage
        .locator('[data-testid="courses-page"]')
        .waitFor({ state: "visible", timeout: 15_000 });

      const myEnrollmentsTab = memberPage.locator("#tab-myEnrollments");
      await myEnrollmentsTab.waitFor({ state: "visible", timeout: 10_000 });
      await myEnrollmentsTab.click();

      await memberPage
        .locator('[data-testid="my-courses-page"]')
        .waitFor({ state: "visible", timeout: 10_000 });

      // ── Vérifier que l'inscription est visible ───────────────
      const unsubscribeBtn = memberPage.locator(
        `[data-testid="course-unsubscribe-btn-${inscriptionId}"]`,
      );
      await expect(unsubscribeBtn).toBeVisible({ timeout: 10_000 });

      // ── Se désinscrire ───────────────────────────────────────
      // Préparer l'attente de la réponse AVANT le clic
      const deleteResponsePromise = memberPage.waitForResponse(
        (resp) =>
          resp.url().includes(`/api/courses/inscriptions/${inscriptionId}`) &&
          resp.request().method() === "DELETE",
        { timeout: 10_000 },
      );

      await unsubscribeBtn.click();
      const deleteResponse = await deleteResponsePromise;

      // L'API doit retourner 200/204
      expect(deleteResponse.status()).toBeLessThan(300);

      // ── Vérifier que le bouton n'existe plus ─────────────────
      await expect(unsubscribeBtn).not.toBeVisible({ timeout: 5_000 });
    } finally {
      // Nettoyage FK (l'inscription peut déjà être supprimée par l'UI)
      await db
        .query("DELETE FROM inscriptions WHERE id = ?", [inscriptionId])
        .catch(() => {});
      await db.query("DELETE FROM cours WHERE id = ?", [courseId]);
      await db.query("DELETE FROM cours_recurrent WHERE id = ?", [recurrentId]);
    }
  });
});
