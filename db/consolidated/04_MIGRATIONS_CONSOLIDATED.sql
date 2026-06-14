-- ============================================================================
-- CLUBMANAGER V3 - FICHIER DE MIGRATIONS CONSOLIDÉ
-- ============================================================================
-- Version      : 1.0
-- Date         : 2026-06-13
-- Database     : MySQL 8.0+ / MariaDB 10.6+
-- ============================================================================
--
-- ⚠️  AVERTISSEMENT IMPORTANT :
--
--   NE PAS APPLIQUER CE FICHIER SI VOUS AVEZ UTILISÉ SCHEMA_CONSOLIDATE.sql
--
--   Ce fichier contient TOUTES les migrations historiques dans l'ordre
--   chronologique. Il est destiné UNIQUEMENT aux bases de données qui ont
--   été créées avec le schéma initial (001) et qui n'ont pas encore appliqué
--   toutes les migrations.
--
--   Si votre base a été créée avec SCHEMA_CONSOLIDATE.sql, elle contient
--   déjà toutes ces modifications et appliquer ce fichier causera des erreurs.
--
-- ============================================================================
-- CONTENU :
--   1.  002_normalize_user_id.sql
--   2.  003_family_system.sql
--   3.  003_add_messages_archived.sql
--   4.  004_app_roles.sql
--   5.  005_messaging.sql
--   6.  006_templates.sql
--   7.  007_store_setup.sql
--   8.  008_fix_commandes_user_id.sql
--   9.  009_deprecate_validation_tokens.sql
--   10. 010_add_email_change_support.sql
--   11. V4.5__add_langue_preferee.sql
--   12. V4.6__reference_tables_phase1.sql
--   13. V4.7__reference_tables_phase2.sql
--   14. V4.7.1__hotfix_genres_structure.sql
--   15. V4.7.2__manual_steps.sql
--   16. V4.8__fix_new_modules_user_id.sql
--   17. V4.9__fix_inscriptions_user_id.sql
--   18. V4.10__fix_alertes_utilisateur_id.sql
-- ============================================================================


-- ============================================================================
-- MIGRATION 1 : 002_normalize_user_id.sql
-- ============================================================================
-- Renomme token → token_hash dans email_validation_tokens
-- pour uniformiser avec password_reset_tokens et refresh_tokens
-- ============================================================================

ALTER TABLE email_validation_tokens
  RENAME COLUMN token TO token_hash;


-- ============================================================================
-- MIGRATION 2 : 003_family_system.sql
-- ============================================================================
-- Ajoute le système de groupes familiaux permettant de lier
-- les membres d'une même famille
-- ============================================================================

USE clubmanager;

-- ------------------------------------------------------------
-- Modification de la table `utilisateurs`
-- ------------------------------------------------------------

-- Rendre email nullable (enfants sans email)
ALTER TABLE utilisateurs
    MODIFY COLUMN email VARCHAR(255) NULL
        COMMENT 'NULL autorisé pour les comptes enfants gérés par un tuteur';

-- Rendre password nullable (comptes gérés)
ALTER TABLE utilisateurs
    MODIFY COLUMN password VARCHAR(255) NULL
        COMMENT 'NULL pour les comptes gérés (mineurs sans connexion directe)';

-- Rendre nom_utilisateur nullable
ALTER TABLE utilisateurs
    MODIFY COLUMN nom_utilisateur VARCHAR(50) NULL
        COMMENT 'NULL pour les comptes enfants gérés par un tuteur';

-- Mettre à jour la contrainte CHECK sur email
ALTER TABLE utilisateurs
    DROP CHECK chk_utilisateurs_email;

ALTER TABLE utilisateurs
    ADD CONSTRAINT chk_utilisateurs_email
        CHECK (
            email IS NULL
            OR email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'
        );

-- Ajouter les nouvelles colonnes de gestion familiale
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

-- Ajouter la Foreign Key vers le tuteur
ALTER TABLE utilisateurs
    ADD CONSTRAINT fk_utilisateurs_tuteur
        FOREIGN KEY (tuteur_id) REFERENCES utilisateurs(id)
        ON DELETE SET NULL ON UPDATE CASCADE;

-- Ajouter les index
ALTER TABLE utilisateurs
    ADD INDEX idx_tuteur_id        (tuteur_id),
    ADD INDEX idx_est_mineur       (est_mineur),
    ADD INDEX idx_peut_se_connecter (peut_se_connecter);

-- ------------------------------------------------------------
-- Création de la table `familles`
-- ------------------------------------------------------------

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

-- ------------------------------------------------------------
-- Création de la table `membres_famille`
-- ------------------------------------------------------------

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


-- ============================================================================
-- MIGRATION 3 : 003_add_messages_archived.sql
-- ============================================================================
-- GAP-16 : Archivage des messages
-- ============================================================================

SET @dbname = DATABASE();

-- Ajouter la colonne archived (si absente)
SET @preparedStatement = (
  SELECT IF(
    (
      SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = @dbname
        AND TABLE_NAME   = 'messages'
        AND COLUMN_NAME  = 'archived'
    ) > 0,
    'SELECT ''Colonne archived déjà présente, rien à faire.'' AS info;',
    'ALTER TABLE messages ADD COLUMN archived TINYINT(1) NOT NULL DEFAULT 0;'
  )
);
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Créer l'index idx_messages_archived (si absent)
SET @preparedStatement = (
  SELECT IF(
    (
      SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
      WHERE TABLE_SCHEMA = @dbname
        AND TABLE_NAME   = 'messages'
        AND INDEX_NAME   = 'idx_messages_archived'
    ) > 0,
    'SELECT ''Index idx_messages_archived déjà présent, rien à faire.'' AS info;',
    'CREATE INDEX idx_messages_archived ON messages(destinataire_id, archived);'
  )
);
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


