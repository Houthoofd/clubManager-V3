-- ============================================================
-- MIGRATION 003: Add Email Verification Columns (SIMPLIFIED)
-- ============================================================
-- Date: 2025-01-26
-- Description:
--   - Ajout de email_verified_at dans utilisateurs
--   - Modification de email_validation_tokens pour correspondre au nouveau schéma
--   - Modification de password_reset_tokens pour ajouter les colonnes manquantes
-- ============================================================

USE clubmanager;

-- ============================================================
-- 1. Modification table utilisateurs
-- ============================================================

-- Ajouter la colonne email_verified_at (ignorer si existe)
SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'utilisateurs'
        AND COLUMN_NAME = 'email_verified_at'
);

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE utilisateurs ADD COLUMN email_verified_at TIMESTAMP NULL COMMENT "Date de vérification de l\'\'email" AFTER email_verified',
    'SELECT "Column email_verified_at already exists" AS msg'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Mettre à jour les utilisateurs existants déjà vérifiés
UPDATE utilisateurs
SET email_verified_at = created_at
WHERE email_verified = TRUE AND email_verified_at IS NULL;

-- Index pour recherches rapides
SET @idx_exists = (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'utilisateurs'
        AND INDEX_NAME = 'idx_email_verified_at'
);

SET @sql = IF(@idx_exists = 0,
    'ALTER TABLE utilisateurs ADD INDEX idx_email_verified_at (email_verified_at)',
    'SELECT "Index idx_email_verified_at already exists" AS msg'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================================
-- 2. Modification table email_validation_tokens
-- ============================================================

-- Supprimer TOUTES les foreign keys existantes sur cette table
SELECT CONCAT('ALTER TABLE email_validation_tokens DROP FOREIGN KEY ', CONSTRAINT_NAME, ';')
INTO @drop_fk_sql
FROM information_schema.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'email_validation_tokens'
    AND CONSTRAINT_TYPE = 'FOREIGN KEY'
LIMIT 1;

SET @drop_fk_sql = IFNULL(@drop_fk_sql, 'SELECT "No FK to drop on email_validation_tokens" AS msg');
PREPARE stmt FROM @drop_fk_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Renommer utilisateur_id en user_id (ignorer si déjà renommé)
SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'email_validation_tokens'
        AND COLUMN_NAME = 'utilisateur_id'
);

SET @sql = IF(@col_exists > 0,
    'ALTER TABLE email_validation_tokens CHANGE COLUMN utilisateur_id user_id INT UNSIGNED NOT NULL',
    'SELECT "Column utilisateur_id already renamed" AS msg'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Renommer token_hash en token (ignorer si déjà renommé)
SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'email_validation_tokens'
        AND COLUMN_NAME = 'token_hash'
);

SET @sql = IF(@col_exists > 0,
    'ALTER TABLE email_validation_tokens CHANGE COLUMN token_hash token VARCHAR(255) NOT NULL UNIQUE COMMENT "Token de vérification (hashé SHA-256)"',
    'SELECT "Column token_hash already renamed" AS msg'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ajouter colonne email
SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'email_validation_tokens'
        AND COLUMN_NAME = 'email'
);

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE email_validation_tokens ADD COLUMN email VARCHAR(255) NOT NULL COMMENT "Email à vérifier" AFTER token',
    'SELECT "Column email already exists" AS msg'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ajouter colonne used_at
SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'email_validation_tokens'
        AND COLUMN_NAME = 'used_at'
);

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE email_validation_tokens ADD COLUMN used_at TIMESTAMP NULL COMMENT "Date d\'\'utilisation du token" AFTER expires_at',
    'SELECT "Column used_at already exists" AS msg'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Supprimer colonne used
SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'email_validation_tokens'
        AND COLUMN_NAME = 'used'
);

SET @sql = IF(@col_exists > 0,
    'ALTER TABLE email_validation_tokens DROP COLUMN used',
    'SELECT "Column used already dropped" AS msg'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Supprimer colonne token_type
SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'email_validation_tokens'
        AND COLUMN_NAME = 'token_type'
);

