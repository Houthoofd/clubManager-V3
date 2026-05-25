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

    // 3. Seed reference tables required by auth tests (status + grades).
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
        (1, 'Blanche',  '#FFFFFF', 0),
        (2, 'Bleue',    '#0000FF', 1),
        (3, 'Violette', '#800080', 2),
        (4, 'Marron',   '#8B4513', 3),
        (5, 'Noire',    '#000000', 4)
      ON DUPLICATE KEY UPDATE nom = VALUES(nom);
    `);

    // 3b. Migration V4.6 — tables de référence phase 1
    //     (methodes_paiement, statuts_commande, types_cours)
    //     Ces tables n'existent pas dans SCHEMA_CONSOLIDATE.sql.
    await conn.query(`
      CREATE TABLE IF NOT EXISTS methodes_paiement (
        id               INT UNSIGNED  NOT NULL AUTO_INCREMENT,
        code             VARCHAR(50)   NOT NULL,
        nom              VARCHAR(100)  NOT NULL,
        nom_en           VARCHAR(100)  DEFAULT NULL,
        description      TEXT          DEFAULT NULL,
        description_en   TEXT          DEFAULT NULL,
        icone            VARCHAR(50)   DEFAULT NULL,
        couleur          VARCHAR(20)   NOT NULL DEFAULT 'neutral',
        ordre            INT           NOT NULL DEFAULT 99,
        actif            TINYINT(1)    NOT NULL DEFAULT 1,
        visible_frontend TINYINT(1)    NOT NULL DEFAULT 1,
        visible_admin    TINYINT(1)    NOT NULL DEFAULT 1,
        created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_methodes_paiement_code (code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    await conn.query(`
      INSERT IGNORE INTO methodes_paiement
        (code, nom, nom_en, couleur, ordre, actif, visible_frontend, visible_admin)
      VALUES
        ('especes',  'Espèces',           'Cash',           'success', 1, 1, 1, 1),
        ('virement', 'Virement bancaire',  'Bank transfer',  'purple',  2, 1, 1, 1),
        ('stripe',   'Carte bancaire',     'Credit card',    'info',    3, 1, 1, 1),
        ('autre',    'Autre',              'Other',          'neutral', 4, 1, 1, 1);
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS statuts_commande (
        id           INT UNSIGNED  NOT NULL AUTO_INCREMENT,
        code         VARCHAR(50)   NOT NULL,
        nom          VARCHAR(100)  NOT NULL,
        nom_en       VARCHAR(100)  DEFAULT NULL,
        description  TEXT          DEFAULT NULL,
        couleur      VARCHAR(20)   NOT NULL DEFAULT 'neutral',
        ordre        INT           NOT NULL DEFAULT 99,
        est_final    TINYINT(1)    NOT NULL DEFAULT 0,
        peut_modifier TINYINT(1)   NOT NULL DEFAULT 1,
        peut_annuler  TINYINT(1)   NOT NULL DEFAULT 1,
        actif        TINYINT(1)    NOT NULL DEFAULT 1,
        created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_statuts_commande_code (code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    await conn.query(`
      INSERT IGNORE INTO statuts_commande (code, nom, nom_en, couleur, ordre, est_final, peut_modifier, peut_annuler)
      VALUES
        ('en_attente', 'En attente', 'Pending',   'warning', 1, 0, 1, 1),
        ('payee',      'Payée',      'Paid',       'info',    2, 0, 1, 1),
        ('livree',     'Livrée',     'Delivered',  'success', 3, 1, 0, 0),
        ('annulee',    'Annulée',    'Cancelled',  'danger',  4, 1, 0, 0);
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS types_cours (
        id                   INT UNSIGNED  NOT NULL AUTO_INCREMENT,
        code                 VARCHAR(50)   NOT NULL,
        nom                  VARCHAR(100)  NOT NULL,
        nom_en               VARCHAR(100)  DEFAULT NULL,
        description          TEXT          DEFAULT NULL,
        couleur              VARCHAR(20)   NOT NULL DEFAULT 'blue',
        duree_defaut_minutes INT           NOT NULL DEFAULT 60,
        ordre                INT           NOT NULL DEFAULT 99,
        actif                TINYINT(1)    NOT NULL DEFAULT 1,
        created_at           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_types_cours_code (code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    await conn.query(`
      INSERT IGNORE INTO types_cours (code, nom, nom_en, couleur, duree_defaut_minutes, ordre, actif)
      VALUES
        ('karate',    'Karaté',    'Karate',    'blue',   60, 1, 1),
        ('judo',      'Judo',      'Judo',      'green',  60, 2, 1),
        ('taekwondo', 'Taekwondo', 'Taekwondo', 'red',    60, 3, 1),
        ('autre',     'Autre',     'Other',     'gray',   60, 99, 1);
    `);

    // 3c. Migration V4.7.1 — tables de référence phase 2 + restructuration genres
    //     genres : ALTER TABLE pour ajouter les colonnes manquantes.
    //     Pas de IF NOT EXISTS (syntaxe MySQL 8.0.3+ non disponible sur toutes versions) :
    //     la DB est recréée from scratch à chaque run, donc les colonnes n'existent jamais.
    await conn.query(
      `ALTER TABLE genres ADD COLUMN code       VARCHAR(10)  DEFAULT NULL  AFTER id`,
    );
    await conn.query(
      `ALTER TABLE genres ADD COLUMN nom_en     VARCHAR(50)  DEFAULT NULL  AFTER nom`,
    );
    await conn.query(
      `ALTER TABLE genres ADD COLUMN ordre      INT          NOT NULL DEFAULT 99 AFTER nom_en`,
    );
    await conn.query(
      `ALTER TABLE genres ADD COLUMN actif      TINYINT(1)   NOT NULL DEFAULT 1  AFTER ordre`,
    );
    await conn.query(
      `ALTER TABLE genres ADD COLUMN created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER actif`,
    );

    // Seed genres avec la nouvelle structure complète
    await conn.query(`
      INSERT IGNORE INTO genres (id, nom, code, nom_en, ordre, actif) VALUES
        (1, 'Homme',        'M',            'Male',          1, 1),
        (2, 'Femme',        'F',            'Female',        2, 1),
        (3, 'Autre',        'autre',        'Other',         3, 1),
        (4, 'Non spécifié', 'non_specifie', 'Not specified', 4, 1)
      ON DUPLICATE KEY UPDATE code = VALUES(code), nom_en = VALUES(nom_en), ordre = VALUES(ordre);
    `);

    // Ajouter index UNIQUE sur genres.code si absent
    await conn
      .query(
        `
      ALTER TABLE genres
        ADD UNIQUE KEY uq_genres_code (code)
    `,
      )
      .catch(() => {
        /* Index already exists — ignore */
      });

    // statuts_paiement, statuts_echeance, roles_utilisateur, roles_familial
    // (FK checks désactivés car les tables peuvent déjà exister avec une structure partielle)
    await conn.query(`SET FOREIGN_KEY_CHECKS = 0`);

    await conn.query(`DROP TABLE IF EXISTS statuts_paiement`);
    await conn.query(`
      CREATE TABLE statuts_paiement (
        id                  INT UNSIGNED  NOT NULL AUTO_INCREMENT,
        code                VARCHAR(50)   NOT NULL,
        nom                 VARCHAR(100)  NOT NULL,
        nom_en              VARCHAR(100)  DEFAULT NULL,
        couleur             VARCHAR(20)   NOT NULL DEFAULT 'neutral',
        ordre               INT           NOT NULL DEFAULT 99,
        compte_dans_revenus TINYINT(1)    NOT NULL DEFAULT 0,
        est_final           TINYINT(1)    NOT NULL DEFAULT 0,
        actif               TINYINT(1)    NOT NULL DEFAULT 1,
        created_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_statuts_paiement_code (code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    await conn.query(`
      INSERT INTO statuts_paiement (code, nom, nom_en, couleur, ordre, compte_dans_revenus, est_final) VALUES
        ('en_attente', 'En attente', 'Pending',   'warning', 1, 0, 0),
        ('valide',     'Validé',     'Validated', 'info',    2, 0, 0),
        ('paye',       'Payé',       'Paid',      'success', 3, 1, 1),
        ('partiel',    'Partiel',    'Partial',   'orange',  4, 1, 0),
        ('echoue',     'Échoué',     'Failed',    'danger',  5, 0, 1),
        ('rembourse',  'Remboursé',  'Refunded',  'purple',  6, 0, 1),
        ('annule',     'Annulé',     'Cancelled', 'neutral', 7, 0, 1);
    `);

    await conn.query(`DROP TABLE IF EXISTS statuts_echeance`);
    await conn.query(`
      CREATE TABLE statuts_echeance (
        id         INT UNSIGNED  NOT NULL AUTO_INCREMENT,
        code       VARCHAR(50)   NOT NULL,
        nom        VARCHAR(100)  NOT NULL,
        nom_en     VARCHAR(100)  DEFAULT NULL,
        couleur    VARCHAR(20)   NOT NULL DEFAULT 'neutral',
        ordre      INT           NOT NULL DEFAULT 99,
        est_final  TINYINT(1)    NOT NULL DEFAULT 0,
        actif      TINYINT(1)    NOT NULL DEFAULT 1,
        created_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_statuts_echeance_code (code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    await conn.query(`
      INSERT INTO statuts_echeance (code, nom, nom_en, couleur, ordre, est_final) VALUES
        ('en_attente', 'En attente', 'Pending',   'warning', 1, 0),
        ('paye',       'Payé',       'Paid',      'success', 2, 1),
        ('en_retard',  'En retard',  'Overdue',   'danger',  3, 0),
        ('annule',     'Annulé',     'Cancelled', 'neutral', 4, 1);
    `);

    await conn.query(`DROP TABLE IF EXISTS roles_utilisateur`);
    await conn.query(`
      CREATE TABLE roles_utilisateur (
        id           INT UNSIGNED  NOT NULL AUTO_INCREMENT,
        code         VARCHAR(50)   NOT NULL,
        nom          VARCHAR(100)  NOT NULL,
        nom_en       VARCHAR(100)  DEFAULT NULL,
        couleur      VARCHAR(20)   NOT NULL DEFAULT 'neutral',
        niveau_acces INT           NOT NULL DEFAULT 1,
        ordre        INT           NOT NULL DEFAULT 99,
        actif        TINYINT(1)    NOT NULL DEFAULT 1,
        created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_roles_utilisateur_code (code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    await conn.query(`
      INSERT INTO roles_utilisateur (code, nom, nom_en, couleur, niveau_acces, ordre) VALUES
        ('admin',     'Administrateur', 'Administrator', 'danger', 100, 1),
        ('professor', 'Professeur',     'Professor',     'purple',  50, 2),
        ('member',    'Membre',         'Member',        'success', 10, 3),
        ('parent',    'Parent',         'Parent',        'info',    10, 4);
    `);

    await conn.query(`DROP TABLE IF EXISTS roles_familial`);
    await conn.query(`
      CREATE TABLE roles_familial (
        id         INT UNSIGNED  NOT NULL AUTO_INCREMENT,
        code       VARCHAR(50)   NOT NULL,
        nom        VARCHAR(100)  NOT NULL,
        nom_en     VARCHAR(100)  DEFAULT NULL,
        couleur    VARCHAR(20)   NOT NULL DEFAULT 'neutral',
        ordre      INT           NOT NULL DEFAULT 99,
        actif      TINYINT(1)    NOT NULL DEFAULT 1,
        created_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_roles_familial_code (code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    await conn.query(`
      INSERT INTO roles_familial (code, nom, nom_en, couleur, ordre) VALUES
        ('parent',   'Parent',       'Parent',        'blue',    1),
        ('tuteur',   'Tuteur légal', 'Legal guardian', 'purple',  2),
        ('enfant',   'Enfant',       'Child',          'green',   3),
        ('conjoint', 'Conjoint',     'Spouse',         'info',    4),
        ('autre',    'Autre',        'Other',          'neutral', 5);
    `);

    await conn.query(`SET FOREIGN_KEY_CHECKS = 1`);

    // 4. Apply migration 010: add the `email` column to email_validation_tokens.
    //    This migration is not yet incorporated into SCHEMA_CONSOLIDATE.sql (v4.4).
    await conn.query(`
      ALTER TABLE email_validation_tokens
        ADD COLUMN email VARCHAR(255) NULL
          COMMENT 'Nouvel email cible (change_email uniquement)'
          AFTER token_type;
    `);

    // 5. Migrations Phase 4 — Messaging : colonnes et table broadcasts
    //    Ces colonnes ont été ajoutées après SCHEMA_CONSOLIDATE.sql
    await conn.query(`
      ALTER TABLE messages
        ADD COLUMN envoye_par_email TINYINT(1) NOT NULL DEFAULT 0 AFTER contenu,
        ADD COLUMN archived         TINYINT(1) NOT NULL DEFAULT 0 AFTER lu,
        ADD COLUMN broadcast_id     INT UNSIGNED NULL                AFTER archived,
        ADD INDEX idx_archived      (archived),
        ADD INDEX idx_broadcast_id  (broadcast_id);
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS broadcasts (
        id                  INT UNSIGNED  NOT NULL AUTO_INCREMENT,
        expediteur_id       INT UNSIGNED  NOT NULL,
        sujet               VARCHAR(200)  NULL,
        contenu             TEXT          NOT NULL,
        cible               ENUM('tous','admin','professor','member') NOT NULL DEFAULT 'tous',
        envoye_par_email    TINYINT(1)    NOT NULL DEFAULT 0,
        destinataires_count INT UNSIGNED  NOT NULL DEFAULT 0,
        created_at          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        CONSTRAINT fk_broadcasts_expediteur
          FOREIGN KEY (expediteur_id) REFERENCES utilisateurs(id)
          ON DELETE CASCADE ON UPDATE CASCADE,
        INDEX idx_broadcasts_expediteur (expediteur_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      COMMENT='Envois groupés de messages';
    `);

    // Ajouter la FK de messages.broadcast_id vers broadcasts.id
    await conn
      .query(
        `
        ALTER TABLE messages
          ADD CONSTRAINT fk_messages_broadcast
            FOREIGN KEY (broadcast_id) REFERENCES broadcasts(id)
            ON DELETE SET NULL ON UPDATE CASCADE;
      `,
      )
      .catch(() => {
        /* FK déjà présente ou non supportée — ignorer */
      });

    // 6. Migration 006 — colonne `actif` sur types_messages_personnalises
    await conn.query(`
      ALTER TABLE types_messages_personnalises
        ADD COLUMN actif BOOLEAN NOT NULL DEFAULT TRUE
          COMMENT 'Type de template actif ou non'
          AFTER description,
        ADD INDEX idx_actif (actif);
    `);

    // 7. Migration 007 — colonne `ordre` sur categories
    await conn.query(`
      ALTER TABLE categories
        ADD COLUMN ordre INT UNSIGNED NOT NULL DEFAULT 0
          COMMENT 'Ordre d''affichage des catégories'
          AFTER description,
        ADD INDEX idx_ordre (ordre);
    `);

    // 8. Migration 003_add_messages_archived — colonne `archived` sur messages
    //    (déjà présente via l'étape 5 — cette note est conservée pour documentation)

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
