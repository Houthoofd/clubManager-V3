import { test, expect } from "../../fixtures";
import { E2E_DB_USER_IDS } from "../../setup/e2e-credentials";
import fs from "fs";
import path from "path";

// Extract token from storageState JSON
function getAccessToken(): string {
  const authFile = path.resolve(__dirname, "../../setup/.auth/member.json");
  const data = JSON.parse(fs.readFileSync(authFile, "utf-8"));
  
  // Find accessToken in the origins array
  for (const origin of data.origins || []) {
    const ls = origin.localStorage || [];
    const tokenItem = ls.find((item: any) => item.name === "accessToken");
    if (tokenItem) return tokenItem.value;
  }
  return "";
}

async function fetchApi(request: import("@playwright/test").APIRequestContext, url: string, options: any = {}) {
  const token = getAccessToken();
  const res = await request.fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return { ok: res.ok(), status: res.status() };
}

test.describe("Messagerie — Edge cases", () => {
  test("ne peut pas lire un message appartenant à un autre utilisateur", async ({ memberPage, db }) => {
    // 1. Get another user's ID (admin)
    const adminRows = await db.query<{ id: number }>(
      "SELECT id FROM utilisateurs WHERE userId = ?",
      [E2E_DB_USER_IDS.admin]
    );
    const adminDbId = adminRows[0]?.id;
    expect(adminDbId).toBeDefined();

    // 2. Insert message from admin to admin (member cannot read it)
    const msgId = await db.insertOne("messages", {
      expediteur_id: adminDbId,
      destinataire_id: adminDbId,
      sujet: "Secret Admin",
      contenu: "Secret admin message",
      envoye_par_email: 0,
      lu: 0,
    });

    try {
      // 3. Try to read with memberPage
      const res = await fetchApi(memberPage.request, `/api/messages/${msgId}`);
      expect(res.ok).toBeFalsy();
      expect(res.status).toBe(404); // "Message introuvable ou acces refuse" maps to 404
    } finally {
      await db.query("DELETE FROM messages WHERE id = ?", [msgId]);
    }
  });

  test("ne peut pas envoyer un message à un utilisateur invalide", async ({ memberPage }) => {
    const res = await fetchApi(memberPage.request, '/api/messages/send', {
      method: "POST",
      data: {
        destinataire_id: 9999999, // ID that doesn't exist
        sujet: "Test",
        contenu: "Hello",
      }
    });
    
    expect(res.ok).toBeFalsy();
    expect(res.status).toBe(404); // "Destinataire introuvable" maps to 404
  });

  test("supprimer un message le retire, et sa lecture devient impossible", async ({ memberPage, db }) => {
    // 1. Get member ID
    const memberRows = await db.query<{ id: number }>(
      "SELECT id FROM utilisateurs WHERE userId = ?",
      [E2E_DB_USER_IDS.member]
    );
    const memberDbId = memberRows[0]?.id;
    expect(memberDbId).toBeDefined();
    
    // 2. Insert a message for the member
    const msgId = await db.insertOne("messages", {
      expediteur_id: memberDbId,
      destinataire_id: memberDbId,
      sujet: "To delete",
      contenu: "Content",
      envoye_par_email: 0,
      lu: 0,
    });

    try {
      // 3. Read it first to ensure it exists
      const initialRes = await fetchApi(memberPage.request, `/api/messages/${msgId}`);
      expect(initialRes.ok).toBeTruthy();

      // 4. Delete the message via API
      const delRes = await fetchApi(memberPage.request, `/api/messages/${msgId}`, { method: "DELETE" });
      expect(delRes.ok).toBeTruthy();
      
      // 5. Try to read it again
      const getRes = await fetchApi(memberPage.request, `/api/messages/${msgId}`);
      expect(getRes.ok).toBeFalsy();
      expect(getRes.status).toBe(404);
    } finally {
      await db.query("DELETE FROM messages WHERE id = ?", [msgId]);
    }
  });
});
