-- ============================================================
-- Migration 003 : Ajout colonne archived sur messages
-- ============================================================
-- GAP-16 : Archivage des messages
-- Compatible : MySQL 5.7+ / MySQL 8.0+ (pas MariaDB-only)
-- Idempotent : Oui (vérification via INFORMATION_SCHEMA)
-- ============================================================

SET @dbname = DATABASE();

-- ------------------------------------------------------------
-- ÉTAPE 1 : Ajouter la colonne archived (si absente)
-- ------------------------------------------------------------
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

-- ------------------------------------------------------------
-- ÉTAPE 2 : Créer l index idx_messages_archived (si absent)
-- ------------------------------------------------------------
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

-- ------------------------------------------------------------
-- Vérification post-migration
-- ------------------------------------------------------------
SELECT
    COLUMN_NAME,
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME   = 'messages'
  AND COLUMN_NAME  = 'archived';
