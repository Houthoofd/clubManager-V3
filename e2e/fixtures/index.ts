/**
 * index.ts
 * Point d'entrée des fixtures E2E.
 *
 * Importer depuis ici dans les fichiers de test :
 *   import { test, expect, LoginPage, DashboardPage } from '../fixtures';
 *
 * Le `test` et `expect` exportés sont ceux de db.fixture (qui étend auth.fixture).
 * Ils incluent toutes les fixtures : adminPage, memberPage, professorPage, db.
 */

// Fixtures d'authentification (types + fixtures brutes)
export { type AuthFixtures } from "./auth.fixture";

// Fixtures complètes (auth + db) — test et expect enrichis
export { test, expect, type DbFixtures, type DbHelper } from "./db.fixture";

// Page Objects
export { LoginPage } from "./pages/LoginPage";
export { DashboardPage } from "./pages/DashboardPage";
export { ProfilePage } from "./pages/ProfilePage";
export { CoursesPage } from "./pages/CoursesPage";
