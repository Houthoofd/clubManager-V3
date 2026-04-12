-- ============================================================
-- CLUBMANAGER - MIGRATION 003 : Système de gestion des familles
-- ============================================================
-- Version    : 1.0
-- Date       : 2025-01-26
-- Auteur     : Benoit Houthoofd
-- Database   : MySQL 8.0+ / MariaDB 10.6+
-- ============================================================
-- Description :
--   Ajoute le système de groupes familiaux permettant de lier
--   les membres d'une même famille. Conçu notamment pour les
--   enfants mineurs qui n'ont pas d'adresse email et qui sont
--   gérés par un parent ou tuteur légal.
--
-- Changements :
--   1. Modification de `utilisateurs` :
--      - email          : NOT NULL → NULL (enfants sans email)
--      - password       : NOT NULL → NULL (comptes gérés)
--      - nom_utilisateur: NOT NULL → NULL (comptes gérés)
--      - Nouvelle colonne tuteur_id         (FK vers utilisateurs)
--      - Nouvelle colonne est_mineur        (flag mineur)
--      - Nouvelle colonne peut_se_connecter (flag connexion directe)
--      - Mise à jour contrainte CHECK email (accepte NULL)
--   2. Création de la table `familles`
--   3. Création de la table `membres_famille`
--
-- Dépendances :
--   - Migration 001 (schema initial)
--   - Migration 002 (normalize user_id)
--
-- ⚠️  ROLLBACK disponible en bas de ce fichier
-- ============================================================

USE clubmanager;

-- ============================================================
-- ÉTAPE 1 : MODIFICATION DE LA TABLE `utilisateurs`
-- ============================================================

-- ------------------------------------------------------------
-- 1.1 Rendre email nullable
--     Raison : les enfants mineurs n'ont pas d'adresse email.
--     Un compte enfant est créé et géré par le tuteur légal.
-- ------------------------------------------------------------
ALTER TABLE utilisateurs
    MODIFY COLUMN email VARCHAR(255) NULL
        COMMENT 'NULL autorisé pour les comptes enfants gérés par un tuteur';

-- ------------------------------------------------------------
-- 1.2 Rendre password nullable
--     Raison : un enfant ne se connecte pas lui-même.
--     Son compte est géré exclusivement par le tuteur.
-- ------------------------------------------------------------
ALTER TABLE utilisateurs
    MODIFY COLUMN password VARCHAR(255) NULL
        COMMENT 'NULL pour les comptes gérés (mineurs sans connexion directe)';

-- ------------------------------------------------------------
-- 1.3 Rendre nom_utilisateur nullable
--     Raison : inutile pour un compte enfant géré.
--     Note MySQL : plusieurs NULL dans un index UNIQUE ne
--     génèrent pas de conflit — comportement standard.
-- ------------------------------------------------------------
ALTER TABLE utilisateurs
    MODIFY COLUMN nom_utilisateur VARCHAR(50) NULL
        COMMENT 'NULL pour les comptes enfants gérés par un tuteur';

-- ------------------------------------------------------------
-- 1.4 Mettre à jour la contrainte CHECK sur email
--     Ancienne règle : email doit toujours être valide
--     Nouvelle règle : email est valide OU null (pour enfants)
-- ------------------------------------------------------------
ALTER TABLE utilisateurs
    DROP CHECK chk_utilisateurs_email;

ALTER TABLE utilisateurs
    ADD CONSTRAINT chk_utilisateurs_email
        CHECK (
            email IS NULL
            OR email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'
        );

-- ------------------------------------------------------------
-- 1.5 Ajouter les nouvelles colonnes de gestion familiale
-- ------------------------------------------------------------
ALTER TABLE utilisateurs
    ADD COLUMN tuteur_id INT UNSIGNED NULL
        COMMENT 'Référence au parent/tuteur légal qui gère ce compte (NULL si compte autonome)'
        AFTER status_id,

    ADD COLUMN est_mineur BOOLEAN NOT NULL DEFAULT FALSE
        COMMENT 'TRUE si ce membre est un enfant mineur géré par un tuteur légal'
        AFTER tuteur_id,

    ADD COLUMN peut_se_connecter BOOLEAN NOT NULL DEFAULT TRUE
        COMMENT 'FALSE pour les comptes enfants gérés exclusivement par le tuteur (pas de connexion directe)'
        AFTER est_mineur;

-- ------------------------------------------------------------
-- 1.6 Ajouter la Foreign Key vers le tuteur
--     ON DELETE SET NULL : si le tuteur est supprimé (soft delete),
--     le compte enfant reste intact avec tuteur_id = NULL
-- ------------------------------------------------------------
ALTER TABLE utilisateurs
    ADD CONSTRAINT fk_utilisateurs_tuteur
        FOREIGN KEY (tuteur_id) REFERENCES utilisateurs(id)
        ON DELETE SET NULL ON UPDATE CASCADE;

-- ------------------------------------------------------------
-- 1.7 Ajouter les index pour les nouvelles colonnes
-- ------------------------------------------------------------
ALTER TABLE utilisateurs
    ADD INDEX idx_tuteur_id        (tuteur_id),
    ADD INDEX idx_est_mineur       (est_mineur),
    ADD INDEX idx_peut_se_connecter (peut_se_connecter);

-- ============================================================
-- ÉTAPE 2 : CRÉATION DE LA TABLE `familles`
-- ============================================================
-- Représente un groupe familial. Une famille peut contenir
-- plusieurs membres (parents, enfants, tuteurs, etc.).
-- Le nom est optionnel (peut être déduit du nom de famille).
-- ============================================================

