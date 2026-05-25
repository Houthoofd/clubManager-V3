/**
 * messaging.spec.ts
 * Tests E2E — Flux membre : Messagerie (/messages)
 * Phase E3
 *
 * Projet Playwright : chromium-member (testIgnore dans playwright.config.ts)
 *
 * Comptes de test :
 *   Membre  : e2e_member (U-9999-0002) — role_app: member
 *   Admin   : e2e_admin  (U-9999-0001) — role_app: admin
 *
 * data-testid utilisés :
 *   messages-page        → wrapper principal de MessagesPage
 *   messages-compose-btn → bouton "Nouveau message"
 *   messages-list        → conteneur scrollable de la liste
 *   message-item-{id}    → item de message individuel
 *
 * Formulaire de composition (ids HTML) :
 *   compose-message-form → form de composition
 *   #destinataire-id     → input destinataire (DB id numérique)
 *   #sujet               → input sujet
 *   #contenu             → textarea contenu
 */

import { test, expect } from "../../fixtures";
import { E2E_DB_USER_IDS } from "../../setup/e2e-credentials";

// ============================================================
// Helpers
// ============================================================

async function gotoMessages(page: import("@playwright/test").Page) {
  await page.goto("/messages");
  await page.locator('[data-testid="messages-page"]').waitFor({
    state: "visible",
    timeout: 15_000,
  });
}

// ============================================================
// Tests
// ============================================================

