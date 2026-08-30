/**
 * families.edge-cases.spec.ts
 * Tests E2E — Edge cases pour les familles (perspective membre)
 */

import { test, expect } from "../../fixtures";

// Utilitaire pour récupérer le token
async function getAuthHeaders(page: import("@playwright/test").Page) {
  await page.goto("/");
  const token = await page.evaluate(() => localStorage.getItem("accessToken"));
  return {
    Authorization: `Bearer ${token}`,
  };
}

test.describe("Familles - Edge Cases", () => {
  // Test 1 : Permission escalation
  test("ne peut pas retirer un responsable (Chef de famille) en tant que simple membre", async ({
    memberPage,
    db,
  }) => {
    // 1. Récupérer l'ID DB du membre de test (memberPage est U-9999-0002)
    const [memberRow] = await db.query<{ id: number }>(
      "SELECT id FROM utilisateurs WHERE userId = 'U-9999-0002'",
    );
    const memberId = memberRow.id;

    // 2. Créer un utilisateur "Chef" de famille
    const chefUserId = "U-9998-9999";
    await db.query(
      `
      INSERT INTO utilisateurs (userId, email, password, first_name, last_name, role_app)
      VALUES (?, ?, 'x', 'Chef', 'Famille', 'member')
      ON DUPLICATE KEY UPDATE id=id
    `,
      [chefUserId, "chef@test.local"],
    );
    const [chefRow] = await db.query<{ id: number }>(
      "SELECT id FROM utilisateurs WHERE userId = ?",
      [chefUserId],
    );
    const chefId = chefRow.id;

    // 3. Créer la famille
    const familleId = await db.insertOne("familles", {
      nom: "Famille Edge Case",
    });

    try {
      // 4. Ajouter le chef (responsable = 1) et le membre courant (responsable = 0)
      await db.insertOne("membres_famille", {
        famille_id: familleId,
        user_id: chefId,
        est_responsable: 1,
      });
      await db.insertOne("membres_famille", {
        famille_id: familleId,
        user_id: memberId,
        est_responsable: 0,
      });

      // 5. Tenter de supprimer le chef depuis la session du membre
      const headers = await getAuthHeaders(memberPage);
      const response = await memberPage.request.delete(
        `/api/families/members/${chefId}`,
        { headers }
      );

      // Devrait être rejeté avec une erreur client
      expect(response.status()).toBeGreaterThanOrEqual(400);
      const json = await response.json();
      expect(json.message).toMatch(
        /Vous devez être responsable de la famille pour retirer un membre/i,
      );
    } finally {
      // Cleanup
      await db.query("DELETE FROM membres_famille WHERE famille_id = ?", [
        familleId,
      ]);
      await db.query("DELETE FROM familles WHERE id = ?", [familleId]);
      await db.query("DELETE FROM utilisateurs WHERE id = ?", [chefId]);
    }
  });

  // Test 2 : Isolation (Tentative d'accès aux routes admin sur une autre famille)
  test("ne peut pas accéder ou modifier une autre famille via les routes d'administration", async ({
    memberPage,
    db,
  }) => {
    // Créer une famille cible
    const familleId = await db.insertOne("familles", {
      nom: "Famille Cible Admin",
    });

    try {
      const headers = await getAuthHeaders(memberPage);
      // 1. Tenter de lire les membres (route ADMIN)
      const getRes = await memberPage.request.get(
        `/api/families/${familleId}/members`,
        { headers }
      );
      expect(getRes.status()).toBe(403);

      // 2. Tenter de modifier la famille (route ADMIN)
      const putRes = await memberPage.request.put(`/api/families/${familleId}`, {
        headers,
        data: { nom: "Piratage" },
      });
      expect(putRes.status()).toBe(403);

      // 3. Tenter de supprimer la famille (route ADMIN)
      const delRes = await memberPage.request.delete(`/api/families/${familleId}`, { headers });
      expect(delRes.status()).toBe(403);
    } finally {
      await db.query("DELETE FROM familles WHERE id = ?", [familleId]);
    }
  });

  // Test 3 : Isolation (Tentative de retirer un membre d'une autre famille via sa propre route)
  test("ne peut pas retirer un membre d'une autre famille via sa propre route", async ({
    memberPage,
    db,
  }) => {
    // memberPage est U-9999-0002
    const [memberRow] = await db.query<{ id: number }>(
      "SELECT id FROM utilisateurs WHERE userId = 'U-9999-0002'",
    );
    const memberId = memberRow.id;

    // Créer un utilisateur cible (dans une autre famille ou sans famille)
    const otherUserId = "U-9998-9998";
    await db.query(
      `
      INSERT INTO utilisateurs (userId, email, password, first_name, last_name, role_app)
      VALUES (?, ?, 'x', 'Autre', 'Famille', 'member')
      ON DUPLICATE KEY UPDATE id=id
    `,
      [otherUserId, "autre@test.local"],
    );
    const [otherRow] = await db.query<{ id: number }>(
      "SELECT id FROM utilisateurs WHERE userId = ?",
      [otherUserId],
    );
    const otherId = otherRow.id;

    // Créer une famille pour le membre courant
    const familleId = await db.insertOne("familles", {
      nom: "Ma Famille Légitime",
    });

    try {
      // Mettre le membre courant comme responsable pour passer le check de responsabilité
      await db.insertOne("membres_famille", {
        famille_id: familleId,
        user_id: memberId,
        est_responsable: 1,
      });

      // Tenter de supprimer "otherId"
      const headers = await getAuthHeaders(memberPage);
      const response = await memberPage.request.delete(
        `/api/families/members/${otherId}`,
        { headers }
      );

      // Devrait échouer car il n'est pas dans la famille
      expect(response.status()).toBeGreaterThanOrEqual(400);
      const json = await response.json();
      expect(json.message).toMatch(
        /Ce membre n'appartient pas à votre famille/i,
      );
    } finally {
      await db.query("DELETE FROM membres_famille WHERE famille_id = ?", [
        familleId,
      ]);
      await db.query("DELETE FROM familles WHERE id = ?", [familleId]);
      await db.query("DELETE FROM utilisateurs WHERE id = ?", [otherId]);
    }
  });
});
