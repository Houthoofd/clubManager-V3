-- =====================================================================
-- Migration V4.5 : Ajout du support multilingue
-- =====================================================================
-- Description : Ajoute la colonne langue_preferee pour permettre aux
--               utilisateurs de choisir leur langue préférée dans
--               l'application (FR, EN, NL, DE, ES)
-- Auteur : ClubManager V3 Team
-- Date : 2024
-- Idempotent : Oui (safe à ré-exécuter)
-- =====================================================================

-- Étape 1 : Ajouter la colonne langue_preferee (si elle n'existe pas)
-- ---------------------------------------------------------------------
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

-- Étape 2 : Ajouter le constraint de validation (si il n'existe pas)
-- ---------------------------------------------------------------------
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

-- Étape 3 : Créer l'index (si il n'existe pas)
-- ---------------------------------------------------------------------
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

-- =====================================================================
-- Vérifications post-migration
-- =====================================================================

-- Vérifier que la colonne est présente
SELECT
    COLUMN_NAME,
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME   = 'utilisateurs'
  AND COLUMN_NAME  = 'langue_preferee';

-- Vérifier que l'index est présent
SELECT
    INDEX_NAME,
    COLUMN_NAME,
    SEQ_IN_INDEX,
    INDEX_TYPE
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME   = 'utilisateurs'
  AND INDEX_NAME   = 'idx_langue_preferee';

-- Distribution des langues parmi les utilisateurs existants
SELECT
    langue_preferee,
    COUNT(*) AS nb_utilisateurs
FROM utilisateurs
GROUP BY langue_preferee
ORDER BY nb_utilisateurs DESC;

-- =====================================================================
-- Fin de la migration V4.5 (idempotente)
-- =====================================================================
