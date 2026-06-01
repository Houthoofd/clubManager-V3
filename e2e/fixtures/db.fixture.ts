/**
 * db.fixture.ts
 * Fixture Playwright fournissant un accès DB MySQL pour les tests.
 *
 * Usage dans un test :
 *   import { test, expect } from '@e2e/fixtures';
 *
 *   test('exemple avec DB', async ({ db }) => {
 *     const rows = await db.query('SELECT * FROM utilisateurs WHERE email = ?', ['test@test.com']);
 *     expect(rows).toHaveLength(1);
 *   });
 *
 * ⚠️  Les variables d'env DB_* doivent être disponibles au moment du test.
 *     Elles sont chargées depuis backend/.env par le globalSetup.
 */

import { test as authTest, expect, type AuthFixtures } from "./auth.fixture";
import mysql, { type Connection } from "mysql2/promise";
import { createHash } from "crypto";
import path from "path";
import dotenv from "dotenv";

// Charger les variables d'env si pas encore chargées (utile pour les runs isolés)
dotenv.config({ path: path.resolve(__dirname, "../../backend/.env") });

// ============================================================
// Types
// ============================================================

/** Interface des méthodes utilitaires DB disponibles dans les tests */
export interface DbHelper {
  /** Tronque une table (supprime toutes les lignes) */
  truncate(table: string): Promise<void>;
  /** Exécute une requête SQL et retourne les résultats */
  query<T = Record<string, unknown>>(
    sql: string,
    params?: unknown[],
  ): Promise<T[]>;
  /** Insère une ligne et retourne l'insertId */
  insertOne(table: string, data: Record<string, unknown>): Promise<number>;
  /** Insère un token directement en DB pour les tests nécessitant un token valide.
   * Le backend SHA-256 hache les tokens — ce helper fait la même chose.
   * @param type - 'password-reset' | 'email-verification' | 'email-change'
   * @param userId - ID interne (int) de l'utilisateur (pas le userId format U-XXXX)
   * @param token - Token en clair (sera hashé SHA-256)
   * @param email - Nouveau email (obligatoire pour 'email-change')
   * @param expiresInMinutes - Durée de validité (défaut: 60)
   */
  insertToken(params: {
    type: "password-reset" | "email-verification" | "email-change";
    userId: number;
    token: string;
    email?: string;
    expiresInMinutes?: number;
  }): Promise<void>;
  /** Connexion MySQL sous-jacente (pour les cas avancés) */
  connection: Connection;
}

export type DbFixtures = {
  /** Helper d'accès DB — connexion créée avant chaque test, fermée après */
  db: DbHelper;
};

// ============================================================
// Extension : fusion des fixtures auth + db
// ============================================================
export const test = authTest.extend<DbFixtures>({
  db: async ({}, use) => {
    // Ouvrir la connexion MySQL
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST ?? "localhost",
      port: Number(process.env.DB_PORT ?? 3306),
      user: process.env.DB_USER ?? "root",
      password: process.env.DB_PASSWORD ?? "",
      database: process.env.DB_NAME ?? "clubmanager",
    });

    // Construire le helper
    const db: DbHelper = {
      connection,

      async truncate(table: string): Promise<void> {
        await connection.execute(`DELETE FROM \`${table}\``);
      },

      async query<T = Record<string, unknown>>(
        sql: string,
        params: unknown[] = [],
      ): Promise<T[]> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const [rows] = await connection.execute(sql, params as any[]);
        return rows as T[];
      },

      async insertToken({ type, userId, token, email, expiresInMinutes = 60 }) {
        const tokenHash = createHash("sha256").update(token).digest("hex");
        const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

        if (type === "password-reset") {
          await connection.execute(
            "INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)",
            [userId, tokenHash, expiresAt],
          );
        } else if (type === "email-verification") {
          await connection.execute(
            "INSERT INTO email_validation_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)",
            [userId, tokenHash, expiresAt],
          );
        } else if (type === "email-change") {
          if (!email)
            throw new Error("email is required for email-change token type");
          await connection.execute(
            "DELETE FROM email_validation_tokens WHERE user_id = ? AND token_type = 'change_email'",
            [userId],
          );
          await connection.execute(
            "INSERT INTO email_validation_tokens (user_id, token_hash, token_type, email, expires_at) VALUES (?, ?, 'change_email', ?, ?)",
            [userId, tokenHash, email, expiresAt],
          );
        }
      },

      async insertOne(
        table: string,
        data: Record<string, unknown>,
      ): Promise<number> {
        const columns = Object.keys(data)
          .map((col) => `\`${col}\``)
          .join(", ");
        const placeholders = Object.keys(data)
          .map(() => "?")
          .join(", ");
        const values = Object.values(data);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const [result] = await connection.execute(
          `INSERT INTO \`${table}\` (${columns}) VALUES (${placeholders})`,
          values as any[],
        );

        return (result as { insertId: number }).insertId;
      },
    };

    // Fournir le helper au test
    await use(db);

    // Fermer la connexion après le test
    await connection.end();
  },
});

export { expect };
export type { AuthFixtures };
