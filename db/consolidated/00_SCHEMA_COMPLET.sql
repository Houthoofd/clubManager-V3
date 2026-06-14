-- ============================================================
-- CLUBMANAGER - SCHÉMA BASE DE DONNÉES v5.1
-- ============================================================
-- Version     : 5.1 — Normalisation références paiements (ENUM → FK)
-- Date        : 2025-05-19
-- Auteur      : Benoit Houthoofd
-- Database    : MySQL 8.0+ / MariaDB 10.6+
-- Encoding    : UTF8MB4
-- Engine      : InnoDB
-- ============================================================
-- Description :
--   Schéma complet et consolidé pour ClubManager V3.
--   Ce fichier est la SOURCE UNIQUE DE VÉRITÉ pour la structure
--   de la base de données. Il intègre le schéma initial (v4.4)
--   et toutes les migrations jusqu'à v4.8 incluses.
--
--   NE PAS appliquer les migrations séparément si ce fichier
--   est utilisé pour créer la base depuis zéro.
--
-- Historique des versions intégrées :
--   v4.1  — Soft Delete + RGPD sur utilisateurs
--   v4.2  — token_hash normalisé (migration 002)
--   v4.3  — Système familles (migration 003)
--   v4.4  — RBAC role_app (migration 004)
--   v4.5  — langue_preferee multilingue (migration V4.5)
--   v4.6  — Tables de référence Phase 1 (migration V4.6)
--           methodes_paiement, statuts_commande,
--           transitions_statut_commande, types_cours
--   v4.7  — Tables de référence Phase 2 (migration V4.7 + V4.7.1)
--           statuts_paiement, statuts_echeance,
--           roles_utilisateur, roles_familial,
--           genres étendu (code, nom_en, ordre)
--   v4.8  — user_id normalisé partout (migration V4.8)
--   mig005 — broadcasts + messages.broadcast_id + envoye_par_email
--   mig006 — types_messages_personnalises.actif
--   mig007 — categories.ordre
--   mig009 — DROP validation_tokens (table dépréciée)
--   mig010 — email_validation_tokens.email (changement d'email)
--   mig003b — messages.archived (archivage GAP-16)
--   v5.1  — Normalisation références paiements (ENUM → FK)
--
-- Tables : 56 tables
-- Foreign Keys : ~55
-- ============================================================

-- ============================================================
-- INITIALISATION
-- ============================================================

DROP DATABASE IF EXISTS clubmanager;
CREATE DATABASE clubmanager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE clubmanager;

-- ============================================================
-- 1. TABLES DE RÉFÉRENCE (14 tables)
-- ============================================================
-- Ces tables ne dépendent d'aucune autre table.
-- Elles stockent des valeurs de référence stables avec code,
-- labels bilingues (fr/en), couleurs badge et ordre d'affichage.

-- ------------------------------------------------------------
-- 1.1 genres — Genres/sexes des utilisateurs (v4.7.1 étendu)
-- ------------------------------------------------------------
CREATE TABLE genres (
    id         INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    nom        VARCHAR(50)   NOT NULL,
    code       VARCHAR(20)   DEFAULT NULL,
    nom_en     VARCHAR(50)   DEFAULT NULL,
    ordre      INT           NOT NULL DEFAULT 99,
    actif      TINYINT(1)    NOT NULL DEFAULT 1,
    created_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_genres_code (code),
    INDEX idx_nom         (nom),
    INDEX idx_genres_actif (actif),
    INDEX idx_genres_ordre (ordre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Genres des utilisateurs (Homme, Femme, Autre, Non spécifié)';

INSERT INTO genres (id, nom, code, nom_en, ordre, actif) VALUES
    (1, 'Homme',        'M',            'Male',          1, 1),
    (2, 'Femme',        'F',            'Female',        2, 1),
    (3, 'Autre',        'autre',        'Other',         3, 1),
    (4, 'Non spécifié', 'non_specifie', 'Not specified', 4, 1);

-- ------------------------------------------------------------
-- 1.2 grades — Grades/ceintures
-- ------------------------------------------------------------
CREATE TABLE grades (
    id     INT UNSIGNED AUTO_INCREMENT,
    nom    VARCHAR(50)  NOT NULL UNIQUE,
    ordre  INT UNSIGNED NOT NULL UNIQUE COMMENT 'Ordre hiérarchique (0=blanche, 1=bleue, etc.)',
    couleur VARCHAR(50) NULL COMMENT 'Couleur de la ceinture',

    PRIMARY KEY (id),
    INDEX idx_ordre (ordre),
    INDEX idx_nom   (nom),

    CONSTRAINT chk_grades_ordre CHECK (ordre >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Grades et ceintures de jiu-jitsu';

-- ------------------------------------------------------------
-- 1.3 status — Statuts génériques
-- ------------------------------------------------------------
CREATE TABLE status (
    id          INT UNSIGNED AUTO_INCREMENT,
    nom         VARCHAR(50)  NOT NULL UNIQUE,
    description TEXT NULL,

    PRIMARY KEY (id),
    INDEX idx_nom (nom)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Statuts génériques (actif, inactif, en_attente, etc.)';

-- ------------------------------------------------------------
-- 1.4 plans_tarifaires — Plans d'abonnement
-- ------------------------------------------------------------
CREATE TABLE plans_tarifaires (
    id          INT UNSIGNED AUTO_INCREMENT,
    nom         VARCHAR(100)   NOT NULL UNIQUE,
    description TEXT           NULL,
    prix        DECIMAL(10,2)  NOT NULL,
    duree_mois  INT UNSIGNED   NOT NULL COMMENT 'Durée en mois',
    actif       BOOLEAN        NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_actif (actif),
    INDEX idx_nom   (nom),
    INDEX idx_prix  (prix),

    CONSTRAINT chk_plans_prix   CHECK (prix > 0),
    CONSTRAINT chk_plans_duree  CHECK (duree_mois > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Plans tarifaires et abonnements';

-- ------------------------------------------------------------
-- 1.5 categories — Catégories d'articles magasin (+ ordre mig007)
-- ------------------------------------------------------------
CREATE TABLE categories (
    id          INT UNSIGNED AUTO_INCREMENT,
    nom         VARCHAR(100)  NOT NULL UNIQUE,
    description TEXT          NULL,
    ordre       INT UNSIGNED  NOT NULL DEFAULT 0 COMMENT 'Ordre d''affichage des catégories',
    created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_nom   (nom),
    INDEX idx_ordre (ordre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Catégories d''articles (kimono, accessoires, etc.)';

-- ------------------------------------------------------------
-- 1.6 tailles — Tailles disponibles pour les articles
-- ------------------------------------------------------------
CREATE TABLE tailles (
    id    INT UNSIGNED AUTO_INCREMENT,
    nom   VARCHAR(20) NOT NULL UNIQUE COMMENT 'XS, S, M, L, XL, A1, A2, A3, A4, etc.',
    ordre INT UNSIGNED NULL COMMENT 'Ordre d''affichage',

    PRIMARY KEY (id),
    INDEX idx_nom   (nom),
    INDEX idx_ordre (ordre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tailles pour les articles (vêtements, kimonos)';

-- ------------------------------------------------------------
-- 1.7 methodes_paiement — Méthodes de paiement (V4.6)
-- ------------------------------------------------------------
CREATE TABLE methodes_paiement (
    id               INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    code             VARCHAR(50)   NOT NULL,
    nom              VARCHAR(100)  NOT NULL,
    nom_en           VARCHAR(100)  DEFAULT NULL,
    description      TEXT          DEFAULT NULL,
    description_en   TEXT          DEFAULT NULL,
    icone            VARCHAR(50)   DEFAULT NULL COMMENT 'Nom du composant React icône',
    couleur          VARCHAR(20)   NOT NULL DEFAULT 'neutral' COMMENT 'Variant badge',
    ordre            INT           NOT NULL DEFAULT 99,
    actif            TINYINT(1)    NOT NULL DEFAULT 1,
    visible_frontend TINYINT(1)    NOT NULL DEFAULT 1,
    visible_admin    TINYINT(1)    NOT NULL DEFAULT 1,
    created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_methodes_paiement_code (code),
    KEY idx_methodes_paiement_actif  (actif),
    KEY idx_methodes_paiement_ordre  (ordre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Table de référence : Méthodes de paiement disponibles';

INSERT INTO methodes_paiement
    (code, nom, nom_en, description, description_en, icone, couleur, ordre, actif, visible_frontend, visible_admin)
VALUES
    ('especes',  'Espèces',           'Cash',           'Paiement en argent liquide',    'Cash payment',                'BanknotesIcon',       'success', 1, 1, 1, 1),
    ('virement', 'Virement bancaire', 'Bank transfer',  'Virement SEPA ou autre',        'SEPA or other bank transfer', 'BuildingLibraryIcon', 'purple',  2, 1, 1, 1),
    ('stripe',   'Carte bancaire',    'Credit card',    'Paiement en ligne via Stripe',  'Online payment via Stripe',   'CreditCardIcon',      'info',    3, 1, 1, 1),
    ('autre',    'Autre',             'Other',          'Autre mode de paiement',        'Other payment method',        'TagIcon',             'neutral', 4, 1, 1, 1);

-- ------------------------------------------------------------
-- 1.8 statuts_commande — Statuts du cycle de vie commandes (V4.6)
-- ------------------------------------------------------------
CREATE TABLE statuts_commande (
    id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
    code         VARCHAR(50)  NOT NULL,
    nom          VARCHAR(100) NOT NULL,
    nom_en       VARCHAR(100) DEFAULT NULL,
    description  TEXT         DEFAULT NULL,
    description_en TEXT       DEFAULT NULL,
    couleur      VARCHAR(20)  NOT NULL DEFAULT 'neutral',
    ordre        INT          NOT NULL DEFAULT 99,
    est_final    TINYINT(1)   NOT NULL DEFAULT 0,
    peut_modifier TINYINT(1)  NOT NULL DEFAULT 1,
    peut_annuler TINYINT(1)   NOT NULL DEFAULT 1,
    compte_stock TINYINT(1)   NOT NULL DEFAULT 0,
    actif        TINYINT(1)   NOT NULL DEFAULT 1,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_statuts_commande_code (code),
    KEY idx_statuts_commande_actif     (actif),
    KEY idx_statuts_commande_est_final (est_final),
    KEY idx_statuts_commande_ordre     (ordre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Table de référence : Statuts du cycle de vie d''une commande';

INSERT INTO statuts_commande
    (code, nom, nom_en, description, description_en, couleur, ordre, est_final, peut_modifier, peut_annuler, compte_stock)
VALUES
    ('en_attente', 'En attente', 'Pending',     'Commande en attente de paiement',        'Order pending payment',         'warning', 1, 0, 1, 1, 0),
    ('en_cours',   'En cours',   'In progress', 'Commande en cours de préparation',       'Order being prepared',          'info',    2, 0, 1, 1, 0),
    ('payee',      'Payée',      'Paid',        'Commande payée, prête à être expédiée',  'Order paid, ready to ship',     'info',    3, 0, 1, 1, 0),
    ('expediee',   'Expédiée',   'Shipped',     'Commande expédiée',                      'Order shipped',                 'purple',  4, 0, 0, 1, 1),
    ('prete',      'Prête',      'Ready',       'Commande prête pour retrait',            'Order ready for pickup',        'purple',  5, 0, 0, 1, 1),
    ('livree',     'Livrée',     'Delivered',   'Commande livrée au client',              'Order delivered to customer',   'success', 6, 1, 0, 0, 1),
    ('annulee',    'Annulée',    'Cancelled',   'Commande annulée',                       'Order cancelled',               'danger',  7, 1, 0, 0, 0);

-- ------------------------------------------------------------
-- 1.9 transitions_statut_commande — Workflow commandes (V4.6)
-- ------------------------------------------------------------
CREATE TABLE transitions_statut_commande (
    id                INT UNSIGNED NOT NULL AUTO_INCREMENT,
    statut_depart_id  INT UNSIGNED NOT NULL,
    statut_arrivee_id INT UNSIGNED NOT NULL,
    role_requis       VARCHAR(50)  DEFAULT NULL COMMENT 'NULL = tous les rôles',
    description       TEXT         DEFAULT NULL,
    description_en    TEXT         DEFAULT NULL,
    ordre_priorite    INT          NOT NULL DEFAULT 100,
    actif             TINYINT(1)   NOT NULL DEFAULT 1,
    created_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_transition (statut_depart_id, statut_arrivee_id),
    KEY idx_transitions_depart  (statut_depart_id),
    KEY idx_transitions_arrivee (statut_arrivee_id),
    KEY idx_transitions_actif   (actif),

    CONSTRAINT fk_transition_depart
        FOREIGN KEY (statut_depart_id)  REFERENCES statuts_commande(id) ON DELETE CASCADE,
    CONSTRAINT fk_transition_arrivee
        FOREIGN KEY (statut_arrivee_id) REFERENCES statuts_commande(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Transitions autorisées entre statuts de commande (workflow)';

INSERT INTO transitions_statut_commande
    (statut_depart_id, statut_arrivee_id, role_requis, description, description_en, ordre_priorite)
VALUES
    ((SELECT id FROM statuts_commande WHERE code='en_attente'), (SELECT id FROM statuts_commande WHERE code='payee'),    NULL,    'Paiement reçu',        'Payment received',   1),
    ((SELECT id FROM statuts_commande WHERE code='en_attente'), (SELECT id FROM statuts_commande WHERE code='annulee'),  NULL,    'Annuler la commande',  'Cancel order',       99),
    ((SELECT id FROM statuts_commande WHERE code='en_cours'),   (SELECT id FROM statuts_commande WHERE code='payee'),    'admin', 'Marquer comme payée',  'Mark as paid',       1),
    ((SELECT id FROM statuts_commande WHERE code='en_cours'),   (SELECT id FROM statuts_commande WHERE code='annulee'),  'admin', 'Annuler la commande',  'Cancel order',       99),
    ((SELECT id FROM statuts_commande WHERE code='payee'),      (SELECT id FROM statuts_commande WHERE code='expediee'), 'admin', 'Expédier la commande', 'Ship order',         1),
    ((SELECT id FROM statuts_commande WHERE code='payee'),      (SELECT id FROM statuts_commande WHERE code='prete'),    'admin', 'Marquer comme prête',  'Mark as ready',      2),
    ((SELECT id FROM statuts_commande WHERE code='payee'),      (SELECT id FROM statuts_commande WHERE code='annulee'),  'admin', 'Annuler la commande',  'Cancel order',       99),
    ((SELECT id FROM statuts_commande WHERE code='expediee'),   (SELECT id FROM statuts_commande WHERE code='livree'),   'admin', 'Confirmer la livraison','Confirm delivery',  1),
    ((SELECT id FROM statuts_commande WHERE code='prete'),      (SELECT id FROM statuts_commande WHERE code='livree'),   'admin', 'Confirmer le retrait', 'Confirm pickup',     1);

-- ------------------------------------------------------------
-- 1.10 types_cours — Types de cours disponibles (V4.6)
-- ------------------------------------------------------------
CREATE TABLE types_cours (
    id                   INT UNSIGNED NOT NULL AUTO_INCREMENT,
    code                 VARCHAR(50)  NOT NULL,
    nom                  VARCHAR(100) NOT NULL,
    nom_en               VARCHAR(100) DEFAULT NULL,
    description          TEXT         DEFAULT NULL,
    description_en       TEXT         DEFAULT NULL,
    couleur              VARCHAR(20)  NOT NULL DEFAULT 'blue',
    duree_defaut_minutes INT          NOT NULL DEFAULT 60,
    capacite_max_defaut  INT          DEFAULT NULL,
    niveau               VARCHAR(50)  DEFAULT NULL COMMENT 'debutant, intermediaire, avance, tous',
    icone                VARCHAR(50)  DEFAULT NULL,
    ordre                INT          NOT NULL DEFAULT 99,
    actif                TINYINT(1)   NOT NULL DEFAULT 1,
    created_at           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_types_cours_code (code),
    KEY idx_types_cours_actif (actif),
    KEY idx_types_cours_ordre (ordre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Table de référence : Types de cours disponibles dans le club';

INSERT INTO types_cours
    (code, nom, nom_en, description, description_en, couleur, duree_defaut_minutes, ordre, actif)
VALUES
    ('karate',    'Karaté',    'Karate',    'Art martial japonais traditionnel', 'Traditional Japanese martial art',  'blue',   60, 1,  1),
    ('judo',      'Judo',      'Judo',      'Art martial et sport de combat',    'Martial art and combat sport',      'green',  60, 2,  1),
    ('taekwondo', 'Taekwondo', 'Taekwondo', 'Art martial coréen',                'Korean martial art',                'red',    60, 3,  1),
    ('aikido',    'Aïkido',    'Aikido',    'Art martial japonais défensif',     'Japanese defensive martial art',    'purple', 60, 4,  1),
    ('kendo',     'Kendo',     'Kendo',     'Escrime japonaise',                 'Japanese fencing',                  'orange', 60, 5,  1),
    ('autre',     'Autre',     'Other',     'Autre type de cours',               'Other course type',                 'gray',   60, 99, 1);

-- ------------------------------------------------------------
-- 1.11 statuts_paiement — Statuts des paiements (V4.7)
-- ------------------------------------------------------------
CREATE TABLE statuts_paiement (
    id                  INT UNSIGNED NOT NULL AUTO_INCREMENT,
    code                VARCHAR(50)  NOT NULL,
    nom                 VARCHAR(100) NOT NULL,
    nom_en              VARCHAR(100) DEFAULT NULL,
    couleur             VARCHAR(20)  NOT NULL DEFAULT 'neutral',
    ordre               INT          NOT NULL DEFAULT 99,
    compte_dans_revenus TINYINT(1)   NOT NULL DEFAULT 0,
    est_final           TINYINT(1)   NOT NULL DEFAULT 0,
    actif               TINYINT(1)   NOT NULL DEFAULT 1,
    created_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_statuts_paiement_code (code),
    KEY idx_statuts_paiement_actif  (actif),
    KEY idx_statuts_paiement_ordre  (ordre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Table de référence : Statuts du cycle de vie d''un paiement';

INSERT INTO statuts_paiement (code, nom, nom_en, couleur, ordre, compte_dans_revenus, est_final) VALUES
    ('en_attente', 'En attente', 'Pending',   'warning', 1, 0, 0),
    ('valide',     'Validé',     'Validated', 'info',    2, 0, 0),
    ('paye',       'Payé',       'Paid',      'success', 3, 1, 1),
    ('partiel',    'Partiel',    'Partial',   'orange',  4, 1, 0),
    ('echoue',     'Échoué',     'Failed',    'danger',  5, 0, 1),
    ('rembourse',  'Remboursé',  'Refunded',  'purple',  6, 0, 1),
    ('annule',     'Annulé',     'Cancelled', 'neutral', 7, 0, 1);

-- ------------------------------------------------------------
-- 1.12 statuts_echeance — Statuts des échéances (V4.7)
-- ------------------------------------------------------------
CREATE TABLE statuts_echeance (
    id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
    code       VARCHAR(50)  NOT NULL,
    nom        VARCHAR(100) NOT NULL,
    nom_en     VARCHAR(100) DEFAULT NULL,
    couleur    VARCHAR(20)  NOT NULL DEFAULT 'neutral',
    ordre      INT          NOT NULL DEFAULT 99,
    est_final  TINYINT(1)   NOT NULL DEFAULT 0,
    actif      TINYINT(1)   NOT NULL DEFAULT 1,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

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

-- ------------------------------------------------------------
-- 1.13 roles_utilisateur — Rôles applicatifs (V4.7)
-- ------------------------------------------------------------
CREATE TABLE roles_utilisateur (
    id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
    code         VARCHAR(50)  NOT NULL,
    nom          VARCHAR(100) NOT NULL,
    nom_en       VARCHAR(100) DEFAULT NULL,
    couleur      VARCHAR(20)  NOT NULL DEFAULT 'neutral',
    niveau_acces INT          NOT NULL DEFAULT 1 COMMENT '1=minimum, 100=maximum (admin)',
    ordre        INT          NOT NULL DEFAULT 99,
    actif        TINYINT(1)   NOT NULL DEFAULT 1,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

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

-- ------------------------------------------------------------
-- 1.14 roles_familial — Rôles au sein d'une famille (V4.7)
-- ------------------------------------------------------------
CREATE TABLE roles_familial (
    id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
    code       VARCHAR(50)  NOT NULL,
    nom        VARCHAR(100) NOT NULL,
    nom_en     VARCHAR(100) DEFAULT NULL,
    couleur    VARCHAR(20)  NOT NULL DEFAULT 'neutral',
    ordre      INT          NOT NULL DEFAULT 99,
    actif      TINYINT(1)   NOT NULL DEFAULT 1,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_roles_familial_code (code),
    KEY idx_roles_familial_actif (actif),
    KEY idx_roles_familial_ordre (ordre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Table de référence : Rôles au sein d''une unité familiale';

INSERT INTO roles_familial (code, nom, nom_en, couleur, ordre) VALUES
    ('parent',   'Parent',       'Parent',        'blue',    1),
    ('tuteur',   'Tuteur légal', 'Legal guardian', 'purple',  2),
    ('enfant',   'Enfant',       'Child',          'green',   3),
    ('conjoint', 'Conjoint',     'Spouse',         'info',    4),
    ('autre',    'Autre',        'Other',          'neutral', 5);

-- ============================================================
-- 2. TABLES UTILISATEURS (8 tables)
-- ============================================================
-- Gestion des utilisateurs avec soft delete RGPD, familles,
-- RBAC, multilingue et tokens d'authentification.
-- Note : validation_tokens est volontairement absent (déprécié — mig009).

-- ------------------------------------------------------------
-- 2.1 utilisateurs — Table principale
-- ------------------------------------------------------------
CREATE TABLE utilisateurs (
    id                 INT UNSIGNED  AUTO_INCREMENT,
    userId             VARCHAR(20)   NOT NULL UNIQUE COMMENT 'Format: U-YYYY-XXXX',
    first_name         VARCHAR(100)  NOT NULL,
    last_name          VARCHAR(100)  NOT NULL,
    nom_utilisateur    VARCHAR(50)   NULL COMMENT 'NULL pour les comptes enfants gérés par un tuteur',
    email              VARCHAR(255)  NULL COMMENT 'NULL autorisé pour les comptes enfants gérés par un tuteur',
    password           VARCHAR(255)  NULL COMMENT 'Hash bcrypt/argon2 — NULL pour les comptes gérés (mineurs)',
    date_of_birth      DATE          NULL,
    telephone          VARCHAR(20)   NULL,
    adresse            TEXT          NULL,

    -- Relations
    genre_id           INT UNSIGNED  NULL,
    grade_id           INT UNSIGNED  NULL,
    abonnement_id      INT UNSIGNED  NULL COMMENT 'Plan tarifaire actuel',
    status_id          INT UNSIGNED  NULL,

    -- Gestion familiale (v4.3)
    tuteur_id          INT UNSIGNED  NULL COMMENT 'Parent/tuteur légal gérant ce compte',
    est_mineur         BOOLEAN       NOT NULL DEFAULT FALSE,
    peut_se_connecter  BOOLEAN       NOT NULL DEFAULT TRUE COMMENT 'FALSE pour les comptes enfants',

    -- Rôle RBAC (v4.4)
    role_app           ENUM('admin', 'member', 'professor') NOT NULL DEFAULT 'member',

    -- Internationalisation (v4.5)
    langue_preferee    VARCHAR(5)    NOT NULL DEFAULT 'fr' COMMENT 'ISO 639-1: fr, en, nl, de, es',

    -- Statut compte
    active             BOOLEAN       NOT NULL DEFAULT TRUE,
    email_verified     BOOLEAN       NOT NULL DEFAULT FALSE,
    email_verified_at  TIMESTAMP     NULL     COMMENT 'Date de vérification de l''email',
    photo_url          VARCHAR(255)  NULL,

    -- Soft Delete + RGPD (v4.1)
    deleted_at         TIMESTAMP     NULL COMMENT 'Date de suppression (soft delete)',
    deleted_by         INT UNSIGNED  NULL COMMENT 'ID de l''admin ayant supprimé',
    deletion_reason    TEXT          NULL,
    anonymized         BOOLEAN       NOT NULL DEFAULT FALSE COMMENT 'Compte anonymisé RGPD',

    -- Métadonnées
    date_inscription   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    derniere_connexion TIMESTAMP     NULL,
    created_at         TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    -- Foreign Keys
    CONSTRAINT fk_utilisateurs_genre
        FOREIGN KEY (genre_id) REFERENCES genres(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_utilisateurs_grade
        FOREIGN KEY (grade_id) REFERENCES grades(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_utilisateurs_abonnement
        FOREIGN KEY (abonnement_id) REFERENCES plans_tarifaires(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_utilisateurs_status
        FOREIGN KEY (status_id) REFERENCES status(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_utilisateurs_deleted_by
        FOREIGN KEY (deleted_by) REFERENCES utilisateurs(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_utilisateurs_tuteur
        FOREIGN KEY (tuteur_id) REFERENCES utilisateurs(id)
        ON DELETE SET NULL ON UPDATE CASCADE,

    -- Constraints
    CONSTRAINT chk_langue_preferee
        CHECK (langue_preferee IN ('fr', 'en', 'nl', 'de', 'es')),
    CONSTRAINT chk_utilisateurs_email
        CHECK (email IS NULL OR email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_utilisateurs_userId
        CHECK (userId REGEXP '^U-[0-9]{4}-[0-9]{4}$'),

    -- Indexes
    INDEX idx_userId              (userId),
    INDEX idx_email               (email),
    INDEX idx_nom_utilisateur     (nom_utilisateur),
    INDEX idx_last_name           (last_name),
    INDEX idx_first_name          (first_name),
    INDEX idx_active              (active),
    INDEX idx_email_verified      (email_verified),
    INDEX idx_deleted_at          (deleted_at),
    INDEX idx_anonymized          (anonymized),
    INDEX idx_genre_id            (genre_id),
    INDEX idx_grade_id            (grade_id),
    INDEX idx_abonnement_id       (abonnement_id),
    INDEX idx_status_id           (status_id),
    INDEX idx_date_inscription    (date_inscription),
    INDEX idx_derniere_connexion  (derniere_connexion),
    INDEX idx_langue_preferee     (langue_preferee),
    INDEX idx_tuteur_id           (tuteur_id),
    INDEX idx_est_mineur          (est_mineur),
    INDEX idx_peut_se_connecter   (peut_se_connecter),
    INDEX idx_role_app            (role_app)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Utilisateurs avec soft delete RGPD, familles, RBAC et multilingue';

-- ------------------------------------------------------------
-- 2.2 email_validation_tokens — Tokens validation email (+ email mig010)
-- ------------------------------------------------------------
CREATE TABLE email_validation_tokens (
    id         INT UNSIGNED AUTO_INCREMENT,
    user_id    INT UNSIGNED NOT NULL,
    token_hash VARCHAR(64)  NOT NULL UNIQUE COMMENT 'SHA-256 hash du token',
    token_type ENUM('verification', 'change_email') NOT NULL DEFAULT 'verification',
    email      VARCHAR(255) NULL COMMENT 'Nouvel email cible (change_email uniquement — mig010)',
    expires_at TIMESTAMP    NOT NULL,
    used       BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_email_tokens_utilisateur
        FOREIGN KEY (user_id) REFERENCES utilisateurs(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    INDEX idx_token_hash (token_hash),
    INDEX idx_user_id    (user_id),
    INDEX idx_expires_at (expires_at),
    INDEX idx_used       (used),
    INDEX idx_token_type (token_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tokens de validation email (SHA-256)';

-- ------------------------------------------------------------
-- 2.3 password_reset_tokens — Tokens réinitialisation mot de passe
-- ------------------------------------------------------------
CREATE TABLE password_reset_tokens (
    id         INT UNSIGNED AUTO_INCREMENT,
    user_id    INT UNSIGNED NOT NULL,
    token_hash VARCHAR(64)  NOT NULL UNIQUE COMMENT 'SHA-256 hash du token',
    expires_at TIMESTAMP    NOT NULL,
    used       BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_pwd_reset_utilisateur
        FOREIGN KEY (user_id) REFERENCES utilisateurs(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    INDEX idx_token_hash (token_hash),
    INDEX idx_user_id    (user_id),
    INDEX idx_expires_at (expires_at),
    INDEX idx_used       (used)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tokens de réinitialisation mot de passe (SHA-256)';

-- ------------------------------------------------------------
-- 2.4 password_reset_attempts — Anti-bruteforce réinitialisation
-- ------------------------------------------------------------
CREATE TABLE password_reset_attempts (
    id              INT UNSIGNED AUTO_INCREMENT,
    email           VARCHAR(255) NOT NULL,
    ip_address      VARCHAR(45)  NOT NULL COMMENT 'IPv4 + IPv6',
    attempts_count  INT UNSIGNED NOT NULL DEFAULT 1,
    last_attempt_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    INDEX idx_email         (email),
    INDEX idx_ip_address    (ip_address),
    INDEX idx_last_attempt  (last_attempt_at),
    INDEX idx_email_ip      (email, ip_address)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Suivi des tentatives de réinitialisation (anti-bruteforce)';

-- ------------------------------------------------------------
-- 2.5 refresh_tokens — Tokens JWT de rafraîchissement
-- ------------------------------------------------------------
CREATE TABLE refresh_tokens (
    id         INT UNSIGNED AUTO_INCREMENT,
    user_id    INT UNSIGNED NOT NULL,
    token_hash VARCHAR(64)  NOT NULL UNIQUE COMMENT 'SHA-256 hash',
    expires_at TIMESTAMP    NOT NULL,
    revoked    BOOLEAN      NOT NULL DEFAULT FALSE,
    ip_address VARCHAR(45)  NULL,
    user_agent TEXT         NULL,
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_refresh_tokens_utilisateur
        FOREIGN KEY (user_id) REFERENCES utilisateurs(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    INDEX idx_token_hash (token_hash),
    INDEX idx_user_id    (user_id),
    INDEX idx_expires_at (expires_at),
    INDEX idx_revoked    (revoked),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Refresh tokens JWT avec révocation et tracking';

-- ------------------------------------------------------------
-- 2.6 login_attempts — Logs des tentatives de connexion
-- ------------------------------------------------------------
CREATE TABLE login_attempts (
    id             INT UNSIGNED AUTO_INCREMENT,
    email          VARCHAR(255) NOT NULL,
    ip_address     VARCHAR(45)  NOT NULL,
    success        BOOLEAN      NOT NULL,
    user_agent     TEXT         NULL,
    failure_reason VARCHAR(255) NULL COMMENT 'wrong_password, account_disabled, etc.',
    created_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    INDEX idx_email      (email),
    INDEX idx_ip_address (ip_address),
    INDEX idx_success    (success),
    INDEX idx_created_at (created_at),
    INDEX idx_email_ip   (email, ip_address)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Logs des tentatives de connexion pour audit et sécurité';

-- ------------------------------------------------------------
-- 2.7 auth_attempts — Historique d'authentification (GAP-20)
-- ------------------------------------------------------------
CREATE TABLE auth_attempts (
    id         INT UNSIGNED AUTO_INCREMENT,
    email      VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45)  NOT NULL,
    success    BOOLEAN      NOT NULL DEFAULT FALSE,
    user_agent TEXT         NULL,
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    INDEX idx_email      (email),
    INDEX idx_ip_address (ip_address),
    INDEX idx_success    (success),
    INDEX idx_created_at (created_at),
    INDEX idx_email_ip   (email, ip_address)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Historique des tentatives d''authentification';

-- ------------------------------------------------------------
-- 2.8 manual_recovery_requests — Demandes de récupération manuelle
-- ------------------------------------------------------------
CREATE TABLE manual_recovery_requests (
    id         INT UNSIGNED AUTO_INCREMENT,
    email      VARCHAR(255) NOT NULL,
    reason     TEXT         NULL,
    ip_address VARCHAR(45)  NOT NULL,
    status     ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    INDEX idx_email      (email),
    INDEX idx_status     (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Demandes de récupération manuelle de compte';

-- ============================================================
-- 3. TABLES COURS (6 tables)
-- ============================================================

-- ------------------------------------------------------------
-- 3.1 cours_recurrent — Cours récurrents (planning hebdomadaire)
-- ------------------------------------------------------------
CREATE TABLE cours_recurrent (
    id           INT UNSIGNED AUTO_INCREMENT,
    type_cours   VARCHAR(100) NOT NULL COMMENT 'Gi, NoGi, Enfants, Compétition, etc.',
    jour_semaine TINYINT UNSIGNED NOT NULL COMMENT '1=Lundi, 7=Dimanche',
    heure_debut  TIME         NOT NULL,
    heure_fin    TIME         NOT NULL,
    active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    INDEX idx_jour_semaine (jour_semaine),
    INDEX idx_type_cours   (type_cours),
    INDEX idx_active       (active),
    INDEX idx_horaire      (jour_semaine, heure_debut),

    CONSTRAINT chk_cours_rec_jour    CHECK (jour_semaine BETWEEN 1 AND 7),
    CONSTRAINT chk_cours_rec_horaire CHECK (heure_fin > heure_debut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Cours récurrents hebdomadaires';

-- ------------------------------------------------------------
-- 3.2 cours — Instances de cours (séances concrètes)
-- ------------------------------------------------------------
CREATE TABLE cours (
    id                 INT UNSIGNED AUTO_INCREMENT,
    cours_recurrent_id INT UNSIGNED NULL COMMENT 'NULL si cours ponctuel',
    date_cours         DATE         NOT NULL,
    type_cours         VARCHAR(100) NOT NULL,
    heure_debut        TIME         NOT NULL,
    heure_fin          TIME         NOT NULL,
    created_at         TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_cours_recurrent
        FOREIGN KEY (cours_recurrent_id) REFERENCES cours_recurrent(id)
        ON DELETE SET NULL ON UPDATE CASCADE,

    INDEX idx_date_cours         (date_cours),
    INDEX idx_type_cours         (type_cours),
    INDEX idx_cours_recurrent_id (cours_recurrent_id),
    INDEX idx_date_type          (date_cours, type_cours),

    CONSTRAINT chk_cours_horaire CHECK (heure_fin > heure_debut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Instances de cours réalisés';

-- ------------------------------------------------------------
-- 3.3 professeurs — Professeurs/instructeurs
-- ------------------------------------------------------------
CREATE TABLE professeurs (
    id         INT UNSIGNED AUTO_INCREMENT,
    nom        VARCHAR(100) NOT NULL,
    prenom     VARCHAR(100) NOT NULL,
    email      VARCHAR(255) NULL,
    telephone  VARCHAR(20)  NULL,
    specialite VARCHAR(100) NULL COMMENT 'Gi, NoGi, Enfants, etc.',
    grade_id   INT UNSIGNED NULL,
    photo_url  VARCHAR(255) NULL,
    actif      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_professeurs_grade
        FOREIGN KEY (grade_id) REFERENCES grades(id)
        ON DELETE SET NULL ON UPDATE CASCADE,

    INDEX idx_nom       (nom),
    INDEX idx_prenom    (prenom),
    INDEX idx_email     (email),
    INDEX idx_actif     (actif),
    INDEX idx_grade_id  (grade_id),
    INDEX idx_nom_prenom (nom, prenom)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Professeurs et instructeurs';

-- ------------------------------------------------------------
-- 3.4 cours_recurrent_professeur — Association cours récurrents <-> professeurs
-- ------------------------------------------------------------
CREATE TABLE cours_recurrent_professeur (
    id                 INT UNSIGNED AUTO_INCREMENT,
    cours_recurrent_id INT UNSIGNED NOT NULL,
    professeur_id      INT UNSIGNED NOT NULL,
    created_at         TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_crp_cours_recurrent
        FOREIGN KEY (cours_recurrent_id) REFERENCES cours_recurrent(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_crp_professeur
        FOREIGN KEY (professeur_id) REFERENCES professeurs(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    UNIQUE KEY uk_cours_professeur (cours_recurrent_id, professeur_id),
    INDEX idx_cours_recurrent_id (cours_recurrent_id),
    INDEX idx_professeur_id      (professeur_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Association cours récurrents et professeurs';

-- ------------------------------------------------------------
-- 3.5 inscriptions — Inscriptions utilisateurs aux cours
-- ------------------------------------------------------------
CREATE TABLE inscriptions (
    id          INT UNSIGNED AUTO_INCREMENT,
    user_id     INT UNSIGNED NOT NULL,
    cours_id    INT UNSIGNED NOT NULL,
    status_id   INT UNSIGNED NULL,
    commentaire TEXT         NULL,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_inscriptions_utilisateur
        FOREIGN KEY (user_id) REFERENCES utilisateurs(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_inscriptions_cours
        FOREIGN KEY (cours_id) REFERENCES cours(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_inscriptions_status
        FOREIGN KEY (status_id) REFERENCES status(id)
        ON DELETE SET NULL ON UPDATE CASCADE,

    UNIQUE KEY uk_utilisateur_cours (user_id, cours_id),
    INDEX idx_user_id    (user_id),
    INDEX idx_cours_id   (cours_id),
    INDEX idx_status_id  (status_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Inscriptions des utilisateurs aux cours';

-- ------------------------------------------------------------
-- 3.6 reservations — Réservations de cours
-- ------------------------------------------------------------
CREATE TABLE reservations (
    id         INT UNSIGNED AUTO_INCREMENT,
    user_id    INT UNSIGNED NOT NULL,
    cours_id   INT UNSIGNED NOT NULL,
    statut     ENUM('confirmee', 'annulee', 'en_attente') NOT NULL DEFAULT 'confirmee',
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_reservations_utilisateur
        FOREIGN KEY (user_id) REFERENCES utilisateurs(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_reservations_cours
        FOREIGN KEY (cours_id) REFERENCES cours(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    INDEX idx_user_id    (user_id),
    INDEX idx_cours_id   (cours_id),
    INDEX idx_statut     (statut),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Réservations de cours par les utilisateurs';

-- ============================================================
-- 4. TABLES PAIEMENTS (2 tables)
-- ============================================================

-- ------------------------------------------------------------
-- 4.1 paiements — Paiements des utilisateurs
-- ------------------------------------------------------------
CREATE TABLE paiements (
    id                        INT UNSIGNED  AUTO_INCREMENT,
    user_id                   INT UNSIGNED  NOT NULL,
    plan_tarifaire_id         INT UNSIGNED  NULL,
    montant                   DECIMAL(10,2) NOT NULL,
    methode_paiement_id       INT UNSIGNED  NOT NULL,
    statut_id                 INT UNSIGNED  NOT NULL,
    description               TEXT          NULL,
    stripe_payment_intent_id  VARCHAR(255)  NULL,
    stripe_charge_id          VARCHAR(255)  NULL,
    date_paiement             TIMESTAMP     NULL,
    created_at                TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at                TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_paiements_utilisateur
        FOREIGN KEY (user_id) REFERENCES utilisateurs(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_paiements_plan
        FOREIGN KEY (plan_tarifaire_id) REFERENCES plans_tarifaires(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_paiements_methode
        FOREIGN KEY (methode_paiement_id) REFERENCES methodes_paiement(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_paiements_statut
        FOREIGN KEY (statut_id) REFERENCES statuts_paiement(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    INDEX idx_user_id               (user_id),
    INDEX idx_plan_tarifaire_id     (plan_tarifaire_id),
    INDEX idx_methode_paiement_id   (methode_paiement_id),
    INDEX idx_statut_id             (statut_id),
    INDEX idx_date_paiement         (date_paiement),
    INDEX idx_stripe_payment_intent (stripe_payment_intent_id),
    INDEX idx_created_at            (created_at),

    CONSTRAINT chk_paiements_montant CHECK (montant > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Paiements des utilisateurs';

-- ------------------------------------------------------------
-- 4.2 echeances_paiements — Échéances de paiement
-- ------------------------------------------------------------
CREATE TABLE echeances_paiements (
    id                INT UNSIGNED  AUTO_INCREMENT,
    user_id           INT UNSIGNED  NOT NULL,
    plan_tarifaire_id INT UNSIGNED  NULL,
    montant           DECIMAL(10,2) NOT NULL,
    date_echeance     DATE          NOT NULL,
    statut_id         INT UNSIGNED  NOT NULL,
    paiement_id       INT UNSIGNED  NULL COMMENT 'Paiement effectué pour cette échéance',
    created_at        TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_echeances_utilisateur
        FOREIGN KEY (user_id) REFERENCES utilisateurs(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_echeances_plan
        FOREIGN KEY (plan_tarifaire_id) REFERENCES plans_tarifaires(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_echeances_paiement
        FOREIGN KEY (paiement_id) REFERENCES paiements(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_echeances_statut
        FOREIGN KEY (statut_id) REFERENCES statuts_echeance(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    INDEX idx_user_id           (user_id),
    INDEX idx_plan_tarifaire_id (plan_tarifaire_id),
    INDEX idx_date_echeance     (date_echeance),
    INDEX idx_statut_id         (statut_id),
    INDEX idx_paiement_id       (paiement_id),

    CONSTRAINT chk_echeances_montant CHECK (montant > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Échéances de paiement des abonnements';

-- ============================================================
-- 5. TABLES MAGASIN (6 tables)
-- ============================================================

-- ------------------------------------------------------------
-- 5.1 articles — Articles en vente
-- ------------------------------------------------------------
CREATE TABLE articles (
    id           INT UNSIGNED  AUTO_INCREMENT,
    nom          VARCHAR(200)  NOT NULL,
    description  TEXT          NULL,
    prix         DECIMAL(10,2) NOT NULL,
    categorie_id INT UNSIGNED  NULL,
    actif        BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_articles_categorie
        FOREIGN KEY (categorie_id) REFERENCES categories(id)
        ON DELETE SET NULL ON UPDATE CASCADE,

    INDEX idx_nom          (nom),
    INDEX idx_categorie_id (categorie_id),
    INDEX idx_actif        (actif),
    INDEX idx_prix         (prix),

    CONSTRAINT chk_articles_prix CHECK (prix >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Articles disponibles à la vente';

-- ------------------------------------------------------------
-- 5.2 images — Images des articles
-- ------------------------------------------------------------
CREATE TABLE images (
    id         INT UNSIGNED AUTO_INCREMENT,
    article_id INT UNSIGNED NOT NULL,
    url        VARCHAR(255) NOT NULL,
    ordre      INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Ordre d''affichage',
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_images_article
        FOREIGN KEY (article_id) REFERENCES articles(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    INDEX idx_article_id    (article_id),
    INDEX idx_ordre         (ordre),
    INDEX idx_article_ordre (article_id, ordre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Images des articles';

-- ------------------------------------------------------------
-- 5.3 stocks — Stocks par article et taille
-- ------------------------------------------------------------
CREATE TABLE stocks (
    id               INT UNSIGNED AUTO_INCREMENT,
    article_id       INT UNSIGNED NOT NULL,
    taille_id        INT UNSIGNED NOT NULL,
    quantite         INT          NOT NULL DEFAULT 0 COMMENT 'Stock total',
    quantite_minimum INT          NOT NULL DEFAULT 0 COMMENT 'Seuil d''alerte',
    stock_physique   INT          NOT NULL DEFAULT 0 COMMENT 'Stock physique disponible',
    stock_reserve    INT          NOT NULL DEFAULT 0 COMMENT 'Stock réservé (commandes en attente)',
    stock_disponible INT          NOT NULL DEFAULT 0 COMMENT 'Stock disponible = physique - réservé',
    created_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_stocks_article
        FOREIGN KEY (article_id) REFERENCES articles(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_stocks_taille
        FOREIGN KEY (taille_id) REFERENCES tailles(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    UNIQUE KEY uk_article_taille   (article_id, taille_id),
    INDEX idx_article_id           (article_id),
    INDEX idx_taille_id            (taille_id),
    INDEX idx_stock_disponible     (stock_disponible),
    INDEX idx_quantite_minimum     (quantite_minimum),

    CONSTRAINT chk_stocks_quantite CHECK (quantite >= 0),
    CONSTRAINT chk_stocks_reserve  CHECK (stock_reserve >= 0),
    CONSTRAINT chk_stocks_physique CHECK (stock_physique >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stocks des articles par taille';

-- ------------------------------------------------------------
-- 5.4 commandes — Commandes des utilisateurs
-- ------------------------------------------------------------
CREATE TABLE commandes (
    id               INT UNSIGNED  AUTO_INCREMENT,
    unique_id        VARCHAR(50)   NOT NULL UNIQUE COMMENT 'Identifiant unique de commande',
    numero_commande  VARCHAR(50)   NOT NULL UNIQUE COMMENT 'Numéro de commande lisible',
    user_id          INT UNSIGNED  NOT NULL,
    total            DECIMAL(10,2) NOT NULL,
    date_commande    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    statut           ENUM('en_attente', 'payee', 'expediee', 'livree', 'annulee') NOT NULL DEFAULT 'en_attente',
    ip_address       VARCHAR(45)   NULL,
    user_agent       TEXT          NULL,
    created_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_commandes_user
        FOREIGN KEY (user_id) REFERENCES utilisateurs(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    INDEX idx_unique_id       (unique_id),
    INDEX idx_numero_commande (numero_commande),
    INDEX idx_user_id         (user_id),
    INDEX idx_statut          (statut),
    INDEX idx_date_commande   (date_commande),
    INDEX idx_created_at      (created_at),

    CONSTRAINT chk_commandes_total CHECK (total >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Commandes des utilisateurs';

-- ------------------------------------------------------------
-- 5.5 commande_articles — Articles dans les commandes
-- ------------------------------------------------------------
CREATE TABLE commande_articles (
    id          INT UNSIGNED  AUTO_INCREMENT,
    commande_id INT UNSIGNED  NOT NULL,
    article_id  INT UNSIGNED  NOT NULL,
    taille_id   INT UNSIGNED  NULL,
    quantite    INT UNSIGNED  NOT NULL,
    prix        DECIMAL(10,2) NOT NULL COMMENT 'Prix unitaire au moment de la commande',
    created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_commande_articles_commande
        FOREIGN KEY (commande_id) REFERENCES commandes(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_commande_articles_article
        FOREIGN KEY (article_id) REFERENCES articles(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_commande_articles_taille
        FOREIGN KEY (taille_id) REFERENCES tailles(id)
        ON DELETE SET NULL ON UPDATE CASCADE,

    INDEX idx_commande_id (commande_id),
    INDEX idx_article_id  (article_id),
    INDEX idx_taille_id   (taille_id),

    CONSTRAINT chk_commande_articles_quantite CHECK (quantite > 0),
    CONSTRAINT chk_commande_articles_prix     CHECK (prix >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Détails des articles dans chaque commande';

-- ------------------------------------------------------------
-- 5.6 mouvements_stock — Historique des mouvements de stock
-- ------------------------------------------------------------
CREATE TABLE mouvements_stock (
    id                INT UNSIGNED AUTO_INCREMENT,
    article_id        INT UNSIGNED NOT NULL,
    taille            VARCHAR(20)  NOT NULL COMMENT 'Taille de l''article',
    type_mouvement    ENUM('commande', 'livraison', 'annulation', 'retour', 'ajustement', 'inventaire') NOT NULL,
    quantite_avant    INT          NOT NULL,
    quantite_apres    INT          NOT NULL,
    quantite_mouvement INT         NOT NULL COMMENT 'Quantité du mouvement (+ ou -)',
    commande_id       INT UNSIGNED NULL,
    user_id           INT UNSIGNED NULL COMMENT 'Utilisateur ayant effectué le mouvement',
    motif             TEXT         NULL,
    created_at        TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_mouvements_article
        FOREIGN KEY (article_id) REFERENCES articles(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_mouvements_commande
        FOREIGN KEY (commande_id) REFERENCES commandes(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_mouvements_stock_user
        FOREIGN KEY (user_id) REFERENCES utilisateurs(id)
        ON DELETE SET NULL ON UPDATE CASCADE,

    INDEX idx_article_id    (article_id),
    INDEX idx_type_mouvement (type_mouvement),
    INDEX idx_commande_id   (commande_id),
    INDEX idx_user_id       (user_id),
    INDEX idx_created_at    (created_at),
    INDEX idx_article_date  (article_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Historique des mouvements de stock';

-- ============================================================
-- 6. TABLES MESSAGERIE (6 tables)
-- ============================================================

-- ------------------------------------------------------------
-- 6.1 broadcasts — Envois groupés (mig005)
-- ------------------------------------------------------------
CREATE TABLE broadcasts (
    id                  INT UNSIGNED AUTO_INCREMENT,
    expediteur_id       INT UNSIGNED NOT NULL,
    sujet               VARCHAR(200) NULL,
    contenu             TEXT         NOT NULL,
    cible               ENUM('tous', 'admin', 'professor', 'member') NOT NULL DEFAULT 'tous',
    destinataires_count INT UNSIGNED NOT NULL DEFAULT 0,
    envoye_par_email    BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_broadcasts_expediteur
        FOREIGN KEY (expediteur_id) REFERENCES utilisateurs(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    INDEX idx_expediteur_id (expediteur_id),
    INDEX idx_cible         (cible),
    INDEX idx_created_at    (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Envois groupés (broadcasts) aux membres';

-- ------------------------------------------------------------
-- 6.2 messages — Messages entre utilisateurs
--     (+ broadcast_id, envoye_par_email mig005 ; + archived mig003b)
-- ------------------------------------------------------------
CREATE TABLE messages (
    id               INT UNSIGNED AUTO_INCREMENT,
    expediteur_id    INT UNSIGNED NOT NULL,
    destinataire_id  INT UNSIGNED NOT NULL,
    sujet            VARCHAR(200) NULL,
    contenu          TEXT         NOT NULL,
    broadcast_id     INT UNSIGNED NULL COMMENT 'Lien vers le broadcast groupé (NULL si individuel)',
    envoye_par_email BOOLEAN      NOT NULL DEFAULT FALSE COMMENT 'TRUE si copie email envoyée',
    lu               BOOLEAN      NOT NULL DEFAULT FALSE,
    date_lecture     TIMESTAMP    NULL,
    archived         TINYINT(1)   NOT NULL DEFAULT 0 COMMENT 'Message archivé (GAP-16)',
    created_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_messages_expediteur
        FOREIGN KEY (expediteur_id) REFERENCES utilisateurs(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_messages_destinataire
        FOREIGN KEY (destinataire_id) REFERENCES utilisateurs(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_messages_broadcast
        FOREIGN KEY (broadcast_id) REFERENCES broadcasts(id)
        ON DELETE SET NULL ON UPDATE CASCADE,

    INDEX idx_expediteur_id         (expediteur_id),
    INDEX idx_destinataire_id       (destinataire_id),
    INDEX idx_broadcast_id          (broadcast_id),
    INDEX idx_lu                    (lu),
    INDEX idx_archived              (archived),
    INDEX idx_created_at            (created_at),
    INDEX idx_destinataire_lu       (destinataire_id, lu),
    INDEX idx_messages_archived     (destinataire_id, archived)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Messages entre utilisateurs';

-- ------------------------------------------------------------
-- 6.3 message_status — Historique des statuts des messages
-- ------------------------------------------------------------
CREATE TABLE message_status (
    id         INT UNSIGNED AUTO_INCREMENT,
    message_id INT UNSIGNED NOT NULL,
    statut     ENUM('envoye', 'lu', 'archive', 'supprime') NOT NULL,
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_message_status_message
        FOREIGN KEY (message_id) REFERENCES messages(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    INDEX idx_message_id (message_id),
    INDEX idx_statut     (statut),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Historique des statuts des messages';

-- ------------------------------------------------------------
-- 6.4 types_messages_personnalises — Types de templates (+ actif mig006)
-- ------------------------------------------------------------
CREATE TABLE types_messages_personnalises (
    id          INT UNSIGNED AUTO_INCREMENT,
    nom         VARCHAR(100) NOT NULL UNIQUE,
    description TEXT         NULL,
    actif       BOOLEAN      NOT NULL DEFAULT TRUE COMMENT 'Type de template actif ou non',
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    INDEX idx_nom   (nom),
    INDEX idx_actif (actif)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Types de messages personnalisés (newsletters, etc.)';

INSERT INTO types_messages_personnalises (nom, description, actif) VALUES
    ('Bienvenue',          'Message de bienvenue pour les nouveaux membres', TRUE),
    ('Cours annulé',       'Annulation ou modification d''un cours',         TRUE),
    ('Rappel paiement',    'Rappel pour un paiement ou abonnement',          TRUE),
    ('Promotion ceinture', 'Félicitations pour une promotion de grade',      TRUE),
    ('Annonce générale',   'Communication générale aux membres',             TRUE);

-- ------------------------------------------------------------
-- 6.5 messages_personnalises — Templates de messages
-- ------------------------------------------------------------
CREATE TABLE messages_personnalises (
    id         INT UNSIGNED AUTO_INCREMENT,
    type_id    INT UNSIGNED NOT NULL,
    titre      VARCHAR(200) NOT NULL,
    contenu    TEXT         NOT NULL,
    actif      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_messages_perso_type
        FOREIGN KEY (type_id) REFERENCES types_messages_personnalises(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    INDEX idx_type_id    (type_id),
    INDEX idx_actif      (actif),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Templates de messages personnalisés';

-- ------------------------------------------------------------
-- 6.6 notifications — Notifications système
-- ------------------------------------------------------------
CREATE TABLE notifications (
    id         INT UNSIGNED AUTO_INCREMENT,
    user_id    INT UNSIGNED NOT NULL,
    type       ENUM('info', 'warning', 'error', 'success') NOT NULL DEFAULT 'info',
    titre      VARCHAR(200) NOT NULL,
    contenu    TEXT         NOT NULL,
    lu         BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_notifications_utilisateur
        FOREIGN KEY (user_id) REFERENCES utilisateurs(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    INDEX idx_user_id      (user_id),
    INDEX idx_type         (type),
    INDEX idx_lu           (lu),
    INDEX idx_created_at   (created_at),
    INDEX idx_utilisateur_lu (user_id, lu)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Notifications système pour les utilisateurs';

-- ============================================================
-- 7. TABLES ALERTES (3 tables)
-- ============================================================

-- ------------------------------------------------------------
-- 7.1 alertes_types — Types d'alertes système
-- ------------------------------------------------------------
CREATE TABLE alertes_types (
    id          INT UNSIGNED AUTO_INCREMENT,
    code        VARCHAR(50)  NOT NULL UNIQUE COMMENT 'PAYMENT_OVERDUE, etc.',
    nom         VARCHAR(100) NOT NULL,
    description TEXT         NULL,
    priorite    ENUM('basse', 'normale', 'haute', 'critique') NOT NULL DEFAULT 'normale',
    actif       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    INDEX idx_code     (code),
    INDEX idx_priorite (priorite),
    INDEX idx_actif    (actif)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Types d''alertes système';

-- ------------------------------------------------------------
-- 7.2 alertes_utilisateurs — Alertes pour les utilisateurs
-- ------------------------------------------------------------
CREATE TABLE alertes_utilisateurs (
    id               INT UNSIGNED AUTO_INCREMENT,
    user_id          INT UNSIGNED NOT NULL,
    alerte_type_id   INT UNSIGNED NOT NULL,
    statut           ENUM('active', 'resolue', 'ignoree') NOT NULL DEFAULT 'active',
    donnees_contexte JSON         NULL COMMENT 'Données contextuelles de l''alerte',
    date_detection   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    date_resolution  TIMESTAMP    NULL,
    notes            TEXT         NULL,
    resolu_par       INT UNSIGNED NULL COMMENT 'Admin ayant résolu l''alerte',
    created_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_alertes_util_utilisateur
        FOREIGN KEY (user_id) REFERENCES utilisateurs(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_alertes_util_type
        FOREIGN KEY (alerte_type_id) REFERENCES alertes_types(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_alertes_util_resolu
        FOREIGN KEY (resolu_par) REFERENCES utilisateurs(id)
        ON DELETE SET NULL ON UPDATE CASCADE,

    INDEX idx_user_id          (user_id),
    INDEX idx_alerte_type_id   (alerte_type_id),
    INDEX idx_statut           (statut),
    INDEX idx_date_detection   (date_detection),
    INDEX idx_date_resolution  (date_resolution),
    INDEX idx_resolu_par       (resolu_par),
    INDEX idx_utilisateur_statut (user_id, statut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Alertes actives pour les utilisateurs';

-- ------------------------------------------------------------
-- 7.3 alertes_actions — Actions suite aux alertes
-- ------------------------------------------------------------
CREATE TABLE alertes_actions (
    id             INT UNSIGNED AUTO_INCREMENT,
    alerte_user_id INT UNSIGNED NOT NULL,
    user_id        INT UNSIGNED NULL COMMENT 'Admin ayant effectué l''action',
    action_type    ENUM('message_envoye', 'information_mise_a_jour', 'paiement_recu', 'statut_change', 'autre') NOT NULL,
    description    TEXT         NULL,
    created_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_alertes_actions_alerte
        FOREIGN KEY (alerte_user_id) REFERENCES alertes_utilisateurs(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_alertes_actions_utilisateur
        FOREIGN KEY (user_id) REFERENCES utilisateurs(id)
        ON DELETE SET NULL ON UPDATE CASCADE,

    INDEX idx_alerte_user_id (alerte_user_id),
    INDEX idx_user_id        (user_id),
    INDEX idx_action_type    (action_type),
    INDEX idx_created_at     (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Historique des actions effectuées suite aux alertes';

-- ============================================================
-- 8. TABLES GROUPES (2 tables)
-- ============================================================

-- ------------------------------------------------------------
-- 8.1 groupes — Groupes d'utilisateurs
-- ------------------------------------------------------------
CREATE TABLE groupes (
    id          INT UNSIGNED AUTO_INCREMENT,
    nom         VARCHAR(100) NOT NULL UNIQUE,
    description TEXT         NULL,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    INDEX idx_nom (nom)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Groupes d''utilisateurs (compétition, enfants, etc.)';

-- ------------------------------------------------------------
-- 8.2 groupes_utilisateurs — Association groupes <-> utilisateurs
-- ------------------------------------------------------------
CREATE TABLE groupes_utilisateurs (
    id         INT UNSIGNED AUTO_INCREMENT,
    groupe_id  INT UNSIGNED NOT NULL,
    user_id    INT UNSIGNED NOT NULL,
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_groupes_util_groupe
        FOREIGN KEY (groupe_id) REFERENCES groupes(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_groupes_util_user
        FOREIGN KEY (user_id) REFERENCES utilisateurs(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    UNIQUE KEY uk_groupe_utilisateur (groupe_id, user_id),
    INDEX idx_groupe_id (groupe_id),
    INDEX idx_user_id   (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Association entre groupes et utilisateurs';

-- ============================================================
-- 9. TABLES SYSTÈME (2 tables)
-- ============================================================

-- ------------------------------------------------------------
-- 9.1 statistiques — Métriques du club
-- ------------------------------------------------------------
CREATE TABLE statistiques (
    id         INT UNSIGNED AUTO_INCREMENT,
    type       VARCHAR(100) NOT NULL COMMENT 'inscriptions, revenus, etc.',
    cle        VARCHAR(100) NOT NULL COMMENT 'Clé de la statistique',
    valeur     TEXT         NOT NULL COMMENT 'Valeur (peut être JSON)',
    date_stat  DATE         NOT NULL,
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    INDEX idx_type       (type),
    INDEX idx_cle        (cle),
    INDEX idx_date_stat  (date_stat),
    INDEX idx_type_date  (type, date_stat),
    INDEX idx_cle_date   (cle, date_stat)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Statistiques et métriques du club';

-- ------------------------------------------------------------
-- 9.2 informations — Paramètres système
-- ------------------------------------------------------------
CREATE TABLE informations (
    id          INT UNSIGNED AUTO_INCREMENT,
    cle         VARCHAR(100) NOT NULL UNIQUE,
    valeur      TEXT         NOT NULL,
    description TEXT         NULL,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    INDEX idx_cle (cle)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Informations et paramètres système';

-- ============================================================
-- 10. TABLES FAMILLES (2 tables)
-- ============================================================

-- ------------------------------------------------------------
-- 10.1 familles — Groupes familiaux
-- ------------------------------------------------------------
CREATE TABLE familles (
    id         INT UNSIGNED AUTO_INCREMENT,
    nom        VARCHAR(100) NULL COMMENT 'Nom optionnel (ex: Famille Dupont)',
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    INDEX idx_nom (nom)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Groupes familiaux — relie les membres d''une même famille';

-- ------------------------------------------------------------
-- 10.2 membres_famille — Liens utilisateurs <-> familles
-- ------------------------------------------------------------
CREATE TABLE membres_famille (
    id               INT UNSIGNED AUTO_INCREMENT,
    famille_id       INT UNSIGNED NOT NULL,
    user_id          INT UNSIGNED NOT NULL,
    role             ENUM('parent', 'tuteur', 'enfant', 'conjoint', 'autre') NOT NULL DEFAULT 'autre',
    est_responsable  BOOLEAN      NOT NULL DEFAULT FALSE COMMENT 'Peut gérer les autres membres',
    est_tuteur_legal BOOLEAN      NOT NULL DEFAULT FALSE COMMENT 'Tuteur légal des mineurs',
    date_ajout       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uk_famille_user (famille_id, user_id),

    CONSTRAINT fk_mf_famille
        FOREIGN KEY (famille_id) REFERENCES familles(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_mf_user
        FOREIGN KEY (user_id) REFERENCES utilisateurs(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    INDEX idx_famille_id          (famille_id),
    INDEX idx_user_id             (user_id),
    INDEX idx_role                (role),
    INDEX idx_est_responsable     (est_responsable),
    INDEX idx_est_tuteur_legal    (est_tuteur_legal),
    INDEX idx_famille_responsable (famille_id, est_responsable)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Liens entre utilisateurs et familles avec rôles et responsabilités';

-- ============================================================
-- FIN DU SCHÉMA v5.0
-- ============================================================
-- Récapitulatif :
--   56 tables créées
--   ~55 Foreign Keys
--   ~200+ index stratégiques
--   14 CHECK constraints
--   Support Soft Delete + RGPD
--   Tables de référence bilingues (fr/en)
--   Toutes les migrations v4.2 → v4.8 intégrées
-- ============================================================
