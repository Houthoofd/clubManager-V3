-- ============================================================
-- CLUBMANAGER - SCHÉMA BASE DE DONNÉES v4.1
-- ============================================================
-- Version: 4.4 (RBAC - Rôles applicatifs)
-- Date: 2025-01-26
-- Author: Benoit Houthoofd
-- Database: MySQL 8.0+ / MariaDB 10.6+
-- Encoding: UTF8MB4
-- Engine: InnoDB
-- ============================================================
-- Description:
--   Base de données complète pour la gestion d'un club de jiu-jitsu
--   avec gestion des utilisateurs, cours, paiements, magasin,
--   messagerie, alertes et statistiques.
--
-- Nouveautés v4.1:
--   - Soft Delete sur utilisateurs (deleted_at, deleted_by, deletion_reason)
--   - Anonymisation RGPD (conformité article 17)
--   - CHECK constraints renforcés
--   - Validation email et tokens SHA-256
--   - Index stratégiques optimisés
--
-- Nouveautés v4.4:
--   - Colonne role_app ENUM('admin','member','professor') dans utilisateurs
--   - RBAC : contrôle d'accès par rôle applicatif
--
-- Nouveautés v4.3:
--   - Système de gestion des familles (tables familles + membres_famille)
--   - email / password / nom_utilisateur rendus nullables (comptes enfants)
--   - Nouvelle colonne tuteur_id dans utilisateurs (FK auto-référente)
--   - Nouvelles colonnes est_mineur et peut_se_connecter
--   - Contrainte CHECK email mise à jour (accepte NULL)
--
-- Tables: 43 tables (41 existantes + 2 : familles, membres_famille)
-- Foreign Keys: 45 (+2 : fk_mf_famille, fk_mf_user, fk_utilisateurs_tuteur)
-- Indexes: ~162 (+8)
-- CHECK Constraints: 13 (chk_utilisateurs_email mis à jour)
-- ============================================================

-- Suppression et création de la base de données
DROP DATABASE IF EXISTS clubmanager;
CREATE DATABASE clubmanager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE clubmanager;

-- ============================================================
-- 1. TABLES DE RÉFÉRENCE (6 tables)
-- ============================================================
-- Ces tables ne dépendent d'aucune autre table
-- Ordre de création libre

