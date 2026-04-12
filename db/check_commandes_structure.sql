-- ============================================================
-- Script de vérification de la structure de la table commandes
-- ============================================================
-- Ce script vérifie si la colonne user_id existe dans la table commandes
-- et affiche la structure complète de la table
-- ============================================================

USE clubmanager;

-- Afficher la structure de la table commandes
DESCRIBE commandes;

-- Vérifier si la colonne user_id existe
SELECT
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_KEY,
    COLUMN_DEFAULT,
    EXTRA
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'clubmanager'
AND TABLE_NAME = 'commandes'
ORDER BY ORDINAL_POSITION;

-- Vérifier les colonnes liées à l'utilisateur
SELECT COLUMN_NAME
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'clubmanager'
AND TABLE_NAME = 'commandes'
AND COLUMN_NAME LIKE '%user%' OR COLUMN_NAME LIKE '%utilisateur%';
