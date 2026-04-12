-- ============================================================
-- MIGRATION 007 - STORE SETUP
-- ============================================================
-- Description:
--   - Ajout de la colonne `ordre` sur la table `categories`
--     (manquante dans le schéma initial, requise par le module store)
-- Date: 2025
-- ============================================================

USE clubmanager;

-- ------------------------------------------------------------
-- 1. Ajout de la colonne `ordre` sur `categories`
-- ------------------------------------------------------------

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

-- ------------------------------------------------------------
-- 2. Ajout de l'index sur la colonne `ordre`
-- ------------------------------------------------------------

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

-- ------------------------------------------------------------
-- Migration terminée avec succès
-- ------------------------------------------------------------
