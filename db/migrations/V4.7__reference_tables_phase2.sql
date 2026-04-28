-- ============================================================================
-- MIGRATION V4.7: TABLES DE RÉFÉRENCE - PHASE 2
-- ============================================================================
-- Date        : Décembre 2024
-- Version     : 4.7
-- Moteur      : MySQL 8.0+
-- Idempotent  : Oui — DROP + CREATE IF NOT EXISTS + INSERT IGNORE
--               (tables de référence : pas de données utilisateur, safe à recréer)
--
-- PHASE 2 INCLUT:
--   1. statuts_paiement   (en_attente, paye, echoue, rembourse, etc.)
--   2. statuts_echeance   (en_attente, paye, en_retard, annule)
--   3. roles_utilisateur  (admin, professor, member, parent)
--   4. roles_familial     (parent, tuteur, enfant, conjoint, autre)
--   5. genres             (M, F, autre)
--
-- ROLLBACK:
--   DROP TABLE IF EXISTS statuts_paiement;
--   DROP TABLE IF EXISTS statuts_echeance;
--   DROP TABLE IF EXISTS roles_utilisateur;
--   DROP TABLE IF EXISTS roles_familial;
--   DROP TABLE IF EXISTS genres;
-- ============================================================================


-- ============================================================================
-- 1. STATUTS DE PAIEMENT
-- ============================================================================

DROP TABLE IF EXISTS statuts_paiement;

CREATE TABLE statuts_paiement (
  id                   INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  code                 VARCHAR(50)   NOT NULL,
  nom                  VARCHAR(100)  NOT NULL,
  nom_en               VARCHAR(100)  DEFAULT NULL,
  couleur              VARCHAR(20)   NOT NULL DEFAULT 'neutral' COMMENT 'Variant badge: success, warning, danger, info, neutral, purple, orange',
  ordre                INT           NOT NULL DEFAULT 99,
  compte_dans_revenus  TINYINT(1)    NOT NULL DEFAULT 0 COMMENT 'Inclus dans le calcul des revenus',
  est_final            TINYINT(1)    NOT NULL DEFAULT 0 COMMENT 'Aucune transition possible depuis cet état',
  actif                TINYINT(1)    NOT NULL DEFAULT 1,
  created_at           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
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


-- ============================================================================
-- 2. STATUTS D'ÉCHÉANCE
-- ============================================================================

DROP TABLE IF EXISTS statuts_echeance;

CREATE TABLE statuts_echeance (
  id         INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  code       VARCHAR(50)   NOT NULL,
  nom        VARCHAR(100)  NOT NULL,
  nom_en     VARCHAR(100)  DEFAULT NULL,
  couleur    VARCHAR(20)   NOT NULL DEFAULT 'neutral' COMMENT 'Variant badge: success, warning, danger, info, neutral',
  ordre      INT           NOT NULL DEFAULT 99,
  est_final  TINYINT(1)    NOT NULL DEFAULT 0,
  actif      TINYINT(1)    NOT NULL DEFAULT 1,
  created_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_statuts_echeance_code (code),
  KEY idx_statuts_echeance_actif (actif),
  KEY idx_statuts_echeance_ordre (ordre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Table de référence : Statuts des échéances de paiement';

INSERT INTO statuts_echeance
  (code, nom, nom_en, couleur, ordre, est_final)
VALUES
  ('en_attente', 'En attente', 'Pending',  'warning', 1, 0),
  ('paye',       'Payé',       'Paid',     'success', 2, 1),
  ('en_retard',  'En retard',  'Overdue',  'danger',  3, 0),
  ('annule',     'Annulé',     'Cancelled','neutral', 4, 1);


-- ============================================================================
-- 3. RÔLES UTILISATEUR
-- ============================================================================

DROP TABLE IF EXISTS roles_utilisateur;

CREATE TABLE roles_utilisateur (
  id           INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  code         VARCHAR(50)   NOT NULL,
  nom          VARCHAR(100)  NOT NULL,
  nom_en       VARCHAR(100)  DEFAULT NULL,
  couleur      VARCHAR(20)   NOT NULL DEFAULT 'neutral' COMMENT 'Variant badge',
  niveau_acces INT           NOT NULL DEFAULT 1 COMMENT '1=minimum, 100=maximum (admin)',
  ordre        INT           NOT NULL DEFAULT 99,
  actif        TINYINT(1)    NOT NULL DEFAULT 1,
  created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
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


-- ============================================================================
-- 4. RÔLES FAMILIAUX
-- ============================================================================

DROP TABLE IF EXISTS roles_familial;

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


-- ============================================================================
-- 5. GENRES
-- ============================================================================

DROP TABLE IF EXISTS genres;

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


-- ============================================================================
-- VÉRIFICATIONS POST-MIGRATION
-- ============================================================================

SELECT 'statuts_paiement'  AS table_name, COUNT(*) AS nb_lignes FROM statuts_paiement
UNION ALL
SELECT 'statuts_echeance'  AS table_name, COUNT(*) AS nb_lignes FROM statuts_echeance
UNION ALL
SELECT 'roles_utilisateur' AS table_name, COUNT(*) AS nb_lignes FROM roles_utilisateur
UNION ALL
SELECT 'roles_familial'    AS table_name, COUNT(*) AS nb_lignes FROM roles_familial
UNION ALL
SELECT 'genres'            AS table_name, COUNT(*) AS nb_lignes FROM genres;

-- ============================================================================
-- FIN DE LA MIGRATION V4.7 (MySQL)
-- ============================================================================
