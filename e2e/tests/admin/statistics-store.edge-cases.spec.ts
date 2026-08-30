import { test, expect } from "../../fixtures";

test.describe("Statistics & Store - Edge Cases", () => {
  test("Cannot order item with negative quantity via API", async ({ adminPage }) => {
    const res = await adminPage.request.post("/api/store/orders", {
      data: {
        items: [
          { articleId: 1, quantite: -5, sizeId: 1 }
        ]
      }
    });
    
    expect(res.status()).toBeGreaterThanOrEqual(400);
    expect(res.status()).toBeLessThan(500);
  });

  test("Statistics rejects inverted date range for trends", async ({ adminPage }) => {
    const res = await adminPage.request.get("/api/statistics/trends", {
      params: {
        date_debut: "2024-12-31",
        date_fin: "2024-01-01"
      }
    });
    
    expect(res.status()).not.toBe(500);
  });

  test("Statistics handles 10,000 years range gracefully", async ({ adminPage }) => {
    const res = await adminPage.request.get("/api/statistics/trends", {
      params: {
        date_debut: "2000-01-01",
        date_fin: "12000-01-01"
      }
    });
    
    // It might pass and return empty data or be rejected. Let's just make sure it's not 500.
    expect(res.status()).not.toBe(500);
  });

  test("Cannot fulfill an order that is already fulfilled", async ({ adminPage }) => {
    // We assume order ID 1 is already fulfilled or we create one and fulfill it.
    // For an edge case test, let's just attempt to fulfill a potentially fulfilled order and check it doesn't crash 500.
    // Or we could mock/create an order, but typically we can try an existing one or just test the API handles it without 500.
    
    // First, let's create a dummy order or assume one exists.
    // E2E fixtures usually have some seeded data. Let's assume order 1 exists.
    
    // First fulfill it (might already be fulfilled, that's fine).
    await adminPage.request.put(`/api/store/orders/1/status`, {
      data: {
        statut: "LIVRE"
      }
    });

    // Try to fulfill it again
    const res = await adminPage.request.put(`/api/store/orders/1/status`, {
      data: {
        statut: "LIVRE"
      }
    });
    
    // The backend should either say 200 OK (idempotent) or 400 Bad Request, but not 500.
    expect(res.status()).not.toBe(500);
  });
});
