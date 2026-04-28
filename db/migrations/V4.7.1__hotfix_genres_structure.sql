-- ============================================================================
-- MIGRATION V4.7.1 : HOTFIX — Correction structure tables Phase 2
-- ============================================================================
-- Date       : Décembre 2024
-- Moteur     : MySQL 8.0+
--
-- CONTEXTE :
--   La table `genres` existe déjà dans le schéma original avec seulement
--   les colonnes (id, nom). Elle est référencée par utilisateurs.genre_id
--   via une FK — on ne peut pas la DROP.
--
--   Les autres tables (statuts_paiement, statuts_echeance, roles_utilisateur,
--   roles_familial) ont peut-être été créées partiellement par une exécution
--   précédente avec une mauvaise structure (syntaxe PostgreSQL).
--
-- STRATÉGIE :
--   - genres           → ALTER TABLE pour ajouter les colonnes manquantes
--                        + UPDATE pour renseigner les nouvelles colonnes
--   - autres tables    → SET FOREIGN_KEY_CHECKS=0 + DROP + CREATE
--                        (pas de données utilisateur, safe à recréer)
-- ============================================================================


-- ============================================================================
-- PARTIE 1 : TABLE genres — ALTER (pas de DROP à cause de la FK utilisateurs)
-- ============================================================================

