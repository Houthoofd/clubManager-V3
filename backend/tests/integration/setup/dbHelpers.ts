/**
 * dbHelpers.ts
 * Test utilities for integration tests — direct DB access, bypasses application layers.
 */

import mysql, {
  type Pool,
  type ResultSetHeader,
  type RowDataPacket,
} from "mysql2/promise";
import bcrypt from "bcryptjs";
import { JwtService } from "../../../src/shared/services/JwtService.js";
import { UserRole } from "@clubmanager/types";

const TEST_DB = "clubmanager_test";

// ─── Connection pool (test-only, never used by the app) ──────────────────────

let _pool: Pool | null = null;

export function getTestPool(): Pool {
  if (!_pool) {
    _pool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "3306", 10),
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: TEST_DB,
      connectionLimit: 5,
      waitForConnections: true,
    });
  }
  return _pool;
}

export async function closeTestPool(): Promise<void> {
  if (_pool) {
    await _pool.end();
    _pool = null;
  }
}

// ─── Counter for unique test user generation ─────────────────────────────────

let _counter = 0;

function nextCounter(): number {
  return ++_counter;
}

export function resetUserCounter(): void {
  _counter = 0;
}

// ─── Table cleanup ────────────────────────────────────────────────────────────

/**
 * Truncates all auth-related tables in the correct order.
 * Safe to call in beforeEach.
 */
export async function truncateAuthTables(): Promise<void> {
  const pool = getTestPool();
  const conn = await pool.getConnection();
  try {
    await conn.query("SET FOREIGN_KEY_CHECKS = 0");
    await conn.query("TRUNCATE TABLE refresh_tokens");
    await conn.query("TRUNCATE TABLE email_validation_tokens");
    await conn.query("TRUNCATE TABLE password_reset_tokens");
    await conn.query("TRUNCATE TABLE password_reset_attempts");
    await conn.query("TRUNCATE TABLE login_attempts");
    await conn.query("TRUNCATE TABLE auth_attempts");
    await conn.query("TRUNCATE TABLE utilisateurs");
    await conn.query("SET FOREIGN_KEY_CHECKS = 1");
    resetUserCounter();
  } finally {
    conn.release();
  }
}

// ─── Test user factory ───────────────────────────────────────────────────────

export interface TestUser {
  id: number;
  userId: string;
  email: string;
  /** Cleartext password — use this in HTTP request bodies */
  password: string;
}

export interface CreateTestUserOptions {
  email_verified?: boolean;
  active?: boolean;
  peut_se_connecter?: boolean;
  deleted_at?: Date | null;
  anonymized?: boolean;
  role_app?: "admin" | "member" | "professor";
}

/**
 * Inserts a user directly into the test DB — bypasses use-cases and email sending.
 * Returns the cleartext password so tests can use it in HTTP login requests.
 */
export async function createTestUser(
  options: CreateTestUserOptions = {},
): Promise<TestUser> {
  const pool = getTestPool();
  const n = nextCounter();
  const year = new Date().getFullYear();
  const userId = `U-${year}-${n.toString().padStart(4, "0")}`;
  const email = `test${n}_${Date.now()}@integration.test`;
  const password = `Test@${n}1234!Secure`;
  const hashed = await bcrypt.hash(password, 10);

  const {
    email_verified = true,
    active = true,
    peut_se_connecter = true,
    deleted_at = null,
    anonymized = false,
    role_app = "member",
  } = options;

  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO utilisateurs
       (userId, first_name, last_name, nom_utilisateur, email, password,
        date_of_birth, genre_id, status_id, active, email_verified,
        peut_se_connecter, deleted_at, anonymized, role_app)
     VALUES (?, 'Test', 'User', ?, ?, ?, '1990-01-01', 1, 1, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      `testuser${n}`,
      email,
      hashed,
      active ? 1 : 0,
      email_verified ? 1 : 0,
      peut_se_connecter ? 1 : 0,
      deleted_at ?? null,
      anonymized ? 1 : 0,
      role_app,
    ],
  );

  return { id: result.insertId, userId, email, password };
}

// ─── Direct DB queries ───────────────────────────────────────────────────────

/**
 * Fetches a row from the utilisateurs table by email.
 * Useful to assert DB state after an HTTP call.
 */
export async function getUserByEmail(
  email: string,
): Promise<RowDataPacket | null> {
  const pool = getTestPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM utilisateurs WHERE email = ? LIMIT 1",
    [email],
  );
  return rows[0] ?? null;
}