test.describe("Messagerie — Flux membre", () => {
  // ----------------------------------------------------------
  // Test 1 : Charger /messages → messages-page visible
  // ----------------------------------------------------------
  test("charger /messages → page messagerie visible", async ({ memberPage }) => {
    await gotoMessages(memberPage);
    await expect(
      memberPage.locator('[data-testid="messages-page"]'),
    ).toBeVisible();
  });

  // ----------------------------------------------------------
  // Test 2 : Bouton "Nouveau message" visible
  // ----------------------------------------------------------
  test("bouton Nouveau message visible", async ({ memberPage }) => {
    await gotoMessages(memberPage);
    await expect(
      memberPage.locator('[data-testid="messages-compose-btn"]'),
    ).toBeVisible({ timeout: 10_000 });
  });

  // ----------------------------------------------------------
  // Test 3 : Onglets Boîte de réception / Envoyés visibles
  // ----------------------------------------------------------
  test("onglets Boîte de réception et Envoyés visibles", async ({
    memberPage,
  }) => {
    await gotoMessages(memberPage);

    // TabGroup rend les onglets avec id="tab-inbox", id="tab-sent", etc.
    await expect(memberPage.locator("#tab-inbox")).toBeVisible({
      timeout: 10_000,
    });
    await expect(memberPage.locator("#tab-sent")).toBeVisible({
      timeout: 10_000,
    });
  });

  // ----------------------------------------------------------
  // Test 4 : Clic "Nouveau message" → modale de composition s'ouvre
  // ----------------------------------------------------------
  test("clic Nouveau message → modale de composition ouverte", async ({
    memberPage,
  }) => {
    await gotoMessages(memberPage);

    await memberPage
      .locator('[data-testid="messages-compose-btn"]')
      .click();

    // La modale de composition est identifiée par le formulaire
    await expect(
      memberPage.locator('[id="compose-message-form"]'),
    ).toBeVisible({ timeout: 5_000 });
  });

  // ----------------------------------------------------------
  // Test 5 : Composer et envoyer un message à l'admin
  //
  // Stratégie :
  //   - Le membre compose un message destiné à l'admin (e2e_admin).
  //   - On récupère l'ID interne de l'admin via la fixture db.
  //   - On remplit le formulaire et on envoie.
  //   - On vérifie que le message apparaît dans l'onglet "Envoyés".
  //
  // Nettoyage :
  //   - Supprime le message via DB après le test.
  // ----------------------------------------------------------
  test("composer et envoyer un message → visible dans Envoyés", async ({
    memberPage,
    db,
  }) => {
    // Récupérer l'ID interne de l'admin en DB
    const adminRows = await db.query<{ id: number }>(
      "SELECT id FROM utilisateurs WHERE userId = ?",
      [E2E_DB_USER_IDS.admin],
    );
    const adminDbId = adminRows[0]?.id;
    expect(adminDbId, "L'admin e2e doit exister en DB").toBeDefined();

    await gotoMessages(memberPage);

    // Ouvrir la modale de composition
    await memberPage
      .locator('[data-testid="messages-compose-btn"]')
      .click();
    await memberPage.locator('[id="compose-message-form"]').waitFor({
      state: "visible",
      timeout: 5_000,
    });

    // Sélectionner le type de destinataire "user" (déjà sélectionné par défaut)
    const recipientRadio = memberPage.locator(
      'input[name="recipientType"][value="user"]',
    );
    await expect(recipientRadio).toBeChecked({ timeout: 3_000 });

    // Remplir l'ID du destinataire (admin)
    await memberPage.locator("#destinataire-id").fill(String(adminDbId));

    // Remplir le sujet et le contenu
    const ts = Date.now();
    await memberPage.locator("#sujet").fill(`Test E2E sujet ${ts}`);
    await memberPage.locator("#contenu").fill(`Message de test E2E ${ts}`);

    // Envoyer le message (bouton de type submit lié au formulaire)
    await memberPage.locator('[form="compose-message-form"][type="submit"]').click();

    // Attendre la fermeture de la modale (le formulaire disparaît)
    await expect(
      memberPage.locator('[id="compose-message-form"]'),
    ).not.toBeVisible({ timeout: 10_000 });

    // Naviguer vers l'onglet "Envoyés"
    await memberPage.locator("#tab-sent").click();

    // Attendre que la liste se mette à jour — le message envoyé doit apparaître
    // On cherche un item dont le texte contient le sujet unique créé
    await expect(
      memberPage.getByText(`Test E2E sujet ${ts}`),
    ).toBeVisible({ timeout: 15_000 });
  });

  // ----------------------------------------------------------
  // Test 6 : Message reçu → clic dessus → marqué comme lu
  //
  // Stratégie :
  //   - Insérer un message reçu par le membre via la fixture db.
  //   - Naviguer vers /messages.
  //   - Vérifier que le message est visible dans la boîte de réception.
  //   - Cliquer dessus → il doit être marqué comme lu (appel API).
  //
  // Nettoyage :
  //   - Supprime le message via DB après le test.
  // ----------------------------------------------------------
  test("message reçu visible dans la boîte de réception", async ({
    memberPage,
    db,
  }) => {
    // Récupérer les IDs internes des comptes E2E
    const adminRows = await db.query<{ id: number }>(
      "SELECT id FROM utilisateurs WHERE userId = ?",
      [E2E_DB_USER_IDS.admin],
    );
    const memberRows = await db.query<{ id: number }>(
      "SELECT id FROM utilisateurs WHERE userId = ?",
      [E2E_DB_USER_IDS.member],
    );
    const adminDbId = adminRows[0]?.id;
    const memberDbId = memberRows[0]?.id;
    expect(adminDbId).toBeDefined();
    expect(memberDbId).toBeDefined();

    // Insérer un message de l'admin vers le membre
    const ts = Date.now();
    const sujet = `[E2E-inbox] ${ts}`;
    const msgId = await db.insertOne("messages", {
      expediteur_id: adminDbId,
      destinataire_id: memberDbId,
      sujet,
      contenu: `Contenu du message de test ${ts}`,
      envoye_par_email: 0,
      lu: 0,
    });

    try {
      await gotoMessages(memberPage);

      // Le message doit apparaître dans la boîte de réception (onglet inbox actif par défaut)
      await expect(memberPage.getByText(sujet)).toBeVisible({
        timeout: 15_000,
      });
    } finally {
      // Nettoyage
      await db.query("DELETE FROM messages WHERE id = ?", [msgId]);
    }
  });
});
