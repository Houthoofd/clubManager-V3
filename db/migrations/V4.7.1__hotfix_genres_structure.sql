-- ============================================================================
-- MIGRATION V4.7.1 : HOTFIX — Correction structure tables Phase 2
-- ============================================================================
-- Date       : Décembre 2024
-- Moteur     : MySQL 8.0+
-- Contexte   : Certaines tables (genres, statuts_paiement, etc.) ont été
--              créées lors d'une migration précédente avec une structure
--              différente (colonnes manquantes, mauvais types).
--              Ce script les recrée proprement.
--
-- SAFE : Ces tables sont des tables de référence (seed data uniquement).
--        Aucune donnée utilisateur ne sera perdue.
--
-- UTILISATION :
--   mysql -u root -p clubmanager < V4.7.1__hotfix_genres_structure.sql
-- ============================================================================


-- ============================================================================
-- ÉTAPE 1 : Diagnostic — voir la structure actuelle
-- ============================================================================

SELECT 'AVANT migration — structure tables existantes' AS info;

SELECT
    TABLE_NAME,
    COLUMN_NAME,
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME IN (
    'genres', 'statuts_paiement', 'statuts_echeance',
    'roles_utilisateur', 'roles_familial'
  )
ORDER BY TABLE_NAME, ORDINAL_POSITION;


