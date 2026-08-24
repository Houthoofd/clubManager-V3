import { test, expect } from "../../fixtures";

test.describe("Payments Edge Cases", () => {
  // ----------------------------------------------------------
  // Test 1 : Double Refund
  // ----------------------------------------------------------
  test("Cannot refund a payment that is already refunded", async ({
    adminPage,
    db,
  }) => {
    // Récupérer l'ID interne du membre E2E
    const memberRows = await db.query<{ id: number }>(
      "SELECT id FROM utilisateurs WHERE userId = ?",
      ["U-9999-0002"]
    );
    const memberDbId = memberRows[0]?.id;
    expect(memberDbId).toBeDefined();

    const paymentId = await db.insertOne("paiements", {
      user_id: memberDbId,
      montant: 50.0,
      methode_paiement_id: 1, // stripe
      statut_id: 4, // 4 = remboursé
      date_paiement: new Date().toISOString().split("T")[0]
    });

    try {
      await adminPage.goto("/payments");
      await adminPage.locator('[data-testid="tab-payments"]').click();
      
      const paymentsTab = adminPage.locator('[data-testid="payments-tab"]');
      await paymentsTab.waitFor({ state: "visible", timeout: 10000 });

      const refundBtn = adminPage.locator(`[data-testid="btn-refund-payment-${paymentId}"]`);
      
      // We expect the button to either be absent or disabled
      const count = await refundBtn.count();
      if (count > 0) {
        await expect(refundBtn).toBeDisabled();
      } else {
        await expect(refundBtn).not.toBeVisible();
      }
    } finally {
      await db.query("DELETE FROM paiements WHERE id = ?", [paymentId]).catch(() => {});
    }
  });

  // ----------------------------------------------------------
  // Test 2 : Zero Payment
  // ----------------------------------------------------------
  test("Cannot create an invoice or schedule of 0€", async ({ adminPage }) => {
    await adminPage.goto("/payments");
    await adminPage.locator('[data-testid="tab-payments"]').click();
    
    const paymentsTab = adminPage.locator('[data-testid="payments-tab"]');
    await paymentsTab.waitFor({ state: "visible", timeout: 10000 });

    await adminPage.locator('[data-testid="btn-record-payment"]').waitFor({ state: "visible", timeout: 10_000 });
    await adminPage.locator('[data-testid="btn-record-payment"]').click();

    const form = adminPage.locator('[id="record-payment-form"]');
    await form.waitFor({ state: "visible", timeout: 5_000 });

    await form.locator("#user_id option").nth(1).waitFor({ state: "attached", timeout: 15000 });
    await form.locator("#user_id").selectOption({ index: 1 });
    
    // Fill 0
    await form.locator("#montant").fill("0");

    let requestSent = false;
    adminPage.on('request', req => {
      if (req.url().includes("/api/payments") && req.method() === "POST") {
        requestSent = true;
      }
    });

    const submitBtn = adminPage.locator('[type="submit"][form="record-payment-form"]');
    await submitBtn.click();
    
    // Attendre un peu pour vérifier si une requête part (ça ne devrait pas)
    await adminPage.waitForTimeout(1000);
    
    // Soit le champ bloque via HTML5, soit le JS bloque et la requête n'est pas envoyée
    expect(requestSent).toBe(false);
  });
});