/**
 * Counts the rows in refresh_tokens for a given user.
 */
export async function countRefreshTokens(userId: number): Promise<number> {
  const pool = getTestPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT COUNT(*) AS cnt FROM refresh_tokens WHERE user_id = ? AND revoked = FALSE",
    [userId],
  );
  return (rows[0] as any).cnt as number;
}

// ─── JWT helpers ─────────────────────────────────────────────────────────────

/**
 * Generates a valid access token for a test user.
 * @param user  - The test user (id, email, userId)
 * @param role  - Optional role; defaults to UserRole.MEMBER
 */
export function generateAccessToken(user: TestUser, role?: UserRole): string {
  return JwtService.generateAccessToken({
    userId: user.id,
    email: user.email,
    userIdString: user.userId,
    role_app: role ?? UserRole.MEMBER,
  });
}

/** Raccourci — crée un utilisateur admin et retourne son token admin */
export async function createTestAdmin(): Promise<{
  user: TestUser;
  token: string;
}> {
  const user = await createTestUser({ role_app: "admin" });
  return { user, token: generateAccessToken(user, UserRole.ADMIN) };
}

/** Raccourci — crée un utilisateur professeur et retourne son token professeur */
export async function createTestProfessor(): Promise<{
  user: TestUser;
  token: string;
}> {
  const user = await createTestUser({ role_app: "professor" });
  return { user, token: generateAccessToken(user, UserRole.PROFESSOR) };
}

// ─── Grade helpers ────────────────────────────────────────────────────────────

/**
 * Insère un grade dans la DB de test.
 * Retourne l'insertId du grade créé.
 */
export async function insertTestGrade(data: {
  nom: string;
  ordre: number;
  couleur?: string;
}): Promise<number> {
  const pool = getTestPool();
  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO grades (nom, ordre, couleur) VALUES (?, ?, ?)",
    [data.nom, data.ordre, data.couleur ?? "#CCCCCC"],
  );
  return result.insertId;
}

/**
 * Supprime les grades insérés par les tests (conserve les seeds id 1-5).
 * Safe to call in beforeEach.
 */
export async function truncateTestGrades(): Promise<void> {
  const pool = getTestPool();
  await pool.query("DELETE FROM grades WHERE id > 5");
}

// ─── Phase 3 — Families ──────────────────────────────────────────────────────

/**
 * Crée une famille et ajoute l'utilisateur fourni comme responsable.
 * Retourne l'id de la famille créée.
 */
export async function createTestFamily(
  responsableUserId: number,
  nom = "Famille Test",
): Promise<number> {
  const pool = getTestPool();
  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO familles (nom) VALUES (?)",
    [nom],
  );
  const familleId = result.insertId;
  await pool.query(
    "INSERT INTO membres_famille (famille_id, user_id, role, est_responsable, est_tuteur_legal) VALUES (?, ?, ?, 1, 0)",
    [familleId, responsableUserId, "parent"],
  );
  return familleId;
}

/**
 * Ajoute un utilisateur existant à une famille.
 */
export async function addFamilyMember(
  familleId: number,
  userId: number,
  options: {
    role?: string;
    est_responsable?: boolean;
    est_tuteur_legal?: boolean;
  } = {},
): Promise<void> {
  const pool = getTestPool();
  const {
    role = "enfant",
    est_responsable = false,
    est_tuteur_legal = false,
  } = options;
  await pool.query(
    "INSERT INTO membres_famille (famille_id, user_id, role, est_responsable, est_tuteur_legal) VALUES (?, ?, ?, ?, ?)",
    [
      familleId,
      userId,
      role,
      est_responsable ? 1 : 0,
      est_tuteur_legal ? 1 : 0,
    ],
  );
}

/**
 * Vide les tables famille (familles + membres_famille).
 * Safe to call in beforeEach.
 */
export async function truncateFamilies(): Promise<void> {
  const pool = getTestPool();
  const conn = await pool.getConnection();
  try {
    await conn.query("SET FOREIGN_KEY_CHECKS = 0");
    await conn.query("TRUNCATE TABLE membres_famille");
    await conn.query("TRUNCATE TABLE familles");
    await conn.query("SET FOREIGN_KEY_CHECKS = 1");
  } finally {
    conn.release();
  }
}

// ─── Phase 4 — Groups ────────────────────────────────────────────────────────

