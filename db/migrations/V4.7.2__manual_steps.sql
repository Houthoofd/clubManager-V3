-- ============================================================================
-- MIGRATION V4.7.2 : ÉTAPES MANUELLES — À exécuter bloc par bloc
-- ============================================================================
-- Exécute chaque bloc séparément dans ton client SQL.
-- Ignore les erreurs "Duplicate column name" ou "Table already exists" —
-- cela signifie juste que l'étape a déjà été faite.
-- ============================================================================


-- ============================================================================
-- BLOC 1 : genres — ajouter les colonnes manquantes
-- (Ignore l'erreur si la colonne existe déjà)
-- ============================================================================

ALTER TABLE genres ADD COLUMN nom_en VARCHAR(50) DEFAULT NULL AFTER nom;
ALTER TABLE genres ADD COLUMN ordre INT NOT NULL DEFAULT 99 AFTER nom_en;
ALTER TABLE genres ADD COLUMN actif TINYINT(1) NOT NULL DEFAULT 1 AFTER ordre;
ALTER TABLE genres ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER actif;


-- ============================================================================
-- BLOC 2 : genres — ajouter l'index unique sur code
-- (Ignore l'erreur si l'index existe déjà)
-- ============================================================================

ALTER TABLE genres ADD UNIQUE KEY uq_genres_code (code);


-- ============================================================================
-- BLOC 3 : genres — renseigner les valeurs des nouvelles colonnes
-- ============================================================================

UPDATE genres SET code = 'M',            nom_en = 'Male',          ordre = 1, actif = 1 WHERE id = 1;
UPDATE genres SET code = 'F',            nom_en = 'Female',        ordre = 2, actif = 1 WHERE id = 2;
UPDATE genres SET code = 'autre',        nom_en = 'Other',         ordre = 3, actif = 1 WHERE id = 3;
UPDATE genres SET code = 'non_specifie', nom_en = 'Not specified',  ordre = 4, actif = 1 WHERE id = 4;

-- Vérification
SELECT id, nom, code, nom_en, ordre, actif FROM genres ORDER BY ordre;


-- ============================================================================
-- BLOC 4 : statuts_paiement — recréer proprement
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS statuts_paiement;
SET FOREIGN_KEY_CHECKS = 1;

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
    UNIQUE KEY uq_statuts_paiement_code (code),
    KEY idx_statuts_paiement_actif (actif),
    KEY idx_statuts_paiement_ordre (ordre)
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

-- Vérification
SELECT id, code, nom, couleur FROM statuts_paiement ORDER BY ordre;


-- ============================================================================
-- BLOC 5 : statuts_echeance — recréer proprement
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS statuts_echeance;
SET FOREIGN_KEY_CHECKS = 1;

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

-- Vérification
SELECT id, code, nom, couleur FROM statuts_echeance ORDER BY ordre;


-- ============================================================================
-- BLOC 6 : roles_utilisateur — recréer proprement
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS roles_utilisateur;
SET FOREIGN_KEY_CHECKS = 1;

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

-- Vérification
SELECT id, code, nom, couleur, niveau_acces FROM roles_utilisateur ORDER BY ordre;


-- ============================================================================
-- BLOC 7 : roles_familial — recréer proprement
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS roles_familial;
SET FOREIGN_KEY_CHECKS = 1;

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

INSERT INTO roles_familial (code, nom, nom_en, couleur, ordre) VALUES
    ('parent',   'Parent',       'Parent',         'blue',    1),
    ('tuteur',   'Tuteur légal', 'Legal guardian',  'purple',  2),
    ('enfant',   'Enfant',       'Child',           'green',   3),
    ('conjoint', 'Conjoint',     'Spouse',          'info',    4),
    ('autre',    'Autre',        'Other',           'neutral', 5);

-- Vérification
SELECT id, code, nom, couleur FROM roles_familial ORDER BY ordre;


-- ============================================================================
-- BLOC 8 : Vérification finale — toutes les tables
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

-- ============================================================================
-- FIN — Résultat attendu :
--   genres            | 4
--   statuts_paiement  | 7
--   statuts_echeance  | 4
--   roles_utilisateur | 4
--   roles_familial    | 5
-- ============================================================================
