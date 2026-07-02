/**
 * globalSetup.ts
 * Exécuté UNE FOIS avant tous les tests Playwright.
 *
 * Responsabilités :
 *   1. Charger les variables d'env depuis backend/.env
 *   2. Créer le dossier setup/.auth/ si nécessaire
 *   3. Appeler POST /api/auth/login pour chaque compte E2E
 *   4. Persister le storageState (cookies + localStorage) dans setup/.auth/*.json
 *
 * ⚠️  Pré-requis avant d'exécuter :
 *   - Backend démarré sur http://localhost:3000 (ou port détecté par portUtils)
 *   - Frontend e2e démarré sur http://localhost:5174 (port dédié e2e)
 *   - Comptes E2E créés en DB via : pnpm --filter @clubmanager/e2e seed
 *
 * Format storageState généré :
 *   {
 *     cookies: [],
 *     origins: [{
 *       origin: "http://localhost:5174",
 *       localStorage: [
 *         { name: "accessToken",   value: "<jwt>" },
 *         { name: "user",          value: "<JSON>" },
 *         { name: "auth-storage",  value: "<zustand JSON>" }
 *       ]
 *     }]
 *   }
 */

import { type FullConfig } from "@playwright/test";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { E2E_DB_USER_IDS } from "./e2e-credentials.js";

// ============================================================
// 1. Charger les variables d'environnement
// ============================================================
const envPath = path.resolve(__dirname, "../../backend/.env");
dotenv.config({ path: envPath });

// ============================================================
// Constantes
// ============================================================
//
// BACKEND_PORT est défini par playwright.config.ts via process.env.PORT
// avant que globalSetup ne soit exécuté (même processus Node.js).
// Fallback sur 3000 si le setup est lancé hors Playwright (ex: debug manuel).
//
const BACKEND_PORT = process.env.PORT ?? "3000";
const BACKEND_URL = `http://localhost:${BACKEND_PORT}`;
//
// E2E_FRONTEND_URL est défini par playwright.config.ts.
// Doit correspondre à l'URL réelle du frontend e2e (port 5174 par défaut)
// pour que les storageState soient appliqués sur la bonne origine.
//
const FRONTEND_URL = process.env.E2E_FRONTEND_URL ?? "http://localhost:5174";
const AUTH_DIR = path.join(__dirname, ".auth");

// Credentials : on utilise les userId au format U-9999-XXXX (valides pour le LoginUseCase)
// et les mots de passe définis dans e2e-credentials.ts
const ACCOUNTS = [
  {
    role: "admin" as const,
    userId: E2E_DB_USER_IDS.admin,
    password: "Admin@E2E2024!",
  },
  {
    role: "member" as const,
    userId: E2E_DB_USER_IDS.member,
    password: "Member@E2E2024!",
  },
  {
    role: "professor" as const,
    userId: E2E_DB_USER_IDS.professor,
    password: "Prof@E2E2024!",
  },
] as const;

// ============================================================
// Helper : parse d'un header Set-Cookie → objet cookie Playwright
// ============================================================
/** Parses a Set-Cookie header string into a Playwright-compatible cookie object */
function parseSetCookie(
  setCookieHeader: string,
  backendHost: string,
): {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires: number;
  httpOnly: boolean;
  secure: boolean;
  sameSite: "Strict" | "Lax" | "None";
} | null {
  // Format: "name=value; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800"
  const parts = setCookieHeader.split(";").map((p) => p.trim());
  const [nameValue, ...attributes] = parts;

  if (!nameValue || !nameValue.includes("=")) return null;

  const eqIdx = nameValue.indexOf("=");
  const name = nameValue.substring(0, eqIdx).trim();
  const value = nameValue.substring(eqIdx + 1).trim();

  let path = "/";
  let maxAge: number | undefined;
  let httpOnly = false;
  let secure = false;
  let sameSite: "Strict" | "Lax" | "None" = "Lax";

  for (const attr of attributes) {
    const lower = attr.toLowerCase();
    if (lower.startsWith("path=")) {
      path = attr.substring(5).trim();
    } else if (lower.startsWith("max-age=")) {
      maxAge = parseInt(attr.substring(8).trim(), 10);
    } else if (lower === "httponly") {
      httpOnly = true;
    } else if (lower === "secure") {
      secure = true;
    } else if (lower.startsWith("samesite=")) {
      const val = attr.substring(9).trim().toLowerCase();
      sameSite = val === "strict" ? "Strict" : val === "none" ? "None" : "Lax";
    }
  }

  const expires =
    maxAge !== undefined ? Math.floor(Date.now() / 1000) + maxAge : -1;

  // Extract hostname from backend URL (e.g., "http://localhost:3001" → "localhost")
  const domain = new URL(backendHost).hostname;

  return { name, value, domain, path, expires, httpOnly, secure, sameSite };
}

