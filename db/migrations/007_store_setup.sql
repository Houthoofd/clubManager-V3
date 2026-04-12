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
ALTER TABLE categories
    ADD COLUMN IF NOT EXISTS ordre INT UNSIGNED NOT NULL DEFAULT 0
        COMMENT 'Ordre d''affichage des catégories'
        AFTER description;

-- Index pour le tri par ordre
CREATE INDEX IF NOT EXISTS idx_ordre ON categories (ordre);
