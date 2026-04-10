-- ============================================================
-- MIGRATION 005 : Système de messagerie étendu
-- ============================================================
-- Version: 1.0
-- Date: 2025
-- Description:
--   - Table broadcasts pour les envois groupés
--   - Colonne broadcast_id sur messages (lien vers broadcast)
--   - Colonne envoye_par_email sur messages
-- ============================================================

USE clubmanager;

-- Table des envois groupés
CREATE TABLE IF NOT EXISTS broadcasts (
    id               INT UNSIGNED AUTO_INCREMENT,
    expediteur_id    INT UNSIGNED NOT NULL,
    sujet            VARCHAR(200) NULL,
    contenu          TEXT NOT NULL,
    cible            ENUM('tous', 'admin', 'professor', 'member') NOT NULL DEFAULT 'tous'
                         COMMENT 'Groupe ciblé par le broadcast',
    destinataires_count INT UNSIGNED NOT NULL DEFAULT 0,
    envoye_par_email BOOLEAN NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_expediteur_id (expediteur_id),
    INDEX idx_cible (cible),
    INDEX idx_created_at (created_at),

    CONSTRAINT fk_broadcasts_expediteur
        FOREIGN KEY (expediteur_id) REFERENCES utilisateurs(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Envois groupés (broadcasts) aux membres';

-- Ajout colonnes sur messages
ALTER TABLE messages
    ADD COLUMN broadcast_id INT UNSIGNED NULL
        COMMENT 'Lien vers le broadcast groupé (NULL si message individuel)'
    AFTER destinataire_id,
    ADD COLUMN envoye_par_email BOOLEAN NOT NULL DEFAULT FALSE
        COMMENT 'TRUE si une copie email a été envoyée'
    AFTER broadcast_id;

-- Index et FK sur messages
ALTER TABLE messages
    ADD INDEX idx_broadcast_id (broadcast_id),
    ADD CONSTRAINT fk_messages_broadcast
        FOREIGN KEY (broadcast_id) REFERENCES broadcasts(id)
        ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================
-- ROLLBACK
-- ============================================================
-- ALTER TABLE messages DROP FOREIGN KEY fk_messages_broadcast;
-- ALTER TABLE messages DROP INDEX idx_broadcast_id;
-- ALTER TABLE messages DROP COLUMN envoye_par_email;
-- ALTER TABLE messages DROP COLUMN broadcast_id;
-- DROP TABLE IF EXISTS broadcasts;
