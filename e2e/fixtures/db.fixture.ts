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
