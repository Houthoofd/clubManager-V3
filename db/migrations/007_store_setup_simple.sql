-- ============================================================
-- MIGRATION 007 - STORE SETUP (VERSION SIMPLE)
-- ============================================================
-- Description:
--   - Ajout de la colonne `ordre` sur la table `categories`
-- Instructions:
--   Exécutez ce script dans votre client MySQL (Workbench, phpMyAdmin, etc.)
-- ============================================================

USE clubmanager;

-- Ajouter la colonne ordre (ignorera l'erreur si elle existe déjà)
ALTER TABLE categories
ADD COLUMN ordre INT UNSIGNED NOT NULL DEFAULT 0
COMMENT 'Ordre d''affichage des catégories'
AFTER description;

-- Créer l'index pour le tri
CREATE INDEX idx_ordre ON categories (ordre);

-- Vérification
SELECT 'Migration 007 terminée avec succès !' AS status;
DESCRIBE categories;