-- ============================================================================
-- MIGRATION 4 : 004_app_roles.sql
-- ============================================================================
-- Système de rôles applicatifs (admin, professor, member)
-- ============================================================================

USE clubmanager;

-- Ajouter la colonne role_app
ALTER TABLE utilisateurs
    ADD COLUMN role_app ENUM('admin', 'member', 'professor')
        NOT NULL DEFAULT 'member'
        COMMENT 'Rôle applicatif pour le contrôle d\'accès (RBAC)'
    AFTER peut_se_connecter;

-- Index pour les recherches par rôle
ALTER TABLE utilisateurs
    ADD INDEX idx_role_app (role_app);


-- ============================================================================
-- MIGRATION 5 : 005_messaging.sql
-- ============================================================================
-- Système de messagerie étendu (broadcasts, envoi par email)
-- ============================================================================

USE clubmanager;

-- Table des envois groupés
CREATE TABLE IF NOT EXISTS broadcasts (
    id               INT UNSIGNED AUTO_INCREMENT,
    expediteur_id    INT UNSIGNED NOT NULL,
    sujet            VARCHAR(200) NULL,
    contenu          TEXT NOT NULL,
    cible            ENUM('tous', 'admin', 'professor', 'member') NOT NULL DEFAULT 'tous'
                         COMMENT 'Groupe ciblé par le broadcast',
    destinataires_count INT UNSIGNED NOT NULL DEFAULT 0,
    envoye_par_email BOOLEAN NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_expediteur_id (expediteur_id),
    INDEX idx_cible (cible),
    INDEX idx_created_at (created_at),

    CONSTRAINT fk_broadcasts_expediteur
        FOREIGN KEY (expediteur_id) REFERENCES utilisateurs(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Envois groupés (broadcasts) aux membres';

-- Ajout colonnes sur messages
ALTER TABLE messages
    ADD COLUMN broadcast_id INT UNSIGNED NULL
        COMMENT 'Lien vers le broadcast groupé (NULL si message individuel)'
    AFTER destinataire_id,
    ADD COLUMN envoye_par_email BOOLEAN NOT NULL DEFAULT FALSE
        COMMENT 'TRUE si une copie email a été envoyée'
    AFTER broadcast_id;

-- Index et FK sur messages
ALTER TABLE messages
    ADD INDEX idx_broadcast_id (broadcast_id),
    ADD CONSTRAINT fk_messages_broadcast
        FOREIGN KEY (broadcast_id) REFERENCES broadcasts(id)
        ON DELETE SET NULL ON UPDATE CASCADE;


-- ============================================================================
-- MIGRATION 6 : 006_templates.sql
-- ============================================================================
-- Templates de messages personnalisés
-- ============================================================================

USE clubmanager;

-- Ajouter colonne actif manquante sur les types
ALTER TABLE types_messages_personnalises
    ADD COLUMN actif BOOLEAN NOT NULL DEFAULT TRUE
        COMMENT 'Type de template actif ou non'
    AFTER description,
    ADD INDEX idx_actif (actif);

-- Données de référence : types par défaut
INSERT INTO types_messages_personnalises (nom, description, actif) VALUES
  ('Bienvenue',          'Message de bienvenue pour les nouveaux membres', TRUE),
  ('Cours annulé',       'Annulation ou modification d''un cours', TRUE),
  ('Rappel paiement',    'Rappel pour un paiement ou abonnement', TRUE),
  ('Promotion ceinture', 'Félicitations pour une promotion de grade', TRUE),
  ('Annonce générale',   'Communication générale aux membres', TRUE)
ON DUPLICATE KEY UPDATE nom = nom;


-- ============================================================================
-- MIGRATION 7 : 007_store_setup.sql
-- ============================================================================
-- Ajout de la colonne `ordre` sur la table `categories`
-- (manquante dans le schéma initial, requise par le module store)
-- ============================================================================

USE clubmanager;

-- Procédure temporaire pour ajouter la colonne si elle n'existe pas
DELIMITER $$

CREATE PROCEDURE AddOrdreColumnIfNotExists()
BEGIN
    -- Vérifier si la colonne existe déjà
    IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = 'clubmanager'
        AND TABLE_NAME = 'categories'
        AND COLUMN_NAME = 'ordre'
    ) THEN
        -- Ajouter la colonne
        ALTER TABLE categories
        ADD COLUMN ordre INT UNSIGNED NOT NULL DEFAULT 0
        COMMENT 'Ordre d''affichage des catégories'
        AFTER description;
    END IF;
END$$

DELIMITER ;

-- Exécuter la procédure
CALL AddOrdreColumnIfNotExists();

-- Supprimer la procédure
DROP PROCEDURE AddOrdreColumnIfNotExists;

-- Procédure temporaire pour ajouter l'index si il n'existe pas
DELIMITER $$

CREATE PROCEDURE AddOrdreIndexIfNotExists()
BEGIN
    -- Vérifier si l'index existe déjà
    IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.STATISTICS
        WHERE TABLE_SCHEMA = 'clubmanager'
        AND TABLE_NAME = 'categories'
        AND INDEX_NAME = 'idx_ordre'
    ) THEN
        -- Créer l'index
        CREATE INDEX idx_ordre ON categories (ordre);
    END IF;
