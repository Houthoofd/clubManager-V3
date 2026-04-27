-- ============================================================================
-- MIGRATION V4.6: TABLES DE RÉFÉRENCE - PHASE 1 (CRITIQUE)
-- ============================================================================
-- Date: Décembre 2024
-- Version: 4.6
-- Description: Migration des valeurs hardcodées critiques vers la DB
--
-- PHASE 1 INCLUT:
--   1. Méthodes de paiement (especes, virement, stripe, autre)
--   2. Statuts de commande (en_attente, payee, livree, annulee, etc.)
--   3. Types de cours (karate, judo, taekwondo, etc.)
--
-- IMPACT:
--   - Tables existantes: paiements, commandes, cours
--   - Pas de breaking change (les colonnes VARCHAR existantes restent)
--   - Migration progressive possible
--
-- ROLLBACK:
--   DROP TABLE IF EXISTS methodes_paiement CASCADE;
--   DROP TABLE IF EXISTS statuts_commande CASCADE;
--   DROP TABLE IF EXISTS transitions_statut_commande CASCADE;
--   DROP TABLE IF EXISTS types_cours CASCADE;
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. MÉTHODES DE PAIEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS methodes_paiement (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  nom VARCHAR(100) NOT NULL,
  nom_en VARCHAR(100),                  -- Traduction anglaise
  description TEXT,
  description_en TEXT,
  icone VARCHAR(50),                    -- Nom de l'icône (CreditCardIcon, BanknotesIcon, etc.)
  couleur VARCHAR(20) DEFAULT 'neutral', -- Variant du badge (success, info, purple, neutral)
  ordre INTEGER NOT NULL,
  actif BOOLEAN DEFAULT true,
  visible_frontend BOOLEAN DEFAULT true, -- Visible dans les selects frontend
  visible_admin BOOLEAN DEFAULT true,    -- Visible pour les admins
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX idx_methodes_paiement_code ON methodes_paiement(code);
CREATE INDEX idx_methodes_paiement_actif ON methodes_paiement(actif);
CREATE INDEX idx_methodes_paiement_ordre ON methodes_paiement(ordre);

-- Données initiales
INSERT INTO methodes_paiement (code, nom, nom_en, description, description_en, icone, couleur, ordre, actif, visible_frontend) VALUES
  ('especes', 'Espèces', 'Cash', 'Paiement en argent liquide', 'Cash payment', 'BanknotesIcon', 'success', 1, true, true),
  ('virement', 'Virement bancaire', 'Bank transfer', 'Virement SEPA ou autre', 'SEPA or other bank transfer', 'BuildingLibraryIcon', 'purple', 2, true, true),
  ('stripe', 'Carte bancaire', 'Credit card', 'Paiement en ligne via Stripe', 'Online payment via Stripe', 'CreditCardIcon', 'info', 3, true, true),
  ('autre', 'Autre', 'Other', 'Autre mode de paiement', 'Other payment method', 'TagIcon', 'neutral', 4, true, true)
ON CONFLICT (code) DO NOTHING;

-- Commentaires
COMMENT ON TABLE methodes_paiement IS 'Table de référence : Méthodes de paiement disponibles dans le système';
COMMENT ON COLUMN methodes_paiement.code IS 'Code technique immuable (utilisé dans le code backend/frontend)';
COMMENT ON COLUMN methodes_paiement.nom IS 'Nom affiché en français';
COMMENT ON COLUMN methodes_paiement.nom_en IS 'Nom affiché en anglais';
COMMENT ON COLUMN methodes_paiement.icone IS 'Nom du composant React icône à afficher';
COMMENT ON COLUMN methodes_paiement.couleur IS 'Variant du badge: success, warning, danger, info, neutral, purple, orange';
COMMENT ON COLUMN methodes_paiement.visible_frontend IS 'Afficher dans les sélecteurs frontend (côté utilisateur)';
COMMENT ON COLUMN methodes_paiement.visible_admin IS 'Afficher dans les interfaces admin';

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_methodes_paiement_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_methodes_paiement_updated_at
  BEFORE UPDATE ON methodes_paiement
  FOR EACH ROW
  EXECUTE FUNCTION update_methodes_paiement_updated_at();


-- ============================================================================
-- 2. STATUTS DE COMMANDE
-- ============================================================================

CREATE TABLE IF NOT EXISTS statuts_commande (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  nom VARCHAR(100) NOT NULL,
  nom_en VARCHAR(100),
  description TEXT,
  description_en TEXT,
  couleur VARCHAR(20) DEFAULT 'neutral',
  ordre INTEGER NOT NULL,
  est_final BOOLEAN DEFAULT false,      -- true pour livree, annulee (aucune transition possible)
  peut_modifier BOOLEAN DEFAULT true,   -- Peut modifier la commande dans cet état
  peut_annuler BOOLEAN DEFAULT true,    -- Peut annuler la commande dans cet état
  compte_stock BOOLEAN DEFAULT false,   -- Décrémente le stock (pour livree par exemple)
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX idx_statuts_commande_code ON statuts_commande(code);
CREATE INDEX idx_statuts_commande_actif ON statuts_commande(actif);
CREATE INDEX idx_statuts_commande_est_final ON statuts_commande(est_final);
CREATE INDEX idx_statuts_commande_ordre ON statuts_commande(ordre);

-- Données initiales
INSERT INTO statuts_commande (code, nom, nom_en, description, description_en, couleur, ordre, est_final, peut_modifier, peut_annuler, compte_stock) VALUES
  ('en_attente', 'En attente', 'Pending', 'Commande en attente de paiement', 'Order pending payment', 'warning', 1, false, true, true, false),
  ('en_cours', 'En cours', 'In progress', 'Commande en cours de préparation', 'Order being prepared', 'info', 2, false, true, true, false),
  ('payee', 'Payée', 'Paid', 'Commande payée, prête à être expédiée', 'Order paid, ready to ship', 'info', 3, false, true, true, false),
  ('expediee', 'Expédiée', 'Shipped', 'Commande expédiée', 'Order shipped', 'purple', 4, false, false, true, true),
  ('prete', 'Prête', 'Ready', 'Commande prête pour retrait', 'Order ready for pickup', 'purple', 5, false, false, true, true),
  ('livree', 'Livrée', 'Delivered', 'Commande livrée au client', 'Order delivered to customer', 'success', 6, true, false, false, true),
  ('annulee', 'Annulée', 'Cancelled', 'Commande annulée', 'Order cancelled', 'danger', 7, true, false, false, false)
ON CONFLICT (code) DO NOTHING;

-- Commentaires
COMMENT ON TABLE statuts_commande IS 'Table de référence : Statuts du cycle de vie d''une commande';
COMMENT ON COLUMN statuts_commande.code IS 'Code technique immuable (utilisé dans le code)';
COMMENT ON COLUMN statuts_commande.est_final IS 'Statut final, aucune transition possible ensuite';
COMMENT ON COLUMN statuts_commande.peut_modifier IS 'Permet de modifier les articles de la commande';
COMMENT ON COLUMN statuts_commande.peut_annuler IS 'Permet d''annuler la commande';
COMMENT ON COLUMN statuts_commande.compte_stock IS 'Décrémente le stock des articles (gestion inventaire)';

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_statuts_commande_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_statuts_commande_updated_at
  BEFORE UPDATE ON statuts_commande
  FOR EACH ROW
  EXECUTE FUNCTION update_statuts_commande_updated_at();


-- ============================================================================
-- 2.1. TABLE DES TRANSITIONS (WORKFLOW)
-- ============================================================================

CREATE TABLE IF NOT EXISTS transitions_statut_commande (
  id SERIAL PRIMARY KEY,
  statut_depart_id INTEGER NOT NULL REFERENCES statuts_commande(id) ON DELETE CASCADE,
  statut_arrivee_id INTEGER NOT NULL REFERENCES statuts_commande(id) ON DELETE CASCADE,
  role_requis VARCHAR(50),              -- NULL = tous, 'admin', 'professor', etc.
  description TEXT,
  description_en TEXT,
  ordre_priorite INTEGER DEFAULT 100,   -- Ordre d'affichage dans les actions possibles
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(statut_depart_id, statut_arrivee_id)
);

-- Index
CREATE INDEX idx_transitions_statut_depart ON transitions_statut_commande(statut_depart_id);
CREATE INDEX idx_transitions_statut_arrivee ON transitions_statut_commande(statut_arrivee_id);
CREATE INDEX idx_transitions_actif ON transitions_statut_commande(actif);

-- Transitions autorisées
INSERT INTO transitions_statut_commande (statut_depart_id, statut_arrivee_id, role_requis, description, description_en, ordre_priorite) VALUES
  -- Depuis en_attente
  ((SELECT id FROM statuts_commande WHERE code = 'en_attente'), (SELECT id FROM statuts_commande WHERE code = 'payee'), NULL, 'Paiement reçu', 'Payment received', 1),
  ((SELECT id FROM statuts_commande WHERE code = 'en_attente'), (SELECT id FROM statuts_commande WHERE code = 'annulee'), NULL, 'Annuler la commande', 'Cancel order', 99),

  -- Depuis en_cours
  ((SELECT id FROM statuts_commande WHERE code = 'en_cours'), (SELECT id FROM statuts_commande WHERE code = 'payee'), 'admin', 'Marquer comme payée', 'Mark as paid', 1),
  ((SELECT id FROM statuts_commande WHERE code = 'en_cours'), (SELECT id FROM statuts_commande WHERE code = 'annulee'), 'admin', 'Annuler la commande', 'Cancel order', 99),

  -- Depuis payee
  ((SELECT id FROM statuts_commande WHERE code = 'payee'), (SELECT id FROM statuts_commande WHERE code = 'expediee'), 'admin', 'Expédier la commande', 'Ship order', 1),
  ((SELECT id FROM statuts_commande WHERE code = 'payee'), (SELECT id FROM statuts_commande WHERE code = 'prete'), 'admin', 'Marquer comme prête', 'Mark as ready', 2),
  ((SELECT id FROM statuts_commande WHERE code = 'payee'), (SELECT id FROM statuts_commande WHERE code = 'annulee'), 'admin', 'Annuler la commande', 'Cancel order', 99),

  -- Depuis expediee
  ((SELECT id FROM statuts_commande WHERE code = 'expediee'), (SELECT id FROM statuts_commande WHERE code = 'livree'), 'admin', 'Confirmer la livraison', 'Confirm delivery', 1),

  -- Depuis prete
  ((SELECT id FROM statuts_commande WHERE code = 'prete'), (SELECT id FROM statuts_commande WHERE code = 'livree'), 'admin', 'Confirmer le retrait', 'Confirm pickup', 1)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE transitions_statut_commande IS 'Transitions autorisées entre statuts de commande (workflow)';
COMMENT ON COLUMN transitions_statut_commande.role_requis IS 'Rôle minimal requis pour effectuer cette transition (NULL = tous)';


-- ============================================================================
-- 3. TYPES DE COURS
-- ============================================================================

CREATE TABLE IF NOT EXISTS types_cours (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  nom VARCHAR(100) NOT NULL,
  nom_en VARCHAR(100),
  description TEXT,
  description_en TEXT,
  couleur VARCHAR(20) DEFAULT 'blue',
  duree_defaut_minutes INTEGER DEFAULT 60,
  capacite_max_defaut INTEGER,
  niveau VARCHAR(50),                   -- debutant, intermediaire, avance, tous
  icone VARCHAR(50),                    -- Icône pour l'affichage
  ordre INTEGER,
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX idx_types_cours_code ON types_cours(code);
CREATE INDEX idx_types_cours_actif ON types_cours(actif);
CREATE INDEX idx_types_cours_ordre ON types_cours(ordre);

-- Données initiales (exemples - à adapter selon votre club)
-- Note: Vous devrez probablement migrer les données existantes de la table cours
INSERT INTO types_cours (code, nom, nom_en, description, description_en, couleur, duree_defaut_minutes, ordre, actif) VALUES
  ('karate', 'Karaté', 'Karate', 'Art martial japonais traditionnel', 'Traditional Japanese martial art', 'blue', 60, 1, true),
  ('judo', 'Judo', 'Judo', 'Art martial et sport de combat', 'Martial art and combat sport', 'green', 60, 2, true),
  ('taekwondo', 'Taekwondo', 'Taekwondo', 'Art martial coréen', 'Korean martial art', 'red', 60, 3, true),
  ('aikido', 'Aïkido', 'Aikido', 'Art martial japonais défensif', 'Japanese defensive martial art', 'purple', 60, 4, true),
  ('kendo', 'Kendo', 'Kendo', 'Escrime japonaise', 'Japanese fencing', 'orange', 60, 5, true),
  ('autre', 'Autre', 'Other', 'Autre type de cours', 'Other course type', 'gray', 60, 99, true)
ON CONFLICT (code) DO NOTHING;

-- Commentaires
COMMENT ON TABLE types_cours IS 'Table de référence : Types de cours disponibles dans le club';
COMMENT ON COLUMN types_cours.code IS 'Code technique immuable (utilisé dans le code)';
COMMENT ON COLUMN types_cours.duree_defaut_minutes IS 'Durée par défaut d''une session de ce type';
COMMENT ON COLUMN types_cours.capacite_max_defaut IS 'Capacité maximale par défaut pour ce type de cours';

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_types_cours_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_types_cours_updated_at
  BEFORE UPDATE ON types_cours
  FOR EACH ROW
  EXECUTE FUNCTION update_types_cours_updated_at();


-- ============================================================================
-- 4. VUES UTILITAIRES (OPTIONNEL)
-- ============================================================================

-- Vue pour les méthodes de paiement actives uniquement
CREATE OR REPLACE VIEW v_methodes_paiement_actives AS
SELECT
  id,
  code,
  nom,
  nom_en,
  description,
  icone,
  couleur,
  ordre
FROM methodes_paiement
WHERE actif = true AND visible_frontend = true
ORDER BY ordre;

COMMENT ON VIEW v_methodes_paiement_actives IS 'Vue des méthodes de paiement actives et visibles';


-- Vue pour les statuts de commande actifs
CREATE OR REPLACE VIEW v_statuts_commande_actifs AS
SELECT
  id,
  code,
  nom,
  nom_en,
  description,
  couleur,
  ordre,
  est_final,
  peut_modifier,
  peut_annuler
FROM statuts_commande
WHERE actif = true
ORDER BY ordre;

COMMENT ON VIEW v_statuts_commande_actifs IS 'Vue des statuts de commande actifs';


-- Vue pour les types de cours actifs
CREATE OR REPLACE VIEW v_types_cours_actifs AS
SELECT
  id,
  code,
  nom,
  nom_en,
  description,
  couleur,
  duree_defaut_minutes,
  capacite_max_defaut,
  niveau,
  ordre
FROM types_cours
WHERE actif = true
ORDER BY ordre;

COMMENT ON VIEW v_types_cours_actifs IS 'Vue des types de cours actifs';


-- ============================================================================
-- 5. FONCTION HELPER : Obtenir les transitions possibles pour un statut
-- ============================================================================

CREATE OR REPLACE FUNCTION get_transitions_possibles(
  p_statut_actuel_code VARCHAR(50),
  p_user_role VARCHAR(50) DEFAULT NULL
)
RETURNS TABLE (
  transition_id INTEGER,
  statut_arrivee_code VARCHAR(50),
  statut_arrivee_nom VARCHAR(100),
  description TEXT,
  ordre_priorite INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    s_arr.code,
    s_arr.nom,
    t.description,
    t.ordre_priorite
  FROM transitions_statut_commande t
  JOIN statuts_commande s_dep ON t.statut_depart_id = s_dep.id
  JOIN statuts_commande s_arr ON t.statut_arrivee_id = s_arr.id
  WHERE s_dep.code = p_statut_actuel_code
    AND t.actif = true
    AND (t.role_requis IS NULL OR p_user_role IS NULL OR t.role_requis = p_user_role)
  ORDER BY t.ordre_priorite, s_arr.ordre;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_transitions_possibles IS 'Retourne les transitions de statut possibles pour un statut donné et un rôle utilisateur';


-- ============================================================================
-- 6. MIGRATION DES DONNÉES EXISTANTES (À ADAPTER)
-- ============================================================================

-- NOTE: Cette section dépend de votre schéma actuel
-- Vous devrez probablement migrer les données existantes de :
--   - Table paiements (colonne methode_paiement VARCHAR)
--   - Table commandes (colonne statut VARCHAR)
--   - Table cours (colonne type VARCHAR)

-- Exemple pour normaliser les types de cours existants:
-- UPDATE cours
-- SET type = 'karate'
-- WHERE LOWER(type) IN ('karate', 'karaté', 'karaté shotokan', 'shotokan');

-- Vous pourrez exécuter ces UPDATE après avoir vérifié les données existantes

COMMIT;

-- ============================================================================
-- FIN DE LA MIGRATION V4.6 - PHASE 1
-- ============================================================================

-- Pour vérifier que tout s'est bien passé:
-- SELECT * FROM methodes_paiement;
-- SELECT * FROM statuts_commande;
-- SELECT * FROM transitions_statut_commande;
-- SELECT * FROM types_cours;

-- Pour tester la fonction de transitions:
-- SELECT * FROM get_transitions_possibles('en_attente');
-- SELECT * FROM get_transitions_possibles('payee', 'admin');