/**
 * Crée un groupe de test. Retourne l'id du groupe.
 */
export async function createTestGroup(
  data: { nom?: string; description?: string } = {},
): Promise<number> {
  const pool = getTestPool();
  const n = nextCounter();
  const { nom = `Groupe Test ${n}`, description = "Description test" } = data;
  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO groupes (nom, description) VALUES (?, ?)",
    [nom, description],
  );
  return result.insertId;
}

/**
 * Ajoute un utilisateur à un groupe (IGNORE si déjà présent).
 */
export async function addGroupMember(
  groupeId: number,
  userId: number,
): Promise<void> {
  const pool = getTestPool();
  await pool.query(
    "INSERT IGNORE INTO groupes_utilisateurs (groupe_id, user_id) VALUES (?, ?)",
    [groupeId, userId],
  );
}

/**
 * Vide les tables groupes (groupes + groupes_utilisateurs).
 */
export async function truncateGroups(): Promise<void> {
  const pool = getTestPool();
  const conn = await pool.getConnection();
  try {
    await conn.query("SET FOREIGN_KEY_CHECKS = 0");
    await conn.query("TRUNCATE TABLE groupes_utilisateurs");
    await conn.query("TRUNCATE TABLE groupes");
    await conn.query("SET FOREIGN_KEY_CHECKS = 1");
  } finally {
    conn.release();
  }
}

// ─── Phase 4 — Messaging ─────────────────────────────────────────────────────

/**
 * Insère un message de test entre deux utilisateurs. Retourne l'id du message.
 */
export async function createTestMessage(
  expediteurId: number,
  destinataireId: number,
  data: { sujet?: string; contenu?: string } = {},
): Promise<number> {
  const pool = getTestPool();
  const { sujet = "Sujet test", contenu = "Contenu du message de test" } = data;
  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO messages (expediteur_id, destinataire_id, sujet, contenu, envoye_par_email, lu) VALUES (?, ?, ?, ?, 0, 0)",
    [expediteurId, destinataireId, sujet, contenu],
  );
  return result.insertId;
}

/**
 * Vide les tables messagerie (messages, message_status, broadcasts).
 */
export async function truncateMessages(): Promise<void> {
  const pool = getTestPool();
  const conn = await pool.getConnection();
  try {
    await conn.query("SET FOREIGN_KEY_CHECKS = 0");
    await conn.query("TRUNCATE TABLE message_status");
    await conn.query("TRUNCATE TABLE messages");
    await conn.query("TRUNCATE TABLE broadcasts");
    await conn.query("SET FOREIGN_KEY_CHECKS = 1");
  } finally {
    conn.release();
  }
}

// ─── Phase 4 — Notifications ─────────────────────────────────────────────────

/**
 * Insère une notification de test pour un utilisateur. Retourne l'id.
 */
export async function seedNotification(
  userId: number,
  data: { titre?: string; contenu?: string; type?: string } = {},
): Promise<number> {
  const pool = getTestPool();
  const {
    titre = "Notification test",
    contenu = "Contenu de la notification de test",
    type = "info",
  } = data;
  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO notifications (user_id, type, titre, contenu) VALUES (?, ?, ?, ?)",
    [userId, type, titre, contenu],
  );
  return result.insertId;
}

/**
 * Vide la table notifications.
 */
export async function truncateNotifications(): Promise<void> {
  const pool = getTestPool();
  await pool.query("TRUNCATE TABLE notifications");
}

// ─── Phase 4 — Alerts ────────────────────────────────────────────────────────

/**
 * Crée un type d'alerte de test. Retourne l'id.
 */
export async function createTestAlertType(
  data: { code?: string; nom?: string; priorite?: string } = {},
): Promise<number> {
  const pool = getTestPool();
  const n = nextCounter();
  const {
    code = `TEST_ALERT_${n}_${Date.now()}`,
    nom = `Alerte Test ${n}`,
    priorite = "normale",
  } = data;
  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO alertes_types (code, nom, priorite, actif) VALUES (?, ?, ?, 1)",
    [code, nom, priorite],
  );
  return result.insertId;
}

/**
 * Crée une alerte utilisateur (alertes_utilisateurs). Retourne l'id.
 */
export async function createTestUserAlert(
  userId: number,
  alerteTypeId: number,
): Promise<number> {
  const pool = getTestPool();
  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO alertes_utilisateurs (user_id, alerte_type_id) VALUES (?, ?)",
    [userId, alerteTypeId],
  );
  return result.insertId;
}

