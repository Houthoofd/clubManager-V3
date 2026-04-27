-- ============================================================================
-- MIGRATION DES VALEURS HARDCODÉES VERS TABLES DE RÉFÉRENCE
-- ============================================================================
-- Date: 2024-12
-- Version: 1.0
-- Description: Migration des valeurs hardcodées du frontend vers la DB
--
-- ORDRE D'EXÉCUTION:
--   Phase 1 (Critique): methodes_paiement, statuts_commande, types_cours
--   Phase 2 (Important): statuts_paiement, roles, statuts_utilisateur
--   Phase 3 (Souhaitable): roles_familiaux, statuts_presence
--
-- ROLLBACK: Voir section à la fin du fichier
-- ============================================================================

BEGIN;

-- ============================================================================
-- PHASE 1: TABLES CRITIQUES (Haute priorité)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. MÉTHODES DE PAIEMENT
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS methodes_paiement (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  nom VARCHAR(100) NOT NULL,
  description TEXT,
  icone VARCHAR(50),                    -- Nom de l'icône (CreditCardIcon, BanknotesIcon, etc.)
  couleur VARCHAR(20) DEFAULT 'neutral', -- Variant du badge (success, info, purple, neutral)
  ordre INTEGER NOT NULL,
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index
CREATE INDEX idx_methodes_paiement_code ON methodes_paiement(code);
CREATE INDEX idx_methodes_paiement_actif ON methodes_paiement(actif);

-- Données initiales
INSERT INTO methodes_paiement (code, nom, description, icone, couleur, ordre) VALUES
  ('especes', 'Espèces', 'Paiement en argent liquide', 'BanknotesIcon', 'success', 1),
  ('virement', 'Virement bancaire', 'Virement SEPA ou autre', 'BuildingLibraryIcon', 'purple', 2),
  ('stripe', 'Carte bancaire', 'Paiement en ligne via Stripe', 'CreditCardIcon', 'info', 3),
  ('autre', 'Autre', 'Autre mode de paiement', 'TagIcon', 'neutral', 4)
ON CONFLICT (code) DO NOTHING;

-- Commentaires
COMMENT ON TABLE methodes_paiement IS 'Méthodes de paiement disponibles dans le système';
COMMENT ON COLUMN methodes_paiement.code IS 'Code technique immuable (utilisé dans le code)';
COMMENT ON COLUMN methodes_paiement.icone IS 'Nom du composant React icône à afficher';
COMMENT ON COLUMN methodes_paiement.couleur IS 'Variant du badge: success, warning, danger, info, neutral, purple, orange';


-- ----------------------------------------------------------------------------
-- 2. STATUTS DE COMMANDE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS statuts_commande (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  nom VARCHAR(100) NOT NULL,
  description TEXT,
  couleur VARCHAR(20) DEFAULT 'neutral',
  ordre INTEGER NOT NULL,
  est_final BOOLEAN DEFAULT false,      -- true pour livree, annulee
  peut_modifier BOOLEAN DEFAULT true,   -- Peut modifier la commande dans cet état
  peut_annuler BOOLEAN DEFAULT true,    -- Peut annuler la commande dans cet état
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index
CREATE INDEX idx_statuts_commande_code ON statuts_commande(code);
CREATE INDEX idx_statuts_commande_actif ON statuts_commande(actif);
CREATE INDEX idx_statuts_commande_est_final ON statuts_commande(est_final);

-- Données initiales
INSERT INTO statuts_commande (code, nom, description, couleur, ordre, est_final, peut_modifier, peut_annuler) VALUES
  ('en_attente', 'En attente', 'Commande en attente de paiement', 'warning', 1, false, true, true),
  ('en_cours', 'En cours', 'Commande en cours de préparation', 'info', 2, false, true, true),
  ('payee', 'Payée', 'Commande payée, prête à être expédiée', 'info', 3, false, true, true),
  ('expediee', 'Expédiée', 'Commande expédiée', 'purple', 4, false, false, true),
  ('prete', 'Prête', 'Commande prête pour retrait', 'purple', 5, false, false, true),
  ('livree', 'Livrée', 'Commande livrée au client', 'success', 6, true, false, false),
  ('annulee', 'Annulée', 'Commande annulée', 'danger', 7, true, false, false)
ON CONFLICT (code) DO NOTHING;

-- Table des transitions possibles (optionnel mais recommandé)
CREATE TABLE IF NOT EXISTS transitions_statut_commande (
  id SERIAL PRIMARY KEY,
  statut_depart_id INTEGER NOT NULL REFERENCES statuts_commande(id) ON DELETE CASCADE,
  statut_arrivee_id INTEGER NOT NULL REFERENCES statuts_commande(id) ON DELETE CASCADE,
  role_requis VARCHAR(50),              -- NULL = tous, 'admin', 'member', etc.
  description TEXT,
  UNIQUE(statut_depart_id, statut_arrivee_id)
);

-- Transitions autorisées
INSERT INTO transitions_statut_commande (statut_depart_id, statut_arrivee_id, role_requis, description) VALUES
  -- Depuis en_attente
  ((SELECT id FROM statuts_commande WHERE code = 'en_attente'), (SELECT id FROM statuts_commande WHERE code = 'payee'), NULL, 'Paiement reçu'),
  ((SELECT id FROM statuts_commande WHERE code = 'en_attente'), (SELECT id FROM statuts_commande WHERE code = 'annulee'), NULL, 'Annulation'),
  -- Depuis payee
  ((SELECT id FROM statuts_commande WHERE code = 'payee'), (SELECT id FROM statuts_commande WHERE code = 'expediee'), 'admin', 'Expédition'),
  ((SELECT id FROM statuts_commande WHERE code = 'payee'), (SELECT id FROM statuts_commande WHERE code = 'prete'), 'admin', 'Préparation terminée'),
  ((SELECT id FROM statuts_commande WHERE code = 'payee'), (SELECT id FROM statuts_commande WHERE code = 'annulee'), 'admin', 'Annulation'),
  -- Depuis expediee
  ((SELECT id FROM statuts_commande WHERE code = 'expediee'), (SELECT id FROM statuts_commande WHERE code = 'livree'), 'admin', 'Livraison confirmée'),
  -- Depuis prete
  ((SELECT id FROM statuts_commande WHERE code = 'prete'), (SELECT id FROM statuts_commande WHERE code = 'livree'), 'admin', 'Retrait confirmé')
ON CONFLICT DO NOTHING;

COMMENT ON TABLE statuts_commande IS 'Statuts du cycle de vie d''une commande';
COMMENT ON COLUMN statuts_commande.est_final IS 'Statut final, aucune transition possible ensuite';


-- ----------------------------------------------------------------------------
-- 3. TYPES DE COURS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS types_cours (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  nom VARCHAR(100) NOT NULL,
  description TEXT,
  couleur VARCHAR(20) DEFAULT 'blue',
  duree_defaut_minutes INTEGER DEFAULT 60,
  capacite_max INTEGER,
  niveau VARCHAR(50),                   -- debutant, intermediaire, avance
  ordre INTEGER,
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index
CREATE INDEX idx_types_cours_code ON types_cours(code);
CREATE INDEX idx_types_cours_actif ON types_cours(actif);

-- Données initiales (exemples - à adapter selon votre club)
INSERT INTO types_cours (code, nom, description, couleur, duree_defaut_minutes, ordre) VALUES
  ('karate', 'Karaté', 'Art martial japonais traditionnel', 'blue', 60, 1),
  ('judo', 'Judo', 'Art martial et sport de combat', 'green', 60, 2),
  ('taekwondo', 'Taekwondo', 'Art martial coréen', 'red', 60, 3),
  ('aikido', 'Aïkido', 'Art martial japonais défensif', 'purple', 60, 4),
  ('kendo', 'Kendo', 'Escrime japonaise', 'orange', 60, 5)
ON CONFLICT (code) DO NOTHING;

-- Migration des types de cours existants depuis texte libre
-- Cette requête crée des entrées pour tous les types uniques trouvés
INSERT INTO types_cours (code, nom, ordre)
SELECT
  LOWER(REPLACE(REPLACE(type_cours, ' ', '_'), 'é', 'e')) as code,
  type_cours as nom,
  ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC, type_cours) + 100 as ordre
FROM cours_recurrents
WHERE type_cours IS NOT NULL
  AND type_cours != ''
  AND NOT EXISTS (
    SELECT 1 FROM types_cours WHERE LOWER(REPLACE(REPLACE(cours_recurrents.type_cours, ' ', '_'), 'é', 'e')) = types_cours.code
  )
GROUP BY type_cours
ON CONFLICT (code) DO NOTHING;

-- Ajouter la colonne type_cours_id aux tables existantes
ALTER TABLE cours_recurrents
ADD COLUMN IF NOT EXISTS type_cours_id INTEGER REFERENCES types_cours(id);

ALTER TABLE cours
ADD COLUMN IF NOT EXISTS type_cours_id INTEGER REFERENCES types_cours(id);

-- Lier les cours existants aux nouveaux types
UPDATE cours_recurrents cr
SET type_cours_id = tc.id
FROM types_cours tc
WHERE LOWER(REPLACE(REPLACE(cr.type_cours, ' ', '_'), 'é', 'e')) = tc.code
  AND cr.type_cours_id IS NULL;

UPDATE cours c
SET type_cours_id = tc.id
FROM types_cours tc
WHERE LOWER(REPLACE(REPLACE(c.type_cours, ' ', '_'), 'é', 'e')) = tc.code
  AND c.type_cours_id IS NULL;

COMMENT ON TABLE types_cours IS 'Types de cours disponibles dans le club';


-- ============================================================================
-- PHASE 2: TABLES IMPORTANTES (Moyenne priorité)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 4. STATUTS DE PAIEMENT
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS statuts_paiement (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  nom VARCHAR(100) NOT NULL,
  description TEXT,
  couleur VARCHAR(20) DEFAULT 'neutral',
  ordre INTEGER NOT NULL,
  compte_dans_revenus BOOLEAN DEFAULT false,  -- Pour statistiques financières
  est_final BOOLEAN DEFAULT false,
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index
CREATE INDEX idx_statuts_paiement_code ON statuts_paiement(code);
CREATE INDEX idx_statuts_paiement_actif ON statuts_paiement(actif);

-- Données initiales
INSERT INTO statuts_paiement (code, nom, description, couleur, ordre, compte_dans_revenus, est_final) VALUES
  ('en_attente', 'En attente', 'Paiement en attente de validation', 'warning', 1, false, false),
  ('paye', 'Payé', 'Paiement effectué et validé', 'success', 2, true, true),
  ('valide', 'Validé', 'Paiement validé par le système', 'success', 3, true, true),
  ('partiel', 'Partiel', 'Paiement partiel reçu', 'info', 4, false, false),
  ('echoue', 'Échoué', 'Paiement échoué ou rejeté', 'danger', 5, false, true),
  ('rembourse', 'Remboursé', 'Paiement remboursé au client', 'purple', 6, false, true),
  ('annule', 'Annulé', 'Paiement annulé', 'danger', 7, false, true)
ON CONFLICT (code) DO NOTHING;

COMMENT ON TABLE statuts_paiement IS 'Statuts possibles pour les paiements';
COMMENT ON COLUMN statuts_paiement.compte_dans_revenus IS 'Inclus dans le calcul des revenus totaux';


-- ----------------------------------------------------------------------------
-- 5. RÔLES UTILISATEURS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  nom VARCHAR(100) NOT NULL,
  description TEXT,
  couleur VARCHAR(20) DEFAULT 'neutral',
  niveau_acces INTEGER NOT NULL,        -- 1=membre, 2=parent, 3=professeur, 4=admin
  permissions JSONB,                    -- Permissions spécifiques {"can_edit_users": true, ...}
  ordre INTEGER,
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index
CREATE INDEX idx_roles_code ON roles(code);
CREATE INDEX idx_roles_actif ON roles(actif);
CREATE INDEX idx_roles_niveau_acces ON roles(niveau_acces);

-- Données initiales
INSERT INTO roles (code, nom, description, couleur, niveau_acces, ordre) VALUES
  ('member', 'Membre', 'Membre standard du club', 'success', 1, 1),
  ('parent', 'Parent', 'Parent d''un membre', 'info', 2, 2),
  ('professor', 'Professeur', 'Enseignant / Instructeur', 'purple', 3, 3),
  ('admin', 'Administrateur', 'Administrateur système', 'danger', 4, 4)
ON CONFLICT (code) DO NOTHING;

COMMENT ON TABLE roles IS 'Rôles applicatifs des utilisateurs';
COMMENT ON COLUMN roles.niveau_acces IS 'Niveau d''accès croissant (1=minimum, 4=maximum)';


-- ----------------------------------------------------------------------------
-- 6. STATUTS UTILISATEUR
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS statuts_utilisateur (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  nom VARCHAR(100) NOT NULL,
  description TEXT,
  couleur VARCHAR(20) DEFAULT 'neutral',
  peut_se_connecter BOOLEAN DEFAULT true,
  ordre INTEGER,
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index
CREATE INDEX idx_statuts_utilisateur_code ON statuts_utilisateur(code);
CREATE INDEX idx_statuts_utilisateur_actif ON statuts_utilisateur(actif);

-- Données initiales avec ID fixes (pour compatibilité)
INSERT INTO statuts_utilisateur (id, code, nom, description, couleur, peut_se_connecter, ordre) VALUES
  (1, 'actif', 'Actif', 'Utilisateur actif', 'success', true, 1),
  (2, 'inactif', 'Inactif', 'Utilisateur inactif', 'neutral', false, 2),
  (3, 'suspendu', 'Suspendu', 'Utilisateur temporairement suspendu', 'orange', false, 3),
  (4, 'en_attente', 'En attente', 'Compte en attente de validation', 'warning', false, 4),
  (5, 'archive', 'Archivé', 'Compte archivé', 'danger', false, 5)
ON CONFLICT (id) DO NOTHING;

-- Réinitialiser la séquence
SELECT setval('statuts_utilisateur_id_seq', (SELECT MAX(id) FROM statuts_utilisateur));

COMMENT ON TABLE statuts_utilisateur IS 'Statuts du cycle de vie d''un utilisateur';


-- ============================================================================
-- PHASE 3: TABLES SOUHAITABLES (Basse priorité)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 7. RÔLES FAMILIAUX
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles_familiaux (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  nom VARCHAR(100) NOT NULL,
  description TEXT,
  couleur_avatar VARCHAR(50),           -- Classe Tailwind (ex: 'bg-green-500')
  couleur_badge VARCHAR(100),           -- Classes Tailwind (ex: 'bg-green-100 text-green-700')
  ordre INTEGER,
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index
CREATE INDEX idx_roles_familiaux_code ON roles_familiaux(code);
CREATE INDEX idx_roles_familiaux_actif ON roles_familiaux(actif);

-- Données initiales
INSERT INTO roles_familiaux (code, nom, description, couleur_avatar, couleur_badge, ordre) VALUES
  ('parent', 'Parent', 'Parent titulaire du compte', 'bg-green-500', 'bg-green-100 text-green-700', 1),
  ('tuteur', 'Tuteur légal', 'Tuteur légal de l''enfant', 'bg-yellow-500', 'bg-yellow-100 text-yellow-700', 2),
  ('conjoint', 'Conjoint', 'Conjoint / Partenaire', 'bg-purple-500', 'bg-purple-100 text-purple-700', 3),
  ('enfant', 'Enfant', 'Enfant du titulaire', 'bg-blue-500', 'bg-blue-100 text-blue-700', 4),
  ('autre', 'Autre', 'Autre lien familial', 'bg-gray-400', 'bg-gray-100 text-gray-600', 5)
ON CONFLICT (code) DO NOTHING;

COMMENT ON TABLE roles_familiaux IS 'Rôles des membres d''une famille';


-- ----------------------------------------------------------------------------
-- 8. STATUTS DE PRÉSENCE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS statuts_presence (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  nom VARCHAR(100) NOT NULL,
  description TEXT,
  couleur VARCHAR(20) DEFAULT 'neutral',
  compte_comme_present BOOLEAN DEFAULT false,  -- Pour statistiques
  ordre INTEGER,
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index
CREATE INDEX idx_statuts_presence_code ON statuts_presence(code);
CREATE INDEX idx_statuts_presence_actif ON statuts_presence(actif);

-- Données initiales avec ID fixes (pour compatibilité)
INSERT INTO statuts_presence (id, code, nom, description, couleur, compte_comme_present, ordre) VALUES
  (1, 'present', 'Présent', 'Élève présent au cours', 'success', true, 1),
  (2, 'absent', 'Absent', 'Élève absent', 'danger', false, 2),
  (3, 'retard', 'En retard', 'Élève arrivé en retard', 'warning', true, 3),
  (4, 'excuse', 'Excusé', 'Absence justifiée', 'info', false, 4)
ON CONFLICT (id) DO NOTHING;

-- Réinitialiser la séquence
SELECT setval('statuts_presence_id_seq', (SELECT MAX(id) FROM statuts_presence));

COMMENT ON TABLE statuts_presence IS 'Statuts de présence aux cours';


-- ----------------------------------------------------------------------------
-- 9. GENRES (si pas déjà existant)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS genres (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,
  nom VARCHAR(50) NOT NULL,
  ordre INTEGER
);

-- Index
CREATE INDEX IF NOT EXISTS idx_genres_code ON genres(code);

-- Données initiales avec ID fixes
INSERT INTO genres (id, code, nom, ordre) VALUES
  (1, 'M', 'Homme', 1),
  (2, 'F', 'Femme', 2),
  (3, 'AUTRE', 'Autre', 3)
ON CONFLICT (id) DO NOTHING;

-- Réinitialiser la séquence
SELECT setval('genres_id_seq', (SELECT MAX(id) FROM genres));

COMMENT ON TABLE genres IS 'Genres / Sexes';


-- ----------------------------------------------------------------------------
-- 10. JOURS DE LA SEMAINE (optionnel)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS jours_semaine (
  id INTEGER PRIMARY KEY CHECK (id BETWEEN 1 AND 7),
  code VARCHAR(3) NOT NULL,             -- MON, TUE, WED, etc.
  nom_court VARCHAR(10) NOT NULL,       -- Lun, Mar, Mer, etc.
  nom_complet VARCHAR(20) NOT NULL,     -- Lundi, Mardi, etc.
  ordre_affichage INTEGER,              -- Pour personnaliser l'ordre
  UNIQUE(code)
);

-- Données initiales (ISO 8601: 1=Lundi, 7=Dimanche)
INSERT INTO jours_semaine (id, code, nom_court, nom_complet, ordre_affichage) VALUES
  (1, 'MON', 'Lun', 'Lundi', 1),
  (2, 'TUE', 'Mar', 'Mardi', 2),
  (3, 'WED', 'Mer', 'Mercredi', 3),
  (4, 'THU', 'Jeu', 'Jeudi', 4),
  (5, 'FRI', 'Ven', 'Vendredi', 5),
  (6, 'SAT', 'Sam', 'Samedi', 6),
  (7, 'SUN', 'Dim', 'Dimanche', 7)
ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE jours_semaine IS 'Jours de la semaine (ISO 8601)';


-- ============================================================================
-- TRIGGERS POUR updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Appliquer aux tables avec updated_at
CREATE TRIGGER update_methodes_paiement_updated_at BEFORE UPDATE ON methodes_paiement
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_statuts_commande_updated_at BEFORE UPDATE ON statuts_commande
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_types_cours_updated_at BEFORE UPDATE ON types_cours
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_statuts_paiement_updated_at BEFORE UPDATE ON statuts_paiement
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================================
-- VUES UTILITAIRES
-- ============================================================================

-- Vue pour lister toutes les valeurs de référence actives
CREATE OR REPLACE VIEW v_references_actives AS
SELECT 'methodes_paiement' as type_reference, code, nom, couleur, ordre, actif FROM methodes_paiement
UNION ALL
SELECT 'statuts_commande', code, nom, couleur, ordre, actif FROM statuts_commande
UNION ALL
SELECT 'types_cours', code, nom, couleur, ordre, actif FROM types_cours
UNION ALL
SELECT 'statuts_paiement', code, nom, couleur, ordre, actif FROM statuts_paiement
UNION ALL
SELECT 'roles', code, nom, couleur, ordre, actif FROM roles
UNION ALL
SELECT 'statuts_utilisateur', code, nom, couleur, ordre, actif FROM statuts_utilisateur
UNION ALL
SELECT 'roles_familiaux', code, nom, NULL as couleur, ordre, actif FROM roles_familiaux
UNION ALL
SELECT 'statuts_presence', code, nom, couleur, ordre, actif FROM statuts_presence
ORDER BY type_reference, ordre;


-- ============================================================================
-- VALIDATION POST-MIGRATION
-- ============================================================================

-- Vérifier que toutes les tables ont été créées
DO $$
DECLARE
  tables_manquantes TEXT[];
BEGIN
  SELECT array_agg(table_name)
  INTO tables_manquantes
  FROM (VALUES
    ('methodes_paiement'),
    ('statuts_commande'),
    ('types_cours'),
    ('statuts_paiement'),
    ('roles'),
    ('statuts_utilisateur'),
    ('roles_familiaux'),
    ('statuts_presence'),
    ('genres')
  ) AS expected(table_name)
  WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = expected.table_name
  );

  IF array_length(tables_manquantes, 1) > 0 THEN
    RAISE EXCEPTION 'Tables manquantes: %', array_to_string(tables_manquantes, ', ');
  ELSE
    RAISE NOTICE '✓ Toutes les tables de référence ont été créées avec succès';
  END IF;
END $$;

-- Compter les enregistrements
SELECT
  'methodes_paiement' as table_name, COUNT(*) as nb_records FROM methodes_paiement
UNION ALL SELECT 'statuts_commande', COUNT(*) FROM statuts_commande
UNION ALL SELECT 'types_cours', COUNT(*) FROM types_cours
UNION ALL SELECT 'statuts_paiement', COUNT(*) FROM statuts_paiement
UNION ALL SELECT 'roles', COUNT(*) FROM roles
UNION ALL SELECT 'statuts_utilisateur', COUNT(*) FROM statuts_utilisateur
UNION ALL SELECT 'roles_familiaux', COUNT(*) FROM roles_familiaux
UNION ALL SELECT 'statuts_presence', COUNT(*) FROM statuts_presence
UNION ALL SELECT 'genres', COUNT(*) FROM genres;

COMMIT;

-- ============================================================================
-- ROLLBACK (à exécuter UNIQUEMENT en cas de problème)
-- ============================================================================
/*
BEGIN;

-- Supprimer les triggers
DROP TRIGGER IF EXISTS update_methodes_paiement_updated_at ON methodes_paiement;
DROP TRIGGER IF EXISTS update_statuts_commande_updated_at ON statuts_commande;
DROP TRIGGER IF EXISTS update_types_cours_updated_at ON types_cours;
DROP TRIGGER IF EXISTS update_statuts_paiement_updated_at ON statuts_paiement;
DROP TRIGGER IF EXISTS update_roles_updated_at ON roles;

-- Supprimer la fonction
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Supprimer la vue
DROP VIEW IF EXISTS v_references_actives;

-- Supprimer les colonnes ajoutées
ALTER TABLE cours_recurrents DROP COLUMN IF EXISTS type_cours_id;
ALTER TABLE cours DROP COLUMN IF EXISTS type_cours_id;

-- Supprimer les tables (dans l'ordre inverse des dépendances)
DROP TABLE IF EXISTS transitions_statut_commande CASCADE;
DROP TABLE IF EXISTS jours_semaine CASCADE;
DROP TABLE IF EXISTS statuts_presence CASCADE;
DROP TABLE IF EXISTS roles_familiaux CASCADE;
DROP TABLE IF EXISTS statuts_utilisateur CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS statuts_paiement CASCADE;
DROP TABLE IF EXISTS types_cours CASCADE;
DROP TABLE IF EXISTS statuts_commande CASCADE;
DROP TABLE IF EXISTS methodes_paiement CASCADE;
DROP TABLE IF EXISTS genres CASCADE;

COMMIT;
*/

-- ============================================================================
-- FIN DE LA MIGRATION
-- ============================================================================
-- Prochaines étapes:
-- 1. Créer les endpoints API pour exposer ces données
-- 2. Créer le hook useReferences() dans le frontend
-- 3. Migrer progressivement les composants React
-- 4. Supprimer les valeurs hardcodées du code
-- ============================================================================
