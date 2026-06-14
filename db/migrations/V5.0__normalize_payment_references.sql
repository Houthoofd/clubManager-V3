-- ============================================================
-- MIGRATION V5.0 - NORMALISATION DES RÉFÉRENCES PAIEMENTS
-- ============================================================
-- Description:
--   Remplace les colonnes ENUM par des Foreign Keys vers les tables de référence.
--   Cette migration normalise complètement le schéma des paiements.
--
--   Tables affectées :
--   - paiements : methode_paiement (ENUM → FK) + statut (ENUM → FK)
--   - echeances_paiements : statut (ENUM → FK)
--
-- Date: 2026-06-13
-- Auteur: Benoit Houthoofd
-- Préconditions:
--   - Tables methodes_paiement, statuts_paiement, statuts_echeance existent
--   - Données de référence sont insérées dans ces tables
--
-- ATTENTION : Cette migration modifie le schéma de façon significative.
--             Testez d'abord sur un environnement de développement.
-- ============================================================

USE clubmanager;

-- ============================================================
-- ÉTAPE 1 : VÉRIFIER LES DONNÉES DE RÉFÉRENCE
-- ============================================================

-- Vérifier que les tables de référence contiennent les données nécessaires
SELECT 'Vérification des données de référence...' AS status;

-- Méthodes de paiement attendues
SELECT COUNT(*) AS methodes_count FROM methodes_paiement
WHERE code IN ('stripe', 'especes', 'virement', 'autre');

-- Statuts de paiement attendus
SELECT COUNT(*) AS statuts_paiement_count FROM statuts_paiement
WHERE code IN ('en_attente', 'valide', 'echoue', 'rembourse');

-- Statuts d'échéance attendus
SELECT COUNT(*) AS statuts_echeance_count FROM statuts_echeance
WHERE code IN ('en_attente', 'paye', 'en_retard', 'annule');

-- ============================================================
-- ÉTAPE 2 : MIGRATION TABLE PAIEMENTS
-- ============================================================

SELECT 'Migration de la table paiements...' AS status;

-- 2.1 Ajouter les nouvelles colonnes FK
ALTER TABLE paiements
    ADD COLUMN methode_paiement_id INT UNSIGNED NULL AFTER montant,
    ADD COLUMN statut_id INT UNSIGNED NULL AFTER methode_paiement_id;

-- 2.2 Créer un mapping temporaire et migrer les données
UPDATE paiements p
INNER JOIN methodes_paiement mp ON mp.code = p.methode_paiement
SET p.methode_paiement_id = mp.id;

UPDATE paiements p
INNER JOIN statuts_paiement sp ON sp.code = p.statut
SET p.statut_id = sp.id;

-- 2.3 Vérifier qu'aucune donnée n'a été perdue
SELECT
    COUNT(*) AS total_paiements,
    SUM(CASE WHEN methode_paiement_id IS NULL THEN 1 ELSE 0 END) AS sans_methode,
    SUM(CASE WHEN statut_id IS NULL THEN 1 ELSE 0 END) AS sans_statut
FROM paiements;

-- 2.4 Rendre les colonnes NOT NULL (si migration OK)
ALTER TABLE paiements
    MODIFY COLUMN methode_paiement_id INT UNSIGNED NOT NULL,
    MODIFY COLUMN statut_id INT UNSIGNED NOT NULL;

-- 2.5 Supprimer les anciennes colonnes ENUM
ALTER TABLE paiements
    DROP COLUMN methode_paiement,
    DROP COLUMN statut;