SET @sql = IF(@col_exists > 0,
    'ALTER TABLE email_validation_tokens DROP COLUMN token_type',
    'SELECT "Column token_type already dropped" AS msg'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ajouter index email
SET @idx_exists = (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'email_validation_tokens'
        AND INDEX_NAME = 'idx_email'
);

SET @sql = IF(@idx_exists = 0,
    'ALTER TABLE email_validation_tokens ADD INDEX idx_email (email)',
    'SELECT "Index idx_email already exists" AS msg'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ajouter index used_at
SET @idx_exists = (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'email_validation_tokens'
        AND INDEX_NAME = 'idx_used_at'
);

SET @sql = IF(@idx_exists = 0,
    'ALTER TABLE email_validation_tokens ADD INDEX idx_used_at (used_at)',
    'SELECT "Index idx_used_at already exists" AS msg'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Recréer la foreign key avec le bon nom
ALTER TABLE email_validation_tokens
ADD CONSTRAINT fk_email_verification_user
    FOREIGN KEY (user_id) REFERENCES utilisateurs(id)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================
-- 3. Modification table password_reset_tokens
-- ============================================================

-- Supprimer TOUTES les foreign keys existantes sur cette table
SELECT CONCAT('ALTER TABLE password_reset_tokens DROP FOREIGN KEY ', CONSTRAINT_NAME, ';')
INTO @drop_fk_sql
FROM information_schema.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'password_reset_tokens'
    AND CONSTRAINT_TYPE = 'FOREIGN KEY'
LIMIT 1;

SET @drop_fk_sql = IFNULL(@drop_fk_sql, 'SELECT "No FK to drop on password_reset_tokens" AS msg');
PREPARE stmt FROM @drop_fk_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Renommer utilisateur_id en user_id
SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'password_reset_tokens'
        AND COLUMN_NAME = 'utilisateur_id'
);

SET @sql = IF(@col_exists > 0,
    'ALTER TABLE password_reset_tokens CHANGE COLUMN utilisateur_id user_id INT UNSIGNED NOT NULL',
    'SELECT "Column utilisateur_id already renamed" AS msg'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Renommer token_hash en token
SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'password_reset_tokens'
        AND COLUMN_NAME = 'token_hash'
);

SET @sql = IF(@col_exists > 0,
    'ALTER TABLE password_reset_tokens CHANGE COLUMN token_hash token VARCHAR(255) NOT NULL UNIQUE COMMENT "Token de reset (hashé SHA-256)"',
    'SELECT "Column token_hash already renamed" AS msg'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ajouter colonne email
SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'password_reset_tokens'
        AND COLUMN_NAME = 'email'
);

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE password_reset_tokens ADD COLUMN email VARCHAR(255) NOT NULL COMMENT "Email de l\'\'utilisateur" AFTER token',
    'SELECT "Column email already exists" AS msg'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ajouter colonne used_at
SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'password_reset_tokens'
        AND COLUMN_NAME = 'used_at'
);

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE password_reset_tokens ADD COLUMN used_at TIMESTAMP NULL COMMENT "Date d\'\'utilisation du token" AFTER expires_at',
    'SELECT "Column used_at already exists" AS msg'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ajouter colonne ip_address
SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'password_reset_tokens'
        AND COLUMN_NAME = 'ip_address'
);

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE password_reset_tokens ADD COLUMN ip_address VARCHAR(45) NULL COMMENT "Adresse IP de la demande" AFTER used_at',
    'SELECT "Column ip_address already exists" AS msg'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ajouter colonne user_agent
SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'password_reset_tokens'
        AND COLUMN_NAME = 'user_agent'
);

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE password_reset_tokens ADD COLUMN user_agent TEXT NULL COMMENT "User agent du navigateur" AFTER ip_address',
    'SELECT "Column user_agent already exists" AS msg'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Supprimer colonne used
SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'password_reset_tokens'
        AND COLUMN_NAME = 'used'
);

SET @sql = IF(@col_exists > 0,
    'ALTER TABLE password_reset_tokens DROP COLUMN used',
    'SELECT "Column used already dropped" AS msg'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ajouter index email
SET @idx_exists = (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'password_reset_tokens'
        AND INDEX_NAME = 'idx_email'
);

SET @sql = IF(@idx_exists = 0,
    'ALTER TABLE password_reset_tokens ADD INDEX idx_email (email)',
    'SELECT "Index idx_email already exists" AS msg'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ajouter index used_at
SET @idx_exists = (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'password_reset_tokens'
        AND INDEX_NAME = 'idx_used_at'
);

SET @sql = IF(@idx_exists = 0,
    'ALTER TABLE password_reset_tokens ADD INDEX idx_used_at (used_at)',
    'SELECT "Index idx_used_at already exists" AS msg'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Recréer la foreign key avec le bon nom
ALTER TABLE password_reset_tokens
ADD CONSTRAINT fk_password_reset_user
    FOREIGN KEY (user_id) REFERENCES utilisateurs(id)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================
-- 4. Event pour nettoyer les tokens expirés
-- ============================================================

SET GLOBAL event_scheduler = ON;

DROP EVENT IF EXISTS cleanup_expired_tokens;

DELIMITER $$

CREATE EVENT cleanup_expired_tokens
ON SCHEDULE EVERY 1 DAY
STARTS (CURRENT_TIMESTAMP + INTERVAL 1 DAY)
DO
BEGIN
    DELETE FROM email_validation_tokens WHERE expires_at < DATE_SUB(NOW(), INTERVAL 7 DAY);
    DELETE FROM password_reset_tokens WHERE expires_at < DATE_SUB(NOW(), INTERVAL 7 DAY);
END$$

DELIMITER ;

-- ============================================================
-- FIN MIGRATION 003
-- ============================================================

SELECT 'Migration 003 completed successfully!' AS status;
