import { defineConfig, devices } from "@playwright/test";
import path from "path";

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
    // URL de base du frontend
    baseURL: "http://localhost:5173",

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
    //    (auth per-project, fixtures lourdes, etc.)
    //    Non utilisé pour l'instant : le setup est global.
    // ----------------------------------------------------------
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
    },

    // ----------------------------------------------------------
    // 2. Tests admin — contexte avec storageState admin
    //    Utilisé pour : tests back-office, gestion membres, etc.
    //    Exclut les tests auth (qui nécessitent un contexte vierge).
    // ----------------------------------------------------------
    {
      name: "chromium-admin",
      testIgnore: /tests\/auth\/.*/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: STORAGE_STATE.admin,
      },
    },

    // ----------------------------------------------------------
    // 3. Tests membre — contexte avec storageState member
    //    Utilisé pour : profil, inscriptions cours, etc.
    //    Exclut les tests auth (qui nécessitent un contexte vierge).
    // ----------------------------------------------------------
    {
      name: "chromium-member",
      testIgnore: /tests\/auth\/.*/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: STORAGE_STATE.member,
      },
    },

    // ----------------------------------------------------------
    // 4. Tests sans auth — aucun storageState
    //    Utilisé pour : login, register, forgot-password, etc.
    //    N'exécute QUE les tests du dossier tests/auth/.
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
  // reuseExistingServer: true  → réutilise le serveur s'il tourne déjà
  //                              (pratique quand on les a démarrés manuellement)
  // ============================================================
  webServer: [
    {
      // Backend Express (TypeScript via tsx watch)
      // Playwright attend que /health réponde 200 avant de lancer globalSetup
      command: "pnpm --filter clubmanager-backend dev",
      url: "http://localhost:3000/health",
      reuseExistingServer: true,
      timeout: 60_000,
      stdout: "pipe",
      stderr: "pipe",
    },
    {
      // Frontend Vite
      command: "pnpm --filter @clubmanager/frontend dev",
      url: "http://localhost:5173",
      reuseExistingServer: true,
      timeout: 60_000,
      stdout: "pipe",
      stderr: "pipe",
    },
  ],
});
