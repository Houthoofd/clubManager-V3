-- ============================================================================
-- CLUBMANAGER V3 - SEED DATA v1.1
-- ============================================================================
-- Tables: genres, grades, status, alertes_types
-- Corrections v1.1 :
--   - Suppression du INSERT message_status (table relationnelle, pas lookup)
--   - Ajout colonne code dans alertes_types (NOT NULL)
--   - Suppression types_messages_personnalises (déjà inséré dans le schéma)
-- ============================================================================

USE clubmanager;

-- ============================================================================
-- GENRES - Types de genre
-- ============================================================================

INSERT INTO genres (id, nom) VALUES
(1, 'Homme'),
(2, 'Femme'),
(3, 'Autre'),
(4, 'Non spécifié')
ON DUPLICATE KEY UPDATE nom = VALUES(nom);

-- ============================================================================
-- GRADES - Ceintures de Jiu-Jitsu Brésilien
-- ============================================================================

INSERT INTO grades (id, nom, couleur, ordre) VALUES
(1, 'Blanche',       '#FFFFFF', 0),
(2, 'Bleue',         '#0000FF', 1),
(3, 'Violette',      '#800080', 2),
(4, 'Marron',        '#8B4513', 3),
(5, 'Noire',         '#000000', 4),
(6, 'Rouge et Noire','#FF0000', 5),
(7, 'Rouge',         '#FF0000', 6)
ON DUPLICATE KEY UPDATE
    nom    = VALUES(nom),
    couleur = VALUES(couleur),
    ordre   = VALUES(ordre);

-- ============================================================================
-- STATUS - Statuts généraux
-- ============================================================================

INSERT INTO status (id, nom, description) VALUES
(1, 'Actif',       'Utilisateur ou entité active'),
(2, 'Inactif',     'Utilisateur ou entité inactive'),
(3, 'Suspendu',    'Utilisateur ou entité suspendu temporairement'),
(4, 'En attente',  'En attente de validation ou traitement'),
(5, 'Archivé',     'Archivé et non utilisé')
ON DUPLICATE KEY UPDATE
    nom         = VALUES(nom),
    description = VALUES(description);

-- ============================================================================
-- ALERTES_TYPES - Types d'alertes système
-- ============================================================================

INSERT INTO alertes_types (id, code, nom, description) VALUES
(1, 'PAYMENT_OVERDUE',       'Paiement en retard',  'Alerte pour les paiements en retard'),
(2, 'SUBSCRIPTION_EXPIRED',  'Abonnement expiré',   'Alerte pour les abonnements expirés'),
(3, 'LONG_ABSENCE',          'Absence prolongée',   'Alerte pour absence prolongée aux cours'),
(4, 'MISSING_DOCUMENT',      'Document manquant',   'Alerte pour documents manquants'),
(5, 'MEDICAL',               'Médical',             'Alerte médicale importante')
ON DUPLICATE KEY UPDATE
    nom         = VALUES(nom),
    description = VALUES(description);

-- ============================================================================
-- Vérification des insertions
-- ============================================================================

SELECT 'Genres insérés:'         AS Info, COUNT(*) AS Total FROM genres;
SELECT 'Grades insérés:'         AS Info, COUNT(*) AS Total FROM grades;
SELECT 'Status insérés:'         AS Info, COUNT(*) AS Total FROM status;
SELECT 'Types alertes insérés:'  AS Info, COUNT(*) AS Total FROM alertes_types;

-- ============================================================================
-- FIN DU SCRIPT
-- ============================================================================
