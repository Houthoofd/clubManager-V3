-- ============================================================
-- MIGRATION 006 : Templates de messages personnalisés
-- ============================================================
USE clubmanager;

-- Ajouter colonne actif manquante sur les types
ALTER TABLE types_messages_personnalises
    ADD COLUMN actif BOOLEAN NOT NULL DEFAULT TRUE
        COMMENT 'Type de template actif ou non'
    AFTER description,
    ADD INDEX idx_actif (actif);

-- Données de référence : types par défaut
INSERT INTO types_messages_personnalises (nom, description, actif) VALUES
  ('Bienvenue',          'Message de bienvenue pour les nouveaux membres', TRUE),
  ('Cours annulé',       'Annulation ou modification d''un cours', TRUE),
  ('Rappel paiement',    'Rappel pour un paiement ou abonnement', TRUE),
  ('Promotion ceinture', 'Félicitations pour une promotion de grade', TRUE),
  ('Annonce générale',   'Communication générale aux membres', TRUE)
ON DUPLICATE KEY UPDATE nom = nom;

-- ============================================================
-- ROLLBACK
-- ============================================================
-- ALTER TABLE types_messages_personnalises DROP INDEX idx_actif;
-- ALTER TABLE types_messages_personnalises DROP COLUMN actif;