CREATE TABLE familles (
    id         INT UNSIGNED AUTO_INCREMENT,
    nom        VARCHAR(100) NULL
                   COMMENT 'Nom optionnel du groupe familial (ex: Famille Dupont)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    INDEX idx_nom (nom)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Groupes familiaux — relie les membres d''une même famille';

-- ============================================================
-- ÉTAPE 3 : CRÉATION DE LA TABLE `membres_famille`
-- ============================================================
-- Table pivot entre `utilisateurs` et `familles`.
-- Chaque ligne représente l'appartenance d'un utilisateur
-- à un groupe familial, avec son rôle dans ce groupe.
--
-- Contraintes métier :
--   - Un utilisateur ne peut appartenir qu'une seule fois
--     à la même famille (UNIQUE KEY uk_famille_user)
--   - Un utilisateur peut appartenir à plusieurs familles
--     (cas de recomposition familiale)
-- ============================================================

CREATE TABLE membres_famille (
    id               INT UNSIGNED AUTO_INCREMENT,
    famille_id       INT UNSIGNED NOT NULL,
    user_id          INT UNSIGNED NOT NULL,

    role             ENUM('parent', 'tuteur', 'enfant', 'conjoint', 'autre')
                         NOT NULL DEFAULT 'autre'
                         COMMENT 'Rôle du membre dans la famille',

    est_responsable  BOOLEAN NOT NULL DEFAULT FALSE
                         COMMENT 'TRUE si ce membre peut gérer les autres membres (inscrire, payer, etc.)',

    est_tuteur_legal BOOLEAN NOT NULL DEFAULT FALSE
                         COMMENT 'TRUE si ce membre est le tuteur légal des mineurs de la famille',

    date_ajout       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                         COMMENT 'Date d''ajout du membre à la famille',

    PRIMARY KEY (id),

    -- Un utilisateur ne peut être ajouté qu'une seule fois par famille
    UNIQUE KEY uk_famille_user (famille_id, user_id),

    -- Foreign Keys
    CONSTRAINT fk_mf_famille
        FOREIGN KEY (famille_id) REFERENCES familles(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_mf_user
        FOREIGN KEY (user_id) REFERENCES utilisateurs(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    -- Index de performance
    INDEX idx_famille_id       (famille_id),
    INDEX idx_user_id          (user_id),
    INDEX idx_role             (role),
    INDEX idx_est_responsable  (est_responsable),
    INDEX idx_est_tuteur_legal (est_tuteur_legal),

    -- Index composite : rechercher tous les membres responsables d'une famille
    INDEX idx_famille_responsable (famille_id, est_responsable)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Liens entre utilisateurs et familles avec rôles et responsabilités';

-- ============================================================
-- VÉRIFICATION POST-MIGRATION
-- ============================================================
-- Décommentez ces requêtes pour vérifier que la migration
-- s'est correctement appliquée.
-- ============================================================

-- Vérifier les nouvelles colonnes dans utilisateurs
-- SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
-- FROM INFORMATION_SCHEMA.COLUMNS
-- WHERE TABLE_SCHEMA = 'clubmanager'
--   AND TABLE_NAME = 'utilisateurs'
--   AND COLUMN_NAME IN ('email', 'password', 'nom_utilisateur', 'tuteur_id', 'est_mineur', 'peut_se_connecter')
-- ORDER BY ORDINAL_POSITION;

-- Vérifier la contrainte CHECK email mise à jour
-- SELECT CONSTRAINT_NAME, CHECK_CLAUSE
-- FROM INFORMATION_SCHEMA.CHECK_CONSTRAINTS
-- WHERE CONSTRAINT_SCHEMA = 'clubmanager'
--   AND CONSTRAINT_NAME = 'chk_utilisateurs_email';

-- Vérifier les nouvelles tables
-- SHOW TABLES LIKE 'familles';
-- SHOW TABLES LIKE 'membres_famille';

-- Vérifier la structure de membres_famille
-- DESCRIBE membres_famille;

-- ============================================================
-- ROLLBACK (annuler cette migration)
-- ============================================================
-- /!\ Exécuter UNIQUEMENT si la migration doit être annulée.
--     Ces commandes sont destructives et irréversibles
--     si des données ont déjà été insérées.
-- ============================================================

-- -- Étape 3 : Supprimer les nouvelles tables
-- DROP TABLE IF EXISTS membres_famille;
-- DROP TABLE IF EXISTS familles;

-- -- Étape 2 : Retirer les nouvelles colonnes et FK de utilisateurs
-- ALTER TABLE utilisateurs
--     DROP FOREIGN KEY fk_utilisateurs_tuteur,
--     DROP INDEX       idx_tuteur_id,
--     DROP INDEX       idx_est_mineur,
--     DROP INDEX       idx_peut_se_connecter,
--     DROP COLUMN      tuteur_id,
--     DROP COLUMN      est_mineur,
--     DROP COLUMN      peut_se_connecter;

-- -- Étape 1 : Restaurer les contraintes et types originaux
-- ALTER TABLE utilisateurs
--     DROP CHECK chk_utilisateurs_email;

-- ALTER TABLE utilisateurs
--     ADD CONSTRAINT chk_utilisateurs_email
--         CHECK (email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$');

-- ALTER TABLE utilisateurs
--     MODIFY COLUMN email           VARCHAR(255) NOT NULL,
--     MODIFY COLUMN password        VARCHAR(255) NOT NULL COMMENT 'Hash bcrypt ou argon2',
--     MODIFY COLUMN nom_utilisateur VARCHAR(50)  NOT NULL;

-- ============================================================
-- FIN DE LA MIGRATION 003
-- ============================================================