-- ============================================================================
-- ÉTAPE 2 : Suppression des tables dans le bon ordre
--           (d'abord celles sans dépendances)
-- ============================================================================

-- Désactiver les vérifications de FK temporairement
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS genres;
DROP TABLE IF EXISTS statuts_paiement;
DROP TABLE IF EXISTS statuts_echeance;
DROP TABLE IF EXISTS roles_utilisateur;
DROP TABLE IF EXISTS roles_familial;

-- Réactiver les vérifications de FK
SET FOREIGN_KEY_CHECKS = 1;

SELECT 'Tables supprimées avec succès.' AS info;


-- ============================================================================
-- ÉTAPE 3 : Recréation — statuts_paiement
-- ============================================================================

CREATE TABLE statuts_paiement (
  id                   INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  code                 VARCHAR(50)   NOT NULL,
  nom                  VARCHAR(100)  NOT NULL,
  nom_en               VARCHAR(100)  DEFAULT NULL,
  couleur              VARCHAR(20)   NOT NULL DEFAULT 'neutral'
                         COMMENT 'Variant badge: success, warning, danger, info, neutral, purple, orange',
  ordre                INT           NOT NULL DEFAULT 99,
  compte_dans_revenus  TINYINT(1)    NOT NULL DEFAULT 0
                         COMMENT 'Inclus dans le calcul des revenus',
  est_final            TINYINT(1)    NOT NULL DEFAULT 0
                         COMMENT 'Aucune transition possible depuis cet état',
  actif                TINYINT(1)    NOT NULL DEFAULT 1,
  created_at           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                         ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_statuts_paiement_code (code),
  KEY idx_statuts_paiement_actif  (actif),
  KEY idx_statuts_paiement_ordre  (ordre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Table de référence : Statuts du cycle de vie d un paiement';

INSERT INTO statuts_paiement
  (code, nom, nom_en, couleur, ordre, compte_dans_revenus, est_final)
VALUES
  ('en_attente', 'En attente', 'Pending',   'warning', 1, 0, 0),
  ('valide',     'Validé',     'Validated', 'info',    2, 0, 0),
  ('paye',       'Payé',       'Paid',      'success', 3, 1, 1),
  ('partiel',    'Partiel',    'Partial',   'orange',  4, 1, 0),
  ('echoue',     'Échoué',     'Failed',    'danger',  5, 0, 1),
  ('rembourse',  'Remboursé',  'Refunded',  'purple',  6, 0, 1),
  ('annule',     'Annulé',     'Cancelled', 'neutral', 7, 0, 1);

SELECT 'statuts_paiement : OK (7 lignes)' AS info;


-- ============================================================================
-- ÉTAPE 4 : Recréation — statuts_echeance
-- ============================================================================

CREATE TABLE statuts_echeance (
  id         INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  code       VARCHAR(50)   NOT NULL,
  nom        VARCHAR(100)  NOT NULL,
  nom_en     VARCHAR(100)  DEFAULT NULL,
  couleur    VARCHAR(20)   NOT NULL DEFAULT 'neutral'
               COMMENT 'Variant badge: success, warning, danger, info, neutral',
  ordre      INT           NOT NULL DEFAULT 99,
  est_final  TINYINT(1)    NOT NULL DEFAULT 0,
  actif      TINYINT(1)    NOT NULL DEFAULT 1,
  created_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
               ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_statuts_echeance_code (code),
  KEY idx_statuts_echeance_actif (actif),
  KEY idx_statuts_echeance_ordre (ordre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Table de référence : Statuts des échéances de paiement';

INSERT INTO statuts_echeance
  (code, nom, nom_en, couleur, ordre, est_final)
VALUES
  ('en_attente', 'En attente', 'Pending',   'warning', 1, 0),
  ('paye',       'Payé',       'Paid',      'success', 2, 1),
  ('en_retard',  'En retard',  'Overdue',   'danger',  3, 0),
  ('annule',     'Annulé',     'Cancelled', 'neutral', 4, 1);

SELECT 'statuts_echeance : OK (4 lignes)' AS info;


-- ============================================================================
-- ÉTAPE 5 : Recréation — roles_utilisateur
-- ============================================================================

CREATE TABLE roles_utilisateur (
  id           INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  code         VARCHAR(50)   NOT NULL,
  nom          VARCHAR(100)  NOT NULL,
  nom_en       VARCHAR(100)  DEFAULT NULL,
  couleur      VARCHAR(20)   NOT NULL DEFAULT 'neutral'
                 COMMENT 'Variant badge',
  niveau_acces INT           NOT NULL DEFAULT 1
                 COMMENT '1=minimum, 100=maximum (admin)',
  ordre        INT           NOT NULL DEFAULT 99,
  actif        TINYINT(1)    NOT NULL DEFAULT 1,
  created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                 ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_roles_utilisateur_code (code),
  KEY idx_roles_utilisateur_actif  (actif),
  KEY idx_roles_utilisateur_niveau (niveau_acces)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Table de référence : Rôles applicatifs des utilisateurs';

INSERT INTO roles_utilisateur
  (code, nom, nom_en, couleur, niveau_acces, ordre)
VALUES
  ('admin',     'Administrateur', 'Administrator', 'danger', 100, 1),
  ('professor', 'Professeur',     'Professor',     'purple',  50, 2),
  ('member',    'Membre',         'Member',        'success', 10, 3),
  ('parent',    'Parent',         'Parent',        'info',    10, 4);

SELECT 'roles_utilisateur : OK (4 lignes)' AS info;


-- ============================================================================
-- ÉTAPE 6 : Recréation — roles_familial
-- ============================================================================

CREATE TABLE roles_familial (
  id         INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  code       VARCHAR(50)   NOT NULL,
  nom        VARCHAR(100)  NOT NULL,
  nom_en     VARCHAR(100)  DEFAULT NULL,
  couleur    VARCHAR(20)   NOT NULL DEFAULT 'neutral',
  ordre      INT           NOT NULL DEFAULT 99,
  actif      TINYINT(1)    NOT NULL DEFAULT 1,
  created_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
               ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_roles_familial_code (code),
  KEY idx_roles_familial_actif (actif),
  KEY idx_roles_familial_ordre (ordre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Table de référence : Rôles au sein d une unité familiale';

INSERT INTO roles_familial
  (code, nom, nom_en, couleur, ordre)
VALUES
  ('parent',   'Parent',       'Parent',         'blue',    1),
  ('tuteur',   'Tuteur légal', 'Legal guardian',  'purple',  2),
  ('enfant',   'Enfant',       'Child',           'green',   3),
  ('conjoint', 'Conjoint',     'Spouse',          'info',    4),
  ('autre',    'Autre',        'Other',           'neutral', 5);

SELECT 'roles_familial : OK (5 lignes)' AS info;


-- ============================================================================
-- ÉTAPE 7 : Recréation — genres
-- ============================================================================

CREATE TABLE genres (
  id         INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  code       VARCHAR(10)   NOT NULL,
  nom        VARCHAR(50)   NOT NULL,
  nom_en     VARCHAR(50)   DEFAULT NULL,
  ordre      INT           NOT NULL DEFAULT 99,
  actif      TINYINT(1)    NOT NULL DEFAULT 1,
  created_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_genres_code (code),
  KEY idx_genres_actif (actif),
  KEY idx_genres_ordre (ordre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Table de référence : Genres';

INSERT INTO genres
  (code, nom, nom_en, ordre)
VALUES
  ('M',     'Homme', 'Male',   1),
  ('F',     'Femme', 'Female', 2),
  ('autre', 'Autre', 'Other',  3);

SELECT 'genres : OK (3 lignes)' AS info;


-- ============================================================================
-- ÉTAPE 8 : Vérification finale
-- ============================================================================

SELECT
  table_name,
  COUNT(*) AS nb_lignes
FROM (
  SELECT 'statuts_paiement'  AS table_name FROM statuts_paiement
  UNION ALL
  SELECT 'statuts_echeance'  FROM statuts_echeance
  UNION ALL
  SELECT 'roles_utilisateur' FROM roles_utilisateur
  UNION ALL
  SELECT 'roles_familial'    FROM roles_familial
  UNION ALL
  SELECT 'genres'            FROM genres
) t
GROUP BY table_name
ORDER BY table_name;

SELECT 'Migration V4.7.1 terminée avec succès ✓' AS info;

-- ============================================================================
-- FIN DE LA MIGRATION V4.7.1
-- ============================================================================
