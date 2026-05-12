/**
 * register.test.ts
 * Integration tests for POST /api/auth/register.
 * Tests the full HTTP stack with real DB writes.
 */

import request from "supertest";
import type { Express } from "express";
import createApp from "../../../src/app.js";
import { truncateAuthTables, getUserByEmail } from "../setup/dbHelpers.js";

let app: Express;

beforeAll(() => {
  app = createApp();
});

beforeEach(async () => {
  await truncateAuthTables();
});

const validDto = {
  first_name: "Jean",
  last_name: "Dupont",
  email: "jean.dupont@integration.test",
  password: "SecurePass@1234!",
  date_of_birth: "1990-05-15",
  genre_id: 1,
};

describe("POST /api/auth/register — succès", () => {
  it("201 — retourne userId + email + firstName", async () => {
    const res = await request(app).post("/api/auth/register").send(validDto);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(validDto.email);
    expect(res.body.data.firstName).toBe(validDto.first_name);
    expect(res.body.data.userId).toBeDefined();
  });

  it("userId généré au format U-YYYY-XXXX", async () => {
    const res = await request(app).post("/api/auth/register").send(validDto);

    const currentYear = new Date().getFullYear();
    expect(res.body.data.userId).toMatch(
      new RegExp(`^U-${currentYear}-\\d{4}$`),
    );
  });

  it("ne retourne jamais le hash bcrypt", async () => {
    const res = await request(app).post("/api/auth/register").send(validDto);

    const json = JSON.stringify(res.body);
    expect(json).not.toContain("$2b$");
    expect(res.body.data).not.toHaveProperty("password");
  });

  it("l'utilisateur est créé en DB avec email_verified = false", async () => {
    await request(app).post("/api/auth/register").send(validDto);

    const row = await getUserByEmail(validDto.email);

    expect(row).not.toBeNull();
    expect(row!.email_verified).toBe(0); // MySQL returns 0/1 for BOOLEAN
  });

  it("l'utilisateur est créé en DB avec active = true", async () => {
    await request(app).post("/api/auth/register").send(validDto);

    const row = await getUserByEmail(validDto.email);

    expect(row!.active).toBe(1);
  });

  it("plusieurs inscriptions créent des userId distincts", async () => {
    const res1 = await request(app).post("/api/auth/register").send(validDto);

    const res2 = await request(app)
      .post("/api/auth/register")
      .send({ ...validDto, email: "second@integration.test" });

    expect(res1.status).toBe(201);
    expect(res2.status).toBe(201);
    expect(res1.body.data.userId).not.toBe(res2.body.data.userId);
  });
});

describe("POST /api/auth/register — erreurs de validation", () => {
  it("500 — prénom manquant", async () => {
    const { first_name, ...dto } = validDto;

    const res = await request(app).post("/api/auth/register").send(dto);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("First name is required");
  });

  it("500 — email invalide", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...validDto, email: "not-an-email" });

    expect(res.status).toBe(500);
    expect(res.body.message).toContain("Invalid email format");
  });

  it("500 — mot de passe trop faible", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...validDto, email: "weak@integration.test", password: "abc" });

    expect(res.status).toBe(500);
    expect(res.body.message).toContain("Password validation failed");
  });

  it("500 — date de naissance manquante", async () => {
    const { date_of_birth, ...dto } = validDto;

    const res = await request(app).post("/api/auth/register").send(dto);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe("POST /api/auth/register — règles métier", () => {
  it("500 — email déjà utilisé", async () => {
    // Première inscription
    const first = await request(app).post("/api/auth/register").send(validDto);
    expect(first.status).toBe(201);

    // Deuxième avec le même email
    const second = await request(app).post("/api/auth/register").send(validDto);

    expect(second.status).toBe(500);
    expect(second.body.success).toBe(false);
    expect(second.body.message).toContain("email");
  });
});