// ============================================================
// Helper : login + construction du storageState
// ============================================================
async function loginAndSaveState(
  role: "admin" | "member" | "professor",
  userId: string,
  password: string,
): Promise<void> {
  // Appel API login (fetch natif Node 18+)
  let response: Response;
  try {
    response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, password }),
    });
  } catch (err: unknown) {
    // ECONNREFUSED ou AggregateError → le backend n'est pas démarré
    throw new Error(
      `\n\u274C  Impossible de joindre le backend sur ${BACKEND_URL}\n` +
        `     Cause : ${err instanceof Error ? err.message : String(err)}\n\n` +
        `  → Le backend doit être démarré AVANT de lancer les tests.\n` +
        `  → Lance : pnpm --filter clubmanager-backend dev\n` +
        `  → Ou active webServer dans playwright.config.ts (déjà activé).\n`,
    );
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "(pas de body)");
    throw new Error(
      `\n\u274C  Login ${userId} échoué (HTTP ${response.status})\n` +
        `     Réponse serveur : ${body}\n\n` +
        `  → Les comptes E2E doivent exister en DB.\n` +
        `  → Lance : pnpm --filter @clubmanager/e2e seed\n`,
    );
  }

  // Extraire accessToken + user depuis response.data
  const json = (await response.json()) as {
    success: boolean;
    data: {
      user: Record<string, unknown>;
      accessToken: string;
      expiresIn: number;
    };
  };

  // L'API retourne accessToken directement dans data (pas dans data.tokens)
  const { accessToken, user } = json.data;

  // Extraire les cookies HTTP-only (refresh token) de la réponse login
  const cookies: Array<{
    name: string;
    value: string;
    domain: string;
    path: string;
    expires: number;
    httpOnly: boolean;
    secure: boolean;
    sameSite: "Strict" | "Lax" | "None";
  }> = [];

  // Node 18+ : getSetCookie() retourne un tableau (gère les cookies multiples)
  const rawCookies: string[] =
    typeof (response.headers as unknown as { getSetCookie?: () => string[] })
      .getSetCookie === "function"
      ? (
          response.headers as unknown as { getSetCookie: () => string[] }
        ).getSetCookie()
      : [response.headers.get("set-cookie") ?? ""].filter(Boolean);

  for (const raw of rawCookies) {
    const parsed = parseSetCookie(raw, BACKEND_URL);
    if (parsed) cookies.push(parsed);
  }

  // Construire le storageState Playwright
  const storageState = {
    cookies,
    origins: [
      {
        origin: FRONTEND_URL,
        localStorage: [
          {
            name: "accessToken",
            value: accessToken,
          },
          {
            name: "user",
            value: JSON.stringify(user),
          },
          {
            // Zustand persist : clé "auth-storage"
            // Format : { state: { user, isAuthenticated: true }, version: 0 }
            name: "auth-storage",
            value: JSON.stringify({
              state: { user, isAuthenticated: true },
              version: 0,
            }),
          },
          {
            name: "user-language",
            value: "fr",
          },
        ],
      },
    ],
  };

  // Écrire dans setup/.auth/{role}.json
  const outPath = path.join(AUTH_DIR, `${role}.json`);
  fs.writeFileSync(outPath, JSON.stringify(storageState, null, 2), "utf-8");
  console.log(`   ✓ storageState écrit : setup/.auth/${role}.json`);
}

// ============================================================
// Export par défaut — exécuté par Playwright avant tous les tests
// ============================================================
export default async function globalSetup(_config: FullConfig): Promise<void> {
  console.log("\n🚀 E2E Global Setup — authentification des comptes de test\n");

  // 2. Créer le dossier .auth s'il n'existe pas
  fs.mkdirSync(AUTH_DIR, { recursive: true });

  // 3. Login pour chaque compte
  for (const account of ACCOUNTS) {
    console.log(
      `🔐 Login pour le rôle "${account.role}" (userId: ${account.userId})...`,
    );
    try {
      await loginAndSaveState(account.role, account.userId, account.password);
    } catch (err) {
      // Afficher le message d'erreur clair et propager
      console.error((err as Error).message);
      throw err;
    }
  }

  // 4. Confirmation finale
  console.log("\n✅ E2E auth state saved for admin, member, professor\n");
}
