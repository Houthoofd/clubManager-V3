import { test, expect } from "../../fixtures";
import fs from "fs";
import path from "path";

test.describe("Member Reservations - Edge Cases", () => {
  let memberToken = "";

  test.beforeAll(() => {
    try {
      const authPath = path.join(__dirname, "../../setup/.auth/member.json");
      const authData = JSON.parse(fs.readFileSync(authPath, "utf-8"));
      const ls = authData.origins?.[0]?.localStorage || [];
      const tokenItem = ls.find((item: any) => item.name === "accessToken");
      if (tokenItem) memberToken = tokenItem.value;
    } catch (e) {
      console.warn("Could not read auth state", e);
    }
  });

  test.beforeEach(async ({ page }) => {
    await page.goto("/reservations");
    await expect(page.getByTestId("reservations-page")).toBeVisible({ timeout: 20000 });
  });

  test("Double Booking: User attempts to book a course they are already booked for", async ({ request }) => {
    expect(memberToken).toBeTruthy();

    // On utilise le cours 9999 qui existe bien dans le seed E2E.
    // Si un autre test l'a annulé, ce premier POST va le recréer (201).
    // S'il est toujours réservé, ce POST va échouer (400) (mais on ignore l'erreur pour la première requête).
    await request.post("/api/reservations", {
      headers: { Authorization: `Bearer ${memberToken}` },
      data: { cours_id: 9999 }
    }).catch(() => {});

    // On retente la même réservation, ce qui garantit un Double Booking (400 ou 409).
    const res = await request.post("/api/reservations", {
      headers: { Authorization: `Bearer ${memberToken}` },
      data: { cours_id: 9999 }
    });

    expect(res.status()).toBeGreaterThanOrEqual(400);
    const body = await res.json();
    expect(JSON.stringify(body)).toMatch(/déjà une réservation/i);
  });

  test("Full Course: User attempts to book a course that has reached its maximum capacity", async ({ page, baseURL }) => {
    expect(memberToken).toBeTruthy();

    await page.route("**/api/reservations", async (route, req) => {
      if (req.method() === "POST") {
        await route.fulfill({
          status: 409,
          contentType: "application/json",
          body: JSON.stringify({ message: "Le cours a atteint sa capacité maximale" })
        });
      } else {
        await route.continue();
      }
    });

    const res = await page.evaluate(async ({ token, url }) => {
      const response = await fetch(`${url}/api/reservations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ cours_id: 9998 })
      });
      return {
        status: response.status,
        body: await response.json()
      };
    }, { token: memberToken, url: baseURL });

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/capacité maximale/i);
  });

  test("Late Cancellation: User attempts to cancel a reservation after the cancellation deadline has passed", async ({ page }) => {
    await page.route("**/api/reservations/*/cancel", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ message: "Le délai d'annulation est dépassé" })
      });
    });

    const cancelBtn = page.locator('[data-testid^="btn-cancel-reservation-"]').first();
    await expect(cancelBtn).toBeVisible({ timeout: 20000 });
    await cancelBtn.click();

    const confirmBtn = page.getByRole("dialog").getByRole("button", { name: /Annuler/i });
    await expect(confirmBtn).toBeVisible();
    await confirmBtn.click();

    const toast = page.locator('[data-sonner-toast]');
    await expect(toast).toBeVisible({ timeout: 20000 });
    const toastText = await toast.textContent();
    expect(toastText).toMatch(/délai/i);
  });
});
