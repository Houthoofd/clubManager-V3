-- ============================================================
-- MIGRATION 004 : Système de rôles applicatifs
-- ============================================================
-- Version: 1.0
-- Date: 2025
-- Description: Ajout de la colonne role_app sur utilisateurs
--              pour le contrôle d'accès basé sur les rôles (RBAC).
--
-- Rôles disponibles:
--   admin     → Accès complet (gestion club, stats, paramètres)
--   professor → Accès entraîneur (cours, membres lecture, stats)
--   member    → Accès membre (profil, cours, paiements propres, store)
-- ============================================================

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

-- ============================================================
-- ROLLBACK (à exécuter pour annuler la migration)
-- ============================================================
-- ALTER TABLE utilisateurs DROP INDEX idx_role_app;
-- ALTER TABLE utilisateurs DROP COLUMN role_app;
