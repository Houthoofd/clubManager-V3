-- ============================================================
-- MIGRATION 008 - FIX COMMANDES USER_ID
-- ============================================================
-- Description:
--   - Renomme utilisateur_id en user_id dans commandes (si nécessaire)
--   - Renomme utilisateur_id en user_id dans mouvements_stock (si nécessaire)
--   - Met à jour les foreign keys associées
-- Date: 2025
-- ============================================================

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

-- ------------------------------------------------------------
-- Vérification finale
-- ------------------------------------------------------------

SELECT 'Migration 008 terminée avec succès !' AS status;

-- Vérifier la structure de commandes
SELECT 'Structure de la table commandes :' AS info;
DESCRIBE commandes;

-- Vérifier la structure de mouvements_stock
SELECT 'Structure de la table mouvements_stock :' AS info;
DESCRIBE mouvements_stock;