-- Ajouter colonne `code` si elle n'existe pas
SET @col = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = 'genres'
      AND COLUMN_NAME  = 'code'
);
SET @sql = IF(@col > 0,
    'SELECT ''code deja present dans genres'' AS info',
    'ALTER TABLE genres ADD COLUMN code VARCHAR(10) DEFAULT NULL AFTER id'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Ajouter colonne `nom_en` si elle n'existe pas
SET @col = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = 'genres'
      AND COLUMN_NAME  = 'nom_en'
);
SET @sql = IF(@col > 0,
    'SELECT ''nom_en deja present dans genres'' AS info',
    'ALTER TABLE genres ADD COLUMN nom_en VARCHAR(50) DEFAULT NULL AFTER nom'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Ajouter colonne `ordre` si elle n'existe pas
SET @col = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = 'genres'
      AND COLUMN_NAME  = 'ordre'
);
SET @sql = IF(@col > 0,
    'SELECT ''ordre deja present dans genres'' AS info',
    'ALTER TABLE genres ADD COLUMN ordre INT NOT NULL DEFAULT 99 AFTER nom_en'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Ajouter colonne `actif` si elle n'existe pas
SET @col = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = 'genres'
      AND COLUMN_NAME  = 'actif'
);
SET @sql = IF(@col > 0,
    'SELECT ''actif deja present dans genres'' AS info',
    'ALTER TABLE genres ADD COLUMN actif TINYINT(1) NOT NULL DEFAULT 1 AFTER ordre'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Ajouter colonne `created_at` si elle n'existe pas
SET @col = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = 'genres'
      AND COLUMN_NAME  = 'created_at'
);
SET @sql = IF(@col > 0,
    'SELECT ''created_at deja present dans genres'' AS info',
    'ALTER TABLE genres ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER actif'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Ajouter index UNIQUE sur code si il n'existe pas déjà
SET @idx = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = 'genres'
      AND INDEX_NAME   = 'uq_genres_code'
);
SET @sql = IF(@idx > 0,
    'SELECT ''index uq_genres_code deja present'' AS info',
    'ALTER TABLE genres ADD UNIQUE KEY uq_genres_code (code)'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Mettre à jour les lignes existantes avec code + nom_en + ordre
UPDATE genres SET code = 'M',            nom_en = 'Male',          ordre = 1 WHERE id = 1 AND (code IS NULL OR code = '');
UPDATE genres SET code = 'F',            nom_en = 'Female',        ordre = 2 WHERE id = 2 AND (code IS NULL OR code = '');
UPDATE genres SET code = 'autre',        nom_en = 'Other',         ordre = 3 WHERE id = 3 AND (code IS NULL OR code = '');
UPDATE genres SET code = 'non_specifie', nom_en = 'Not specified',  ordre = 4 WHERE id = 4 AND (code IS NULL OR code = '');

-- Insérer les lignes manquantes (si la table était vide ou incomplète)
INSERT IGNORE INTO genres (id, nom, code, nom_en, ordre, actif)
VALUES
    (1, 'Homme',         'M',            'Male',          1, 1),
    (2, 'Femme',         'F',            'Female',        2, 1),
    (3, 'Autre',         'autre',        'Other',         3, 1),
    (4, 'Non spécifié',  'non_specifie', 'Not specified', 4, 1);

SELECT 'genres : ALTER + UPDATE OK' AS info;
SELECT id, nom, code, nom_en, ordre, actif FROM genres ORDER BY ordre;


-- ============================================================================
-- PARTIE 2 : Autres tables Phase 2 — DROP + CREATE
--            (pas de FK entrantes, pas de données utilisateur)
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------------------------------------------
-- statuts_paiement
-- ----------------------------------------------------------------------------

DROP TABLE IF EXISTS statuts_paiement;

CREATE TABLE statuts_paiement (
    id                  INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    code                VARCHAR(50)   NOT NULL,
    nom                 VARCHAR(100)  NOT NULL,
    nom_en              VARCHAR(100)  DEFAULT NULL,
    couleur             VARCHAR(20)   NOT NULL DEFAULT 'neutral'
                            COMMENT 'Variant badge: success, warning, danger, info, neutral, purple, orange',
    ordre               INT           NOT NULL DEFAULT 99,
    compte_dans_revenus TINYINT(1)    NOT NULL DEFAULT 0
                            COMMENT 'Inclus dans le calcul des revenus',
    est_final           TINYINT(1)    NOT NULL DEFAULT 0
                            COMMENT 'Aucune transition possible depuis cet état',
    actif               TINYINT(1)    NOT NULL DEFAULT 1,
    created_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                            ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_statuts_paiement_code (code),
    KEY idx_statuts_paiement_actif  (actif),
    KEY idx_statuts_paiement_ordre  (ordre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Table de référence : Statuts du cycle de vie d un paiement';

INSERT INTO statuts_paiement (code, nom, nom_en, couleur, ordre, compte_dans_revenus, est_final) VALUES
    ('en_attente', 'En attente', 'Pending',   'warning', 1, 0, 0),
    ('valide',     'Validé',     'Validated', 'info',    2, 0, 0),
    ('paye',       'Payé',       'Paid',      'success', 3, 1, 1),
    ('partiel',    'Partiel',    'Partial',   'orange',  4, 1, 0),
    ('echoue',     'Échoué',     'Failed',    'danger',  5, 0, 1),
    ('rembourse',  'Remboursé',  'Refunded',  'purple',  6, 0, 1),
    ('annule',     'Annulé',     'Cancelled', 'neutral', 7, 0, 1);

SELECT 'statuts_paiement : OK (7 lignes)' AS info;

-- ----------------------------------------------------------------------------
-- statuts_echeance
-- ----------------------------------------------------------------------------

DROP TABLE IF EXISTS statuts_echeance;

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

INSERT INTO statuts_echeance (code, nom, nom_en, couleur, ordre, est_final) VALUES
    ('en_attente', 'En attente', 'Pending',   'warning', 1, 0),
    ('paye',       'Payé',       'Paid',      'success', 2, 1),
    ('en_retard',  'En retard',  'Overdue',   'danger',  3, 0),
    ('annule',     'Annulé',     'Cancelled', 'neutral', 4, 1);

SELECT 'statuts_echeance : OK (4 lignes)' AS info;

-- ----------------------------------------------------------------------------
-- roles_utilisateur
-- ----------------------------------------------------------------------------

DROP TABLE IF EXISTS roles_utilisateur;

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

INSERT INTO roles_utilisateur (code, nom, nom_en, couleur, niveau_acces, ordre) VALUES
    ('admin',     'Administrateur', 'Administrator', 'danger', 100, 1),
    ('professor', 'Professeur',     'Professor',     'purple',  50, 2),
    ('member',    'Membre',         'Member',        'success', 10, 3),
    ('parent',    'Parent',         'Parent',        'info',    10, 4);

SELECT 'roles_utilisateur : OK (4 lignes)' AS info;

-- ----------------------------------------------------------------------------
-- roles_familial
-- ----------------------------------------------------------------------------

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
    updated_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                   ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_roles_familial_code (code),
    KEY idx_roles_familial_actif (actif),
    KEY idx_roles_familial_ordre (ordre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Table de référence : Rôles au sein d une unité familiale';

INSERT INTO roles_familial (code, nom, nom_en, couleur, ordre) VALUES
    ('parent',   'Parent',       'Parent',         'blue',    1),
    ('tuteur',   'Tuteur légal', 'Legal guardian',  'purple',  2),
    ('enfant',   'Enfant',       'Child',           'green',   3),
    ('conjoint', 'Conjoint',     'Spouse',          'info',    4),
    ('autre',    'Autre',        'Other',           'neutral', 5);

SELECT 'roles_familial : OK (5 lignes)' AS info;

-- Réactiver les FK
SET FOREIGN_KEY_CHECKS = 1;


-- ============================================================================
-- VÉRIFICATION FINALE
-- ============================================================================

SELECT 'genres'            AS table_name, COUNT(*) AS nb_lignes FROM genres
UNION ALL
SELECT 'statuts_paiement'  AS table_name, COUNT(*) AS nb_lignes FROM statuts_paiement
UNION ALL
SELECT 'statuts_echeance'  AS table_name, COUNT(*) AS nb_lignes FROM statuts_echeance
UNION ALL
SELECT 'roles_utilisateur' AS table_name, COUNT(*) AS nb_lignes FROM roles_utilisateur
UNION ALL
SELECT 'roles_familial'    AS table_name, COUNT(*) AS nb_lignes FROM roles_familial;

SELECT 'Migration V4.7.1 terminée avec succès' AS info;

-- ============================================================================
-- FIN DE LA MIGRATION V4.7.1
-- ============================================================================