/**
 * Vide les tables alertes.
 */
export async function truncateAlerts(): Promise<void> {
  const pool = getTestPool();
  const conn = await pool.getConnection();
  try {
    await conn.query("SET FOREIGN_KEY_CHECKS = 0");
    await conn.query("TRUNCATE TABLE alertes_actions");
    await conn.query("TRUNCATE TABLE alertes_utilisateurs");
    await conn.query("TRUNCATE TABLE alertes_types");
    await conn.query("SET FOREIGN_KEY_CHECKS = 1");
  } finally {
    conn.release();
  }
}

// ─── Phase 5 — Courses ───────────────────────────────────────────────────────

/**
 * Crée un cours récurrent de test. Retourne l'id.
 */
export async function createTestCourseRecurrent(
  data: {
    type_cours?: string;
    jour_semaine?: number;
    heure_debut?: string;
    heure_fin?: string;
  } = {},
): Promise<number> {
  const pool = getTestPool();
  const {
    type_cours = "karate",
    jour_semaine = 1,
    heure_debut = "10:00",
    heure_fin = "11:00",
  } = data;
  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO cours_recurrent (type_cours, jour_semaine, heure_debut, heure_fin, active) VALUES (?, ?, ?, ?, 1)",
    [type_cours, jour_semaine, heure_debut, heure_fin],
  );
  return result.insertId;
}

/**
 * Crée une session de cours (cours). Retourne l'id.
 */
export async function createTestCourseSession(
  courseRecurrentId: number | null,
  data: {
    date_cours?: string;
    type_cours?: string;
    heure_debut?: string;
    heure_fin?: string;
  } = {},
): Promise<number> {
  const pool = getTestPool();
  const {
    date_cours = "2026-12-01",
    type_cours = "karate",
    heure_debut = "10:00",
    heure_fin = "11:00",
  } = data;
  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO cours (cours_recurrent_id, date_cours, type_cours, heure_debut, heure_fin) VALUES (?, ?, ?, ?, ?)",
    [courseRecurrentId, date_cours, type_cours, heure_debut, heure_fin],
  );
  return result.insertId;
}

/**
 * Inscrit un utilisateur à une session de cours. Retourne l'id de l'inscription.
 */
export async function createTestInscription(
  userId: number,
  coursId: number,
): Promise<number> {
  const pool = getTestPool();
  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO inscriptions (user_id, cours_id) VALUES (?, ?)",
    [userId, coursId],
  );
  return result.insertId;
}

/**
 * Vide les tables cours.
 */
export async function truncateCourses(): Promise<void> {
  const pool = getTestPool();
  const conn = await pool.getConnection();
  try {
    await conn.query("SET FOREIGN_KEY_CHECKS = 0");
    await conn.query("TRUNCATE TABLE inscriptions");
    await conn.query("TRUNCATE TABLE cours_recurrent_professeur");
    await conn.query("TRUNCATE TABLE cours");
    await conn.query("TRUNCATE TABLE cours_recurrent");
    await conn.query("SET FOREIGN_KEY_CHECKS = 1");
  } finally {
    conn.release();
  }
}

// ─── Phase 5 — Reservations ──────────────────────────────────────────────────

/**
 * Crée une réservation de test. Retourne l'id.
 */
export async function createTestReservation(
  userId: number,
  coursId: number,
  statut = "confirmee",
): Promise<number> {
  const pool = getTestPool();
  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO reservations (user_id, cours_id, statut) VALUES (?, ?, ?)",
    [userId, coursId, statut],
  );
  return result.insertId;
}

/**
 * Vide la table reservations.
 */
export async function truncateReservations(): Promise<void> {
  const pool = getTestPool();
  await pool.query("TRUNCATE TABLE reservations");
}

// ─── Phase 5 — Templates ─────────────────────────────────────────────────────

/**
 * Crée un template de test dans messages_personnalises.
 * Crée aussi un type de template dédié et retourne l'id du template.
 */
