-- ============================================================
-- Migration V5.2 — Système d'invitation
-- Ajoute la table `invitations` pour contrôler l'accès à l'inscription
-- ============================================================

CREATE TABLE IF NOT EXISTS invitations (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  token_hash    VARCHAR(64)  NOT NULL UNIQUE,
  email         VARCHAR(255) NOT NULL,
  invited_by    INT UNSIGNED NOT NULL,
  status        ENUM('pending', 'accepted', 'revoked') NOT NULL DEFAULT 'pending',
  expires_at    TIMESTAMP    NOT NULL,
  used_at       TIMESTAMP    NULL DEFAULT NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_invitations_invited_by
    FOREIGN KEY (invited_by) REFERENCES utilisateurs(id)
    ON DELETE CASCADE,

  INDEX idx_invitations_email  (email),
  INDEX idx_invitations_status (status),
  INDEX idx_invitations_token  (token_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