END$$

DELIMITER ;

-- Exécuter la procédure
CALL AddOrdreIndexIfNotExists();

-- Supprimer la procédure
DROP PROCEDURE AddOrdreIndexIfNotExists;


-- ============================================================================
-- MIGRATION 8 : 008_fix_commandes_user_id.sql
-- ============================================================================
-- Renomme utilisateur_id en user_id dans commandes et mouvements_stock
-- ============================================================================

USE clubmanager;

-- ------------------------------------------------------------
-- 1. Renommer utilisateur_id en user_id dans commandes
-- ------------------------------------------------------------

DELIMITER $$

CREATE PROCEDURE FixCommandesUserId()
BEGIN
    DECLARE col_exists INT;
    DECLARE fk_exists INT;

    -- Vérifier si la colonne utilisateur_id existe
    SELECT COUNT(*) INTO col_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'clubmanager'
    AND TABLE_NAME = 'commandes'
    AND COLUMN_NAME = 'utilisateur_id';

    IF col_exists > 0 THEN
        -- Vérifier si une FK existe sur utilisateur_id
        SELECT COUNT(*) INTO fk_exists
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = 'clubmanager'
        AND TABLE_NAME = 'commandes'
        AND COLUMN_NAME = 'utilisateur_id'
        AND REFERENCED_TABLE_NAME IS NOT NULL;

        -- Supprimer la FK si elle existe
        IF fk_exists > 0 THEN
            SET @fk_name = (
                SELECT CONSTRAINT_NAME
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                WHERE TABLE_SCHEMA = 'clubmanager'
                AND TABLE_NAME = 'commandes'
                AND COLUMN_NAME = 'utilisateur_id'
                AND REFERENCED_TABLE_NAME IS NOT NULL
                LIMIT 1
            );
            SET @sql = CONCAT('ALTER TABLE commandes DROP FOREIGN KEY ', @fk_name);
            PREPARE stmt FROM @sql;
            EXECUTE stmt;
            DEALLOCATE PREPARE stmt;
        END IF;

        -- Renommer la colonne
        ALTER TABLE commandes CHANGE COLUMN utilisateur_id user_id INT UNSIGNED NOT NULL;

        -- Recréer la FK
        ALTER TABLE commandes
        ADD CONSTRAINT fk_commandes_user
        FOREIGN KEY (user_id) REFERENCES utilisateurs(id)
        ON DELETE CASCADE;
    END IF;
END$$

DELIMITER ;

-- Exécuter la procédure
CALL FixCommandesUserId();

-- Supprimer la procédure
DROP PROCEDURE FixCommandesUserId;

-- ------------------------------------------------------------
-- 2. Renommer utilisateur_id en user_id dans mouvements_stock
-- ------------------------------------------------------------

DELIMITER $$

CREATE PROCEDURE FixMouvementsStockUserId()
BEGIN
    DECLARE col_exists INT;
    DECLARE fk_exists INT;

    -- Vérifier si la colonne utilisateur_id existe
    SELECT COUNT(*) INTO col_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'clubmanager'
    AND TABLE_NAME = 'mouvements_stock'
    AND COLUMN_NAME = 'utilisateur_id';

    IF col_exists > 0 THEN
        -- Vérifier si une FK existe sur utilisateur_id
        SELECT COUNT(*) INTO fk_exists
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = 'clubmanager'
        AND TABLE_NAME = 'mouvements_stock'
        AND COLUMN_NAME = 'utilisateur_id'
        AND REFERENCED_TABLE_NAME IS NOT NULL;

        -- Supprimer la FK si elle existe
        IF fk_exists > 0 THEN
            SET @fk_name = (
                SELECT CONSTRAINT_NAME
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                WHERE TABLE_SCHEMA = 'clubmanager'
                AND TABLE_NAME = 'mouvements_stock'
                AND COLUMN_NAME = 'utilisateur_id'
                AND REFERENCED_TABLE_NAME IS NOT NULL
                LIMIT 1
            );
            SET @sql = CONCAT('ALTER TABLE mouvements_stock DROP FOREIGN KEY ', @fk_name);
            PREPARE stmt FROM @sql;
            EXECUTE stmt;
            DEALLOCATE PREPARE stmt;
        END IF;

        -- Renommer la colonne
        ALTER TABLE mouvements_stock CHANGE COLUMN utilisateur_id user_id INT UNSIGNED NULL;

        -- Recréer la FK
        ALTER TABLE mouvements_stock
        ADD CONSTRAINT fk_mouvements_stock_user
        FOREIGN KEY (user_id) REFERENCES utilisateurs(id)
        ON DELETE SET NULL;
    END IF;
END$$

DELIMITER ;

-- Exécuter la procédure
CALL FixMouvementsStockUserId();

-- Supprimer la procédure
DROP PROCEDURE FixMouvementsStockUserId;


-- ============================================================================
-- MIGRATION 9 : 009_deprecate_validation_tokens.sql
-- ============================================================================
-- GAP-19: The validation_tokens table is unused. Specific token tables
-- (email_validation_tokens, password_reset_tokens) replace it.
-- ============================================================================

DROP TABLE IF EXISTS validation_tokens;


-- ============================================================================
-- MIGRATION 10 : 010_add_email_change_support.sql
-- ============================================================================
-- Support du changement d'email (GAP-15)
-- Ajoute la colonne `email` dans email_validation_tokens
-- ============================================================================

-- Ajout idempotent (MySQL 8+)
SET @col_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME   = 'email_validation_tokens'
    AND COLUMN_NAME  = 'email'
);

