-- =====================================================================
-- Migration V4.5 : Ajout du support multilingue
-- =====================================================================
-- Description : Ajoute la colonne langue_preferee pour permettre aux
--               utilisateurs de choisir leur langue préférée dans
--               l'application (FR, EN, NL, DE, ES)
-- Auteur : ClubManager V3 Team
-- Date : 2024
-- =====================================================================

-- Étape 1 : Ajouter la colonne langue_preferee
-- ---------------------------------------------------------------------
ALTER TABLE utilisateurs
ADD COLUMN langue_preferee VARCHAR(5) NOT NULL DEFAULT 'fr'
COMMENT 'Langue préférée utilisateur (ISO 639-1: fr, en, nl, etc.)'
AFTER role_app;

-- Étape 2 : Ajouter le constraint de validation
-- ---------------------------------------------------------------------
ALTER TABLE utilisateurs
ADD CONSTRAINT chk_langue_preferee
CHECK (langue_preferee IN ('fr', 'en', 'nl', 'de', 'es'));

-- Étape 3 : Créer l'index pour optimiser les requêtes par langue
-- ---------------------------------------------------------------------
CREATE INDEX idx_langue_preferee ON utilisateurs(langue_preferee);

-- =====================================================================
-- Vérifications post-migration
-- =====================================================================

-- Vérifier que la colonne a été ajoutée correctement
SELECT
    COLUMN_NAME,
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'utilisateurs'
  AND COLUMN_NAME = 'langue_preferee';

-- Vérifier que le constraint a été ajouté
SELECT
    CONSTRAINT_NAME,
    CHECK_CLAUSE
FROM INFORMATION_SCHEMA.CHECK_CONSTRAINTS
WHERE CONSTRAINT_SCHEMA = DATABASE()
  AND CONSTRAINT_NAME = 'chk_langue_preferee';

-- Vérifier que l'index a été créé
SELECT
    INDEX_NAME,
    COLUMN_NAME,
    SEQ_IN_INDEX,
    INDEX_TYPE
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'utilisateurs'
  AND INDEX_NAME = 'idx_langue_preferee';

-- Vérifier le nombre d'utilisateurs avec la langue par défaut
SELECT
    langue_preferee,
    COUNT(*) AS nb_utilisateurs
FROM utilisateurs
GROUP BY langue_preferee
ORDER BY nb_utilisateurs DESC;

-- =====================================================================
-- Fin de la migration V4.5
-- =====================================================================