-- ------------------------------------------------------------
-- 1.1 genres - Genres/sexes des utilisateurs
-- ------------------------------------------------------------
CREATE TABLE genres (
    id INT UNSIGNED AUTO_INCREMENT,
    nom VARCHAR(50) NOT NULL UNIQUE,

    PRIMARY KEY (id),
    INDEX idx_nom (nom)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Genres des utilisateurs (Homme, Femme, Autre, Non spécifié)';

-- ------------------------------------------------------------
-- 1.2 grades - Grades/ceintures de jiu-jitsu
-- ------------------------------------------------------------
CREATE TABLE grades (
    id INT UNSIGNED AUTO_INCREMENT,
    nom VARCHAR(50) NOT NULL UNIQUE,
    ordre INT UNSIGNED NOT NULL UNIQUE COMMENT 'Ordre hiérarchique (0=blanche, 1=bleue, etc.)',
    couleur VARCHAR(50) NULL COMMENT 'Couleur de la ceinture',

    PRIMARY KEY (id),
    INDEX idx_ordre (ordre),
    INDEX idx_nom (nom),

    CONSTRAINT chk_grades_ordre CHECK (ordre >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Grades et ceintures de jiu-jitsu';

-- ------------------------------------------------------------
-- 1.3 status - Statuts génériques (utilisateurs, inscriptions, etc.)
-- ------------------------------------------------------------
CREATE TABLE status (
    id INT UNSIGNED AUTO_INCREMENT,
    nom VARCHAR(50) NOT NULL UNIQUE,
    description TEXT NULL,

    PRIMARY KEY (id),
    INDEX idx_nom (nom)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Statuts génériques (actif, inactif, en_attente, etc.)';

-- ------------------------------------------------------------
-- 1.4 plans_tarifaires - Plans d'abonnement
-- ------------------------------------------------------------
CREATE TABLE plans_tarifaires (
    id INT UNSIGNED AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NULL,
    prix DECIMAL(10,2) NOT NULL,
    duree_mois INT UNSIGNED NOT NULL COMMENT 'Durée en mois',
    actif BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_actif (actif),
    INDEX idx_nom (nom),
    INDEX idx_prix (prix),

    CONSTRAINT chk_plans_prix CHECK (prix > 0),
    CONSTRAINT chk_plans_duree CHECK (duree_mois > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Plans tarifaires et abonnements';

-- ------------------------------------------------------------
-- 1.5 categories - Catégories d'articles magasin
-- ------------------------------------------------------------
CREATE TABLE categories (
    id INT UNSIGNED AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_nom (nom)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Catégories d''articles (kimono, accessoires, etc.)';

-- ------------------------------------------------------------
-- 1.6 tailles - Tailles disponibles pour les articles
-- ------------------------------------------------------------
CREATE TABLE tailles (
    id INT UNSIGNED AUTO_INCREMENT,
    nom VARCHAR(20) NOT NULL UNIQUE COMMENT 'XS, S, M, L, XL, A1, A2, A3, A4, etc.',
    ordre INT UNSIGNED NULL COMMENT 'Ordre d''affichage',

    PRIMARY KEY (id),
    INDEX idx_nom (nom),
    INDEX idx_ordre (ordre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tailles pour les articles (vêtements, kimonos)';

-- ============================================================
-- 2. TABLES UTILISATEURS (7 tables)
-- ============================================================
-- Gestion des utilisateurs avec soft delete RGPD v4.1

-- ------------------------------------------------------------
-- 2.1 utilisateurs - Table principale des utilisateurs
-- ------------------------------------------------------------
CREATE TABLE utilisateurs (
    id INT UNSIGNED AUTO_INCREMENT,
    userId VARCHAR(20) NOT NULL UNIQUE COMMENT 'Format: U-YYYY-XXXX',
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    nom_utilisateur VARCHAR(50) NULL
                        COMMENT 'NULL pour les comptes enfants gérés par un tuteur',
    email VARCHAR(255) NULL
              COMMENT 'NULL autorisé pour les comptes enfants gérés par un tuteur',
    password VARCHAR(255) NULL
                 COMMENT 'Hash bcrypt ou argon2 — NULL pour les comptes gérés (mineurs)',
    date_of_birth DATE NULL,
    telephone VARCHAR(20) NULL,
    adresse TEXT NULL,

    -- Relations
    genre_id INT UNSIGNED NULL,
    grade_id INT UNSIGNED NULL,
    abonnement_id INT UNSIGNED NULL COMMENT 'Plan tarifaire actuel',
    status_id INT UNSIGNED NULL,

    -- Gestion familiale v4.3
    tuteur_id INT UNSIGNED NULL
                  COMMENT 'Référence au parent/tuteur légal gérant ce compte (NULL si compte autonome)',
    est_mineur BOOLEAN NOT NULL DEFAULT FALSE
                   COMMENT 'TRUE si ce membre est un enfant mineur géré par un tuteur légal',
    peut_se_connecter BOOLEAN NOT NULL DEFAULT TRUE
                          COMMENT 'FALSE pour les comptes enfants gérés exclusivement par le tuteur',

    -- Rôle applicatif RBAC v4.4
    role_app ENUM('admin', 'member', 'professor') NOT NULL DEFAULT 'member'
                 COMMENT 'Rôle applicatif pour le contrôle d\'accès (RBAC)',

    -- Internationalisation v4.5
    langue_preferee VARCHAR(5) NOT NULL DEFAULT 'fr'
                    COMMENT 'Langue préférée utilisateur (ISO 639-1: fr, en, nl, etc.)',

    -- Statut compte
    active BOOLEAN NOT NULL DEFAULT TRUE,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    photo_url VARCHAR(255) NULL,

    -- Soft Delete et RGPD v4.1
    deleted_at TIMESTAMP NULL COMMENT 'Date de suppression (soft delete)',
    deleted_by INT UNSIGNED NULL COMMENT 'ID utilisateur ayant effectué la suppression',
    deletion_reason TEXT NULL COMMENT 'Raison de la suppression',
    anonymized BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Compte anonymisé (RGPD)',

    -- Métadonnées
    date_inscription TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    derniere_connexion TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

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

    -- Indexes stratégiques
    INDEX idx_userId (userId),
    INDEX idx_email (email),
    INDEX idx_nom_utilisateur (nom_utilisateur),
    INDEX idx_last_name (last_name),
    INDEX idx_first_name (first_name),
    INDEX idx_active (active),
    INDEX idx_email_verified (email_verified),
    INDEX idx_deleted_at (deleted_at),
    INDEX idx_anonymized (anonymized),
    INDEX idx_genre_id (genre_id),
    INDEX idx_grade_id (grade_id),
    INDEX idx_abonnement_id (abonnement_id),
    INDEX idx_status_id (status_id),
    INDEX idx_date_inscription   (date_inscription),
    INDEX idx_derniere_connexion (derniere_connexion),
    INDEX idx_langue_preferee (langue_preferee),
    INDEX idx_tuteur_id          (tuteur_id),
    INDEX idx_est_mineur         (est_mineur),
    INDEX idx_peut_se_connecter  (peut_se_connecter),
    INDEX idx_role_app           (role_app),

    -- CHECK constraints v4.3
    CONSTRAINT chk_utilisateurs_email
        CHECK (
            email IS NULL
            OR email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'
        ),
    CONSTRAINT chk_utilisateurs_userId
        CHECK (userId REGEXP '^U-[0-9]{4}-[0-9]{4}$')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Utilisateurs avec soft delete, conformité RGPD et gestion familiale v4.3';

-- ------------------------------------------------------------
-- 2.2 email_validation_tokens - Tokens de validation email
-- ------------------------------------------------------------
CREATE TABLE email_validation_tokens (
    id INT UNSIGNED AUTO_INCREMENT,
    user_id INT UNSIGNED NOT NULL,
    token_hash VARCHAR(64) NOT NULL UNIQUE COMMENT 'SHA-256 hash du token',
    token_type ENUM('verification', 'change_email') NOT NULL DEFAULT 'verification',
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_email_tokens_utilisateur
        FOREIGN KEY (user_id) REFERENCES utilisateurs(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    INDEX idx_token_hash (token_hash),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at),
    INDEX idx_used (used),
    INDEX idx_token_type (token_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tokens de validation email (SHA-256)';

-- ------------------------------------------------------------
-- 2.3 password_reset_tokens - Tokens de réinitialisation mot de passe
-- ------------------------------------------------------------
CREATE TABLE password_reset_tokens (
    id INT UNSIGNED AUTO_INCREMENT,
    user_id INT UNSIGNED NOT NULL,
    token_hash VARCHAR(64) NOT NULL UNIQUE COMMENT 'SHA-256 hash du token',
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_pwd_reset_utilisateur
        FOREIGN KEY (user_id) REFERENCES utilisateurs(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    INDEX idx_token_hash (token_hash),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at),
    INDEX idx_used (used)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tokens de réinitialisation mot de passe (SHA-256)';

-- ------------------------------------------------------------
-- 2.4 password_reset_attempts - Tentatives de réinitialisation
-- ------------------------------------------------------------
CREATE TABLE password_reset_attempts (
    id INT UNSIGNED AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL COMMENT 'Support IPv4 et IPv6',
    attempts_count INT UNSIGNED NOT NULL DEFAULT 1,
    last_attempt_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    INDEX idx_email (email),
    INDEX idx_ip_address (ip_address),
    INDEX idx_last_attempt_at (last_attempt_at),
    INDEX idx_email_ip (email, ip_address)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Suivi des tentatives de réinitialisation (anti-bruteforce)';

-- ------------------------------------------------------------
-- 2.5 refresh_tokens - Tokens de rafraîchissement JWT
-- ------------------------------------------------------------
CREATE TABLE refresh_tokens (
    id INT UNSIGNED AUTO_INCREMENT,
    user_id INT UNSIGNED NOT NULL,
    token_hash VARCHAR(64) NOT NULL UNIQUE COMMENT 'SHA-256 hash du refresh token',
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    ip_address VARCHAR(45) NULL COMMENT 'IP de création du token',
    user_agent TEXT NULL COMMENT 'Navigateur/device info',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_refresh_tokens_utilisateur
        FOREIGN KEY (user_id) REFERENCES utilisateurs(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    INDEX idx_token_hash (token_hash),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at),
    INDEX idx_revoked (revoked),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Refresh tokens JWT avec révocation et tracking';

-- ------------------------------------------------------------
-- 2.6 login_attempts - Logs des tentatives de connexion
-- ------------------------------------------------------------
CREATE TABLE login_attempts (
    id INT UNSIGNED AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL COMMENT 'Support IPv4 et IPv6',
    success BOOLEAN NOT NULL,
    user_agent TEXT NULL,
    failure_reason VARCHAR(255) NULL COMMENT 'wrong_password, account_disabled, email_not_verified, etc.',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    INDEX idx_email (email),
    INDEX idx_ip_address (ip_address),
    INDEX idx_success (success),
    INDEX idx_created_at (created_at),
    INDEX idx_email_ip (email, ip_address)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Logs des tentatives de connexion pour audit et sécurité';

-- ------------------------------------------------------------
-- 2.7 auth_attempts - Tentatives d'authentification
-- ------------------------------------------------------------
CREATE TABLE auth_attempts (
    id INT UNSIGNED AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    success BOOLEAN NOT NULL DEFAULT FALSE,
    user_agent TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    INDEX idx_email (email),
    INDEX idx_ip_address (ip_address),
    INDEX idx_success (success),
    INDEX idx_created_at (created_at),
    INDEX idx_email_ip (email, ip_address)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Historique des tentatives d''authentification';

-- ------------------------------------------------------------
-- 2.8 manual_recovery_requests - Demandes de récupération manuelle
-- ------------------------------------------------------------
CREATE TABLE manual_recovery_requests (
    id INT UNSIGNED AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    reason TEXT NULL,
    ip_address VARCHAR(45) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Demandes de récupération manuelle de compte';

-- ------------------------------------------------------------
-- 2.9 validation_tokens - Tokens de validation génériques
-- ------------------------------------------------------------
CREATE TABLE validation_tokens (
    id INT UNSIGNED AUTO_INCREMENT,
    user_id INT UNSIGNED NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    type ENUM('email', 'password_reset', 'other') NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_validation_tokens_utilisateur
        FOREIGN KEY (user_id) REFERENCES utilisateurs(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    INDEX idx_token (token),
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_expires_at (expires_at),
    INDEX idx_used (used)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tokens de validation génériques';

-- ============================================================
-- 3. TABLES COURS (6 tables)
-- ============================================================
-- Gestion des cours, professeurs et inscriptions

-- ------------------------------------------------------------
-- 3.1 cours_recurrent - Cours récurrents (planning hebdomadaire)
-- ------------------------------------------------------------
CREATE TABLE cours_recurrent (
    id INT UNSIGNED AUTO_INCREMENT,
    type_cours VARCHAR(100) NOT NULL COMMENT 'Gi, NoGi, Enfants, Compétition, etc.',
    jour_semaine TINYINT UNSIGNED NOT NULL COMMENT '1=Lundi, 7=Dimanche',
    heure_debut TIME NOT NULL,
    heure_fin TIME NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    INDEX idx_jour_semaine (jour_semaine),
    INDEX idx_type_cours (type_cours),
    INDEX idx_active (active),
    INDEX idx_horaire (jour_semaine, heure_debut),

    CONSTRAINT chk_cours_rec_jour CHECK (jour_semaine BETWEEN 1 AND 7),
    CONSTRAINT chk_cours_rec_horaire CHECK (heure_fin > heure_debut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Cours récurrents hebdomadaires';

-- ------------------------------------------------------------
-- 3.2 cours - Instances de cours (réalisations concrètes)
-- ------------------------------------------------------------
CREATE TABLE cours (
    id INT UNSIGNED AUTO_INCREMENT,
    cours_recurrent_id INT UNSIGNED NULL COMMENT 'NULL si cours ponctuel',
    date_cours DATE NOT NULL,
    type_cours VARCHAR(100) NOT NULL,
    heure_debut TIME NOT NULL,
    heure_fin TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_cours_recurrent
        FOREIGN KEY (cours_recurrent_id) REFERENCES cours_recurrent(id)
        ON DELETE SET NULL ON UPDATE CASCADE,

    INDEX idx_date_cours (date_cours),
    INDEX idx_type_cours (type_cours),
    INDEX idx_cours_recurrent_id (cours_recurrent_id),
    INDEX idx_date_type (date_cours, type_cours),

    CONSTRAINT chk_cours_horaire CHECK (heure_fin > heure_debut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Instances de cours réalisés';

-- ------------------------------------------------------------
-- 3.3 professeurs - Professeurs/instructeurs
-- ------------------------------------------------------------
CREATE TABLE professeurs (
    id INT UNSIGNED AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(255) NULL,
    telephone VARCHAR(20) NULL,
    specialite VARCHAR(100) NULL COMMENT 'Gi, NoGi, Enfants, etc.',
    grade_id INT UNSIGNED NULL,
    photo_url VARCHAR(255) NULL,
    actif BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_professeurs_grade
        FOREIGN KEY (grade_id) REFERENCES grades(id)
        ON DELETE SET NULL ON UPDATE CASCADE,

    INDEX idx_nom (nom),
    INDEX idx_prenom (prenom),
    INDEX idx_email (email),
    INDEX idx_actif (actif),
    INDEX idx_grade_id (grade_id),
    INDEX idx_nom_prenom (nom, prenom)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Professeurs et instructeurs';

-- ------------------------------------------------------------
-- 3.4 cours_recurrent_professeur - Association cours récurrents <-> professeurs
-- ------------------------------------------------------------
CREATE TABLE cours_recurrent_professeur (
    id INT UNSIGNED AUTO_INCREMENT,
    cours_recurrent_id INT UNSIGNED NOT NULL,
    professeur_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_crp_cours_recurrent
        FOREIGN KEY (cours_recurrent_id) REFERENCES cours_recurrent(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_crp_professeur
        FOREIGN KEY (professeur_id) REFERENCES professeurs(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    UNIQUE KEY uk_cours_professeur (cours_recurrent_id, professeur_id),
    INDEX idx_cours_recurrent_id (cours_recurrent_id),
    INDEX idx_professeur_id (professeur_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Association cours récurrents et professeurs';

-- ------------------------------------------------------------
-- 3.5 inscriptions - Inscriptions utilisateurs aux cours
-- ------------------------------------------------------------
CREATE TABLE inscriptions (
    id INT UNSIGNED AUTO_INCREMENT,
    user_id INT UNSIGNED NOT NULL,
    cours_id INT UNSIGNED NOT NULL,
    status_id INT UNSIGNED NULL,
    commentaire TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

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
    INDEX idx_user_id (user_id),
    INDEX idx_cours_id (cours_id),
    INDEX idx_status_id (status_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Inscriptions des utilisateurs aux cours';

-- ------------------------------------------------------------
-- 3.6 reservations - Réservations de cours
-- ------------------------------------------------------------
CREATE TABLE reservations (
    id INT UNSIGNED AUTO_INCREMENT,
    user_id INT UNSIGNED NOT NULL,
    cours_id INT UNSIGNED NOT NULL,
    statut ENUM('confirmee', 'annulee', 'en_attente') NOT NULL DEFAULT 'confirmee',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_reservations_utilisateur
        FOREIGN KEY (user_id) REFERENCES utilisateurs(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_reservations_cours
        FOREIGN KEY (cours_id) REFERENCES cours(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    INDEX idx_user_id (user_id),
    INDEX idx_cours_id (cours_id),
    INDEX idx_statut (statut),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Réservations de cours par les utilisateurs';

-- ============================================================
-- 4. TABLES PAIEMENTS (2 tables)
-- ============================================================
-- Gestion des paiements et échéances

-- ------------------------------------------------------------
-- 4.1 paiements - Paiements des utilisateurs
-- ------------------------------------------------------------
CREATE TABLE paiements (
    id INT UNSIGNED AUTO_INCREMENT,
    user_id INT UNSIGNED NOT NULL,
    plan_tarifaire_id INT UNSIGNED NULL,
    montant DECIMAL(10,2) NOT NULL,
    methode_paiement ENUM('stripe', 'especes', 'virement', 'autre') NOT NULL,
    statut ENUM('en_attente', 'valide', 'echoue', 'rembourse') NOT NULL DEFAULT 'en_attente',
    description TEXT NULL,
    stripe_payment_intent_id VARCHAR(255) NULL,
    stripe_charge_id VARCHAR(255) NULL,
    date_paiement TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_paiements_utilisateur
        FOREIGN KEY (user_id) REFERENCES utilisateurs(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_paiements_plan
        FOREIGN KEY (plan_tarifaire_id) REFERENCES plans_tarifaires(id)
        ON DELETE SET NULL ON UPDATE CASCADE,

    INDEX idx_user_id (user_id),
    INDEX idx_plan_tarifaire_id (plan_tarifaire_id),
    INDEX idx_statut (statut),
    INDEX idx_methode_paiement (methode_paiement),
    INDEX idx_date_paiement (date_paiement),
    INDEX idx_stripe_payment_intent (stripe_payment_intent_id),
    INDEX idx_created_at (created_at),

    CONSTRAINT chk_paiements_montant CHECK (montant > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Paiements des utilisateurs';

-- ------------------------------------------------------------
-- 4.2 echeances_paiements - Échéances de paiement
-- ------------------------------------------------------------
CREATE TABLE echeances_paiements (
    id INT UNSIGNED AUTO_INCREMENT,
    user_id INT UNSIGNED NOT NULL,
    plan_tarifaire_id INT UNSIGNED NULL,
    montant DECIMAL(10,2) NOT NULL,
    date_echeance DATE NOT NULL,
    statut ENUM('en_attente', 'paye', 'en_retard', 'annule') NOT NULL DEFAULT 'en_attente',
    paiement_id INT UNSIGNED NULL COMMENT 'Paiement effectué pour cette échéance',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

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

    INDEX idx_user_id (user_id),
    INDEX idx_plan_tarifaire_id (plan_tarifaire_id),
    INDEX idx_date_echeance (date_echeance),
    INDEX idx_statut (statut),
    INDEX idx_paiement_id (paiement_id),

    CONSTRAINT chk_echeances_montant CHECK (montant > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Échéances de paiement des abonnements';

-- ============================================================
-- 5. TABLES MAGASIN (6 tables)
-- ============================================================
-- Gestion du magasin et des stocks

-- ------------------------------------------------------------
-- 5.1 articles - Articles en vente
-- ------------------------------------------------------------
CREATE TABLE articles (
    id INT UNSIGNED AUTO_INCREMENT,
    nom VARCHAR(200) NOT NULL,
    description TEXT NULL,
    prix DECIMAL(10,2) NOT NULL,
    categorie_id INT UNSIGNED NULL,
    actif BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_articles_categorie
        FOREIGN KEY (categorie_id) REFERENCES categories(id)
        ON DELETE SET NULL ON UPDATE CASCADE,

    INDEX idx_nom (nom),
    INDEX idx_categorie_id (categorie_id),
    INDEX idx_actif (actif),
    INDEX idx_prix (prix),

    CONSTRAINT chk_articles_prix CHECK (prix >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Articles disponibles à la vente';

-- ------------------------------------------------------------
-- 5.2 images - Images des articles
-- ------------------------------------------------------------
CREATE TABLE images (
    id INT UNSIGNED AUTO_INCREMENT,
    article_id INT UNSIGNED NOT NULL,
    url VARCHAR(255) NOT NULL,
    ordre INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Ordre d''affichage',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_images_article
        FOREIGN KEY (article_id) REFERENCES articles(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    INDEX idx_article_id (article_id),
    INDEX idx_ordre (ordre),
    INDEX idx_article_ordre (article_id, ordre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Images des articles';

-- ------------------------------------------------------------
-- 5.3 stocks - Gestion des stocks par article et taille
-- ------------------------------------------------------------
CREATE TABLE stocks (
    id INT UNSIGNED AUTO_INCREMENT,
    article_id INT UNSIGNED NOT NULL,
    taille_id INT UNSIGNED NOT NULL,
    quantite INT NOT NULL DEFAULT 0 COMMENT 'Stock total',
    quantite_minimum INT NOT NULL DEFAULT 0 COMMENT 'Seuil d''alerte',
    stock_physique INT NOT NULL DEFAULT 0 COMMENT 'Stock physique disponible',
    stock_reserve INT NOT NULL DEFAULT 0 COMMENT 'Stock réservé (commandes en attente)',
    stock_disponible INT NOT NULL DEFAULT 0 COMMENT 'Stock disponible = physique - réservé',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_stocks_article
        FOREIGN KEY (article_id) REFERENCES articles(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_stocks_taille
        FOREIGN KEY (taille_id) REFERENCES tailles(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    UNIQUE KEY uk_article_taille (article_id, taille_id),
    INDEX idx_article_id (article_id),
    INDEX idx_taille_id (taille_id),
    INDEX idx_stock_disponible (stock_disponible),
    INDEX idx_quantite_minimum (quantite_minimum),

    CONSTRAINT chk_stocks_quantite CHECK (quantite >= 0),
    CONSTRAINT chk_stocks_reserve CHECK (stock_reserve >= 0),
    CONSTRAINT chk_stocks_physique CHECK (stock_physique >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stocks des articles par taille';

-- ------------------------------------------------------------
-- 5.4 commandes - Commandes des utilisateurs
-- ------------------------------------------------------------
CREATE TABLE commandes (
    id INT UNSIGNED AUTO_INCREMENT,
    unique_id VARCHAR(50) NOT NULL UNIQUE COMMENT 'Identifiant unique de commande',
    numero_commande VARCHAR(50) NOT NULL UNIQUE COMMENT 'Numéro de commande lisible',
    user_id INT UNSIGNED NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    date_commande TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    statut ENUM('en_attente', 'payee', 'expediee', 'livree', 'annulee') NOT NULL DEFAULT 'en_attente',
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_commandes_utilisateur
        FOREIGN KEY (user_id) REFERENCES utilisateurs(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    INDEX idx_unique_id (unique_id),
    INDEX idx_numero_commande (numero_commande),
    INDEX idx_user_id (user_id),
    INDEX idx_statut (statut),
    INDEX idx_date_commande (date_commande),
    INDEX idx_created_at (created_at),

    CONSTRAINT chk_commandes_total CHECK (total >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Commandes des utilisateurs';

-- ------------------------------------------------------------
-- 5.5 commande_articles - Articles dans les commandes
-- ------------------------------------------------------------
CREATE TABLE commande_articles (
    id INT UNSIGNED AUTO_INCREMENT,
    commande_id INT UNSIGNED NOT NULL,
    article_id INT UNSIGNED NOT NULL,
    taille_id INT UNSIGNED NULL,
    quantite INT UNSIGNED NOT NULL,
    prix DECIMAL(10,2) NOT NULL COMMENT 'Prix unitaire au moment de la commande',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

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
    INDEX idx_article_id (article_id),
    INDEX idx_taille_id (taille_id),

    CONSTRAINT chk_commande_articles_quantite CHECK (quantite > 0),
    CONSTRAINT chk_commande_articles_prix CHECK (prix >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Détails des articles dans chaque commande';

-- ------------------------------------------------------------
-- 5.6 mouvements_stock - Historique des mouvements de stock
-- ------------------------------------------------------------
CREATE TABLE mouvements_stock (
    id INT UNSIGNED AUTO_INCREMENT,
    article_id INT UNSIGNED NOT NULL,
    taille VARCHAR(20) NOT NULL COMMENT 'Taille de l''article',
    type_mouvement ENUM('commande', 'livraison', 'annulation', 'retour', 'ajustement', 'inventaire') NOT NULL,
    quantite_avant INT NOT NULL,
    quantite_apres INT NOT NULL,
    quantite_mouvement INT NOT NULL COMMENT 'Quantité du mouvement (+ ou -)',
    commande_id INT UNSIGNED NULL,
    user_id INT UNSIGNED NULL COMMENT 'Utilisateur ayant effectué le mouvement',
    motif TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_mouvements_article
        FOREIGN KEY (article_id) REFERENCES articles(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_mouvements_commande
        FOREIGN KEY (commande_id) REFERENCES commandes(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_mouvements_utilisateur
        FOREIGN KEY (user_id) REFERENCES utilisateurs(id)
        ON DELETE SET NULL ON UPDATE CASCADE,

    INDEX idx_article_id (article_id),
    INDEX idx_type_mouvement (type_mouvement),
    INDEX idx_commande_id (commande_id),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_article_date (article_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Historique des mouvements de stock';

-- ============================================================
-- 6. TABLES MESSAGERIE (5 tables)
-- ============================================================
-- Gestion de la messagerie et des notifications

-- ------------------------------------------------------------
-- 6.1 messages - Messages entre utilisateurs
-- ------------------------------------------------------------
CREATE TABLE messages (
    id INT UNSIGNED AUTO_INCREMENT,
    expediteur_id INT UNSIGNED NOT NULL,
    destinataire_id INT UNSIGNED NOT NULL,
    sujet VARCHAR(200) NULL,
    contenu TEXT NOT NULL,
    lu BOOLEAN NOT NULL DEFAULT FALSE,
    date_lecture TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_messages_expediteur
        FOREIGN KEY (expediteur_id) REFERENCES utilisateurs(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_messages_destinataire
        FOREIGN KEY (destinataire_id) REFERENCES utilisateurs(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    INDEX idx_expediteur_id (expediteur_id),
    INDEX idx_destinataire_id (destinataire_id),
    INDEX idx_lu (lu),
    INDEX idx_created_at (created_at),
    INDEX idx_destinataire_lu (destinataire_id, lu)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Messages entre utilisateurs';

-- ------------------------------------------------------------
-- 6.2 message_status - Statuts des messages
-- ------------------------------------------------------------
CREATE TABLE message_status (
    id INT UNSIGNED AUTO_INCREMENT,
    message_id INT UNSIGNED NOT NULL,
    statut ENUM('envoye', 'lu', 'archive', 'supprime') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_message_status_message
        FOREIGN KEY (message_id) REFERENCES messages(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    INDEX idx_message_id (message_id),
    INDEX idx_statut (statut),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Historique des statuts des messages';

-- ------------------------------------------------------------
-- 6.3 types_messages_personnalises - Types de messages personnalisés
-- ------------------------------------------------------------
CREATE TABLE types_messages_personnalises (
    id INT UNSIGNED AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    INDEX idx_nom (nom)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Types de messages personnalisés (newsletters, etc.)';

-- ------------------------------------------------------------
-- 6.4 messages_personnalises - Templates de messages personnalisés
-- ------------------------------------------------------------
CREATE TABLE messages_personnalises (
    id INT UNSIGNED AUTO_INCREMENT,
    type_id INT UNSIGNED NOT NULL,
    titre VARCHAR(200) NOT NULL,
    contenu TEXT NOT NULL,
    actif BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_messages_perso_type
        FOREIGN KEY (type_id) REFERENCES types_messages_personnalises(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    INDEX idx_type_id (type_id),
    INDEX idx_actif (actif),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Templates de messages personnalisés';

-- ------------------------------------------------------------
-- 6.5 notifications - Notifications utilisateurs
-- ------------------------------------------------------------
CREATE TABLE notifications (
    id INT UNSIGNED AUTO_INCREMENT,
    user_id INT UNSIGNED NOT NULL,
    type ENUM('info', 'warning', 'error', 'success') NOT NULL DEFAULT 'info',
    titre VARCHAR(200) NOT NULL,
    contenu TEXT NOT NULL,
    lu BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_notifications_utilisateur
        FOREIGN KEY (user_id) REFERENCES utilisateurs(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_lu (lu),
    INDEX idx_created_at (created_at),
    INDEX idx_utilisateur_lu (user_id, lu)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Notifications système pour les utilisateurs';

-- ============================================================
-- 7. TABLES ALERTES (3 tables)
-- ============================================================
-- Système d'alertes et de monitoring

-- ------------------------------------------------------------
-- 7.1 alertes_types - Types d'alertes système
-- ------------------------------------------------------------
CREATE TABLE alertes_types (
    id INT UNSIGNED AUTO_INCREMENT,
    code VARCHAR(50) NOT NULL UNIQUE COMMENT 'Code unique (PAYMENT_OVERDUE, etc.)',
    nom VARCHAR(100) NOT NULL,
    description TEXT NULL,
    priorite ENUM('basse', 'normale', 'haute', 'critique') NOT NULL DEFAULT 'normale',
    actif BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    INDEX idx_code (code),
    INDEX idx_priorite (priorite),
    INDEX idx_actif (actif)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Types d''alertes système';

-- ------------------------------------------------------------
-- 7.2 alertes_utilisateurs - Alertes pour les utilisateurs
-- ------------------------------------------------------------
CREATE TABLE alertes_utilisateurs (
    id INT UNSIGNED AUTO_INCREMENT,
    user_id INT UNSIGNED NOT NULL,
    alerte_type_id INT UNSIGNED NOT NULL,
    statut ENUM('active', 'resolue', 'ignoree') NOT NULL DEFAULT 'active',
    donnees_contexte JSON NULL COMMENT 'Données contextuelles de l''alerte',
    date_detection TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_resolution TIMESTAMP NULL,
    notes TEXT NULL,
    resolu_par INT UNSIGNED NULL COMMENT 'Admin ayant résolu l''alerte',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

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

    INDEX idx_user_id (user_id),
    INDEX idx_alerte_type_id (alerte_type_id),
    INDEX idx_statut (statut),
    INDEX idx_date_detection (date_detection),
    INDEX idx_date_resolution (date_resolution),
    INDEX idx_resolu_par (resolu_par),
    INDEX idx_utilisateur_statut (user_id, statut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Alertes actives pour les utilisateurs';

-- ------------------------------------------------------------
-- 7.3 alertes_actions - Actions effectuées suite aux alertes
-- ------------------------------------------------------------
CREATE TABLE alertes_actions (
    id INT UNSIGNED AUTO_INCREMENT,
    alerte_user_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED NULL COMMENT 'Admin ayant effectué l''action',
    action_type ENUM('message_envoye', 'information_mise_a_jour', 'paiement_recu', 'statut_change', 'autre') NOT NULL,
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_alertes_actions_alerte
        FOREIGN KEY (alerte_user_id) REFERENCES alertes_utilisateurs(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_alertes_actions_utilisateur
        FOREIGN KEY (user_id) REFERENCES utilisateurs(id)
        ON DELETE SET NULL ON UPDATE CASCADE,

    INDEX idx_alerte_user_id (alerte_user_id),
    INDEX idx_user_id (user_id),
    INDEX idx_action_type (action_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Historique des actions effectuées suite aux alertes';

-- ============================================================
-- 8. TABLES GROUPES (2 tables)
-- ============================================================
-- Gestion des groupes d'utilisateurs

-- ------------------------------------------------------------
-- 8.1 groupes - Groupes d'utilisateurs
-- ------------------------------------------------------------
CREATE TABLE groupes (
    id INT UNSIGNED AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    INDEX idx_nom (nom)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Groupes d''utilisateurs (compétition, enfants, etc.)';

-- ------------------------------------------------------------
-- 8.2 groupes_utilisateurs - Association groupes <-> utilisateurs
-- ------------------------------------------------------------
CREATE TABLE groupes_utilisateurs (
    id INT UNSIGNED AUTO_INCREMENT,
    groupe_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_groupes_util_groupe
        FOREIGN KEY (groupe_id) REFERENCES groupes(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_groupes_util_utilisateur
        FOREIGN KEY (user_id) REFERENCES utilisateurs(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    UNIQUE KEY uk_groupe_utilisateur (groupe_id, user_id),
    INDEX idx_groupe_id (groupe_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Association entre groupes et utilisateurs';

-- ============================================================
-- 9. TABLES SYSTÈME (2 tables)
-- ============================================================
-- Statistiques et informations système

-- ------------------------------------------------------------
-- 9.1 statistiques - Statistiques du club
-- ------------------------------------------------------------
CREATE TABLE statistiques (
    id INT UNSIGNED AUTO_INCREMENT,
    type VARCHAR(100) NOT NULL COMMENT 'Type de statistique (inscriptions, revenus, etc.)',
    cle VARCHAR(100) NOT NULL COMMENT 'Clé de la statistique',
    valeur TEXT NOT NULL COMMENT 'Valeur (peut être JSON)',
    date_stat DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    INDEX idx_type (type),
    INDEX idx_cle (cle),
    INDEX idx_date_stat (date_stat),
    INDEX idx_type_date (type, date_stat),
    INDEX idx_cle_date (cle, date_stat)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Statistiques et métriques du club';

-- ------------------------------------------------------------
-- 9.2 informations - Informations et paramètres système
-- ------------------------------------------------------------
CREATE TABLE informations (
    id INT UNSIGNED AUTO_INCREMENT,
    cle VARCHAR(100) NOT NULL UNIQUE,
    valeur TEXT NOT NULL,
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    INDEX idx_cle (cle)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Informations et paramètres système';

-- ============================================================
-- 10. TABLES FAMILLES (2 tables) — v4.3
-- ============================================================
-- Gestion des liens familiaux entre membres du club.
-- Permet notamment aux parents de gérer les comptes de leurs
-- enfants mineurs qui n'ont pas d'adresse email propre.

-- ------------------------------------------------------------
-- 10.1 familles - Groupes familiaux
-- ------------------------------------------------------------
CREATE TABLE familles (
    id         INT UNSIGNED AUTO_INCREMENT,
    nom        VARCHAR(100) NULL
                   COMMENT 'Nom optionnel du groupe (ex: Famille Dupont)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    INDEX idx_nom (nom)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Groupes familiaux — relie les membres d''une même famille';

-- ------------------------------------------------------------
-- 10.2 membres_famille - Liens utilisateurs <-> familles
-- ------------------------------------------------------------
CREATE TABLE membres_famille (
    id               INT UNSIGNED AUTO_INCREMENT,
    famille_id       INT UNSIGNED NOT NULL,
    user_id          INT UNSIGNED NOT NULL,

    role             ENUM('parent', 'tuteur', 'enfant', 'conjoint', 'autre')
                         NOT NULL DEFAULT 'autre'
                         COMMENT 'Rôle du membre dans la famille',

    est_responsable  BOOLEAN NOT NULL DEFAULT FALSE
                         COMMENT 'Peut gérer les autres membres (inscrire, payer, etc.)',

    est_tuteur_legal BOOLEAN NOT NULL DEFAULT FALSE
                         COMMENT 'Tuteur légal des mineurs de la famille',

    date_ajout       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

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
-- FIN DU SCHÉMA v4.3
-- ============================================================
-- Récapitulatif:
--   - 43 tables créées (41 existantes + 2 : familles, membres_famille)
--   - 45 Foreign Keys (+2 : fk_mf_famille, fk_mf_user, fk_utilisateurs_tuteur)
--   - ~162 index stratégiques (+8)
--   - 13 CHECK constraints (chk_utilisateurs_email mis à jour)
--   - Support Soft Delete + RGPD sur utilisateurs
--   - Gestion des groupes familiaux (v4.3)
--   - Tokens sécurisés SHA-256
--   - Encoding UTF8MB4
--   - Engine InnoDB
-- ============================================================