-- 2.6 Ajouter les contraintes FK
ALTER TABLE paiements
    ADD CONSTRAINT fk_paiements_methode
        FOREIGN KEY (methode_paiement_id) REFERENCES methodes_paiement(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT fk_paiements_statut
        FOREIGN KEY (statut_id) REFERENCES statuts_paiement(id)
        ON DELETE RESTRICT ON UPDATE CASCADE;

-- 2.7 Ajouter les index
ALTER TABLE paiements
    ADD INDEX idx_methode_paiement_id (methode_paiement_id),
    ADD INDEX idx_statut_id (statut_id);

SELECT 'Table paiements migrée avec succès !' AS status;

-- ============================================================
-- ÉTAPE 3 : MIGRATION TABLE ECHEANCES_PAIEMENTS
-- ============================================================

SELECT 'Migration de la table echeances_paiements...' AS status;

-- 3.1 Ajouter la nouvelle colonne FK
ALTER TABLE echeances_paiements
    ADD COLUMN statut_id INT UNSIGNED NULL AFTER date_echeance;

-- 3.2 Migrer les données
UPDATE echeances_paiements ep
INNER JOIN statuts_echeance se ON se.code = ep.statut
SET ep.statut_id = se.id;

-- 3.3 Vérifier qu'aucune donnée n'a été perdue
SELECT
    COUNT(*) AS total_echeances,
    SUM(CASE WHEN statut_id IS NULL THEN 1 ELSE 0 END) AS sans_statut
FROM echeances_paiements;

-- 3.4 Rendre la colonne NOT NULL (si migration OK)
ALTER TABLE echeances_paiements
    MODIFY COLUMN statut_id INT UNSIGNED NOT NULL;

-- 3.5 Supprimer l'ancienne colonne ENUM
ALTER TABLE echeances_paiements
    DROP COLUMN statut;

-- 3.6 Ajouter la contrainte FK
ALTER TABLE echeances_paiements
    ADD CONSTRAINT fk_echeances_statut
        FOREIGN KEY (statut_id) REFERENCES statuts_echeance(id)
        ON DELETE RESTRICT ON UPDATE CASCADE;

-- 3.7 Ajouter l'index
ALTER TABLE echeances_paiements
    ADD INDEX idx_statut_id (statut_id);

SELECT 'Table echeances_paiements migrée avec succès !' AS status;

-- ============================================================
-- ÉTAPE 4 : VÉRIFICATION FINALE
-- ============================================================

SELECT 'Vérification finale...' AS status;

-- Vérifier les Foreign Keys
SELECT
    TABLE_NAME,
    CONSTRAINT_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME IN ('paiements', 'echeances_paiements')
  AND REFERENCED_TABLE_NAME IN ('methodes_paiement', 'statuts_paiement', 'statuts_echeance')
ORDER BY TABLE_NAME, COLUMN_NAME;

-- Vérifier la structure des tables
SELECT 'Structure paiements :' AS info;
DESCRIBE paiements;

SELECT 'Structure echeances_paiements :' AS info;
DESCRIBE echeances_paiements;

-- ============================================================
-- STATISTIQUES POST-MIGRATION
-- ============================================================

SELECT '=== STATISTIQUES POST-MIGRATION ===' AS '';

SELECT
    'Paiements par méthode' AS statistique,
    mp.code,
    mp.nom,
    COUNT(*) AS nombre
FROM paiements p
INNER JOIN methodes_paiement mp ON mp.id = p.methode_paiement_id
GROUP BY mp.id, mp.code, mp.nom
ORDER BY nombre DESC;

SELECT
    'Paiements par statut' AS statistique,
    sp.code,
    sp.nom,
    COUNT(*) AS nombre
FROM paiements p
INNER JOIN statuts_paiement sp ON sp.id = p.statut_id
GROUP BY sp.id, sp.code, sp.nom
ORDER BY nombre DESC;

SELECT
    'Échéances par statut' AS statistique,
    se.code,
    se.nom,
    COUNT(*) AS nombre
FROM echeances_paiements ep
INNER JOIN statuts_echeance se ON se.id = ep.statut_id
GROUP BY se.id, se.code, se.nom
ORDER BY nombre DESC;

-- ============================================================
SELECT 'Migration V5.0 terminée avec succès ! ✓' AS status;
-- ============================================================

-- NOTES IMPORTANTES :
-- 1. Cette migration est DESTRUCTIVE (supprime les colonnes ENUM)
-- 2. Sauvegardez votre base AVANT d'exécuter cette migration
-- 3. Les triggers/procédures utilisant les anciennes colonnes doivent être mis à jour
-- 4. Le code backend doit être adapté pour utiliser les nouveaux IDs