SET @sql = IF(
  @col_exists = 0,
  'ALTER TABLE email_validation_tokens ADD COLUMN email VARCHAR(255) NULL COMMENT ''Nouvel email cible (change_email uniquement)'' AFTER token_type',
  'SELECT ''column email already exists — skipping'' AS info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


-- ============================================================================
-- MIGRATION 11 : V4.5__add_langue_preferee.sql
-- ============================================================================
-- Ajout du support multilingue
-- ============================================================================

SET @dbname = DATABASE();
SET @tablename = 'utilisateurs';
SET @columnname = 'langue_preferee';

SET @preparedStatement = (
  SELECT IF(
    (
      SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = @dbname
        AND TABLE_NAME   = @tablename
        AND COLUMN_NAME  = @columnname
    ) > 0,
    'SELECT ''colonne langue_preferee déjà présente, rien à faire.'' AS info;',
    CONCAT(
      'ALTER TABLE `', @tablename, '` ',
      'ADD COLUMN `', @columnname, '` VARCHAR(5) NOT NULL DEFAULT ''fr'' ',
      'COMMENT ''Langue préférée utilisateur (ISO 639-1: fr, en, nl, etc.)'' ',
      'AFTER role_app;'
    )
  )
);
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Ajouter le constraint de validation (si il n'existe pas)
SET @constraintname = 'chk_langue_preferee';

SET @preparedStatement = (
  SELECT IF(
    (
      SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
      WHERE TABLE_SCHEMA     = @dbname
        AND TABLE_NAME       = @tablename
        AND CONSTRAINT_NAME  = @constraintname
    ) > 0,
    'SELECT ''constraint chk_langue_preferee déjà présent, rien à faire.'' AS info;',
    CONCAT(
      'ALTER TABLE `', @tablename, '` ',
      'ADD CONSTRAINT `', @constraintname, '` ',
      'CHECK (langue_preferee IN (''fr'', ''en'', ''nl'', ''de'', ''es''));'
    )
  )
);
PREPARE addConstraintIfNotExists FROM @preparedStatement;
EXECUTE addConstraintIfNotExists;
DEALLOCATE PREPARE addConstraintIfNotExists;

-- Créer l'index (si il n'existe pas)
SET @indexname = 'idx_langue_preferee';

SET @preparedStatement = (
  SELECT IF(
    (
      SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
      WHERE TABLE_SCHEMA = @dbname
        AND TABLE_NAME   = @tablename
        AND INDEX_NAME   = @indexname
    ) > 0,
    'SELECT ''index idx_langue_preferee déjà présent, rien à faire.'' AS info;',
    CONCAT(
      'CREATE INDEX `', @indexname, '` ON `', @tablename, '`(langue_preferee);'
    )
  )
);
PREPARE createIndexIfNotExists FROM @preparedStatement;
EXECUTE createIndexIfNotExists;
DEALLOCATE PREPARE createIndexIfNotExists;


-- ============================================================================
-- MIGRATION 12 : V4.6__reference_tables_phase1.sql
-- ============================================================================
-- TABLES DE RÉFÉRENCE - PHASE 1 (CRITIQUE)
-- Inclut: methodes_paiement, statuts_commande, transitions_statut_commande,
--         types_cours
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. MÉTHODES DE PAIEMENT
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS methodes_paiement (
  id                INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  code              VARCHAR(50)     NOT NULL,
  nom               VARCHAR(100)    NOT NULL,
  nom_en            VARCHAR(100)    DEFAULT NULL,
  description       TEXT            DEFAULT NULL,
  description_en    TEXT            DEFAULT NULL,
  icone             VARCHAR(50)     DEFAULT NULL   COMMENT 'Nom du composant React icône',
  couleur           VARCHAR(20)     NOT NULL DEFAULT 'neutral' COMMENT 'Variant badge: success, info, purple, warning, danger, neutral',
  ordre             INT             NOT NULL DEFAULT 99,
  actif             TINYINT(1)      NOT NULL DEFAULT 1,
  visible_frontend  TINYINT(1)      NOT NULL DEFAULT 1 COMMENT 'Affiché dans les sélecteurs côté utilisateur',
  visible_admin     TINYINT(1)      NOT NULL DEFAULT 1 COMMENT 'Affiché dans les interfaces admin',
  created_at        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_methodes_paiement_code (code),
  KEY idx_methodes_paiement_actif  (actif),
  KEY idx_methodes_paiement_ordre  (ordre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Table de référence : Méthodes de paiement disponibles';

INSERT IGNORE INTO methodes_paiement
  (code, nom, nom_en, description, description_en, icone, couleur, ordre, actif, visible_frontend, visible_admin)
VALUES
  ('especes',  'Espèces',          'Cash',          'Paiement en argent liquide',       'Cash payment',                  'BanknotesIcon',       'success', 1, 1, 1, 1),
  ('virement', 'Virement bancaire','Bank transfer',  'Virement SEPA ou autre',           'SEPA or other bank transfer',   'BuildingLibraryIcon', 'purple',  2, 1, 1, 1),
  ('stripe',   'Carte bancaire',   'Credit card',    'Paiement en ligne via Stripe',     'Online payment via Stripe',     'CreditCardIcon',      'info',    3, 1, 1, 1),
  ('autre',    'Autre',            'Other',          'Autre mode de paiement',           'Other payment method',          'TagIcon',             'neutral', 4, 1, 1, 1);

-- ----------------------------------------------------------------------------
-- 2. STATUTS DE COMMANDE
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS statuts_commande (
  id             INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  code           VARCHAR(50)   NOT NULL,
  nom            VARCHAR(100)  NOT NULL,
  nom_en         VARCHAR(100)  DEFAULT NULL,
  description    TEXT          DEFAULT NULL,
  description_en TEXT          DEFAULT NULL,
  couleur        VARCHAR(20)   NOT NULL DEFAULT 'neutral' COMMENT 'Variant badge: success, warning, danger, info, neutral, purple',
  ordre          INT           NOT NULL DEFAULT 99,
  est_final      TINYINT(1)    NOT NULL DEFAULT 0 COMMENT 'Aucune transition possible depuis cet état',
  peut_modifier  TINYINT(1)    NOT NULL DEFAULT 1 COMMENT 'Modification des articles autorisée',
  peut_annuler   TINYINT(1)    NOT NULL DEFAULT 1 COMMENT 'Annulation autorisée',
  compte_stock   TINYINT(1)    NOT NULL DEFAULT 0 COMMENT 'Décrémente le stock des articles',
  actif          TINYINT(1)    NOT NULL DEFAULT 1,
  created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_statuts_commande_code  (code),
  KEY idx_statuts_commande_actif       (actif),
  KEY idx_statuts_commande_est_final   (est_final),
  KEY idx_statuts_commande_ordre       (ordre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Table de référence : Statuts du cycle de vie d une commande';

INSERT IGNORE INTO statuts_commande
  (code, nom, nom_en, description, description_en, couleur, ordre, est_final, peut_modifier, peut_annuler, compte_stock)
VALUES
  ('en_attente', 'En attente', 'Pending',   'Commande en attente de paiement',       'Order pending payment',         'warning', 1, 0, 1, 1, 0),
  ('en_cours',   'En cours',   'In progress','Commande en cours de préparation',     'Order being prepared',          'info',    2, 0, 1, 1, 0),
  ('payee',      'Payée',      'Paid',       'Commande payée, prête à être expédiée','Order paid, ready to ship',     'info',    3, 0, 1, 1, 0),
  ('expediee',   'Expédiée',   'Shipped',    'Commande expédiée',                    'Order shipped',                 'purple',  4, 0, 0, 1, 1),
  ('prete',      'Prête',      'Ready',      'Commande prête pour retrait',          'Order ready for pickup',        'purple',  5, 0, 0, 1, 1),
  ('livree',     'Livrée',     'Delivered',  'Commande livrée au client',            'Order delivered to customer',   'success', 6, 1, 0, 0, 1),
  ('annulee',    'Annulée',    'Cancelled',  'Commande annulée',                     'Order cancelled',               'danger',  7, 1, 0, 0, 0);

-- ----------------------------------------------------------------------------
-- 3. TRANSITIONS DE STATUT (WORKFLOW COMMANDES)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS transitions_statut_commande (
  id                INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  statut_depart_id  INT UNSIGNED  NOT NULL,
  statut_arrivee_id INT UNSIGNED  NOT NULL,
  role_requis       VARCHAR(50)   DEFAULT NULL COMMENT 'NULL = tous les rôles, sinon: admin, professor...',
  description       TEXT          DEFAULT NULL,
  description_en    TEXT          DEFAULT NULL,
  ordre_priorite    INT           NOT NULL DEFAULT 100,
  actif             TINYINT(1)    NOT NULL DEFAULT 1,
  created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_transition (statut_depart_id, statut_arrivee_id),
  KEY idx_transitions_depart  (statut_depart_id),
  KEY idx_transitions_arrivee (statut_arrivee_id),
  KEY idx_transitions_actif   (actif),
  CONSTRAINT fk_transition_depart  FOREIGN KEY (statut_depart_id)  REFERENCES statuts_commande(id) ON DELETE CASCADE,
  CONSTRAINT fk_transition_arrivee FOREIGN KEY (statut_arrivee_id) REFERENCES statuts_commande(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Transitions autorisées entre statuts de commande (workflow)';

INSERT IGNORE INTO transitions_statut_commande
  (statut_depart_id, statut_arrivee_id, role_requis, description, description_en, ordre_priorite)
VALUES
  -- Depuis en_attente
  ((SELECT id FROM statuts_commande WHERE code = 'en_attente'),
   (SELECT id FROM statuts_commande WHERE code = 'payee'),
   NULL, 'Paiement reçu', 'Payment received', 1),

  ((SELECT id FROM statuts_commande WHERE code = 'en_attente'),
   (SELECT id FROM statuts_commande WHERE code = 'annulee'),
   NULL, 'Annuler la commande', 'Cancel order', 99),

  -- Depuis en_cours
  ((SELECT id FROM statuts_commande WHERE code = 'en_cours'),
   (SELECT id FROM statuts_commande WHERE code = 'payee'),
   'admin', 'Marquer comme payée', 'Mark as paid', 1),

  ((SELECT id FROM statuts_commande WHERE code = 'en_cours'),
   (SELECT id FROM statuts_commande WHERE code = 'annulee'),
   'admin', 'Annuler la commande', 'Cancel order', 99),

  -- Depuis payee
  ((SELECT id FROM statuts_commande WHERE code = 'payee'),
   (SELECT id FROM statuts_commande WHERE code = 'expediee'),
   'admin', 'Expédier la commande', 'Ship order', 1),

  ((SELECT id FROM statuts_commande WHERE code = 'payee'),
   (SELECT id FROM statuts_commande WHERE code = 'prete'),
   'admin', 'Marquer comme prête', 'Mark as ready', 2),

  ((SELECT id FROM statuts_commande WHERE code = 'payee'),
   (SELECT id FROM statuts_commande WHERE code = 'annulee'),
   'admin', 'Annuler la commande', 'Cancel order', 99),

  -- Depuis expediee
  ((SELECT id FROM statuts_commande WHERE code = 'expediee'),
   (SELECT id FROM statuts_commande WHERE code = 'livree'),
   'admin', 'Confirmer la livraison', 'Confirm delivery', 1),

  -- Depuis prete
  ((SELECT id FROM statuts_commande WHERE code = 'prete'),
   (SELECT id FROM statuts_commande WHERE code = 'livree'),
   'admin', 'Confirmer le retrait', 'Confirm pickup', 1);

-- ----------------------------------------------------------------------------
-- 4. TYPES DE COURS
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS types_cours (
  id                     INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  code                   VARCHAR(50)   NOT NULL,
  nom                    VARCHAR(100)  NOT NULL,
  nom_en                 VARCHAR(100)  DEFAULT NULL,
  description            TEXT          DEFAULT NULL,
  description_en         TEXT          DEFAULT NULL,
  couleur                VARCHAR(20)   NOT NULL DEFAULT 'blue',
  duree_defaut_minutes   INT           NOT NULL DEFAULT 60,
  capacite_max_defaut    INT           DEFAULT NULL,
  niveau                 VARCHAR(50)   DEFAULT NULL COMMENT 'debutant, intermediaire, avance, tous',
  icone                  VARCHAR(50)   DEFAULT NULL,
  ordre                  INT           NOT NULL DEFAULT 99,
  actif                  TINYINT(1)    NOT NULL DEFAULT 1,
  created_at             DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at             DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_types_cours_code (code),
  KEY idx_types_cours_actif  (actif),
  KEY idx_types_cours_ordre  (ordre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Table de référence : Types de cours disponibles dans le club';

INSERT IGNORE INTO types_cours
  (code, nom, nom_en, description, description_en, couleur, duree_defaut_minutes, ordre, actif)
VALUES
  ('karate',    'Karaté',    'Karate',    'Art martial japonais traditionnel',  'Traditional Japanese martial art',  'blue',   60, 1,  1),
  ('judo',      'Judo',      'Judo',      'Art martial et sport de combat',     'Martial art and combat sport',      'green',  60, 2,  1),
  ('taekwondo', 'Taekwondo', 'Taekwondo', 'Art martial coréen',                 'Korean martial art',                'red',    60, 3,  1),
  ('aikido',    'Aïkido',    'Aikido',    'Art martial japonais défensif',      'Japanese defensive martial art',    'purple', 60, 4,  1),
  ('kendo',     'Kendo',     'Kendo',     'Escrime japonaise',                  'Japanese fencing',                  'orange', 60, 5,  1),
  ('autre',     'Autre',     'Other',     'Autre type de cours',                'Other course type',                 'gray',   60, 99, 1);


-- ============================================================================
-- MIGRATION 13 : V4.7__reference_tables_phase2.sql
-- ============================================================================
-- TABLES DE RÉFÉRENCE - PHASE 2
-- Inclut: statuts_paiement, statuts_echeance, roles_utilisateur,
--         roles_familial, genres
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. STATUTS DE PAIEMENT
-- ----------------------------------------------------------------------------

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

-- ----------------------------------------------------------------------------
-- 2. STATUTS D'ÉCHÉANCE
-- ----------------------------------------------------------------------------

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

-- ----------------------------------------------------------------------------
-- 3. RÔLES UTILISATEUR
-- ----------------------------------------------------------------------------

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

-- ----------------------------------------------------------------------------
-- 4. RÔLES FAMILIAUX
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

-- ----------------------------------------------------------------------------
-- 5. GENRES
-- ----------------------------------------------------------------------------

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
-- MIGRATION 14 : V4.7.1__hotfix_genres_structure.sql
-- ============================================================================
-- HOTFIX — Correction structure tables Phase 2
-- (La table genres existe déjà, ALTER au lieu de DROP)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- PARTIE 1 : TABLE genres — ALTER (pas de DROP à cause de la FK utilisateurs)
-- ----------------------------------------------------------------------------

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

-- ----------------------------------------------------------------------------
-- PARTIE 2 : Autres tables Phase 2 — DROP + CREATE
-- ----------------------------------------------------------------------------

SET FOREIGN_KEY_CHECKS = 0;

-- statuts_paiement
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

-- statuts_echeance
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

-- roles_utilisateur
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

-- roles_familial
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

SET FOREIGN_KEY_CHECKS = 1;


-- ============================================================================
-- MIGRATION 15 : V4.7.2__manual_steps.sql
-- ============================================================================
-- ÉTAPES MANUELLES — Version bloc par bloc
-- (inclus pour référence, déjà appliqué dans V4.7.1)
-- ============================================================================

-- Cette migration était destinée à être appliquée manuellement bloc par bloc
-- Son contenu a été intégré dans V4.7.1 qui est plus robuste et automatisé
-- Aucune action supplémentaire requise


-- ============================================================================
-- MIGRATION 16 : V4.8__fix_new_modules_user_id.sql
-- ============================================================================
-- FIX NEW MODULES USER_ID COLUMNS
-- Renomme utilisateur_id en user_id dans notifications, reservations,
-- groupes_utilisateurs
-- ============================================================================

USE clubmanager;

-- ------------------------------------------------------------
-- 1. notifications — utilisateur_id → user_id
-- ------------------------------------------------------------

DELIMITER $$

CREATE PROCEDURE V48_FixNotificationsUserId()
BEGIN
    DECLARE col_exists INT;
    DECLARE fk_exists  INT;
    DECLARE fk_name    VARCHAR(200);

    SELECT COUNT(*) INTO col_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = 'notifications'
      AND COLUMN_NAME  = 'utilisateur_id';

    IF col_exists > 0 THEN

        -- Supprimer la FK existante si présente
        SELECT COUNT(*) INTO fk_exists
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME   = 'notifications'
          AND COLUMN_NAME  = 'utilisateur_id'
          AND REFERENCED_TABLE_NAME IS NOT NULL;

        IF fk_exists > 0 THEN
            SET fk_name = (
                SELECT CONSTRAINT_NAME
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME   = 'notifications'
                  AND COLUMN_NAME  = 'utilisateur_id'
                  AND REFERENCED_TABLE_NAME IS NOT NULL
                LIMIT 1
            );
            SET @sql = CONCAT('ALTER TABLE notifications DROP FOREIGN KEY `', fk_name, '`');
            PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
        END IF;

        -- Renommer la colonne
        ALTER TABLE notifications
            CHANGE COLUMN utilisateur_id user_id INT UNSIGNED NOT NULL;

        -- Recréer la FK
        ALTER TABLE notifications
            ADD CONSTRAINT fk_notifications_utilisateur
            FOREIGN KEY (user_id) REFERENCES utilisateurs(id)
            ON DELETE CASCADE ON UPDATE CASCADE;

        SELECT 'notifications.utilisateur_id → user_id : OK' AS status;
    ELSE
        SELECT 'notifications : user_id déjà présent, rien à faire' AS status;
    END IF;
END$$

DELIMITER ;

CALL V48_FixNotificationsUserId();
DROP PROCEDURE V48_FixNotificationsUserId;

-- ------------------------------------------------------------
-- 2. reservations — utilisateur_id → user_id
-- ------------------------------------------------------------

DELIMITER $$

CREATE PROCEDURE V48_FixReservationsUserId()
BEGIN
    DECLARE col_exists INT;
    DECLARE fk_exists  INT;
    DECLARE fk_name    VARCHAR(200);

    SELECT COUNT(*) INTO col_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = 'reservations'
      AND COLUMN_NAME  = 'utilisateur_id';

    IF col_exists > 0 THEN

        SELECT COUNT(*) INTO fk_exists
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME   = 'reservations'
          AND COLUMN_NAME  = 'utilisateur_id'
          AND REFERENCED_TABLE_NAME IS NOT NULL;

        IF fk_exists > 0 THEN
            SET fk_name = (
                SELECT CONSTRAINT_NAME
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME   = 'reservations'
                  AND COLUMN_NAME  = 'utilisateur_id'
                  AND REFERENCED_TABLE_NAME IS NOT NULL
                LIMIT 1
            );
            SET @sql = CONCAT('ALTER TABLE reservations DROP FOREIGN KEY `', fk_name, '`');
            PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
        END IF;

        ALTER TABLE reservations
            CHANGE COLUMN utilisateur_id user_id INT UNSIGNED NOT NULL;

        ALTER TABLE reservations
            ADD CONSTRAINT fk_reservations_utilisateur
            FOREIGN KEY (user_id) REFERENCES utilisateurs(id)
            ON DELETE CASCADE ON UPDATE CASCADE;

        SELECT 'reservations.utilisateur_id → user_id : OK' AS status;
    ELSE
        SELECT 'reservations : user_id déjà présent, rien à faire' AS status;
    END IF;
END$$

DELIMITER ;

CALL V48_FixReservationsUserId();
DROP PROCEDURE V48_FixReservationsUserId;

-- ------------------------------------------------------------
-- 3. groupes_utilisateurs — utilisateur_id → user_id
-- ------------------------------------------------------------

DELIMITER $$

CREATE PROCEDURE V48_FixGroupesUtilisateursUserId()
BEGIN
    DECLARE col_exists INT;
    DECLARE fk_exists  INT;
    DECLARE fk_name    VARCHAR(200);

    SELECT COUNT(*) INTO col_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = 'groupes_utilisateurs'
      AND COLUMN_NAME  = 'utilisateur_id';

    IF col_exists > 0 THEN

        SELECT COUNT(*) INTO fk_exists
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME   = 'groupes_utilisateurs'
          AND COLUMN_NAME  = 'utilisateur_id'
          AND REFERENCED_TABLE_NAME IS NOT NULL;

        IF fk_exists > 0 THEN
            SET fk_name = (
                SELECT CONSTRAINT_NAME
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME   = 'groupes_utilisateurs'
                  AND COLUMN_NAME  = 'utilisateur_id'
                  AND REFERENCED_TABLE_NAME IS NOT NULL
                LIMIT 1
            );
            SET @sql = CONCAT('ALTER TABLE groupes_utilisateurs DROP FOREIGN KEY `', fk_name, '`');
            PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
        END IF;

        ALTER TABLE groupes_utilisateurs
            CHANGE COLUMN utilisateur_id user_id INT UNSIGNED NOT NULL;

        ALTER TABLE groupes_utilisateurs
            ADD CONSTRAINT fk_groupes_util_user
            FOREIGN KEY (user_id) REFERENCES utilisateurs(id)
            ON DELETE CASCADE ON UPDATE CASCADE;

        SELECT 'groupes_utilisateurs.utilisateur_id → user_id : OK' AS status;
    ELSE
        SELECT 'groupes_utilisateurs : user_id déjà présent, rien à faire' AS status;
    END IF;
END$$

DELIMITER ;

CALL V48_FixGroupesUtilisateursUserId();
DROP PROCEDURE V48_FixGroupesUtilisateursUserId;


-- ============================================================================
-- MIGRATION 17 : V4.9__fix_inscriptions_user_id.sql
-- ============================================================================
-- FIX INSCRIPTIONS USER_ID COLUMN
-- Renomme utilisateur_id en user_id dans la table inscriptions
-- ============================================================================

USE clubmanager;

DELIMITER $$

CREATE PROCEDURE V49_FixInscriptionsUserId()
BEGIN
    DECLARE col_exists INT;
    DECLARE fk_exists  INT;
    DECLARE fk_name    VARCHAR(200);

    -- Vérifier si la colonne utilisateur_id existe encore
    SELECT COUNT(*) INTO col_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = 'inscriptions'
      AND COLUMN_NAME  = 'utilisateur_id';

    IF col_exists > 0 THEN

        -- Chercher et supprimer la FK si elle référence utilisateur_id
        SELECT COUNT(*) INTO fk_exists
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA        = DATABASE()
          AND TABLE_NAME          = 'inscriptions'
          AND COLUMN_NAME         = 'utilisateur_id'
          AND REFERENCED_TABLE_NAME IS NOT NULL;

        IF fk_exists > 0 THEN
            SET fk_name = (
                SELECT CONSTRAINT_NAME
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                WHERE TABLE_SCHEMA        = DATABASE()
                  AND TABLE_NAME          = 'inscriptions'
                  AND COLUMN_NAME         = 'utilisateur_id'
                  AND REFERENCED_TABLE_NAME IS NOT NULL
                LIMIT 1
            );
            SET @sql = CONCAT('ALTER TABLE inscriptions DROP FOREIGN KEY `', fk_name, '`');
            PREPARE stmt FROM @sql;
            EXECUTE stmt;
            DEALLOCATE PREPARE stmt;
        END IF;

        -- Renommer la colonne (les index et UNIQUE KEY suivent automatiquement)
        ALTER TABLE inscriptions
            CHANGE COLUMN utilisateur_id user_id INT UNSIGNED NOT NULL;

        -- Recréer la FK vers utilisateurs(id)
        ALTER TABLE inscriptions
            ADD CONSTRAINT fk_inscriptions_utilisateur
            FOREIGN KEY (user_id) REFERENCES utilisateurs(id)
            ON DELETE CASCADE ON UPDATE CASCADE;

        SELECT 'inscriptions.utilisateur_id → user_id : OK' AS status;

    ELSE
        SELECT 'inscriptions : user_id déjà présent, rien à faire' AS status;
    END IF;
END$$

DELIMITER ;

CALL V49_FixInscriptionsUserId();
DROP PROCEDURE V49_FixInscriptionsUserId;


-- ============================================================================
-- MIGRATION 18 : V4.10__fix_alertes_utilisateur_id.sql
-- ============================================================================
-- FIX alertes_utilisateurs COLUMN NAME
-- Renomme utilisateur_id en user_id dans alertes_utilisateurs
-- ============================================================================

USE clubmanager;

DELIMITER $$

CREATE PROCEDURE V410_FixAlertesUtilisateurId()
BEGIN
    DECLARE col_exists INT;
    DECLARE fk_exists  INT;
    DECLARE fk_name    VARCHAR(200);

    SELECT COUNT(*) INTO col_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = 'alertes_utilisateurs'
      AND COLUMN_NAME  = 'utilisateur_id';

    IF col_exists > 0 THEN

        -- Supprimer la FK existante si présente
        SELECT COUNT(*) INTO fk_exists
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME   = 'alertes_utilisateurs'
          AND COLUMN_NAME  = 'utilisateur_id'
          AND REFERENCED_TABLE_NAME IS NOT NULL;

        IF fk_exists > 0 THEN
            SET fk_name = (
                SELECT CONSTRAINT_NAME
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME   = 'alertes_utilisateurs'
                  AND COLUMN_NAME  = 'utilisateur_id'
                  AND REFERENCED_TABLE_NAME IS NOT NULL
                LIMIT 1
            );
            SET @sql = CONCAT('ALTER TABLE alertes_utilisateurs DROP FOREIGN KEY `', fk_name, '`');
            PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
        END IF;

        -- Renommer la colonne
        ALTER TABLE alertes_utilisateurs
            CHANGE COLUMN utilisateur_id user_id INT UNSIGNED NOT NULL;

        -- Recréer la FK
        ALTER TABLE alertes_utilisateurs
            ADD CONSTRAINT fk_alertes_util_user
            FOREIGN KEY (user_id) REFERENCES utilisateurs(id)
            ON DELETE CASCADE ON UPDATE CASCADE;

        SELECT 'alertes_utilisateurs.utilisateur_id → user_id : OK' AS status;
    ELSE
        SELECT 'alertes_utilisateurs : user_id déjà présent, rien à faire' AS status;
    END IF;
END$$

DELIMITER ;

CALL V410_FixAlertesUtilisateurId();
DROP PROCEDURE V410_FixAlertesUtilisateurId;


-- ============================================================================
-- FIN DU FICHIER DE MIGRATIONS CONSOLIDÉ
-- ============================================================================
-- Toutes les migrations historiques ont été appliquées
-- La base de données est maintenant à jour
-- ============================================================================
