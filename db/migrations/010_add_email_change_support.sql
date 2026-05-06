-- ============================================================
-- Migration 010: Support du changement d'email (GAP-15)
-- ============================================================
-- Ajoute la colonne `email` dans email_validation_tokens pour stocker
-- le nouvel email cible lors d'une demande de changement d'email.
--
-- token_type = 'verification'  → email NULL (non utilisé)
-- token_type = 'change_email'  → email = nouvelle adresse souhaitée
-- ============================================================

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
