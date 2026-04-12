-- ============================================================
-- Migration 002: Normalisation de la colonne token_hash
-- ============================================================
-- Renomme token → token_hash dans email_validation_tokens
-- pour uniformiser avec password_reset_tokens et refresh_tokens
-- (user_id était déjà correct dans les 3 tables)
-- ============================================================

ALTER TABLE email_validation_tokens
  RENAME COLUMN token TO token_hash;
