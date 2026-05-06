-- ============================================================
-- Migration 009: Dépréciation de la table validation_tokens
-- ============================================================
-- GAP-19: The validation_tokens table is unused. Specific token tables
-- (email_validation_tokens, password_reset_tokens) replace it.
-- This migration drops the unused generic table.
--
-- Audit findings (GAP-19):
--   - No references in backend/src/**/*.ts
--   - No stored procedures or triggers use this table
--   - email_validation_tokens covers type='email'
--   - password_reset_tokens covers type='password_reset'
--   - The table's `token` column is unhashed (security concern vs token_hash pattern)
-- ============================================================

-- Safety check: ensure no rows exist before dropping
-- Run: SELECT COUNT(*) FROM validation_tokens;
-- If 0 rows, execute:

DROP TABLE IF EXISTS validation_tokens;
