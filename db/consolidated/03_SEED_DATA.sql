-- ============================================================================
-- CLUBMANAGER V3 - SEED DATA
-- ============================================================================
-- Script d'insertion des données de référence initiales
-- Tables: genres, grades, status, message_status
-- Version: 1.0
-- Date: 2025
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
(1, 'Blanche', '#FFFFFF', 0),
(2, 'Bleue', '#0000FF', 1),
(3, 'Violette', '#800080', 2),
(4, 'Marron', '#8B4513', 3),
(5, 'Noire', '#000000', 4),
(6, 'Rouge et Noire', '#FF0000', 5),
(7, 'Rouge', '#FF0000', 6)
ON DUPLICATE KEY UPDATE
    nom = VALUES(nom),
    couleur = VALUES(couleur),
    ordre = VALUES(ordre);

-- ============================================================================
-- STATUS - Statuts généraux
-- ============================================================================

INSERT INTO status (id, nom, description) VALUES
(1, 'Actif', 'Utilisateur ou entité active'),
(2, 'Inactif', 'Utilisateur ou entité inactive'),
(3, 'Suspendu', 'Utilisateur ou entité suspendu temporairement'),
(4, 'En attente', 'En attente de validation ou traitement'),
(5, 'Archivé', 'Archivé et non utilisé')
ON DUPLICATE KEY UPDATE
    nom = VALUES(nom),
    description = VALUES(description);

-- ============================================================================
-- MESSAGE_STATUS - Statuts de messages
-- ============================================================================

INSERT INTO message_status (id, nom) VALUES
(1, 'Non lu'),
(2, 'Lu'),
(3, 'Archivé'),
(4, 'Supprimé')
ON DUPLICATE KEY UPDATE nom = VALUES(nom);

-- ============================================================================
-- ALERTES_TYPES - Types d'alertes système
-- ============================================================================

INSERT INTO alertes_types (id, nom, description) VALUES
(1, 'Paiement en retard', 'Alerte pour les paiements en retard'),
(2, 'Abonnement expiré', 'Alerte pour les abonnements expirés'),
(3, 'Absence prolongée', 'Alerte pour absence prolongée aux cours'),
(4, 'Document manquant', 'Alerte pour documents manquants'),
(5, 'Médical', 'Alerte médicale importante')
ON DUPLICATE KEY UPDATE
    nom = VALUES(nom),
    description = VALUES(description);

-- ============================================================================
-- TYPES_MESSAGES_PERSONNALISES - Types de messages automatiques
-- ============================================================================

INSERT INTO types_messages_personnalises (id, nom, description) VALUES
(1, 'Bienvenue', 'Message de bienvenue pour nouveaux membres'),
(2, 'Rappel paiement', 'Rappel de paiement à venir'),
(3, 'Confirmation cours', 'Confirmation d\'inscription à un cours'),
(4, 'Annulation cours', 'Notification d\'annulation de cours'),
(5, 'Promotion', 'Message promotionnel')
ON DUPLICATE KEY UPDATE
    nom = VALUES(nom),
    description = VALUES(description);

-- ============================================================================
-- Verification des insertions
-- ============================================================================

SELECT 'Genres insérés:' as Info, COUNT(*) as Total FROM genres;
SELECT 'Grades insérés:' as Info, COUNT(*) as Total FROM grades;
SELECT 'Status insérés:' as Info, COUNT(*) as Total FROM status;
SELECT 'Message Status insérés:' as Info, COUNT(*) as Total FROM message_status;
SELECT 'Types d\'alertes insérés:' as Info, COUNT(*) as Total FROM alertes_types;
SELECT 'Types de messages personnalisés insérés:' as Info, COUNT(*) as Total FROM types_messages_personnalises;

-- ============================================================================
-- FIN DU SCRIPT
-- ============================================================================
