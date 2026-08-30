import { test, expect } from "../../fixtures";

test.describe("References — Cas limites et sécurité (Membre)", () => {
  test("Sécurité : un membre ne peut pas modifier un document de référence via API", async ({ memberPage }) => {
    // 1. Appel direct à l'API pour tenter d'uploader ou modifier un document de référence
    const response = await memberPage.request.post('/api/references/documents', {
      data: {
        titre: "Nouveau document",
        contenu: "Contenu non autorisé"
      }
    });

    // On s'attend à ce que l'API réponde avec une erreur de permission (403) ou 404 (si route non trouvée/bloquée au niveau global)
    expect([403, 404, 401]).toContain(response.status());
  });

  test("Accès : impossible de lire un document de référence supprimé ou inexistant", async ({ memberPage }) => {
    // 1. Appel direct à l'API pour accéder à un document inexistant
    const response = await memberPage.request.get('/api/references/documents/999999');

    // On s'attend à un 404 Not Found (ou 403)
    expect([403, 404, 401]).toContain(response.status());
  });
});
