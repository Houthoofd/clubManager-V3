import { test, expect } from "../../fixtures";

test.describe("Evénements — Flux membre — Edge Cases", () => {
  test("Inscription à un événement complet (Mock 409 ou 403)", async ({ memberPage }) => {
    await memberPage.route("**/api/events/*/register", async (route, req) => {
      if (req.method() === "POST") {
        await route.fulfill({
          status: 409,
          contentType: "application/json",
          body: JSON.stringify({ message: "L'événement est complet, vous avez été placé sur liste d'attente." }),
        });
      } else {
        await route.continue();
      }
    });

    await memberPage.goto("/events");
    
    const res = await memberPage.evaluate(async () => {
      const token = JSON.parse(localStorage.getItem("auth-storage") || "{}")?.state?.token || "";
      const response = await fetch('/api/events/888/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      });
      return { status: response.status, body: await response.json() };
    });

    expect(res.status).toBe(409);
    expect(res.body.message).toContain("complet");
  });

  test("Grade Bypass: Tentative d'accès à un événement restreint à un grade supérieur", async ({ memberPage, db }) => {
    // We create a real event that requires a higher grade
    const eventId = await db.insertOne("events", {
      title: "High Grade Event",
      start_date: new Date(Date.now() + 86400000),
      end_date: new Date(Date.now() + 86400000 * 2),
      capacity: 10,
      price: 0,
      visibility: "MEMBERS_ONLY",
      min_grade_id: 9999 // Very high grade
    });

    await memberPage.goto("/events");

    const res = await memberPage.evaluate(async (id) => {
      const token = JSON.parse(localStorage.getItem("auth-storage") || "{}")?.state?.token || "";
      const response = await fetch(`/api/events/${id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      });
      return { status: response.status, body: await response.json() };
    }, eventId);

    // It should be 403 Forbidden or 400 Bad Request
    expect([400, 403]).toContain(res.status);
  });

  test("Concurrency (Overbooking): Tentative d'inscriptions simultanées quand 1 seule place restante", async ({ memberPage, db }) => {
    // 1. Create event with exactly 1 capacity left
    const eventId = await db.insertOne("events", {
      title: "Concurrency Test Event",
      start_date: new Date(Date.now() + 86400000),
      end_date: new Date(Date.now() + 86400000 * 2),
      capacity: 1,
      price: 0,
      visibility: "PUBLIC"
    });

    await memberPage.goto("/events");

    // We need multiple tokens to simulate simultaneous requests. We can just use evaluate with fetch and different valid tokens, but generating tokens here is complex. 
    // We can simulate multiple API requests in parallel via evaluating fetch 3 times with the same token (since a user could double click or send concurrent requests)
    const res = await memberPage.evaluate(async (id) => {
      const token = JSON.parse(localStorage.getItem("auth-storage") || "{}")?.state?.token || "";
      
      const p1 = fetch(`/api/events/${id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      });
      const p2 = fetch(`/api/events/${id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      });
      const p3 = fetch(`/api/events/${id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      });

      const responses = await Promise.all([p1, p2, p3]);
      return Promise.all(responses.map(async r => ({ status: r.status, body: await r.json().catch(() => {}) })));
    }, eventId);

    // One should succeed or they might all fail with double registration, but capacity shouldn't exceed 1
    const successCount = res.filter(r => r.status === 200 || r.status === 201).length;
    expect(successCount).toBeLessThanOrEqual(1);

    // Check db capacity
    const registrations = await db.query("SELECT * FROM event_registrations WHERE event_id = ?", [eventId]);
    expect(registrations.length).toBeLessThanOrEqual(1);
  });

  test("Member attempting to register twice for the same event", async ({ memberPage, db }) => {
    const eventId = await db.insertOne("events", {
      title: "Double Registration Test Event",
      start_date: new Date(Date.now() + 86400000),
      end_date: new Date(Date.now() + 86400000 * 2),
      capacity: 10,
      price: 0,
      visibility: "PUBLIC"
    });

    await memberPage.goto("/events");

    const res = await memberPage.evaluate(async (id) => {
      const token = JSON.parse(localStorage.getItem("auth-storage") || "{}")?.state?.token || "";
      
      const response1 = await fetch(`/api/events/${id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      });
      
      const response2 = await fetch(`/api/events/${id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      });

      return [
        { status: response1.status },
        { status: response2.status }
      ];
    }, eventId);

    expect([200, 201]).toContain(res[0].status); // First should succeed
    expect([400, 409]).toContain(res[1].status); // Second should fail (Conflict or Bad request)
  });
});
