import { defineConfig, devices } from "@playwright/test";
import path from "path";
import { findBackendPort, findFrontendPort } from "./setup/portUtils";

// ============================================================
// Détection automatique du port backend
// ============================================================
//
// findBackendPort() examine les ports 3000-3003 et retourne :
//   - le port où ClubManager tourne déjà (réutilisation)
//   - le premier port libre (démarrage d'une nouvelle instance)
//
// Cela permet de coexister avec d'autres projets Node.js qui
// occuperaient déjà le port 3000 (ex : Unitix, autre backend…).
//
// La valeur est mise en cache dans process.env.BACKEND_PORT dès la
// première exécution (processus principal). Les workers Playwright
// héritent de cette variable et findBackendPort() retourne
// immédiatement sans relancer les vérifications réseau.
//
const BACKEND_PORT = findBackendPort();
const BACKEND_URL = `http://localhost:${BACKEND_PORT}`;

// Même mécanique côté frontend : trouver un port libre.
// On part de 5174 (jamais de 5173) pour ne pas entrer en conflit avec
// le serveur de développement qui tourne normalement sur ce port.
const E2E_FRONTEND_PORT = findFrontendPort(5174);
const E2E_FRONTEND_URL = `http://localhost:${E2E_FRONTEND_PORT}`;

// Propagation aux processus enfants :
//   process.env.PORT              → Express listen (backend/src/server.ts)
//   process.env.BACKEND_PORT      → cache pour les workers (évite re-détection)
//   process.env.VITE_API_TARGET   → proxy Vite (frontend/vite.config.ts)
//   process.env.E2E_FRONTEND_PORT → port Vite e2e (frontend/vite.config.ts)
//   process.env.E2E_FRONTEND_URL  → origine des storageState (globalSetup.ts)
process.env.PORT = String(BACKEND_PORT);
process.env.BACKEND_PORT = String(BACKEND_PORT);
process.env.VITE_API_TARGET = BACKEND_URL;
process.env.E2E_FRONTEND_PORT = String(E2E_FRONTEND_PORT);
process.env.E2E_FRONTEND_URL = E2E_FRONTEND_URL;

// Clé Stripe publique de test — injectée dans le frontend dev server pour les tests Stripe.
// Utilise la valeur déjà définie dans l'env si disponible, sinon une clé mock fictive.
// Les tests E2E mockent toutes les requêtes Stripe réelles via page.route().
process.env.VITE_STRIPE_PUBLIC_KEY =
  process.env.VITE_STRIPE_PUBLIC_KEY ?? "pk_test_e2e_mock_playwright";

// ============================================================
// Répertoire de stockage des états d'authentification
// Généré par globalSetup.ts avant chaque run
// ============================================================
const AUTH_DIR = path.join(__dirname, "setup/.auth");

/**
 * Chemins vers les fichiers de storageState par rôle.
 * Exporté pour pouvoir être importé depuis les tests
 * (notamment dans les tests auth qui créent des contextes manuellement).
 */
export const STORAGE_STATE = {
  admin: path.join(AUTH_DIR, "admin.json"),
  member: path.join(AUTH_DIR, "member.json"),
  professor: path.join(AUTH_DIR, "professor.json"),
} as const;