export async function createTestTemplate(
  data: { nom?: string; sujet?: string; contenu?: string } = {},
): Promise<number> {
  const pool = getTestPool();
  const n = nextCounter();
  const {
    nom = `Template Test ${n}`,
    sujet,
    contenu = "Contenu du template test",
  } = data;

  // Crée un type de template dédié
  const [typeResult] = await pool.query<ResultSetHeader>(
    "INSERT INTO types_messages_personnalises (nom, description, actif) VALUES (?, NULL, 1)",
    [`Type ${nom}`],
  );
  const type_id = typeResult.insertId;

  // sujet ou nom utilisé comme titre
  const titre = sujet ?? nom;

  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO messages_personnalises (type_id, titre, contenu, actif) VALUES (?, ?, ?, 1)",
    [type_id, titre, contenu],
  );
  return result.insertId;
}

/**
 * Vide les tables templates (messages_personnalises + types_messages_personnalises).
 */
export async function truncateTemplates(): Promise<void> {
  const pool = getTestPool();
  const conn = await pool.getConnection();
  try {
    await conn.query("SET FOREIGN_KEY_CHECKS = 0");
    await conn.query("TRUNCATE TABLE messages_personnalises");
    await conn.query("TRUNCATE TABLE types_messages_personnalises");
    await conn.query("SET FOREIGN_KEY_CHECKS = 1");
  } finally {
    conn.release();
  }
}

// ─── Phase 6 — Payments ──────────────────────────────────────────────────────

/**
 * Crée un plan tarifaire de test. Retourne l'id.
 */
export async function createTestPricingPlan(
  data: { nom?: string; prix?: number; duree_mois?: number } = {},
): Promise<number> {
  const pool = getTestPool();
  const n = nextCounter();
  const { nom = `Plan Test ${n}`, prix = 50.0, duree_mois = 12 } = data;
  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO plans_tarifaires (nom, prix, duree_mois, actif) VALUES (?, ?, ?, 1)",
    [nom, prix, duree_mois],
  );
  return result.insertId;
}

/**
 * Crée une échéance de paiement de test. Retourne l'id.
 */
export async function createTestPaymentSchedule(
  userId: number,
  data: {
    montant?: number;
    date_echeance?: string;
    plan_tarifaire_id?: number | null;
  } = {},
): Promise<number> {
  const pool = getTestPool();
  const {
    montant = 50.0,
    date_echeance = "2026-12-31",
    plan_tarifaire_id = null,
  } = data;
  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO echeances_paiements (user_id, montant, date_echeance, statut, plan_tarifaire_id) VALUES (?, ?, ?, ?, ?)",
    [userId, montant, date_echeance, "en_attente", plan_tarifaire_id],
  );
  return result.insertId;
}

/**
 * Vide les tables paiements (echeances + paiements + plans).
 */
export async function truncatePayments(): Promise<void> {
  const pool = getTestPool();
  const conn = await pool.getConnection();
  try {
    await conn.query("SET FOREIGN_KEY_CHECKS = 0");
    await conn.query("TRUNCATE TABLE echeances_paiements");
    await conn.query("TRUNCATE TABLE paiements");
    await conn.query("TRUNCATE TABLE plans_tarifaires");
    await conn.query("SET FOREIGN_KEY_CHECKS = 1");
  } finally {
    conn.release();
  }
}

// ─── Phase 6 — Store ─────────────────────────────────────────────────────────

/**
 * Crée une catégorie de store de test. Retourne l'id.
 */
export async function createTestStoreCategory(
  data: { nom?: string; description?: string } = {},
): Promise<number> {
  const pool = getTestPool();
  const n = nextCounter();
  const {
    nom = `Catégorie Test ${n}`,
    description = "Description catégorie test",
  } = data;
  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO categories (nom, description, ordre) VALUES (?, ?, 99)",
    [nom, description],
  );
  return result.insertId;
}

/**
 * Vide toutes les tables du store.
 */
export async function truncateStore(): Promise<void> {
  const pool = getTestPool();
  const conn = await pool.getConnection();
  try {
    await conn.query("SET FOREIGN_KEY_CHECKS = 0");
    await conn.query("TRUNCATE TABLE mouvements_stock");
    await conn.query("TRUNCATE TABLE commande_articles"); // nom correct (sans 's')
    await conn.query("TRUNCATE TABLE commandes");
    await conn.query("TRUNCATE TABLE stocks");
    await conn.query("TRUNCATE TABLE images"); // table 'images', pas 'article_images'
    await conn.query("TRUNCATE TABLE articles");
    await conn.query("TRUNCATE TABLE tailles");
    await conn.query("TRUNCATE TABLE categories");
    await conn.query("SET FOREIGN_KEY_CHECKS = 1");
  } finally {
    conn.release();
  }
}
