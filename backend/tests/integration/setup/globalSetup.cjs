"use strict";

const path = require("path");
const fs = require("fs");

// Load DB credentials from backend/.env (host, user, password, port)
require("dotenv").config({ path: path.join(__dirname, "../../../.env") });

const TEST_DB = "clubmanager_test";

/**
 * Jest globalSetup — runs once before all integration tests.
 * Creates `clubmanager_test`, applies the full schema, and seeds reference data.
 * The production `clubmanager` database is never touched.
 */
module.exports = async function globalSetup() {
  const mysql = require("mysql2/promise");

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306", 10),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    multipleStatements: true,
  });

  try {
    // 1. Drop and recreate test database
    await conn.query(`DROP DATABASE IF EXISTS \`${TEST_DB}\``);
    await conn.query(
      `CREATE DATABASE \`${TEST_DB}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
    await conn.query(`USE \`${TEST_DB}\``);

    // 2. Read and clean the schema — remove lines that create/select the production DB
    const schemaPath = path.resolve(
      __dirname,
      "../../../../db/creation/SCHEMA_CONSOLIDATE.sql",
    );
    let schema = fs.readFileSync(schemaPath, "utf-8");
    schema = schema
      .replace(
        /DROP\s+DATABASE\s+IF\s+EXISTS\s+`?clubmanager`?\s*;/gi,
        "-- stripped",
      )
      .replace(/CREATE\s+DATABASE\s+`?clubmanager`?[^;]*;/gi, "-- stripped")
      .replace(/USE\s+`?clubmanager`?\s*;/gi, "-- stripped");

    await conn.query(schema);

    // 3. Seed only the reference tables needed by auth tests.
    //    The full initial_data.sql is out-of-sync with the current schema
    //    (message_status structure changed, alertes_types.code is NOT NULL).
    //    We insert the minimum data required for FK constraints in utilisateurs.
    await conn.query(`
      INSERT INTO genres (id, nom) VALUES
        (1, 'Homme'), (2, 'Femme'), (3, 'Autre'), (4, 'Non spécifié')
      ON DUPLICATE KEY UPDATE nom = VALUES(nom);
    `);

    await conn.query(`
      INSERT INTO status (id, nom, description) VALUES
        (1, 'Actif',      'Utilisateur ou entité active'),
        (2, 'Inactif',    'Utilisateur ou entité inactive'),
        (3, 'Suspendu',   'Suspendu temporairement'),
        (4, 'En attente', 'En attente de validation'),
        (5, 'Archivé',    'Archivé et non utilisé')
      ON DUPLICATE KEY UPDATE nom = VALUES(nom);
    `);

    await conn.query(`
      INSERT INTO grades (id, nom, couleur, ordre) VALUES
        (1, 'Blanche',       '#FFFFFF', 0),
        (2, 'Bleue',         '#0000FF', 1),
        (3, 'Violette',      '#800080', 2),
        (4, 'Marron',        '#8B4513', 3),
        (5, 'Noire',         '#000000', 4)
      ON DUPLICATE KEY UPDATE nom = VALUES(nom);
    `);

    // 4. Apply migration 010: add the `email` column to email_validation_tokens.
    //    This migration is not yet incorporated into SCHEMA_CONSOLIDATE.sql (v4.4).
    await conn.query(`
      ALTER TABLE email_validation_tokens
        ADD COLUMN email VARCHAR(255) NULL
          COMMENT 'Nouvel email cible (change_email uniquement)'
          AFTER token_type;
    `);

    console.log(
      `\n✅ [globalSetup] Test database "${TEST_DB}" created and seeded.\n`,
    );
  } catch (err) {
    console.error(
      "\n❌ [globalSetup] Failed to initialize test database:",
      err.message,
    );
    throw err;
  } finally {
    await conn.end();
  }
};