// ============================================================
// Configuration Playwright principale
// ============================================================
export default defineConfig({
  testDir: "./tests",

  // Désactiver la parallélisation pour éviter les conflits de DB / état partagé
  fullyParallel: false,

  // En CI, interdire les .only qui seraient oubliés dans un commit
  forbidOnly: !!process.env.CI,

  // 1 retry en CI pour les flaky tests réseau, aucun en local
  retries: process.env.CI ? 1 : 0,

  // En CI, 1 seul worker pour garantir l'ordre et éviter la surcharge
  workers: process.env.CI ? 1 : undefined,

  // Reporters : HTML toujours, GitHub Actions en CI
  reporter: process.env.CI
    ? [["html", { open: "never" }], ["github"] as ["github"]]
    : [["html", { open: "never" }]],

  // Fichiers de setup/teardown globaux (exécutés une fois par run)
  globalSetup: "./setup/globalSetup",
  globalTeardown: "./setup/globalTeardown",

  // ============================================================
  // Options communes à tous les projets
  // ============================================================
  use: {
    // URL de base du frontend e2e (port dédié 5174)
    baseURL: E2E_FRONTEND_URL,

    // Capturer la trace au premier retry (utile pour déboguer les échecs CI)
    trace: "on-first-retry",

    // Screenshot uniquement en cas d'échec
    screenshot: "only-on-failure",

    // Vidéo au premier retry
    video: "on-first-retry",
  },

  // ============================================================
  // Projets Playwright
  // ============================================================
  projects: [
    // ----------------------------------------------------------
    // 1. Projet "setup" — pour d'éventuels fichiers *.setup.ts
    // ----------------------------------------------------------
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
    },

    // ----------------------------------------------------------
    // 2. Tests admin — contexte avec storageState admin
    // ----------------------------------------------------------
    {
      name: "chromium-admin",
      // profile.spec.ts  → réservé chromium-member (data race sur e2e_member)
      // tests/member/*   → réservés chromium-member (fixtures memberPage)
      testIgnore: [
        /tests\/auth\/.*/,
        /tests\/navigation\/profile\.spec\.ts/,
        /tests\/member\/.*/,
        /tests\/profile\/.*/,
      ],
      use: {
        ...devices["Desktop Chrome"],
        storageState: STORAGE_STATE.admin,
      },
    },

    // ----------------------------------------------------------
    // 3. Tests membre — contexte avec storageState member
    // ----------------------------------------------------------
    {
      name: "chromium-member",
      // tests/admin/* → réservés chromium-admin (fixtures adminPage)
      // tests/flows/* → réservés chromium-admin (évite double exécution)
      testIgnore: [/tests\/auth\/.*/, /tests\/admin\/.*/, /tests\/flows\/.*/],
      use: {
        ...devices["Desktop Chrome"],
        storageState: STORAGE_STATE.member,
      },
    },

    // ----------------------------------------------------------
    // 4. Tests sans auth — aucun storageState
    // ----------------------------------------------------------
    {
      name: "chromium-no-auth",
      testMatch: /tests\/auth\/.*/,
      use: {
        ...devices["Desktop Chrome"],
        // Pas de storageState : chaque test part d'un browser vierge
      },
    },
  ],

  // ============================================================
  // webServer — démarre automatiquement backend + frontend
  //
  // Les URLs utilisent BACKEND_URL (port détecté dynamiquement).
  // reuseExistingServer: true → si ClubManager est déjà sur ce port,
  //   Playwright le réutilise sans en démarrer un second.
  // ============================================================
  webServer: [
    {
      // Backend Express — démarre sur le port détecté (PORT env var)
      command: "pnpm --filter clubmanager-backend dev",
      url: `${BACKEND_URL}/health`,
      reuseExistingServer: true,
      timeout: 60_000,
      stdout: "pipe",
      stderr: "pipe",
    },
    {
      // Frontend Vite — port détecté dynamiquement.
      //
      // Toujours ≥ 5174 : on ne touche jamais le port 5173 du frontend dev.
      // Le port et la cible proxy (VITE_API_TARGET) sont injectés via
      // process.env, hérités par le processus Vite enfant.
      //
      // reuseExistingServer: true — si le serveur e2e tourne déjà sur ce
      // port (exécution précédente), on le réutilise ; sinon on le démarre.
      command: "pnpm --filter @clubmanager/frontend dev",
      url: E2E_FRONTEND_URL,
      reuseExistingServer: true,
      timeout: 60_000,
      stdout: "pipe",
      stderr: "pipe",
    },
  ],
});
