-- =============================================================
-- V4.7__reference_tables_phase2.sql
-- Migration Phase 2 — Tables de référence supplémentaires
-- Tables : statuts_paiement, statuts_echeance, roles_utilisateur,
--          roles_familial, genres
-- =============================================================

BEGIN;

-- =============================================================
-- TABLE : statuts_paiement
-- =============================================================

CREATE TABLE IF NOT EXISTS statuts_paiement (
  id                   SERIAL PRIMARY KEY,
  code                 VARCHAR(50)  UNIQUE NOT NULL,
  nom                  VARCHAR(100) NOT NULL,
  nom_en               VARCHAR(100),
  couleur              VARCHAR(20)  DEFAULT 'neutral',
  ordre                INTEGER      NOT NULL,
  compte_dans_revenus  BOOLEAN      DEFAULT false,
  est_final            BOOLEAN      DEFAULT false,
  actif                BOOLEAN      DEFAULT true,
  created_at           TIMESTAMP    DEFAULT NOW()
);

INSERT INTO statuts_paiement (code, nom, nom_en, couleur, ordre, compte_dans_revenus, est_final) VALUES
  ('en_attente', 'En attente',  'Pending',   'warning', 1, false, false),
  ('valide',     'Validé',      'Validated', 'info',    2, false, false),
  ('paye',       'Payé',        'Paid',      'success', 3, true,  true),
  ('partiel',    'Partiel',     'Partial',   'orange',  4, true,  false),
  ('echoue',     'Échoué',      'Failed',    'danger',  5, false, true),
  ('rembourse',  'Remboursé',   'Refunded',  'purple',  6, false, true),
  ('annule',     'Annulé',      'Cancelled', 'neutral', 7, false, true)
ON CONFLICT (code) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_statuts_paiement_actif  ON statuts_paiement (actif);
CREATE INDEX IF NOT EXISTS idx_statuts_paiement_ordre  ON statuts_paiement (ordre);
CREATE INDEX IF NOT EXISTS idx_statuts_paiement_code   ON statuts_paiement (code);

-- =============================================================
-- TABLE : statuts_echeance
-- =============================================================

CREATE TABLE IF NOT EXISTS statuts_echeance (
  id         SERIAL PRIMARY KEY,
  code       VARCHAR(50)  UNIQUE NOT NULL,
  nom        VARCHAR(100) NOT NULL,
  nom_en     VARCHAR(100),
  couleur    VARCHAR(20)  DEFAULT 'neutral',
  ordre      INTEGER      NOT NULL,
  est_final  BOOLEAN      DEFAULT false,
  actif      BOOLEAN      DEFAULT true,
  created_at TIMESTAMP    DEFAULT NOW()
);

INSERT INTO statuts_echeance (code, nom, nom_en, couleur, ordre, est_final) VALUES
  ('en_attente', 'En attente', 'Pending',  'warning', 1, false),
  ('paye',       'Payé',       'Paid',     'success', 2, true),
  ('en_retard',  'En retard',  'Overdue',  'danger',  3, false),
  ('annule',     'Annulé',     'Cancelled','neutral', 4, true)
ON CONFLICT (code) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_statuts_echeance_actif  ON statuts_echeance (actif);
CREATE INDEX IF NOT EXISTS idx_statuts_echeance_ordre  ON statuts_echeance (ordre);
CREATE INDEX IF NOT EXISTS idx_statuts_echeance_code   ON statuts_echeance (code);

-- =============================================================
-- TABLE : roles_utilisateur
-- =============================================================

CREATE TABLE IF NOT EXISTS roles_utilisateur (
  id            SERIAL PRIMARY KEY,
  code          VARCHAR(50)  UNIQUE NOT NULL,
  nom           VARCHAR(100) NOT NULL,
  nom_en        VARCHAR(100),
  couleur       VARCHAR(20)  DEFAULT 'neutral',
  niveau_acces  INTEGER      NOT NULL DEFAULT 1,
  ordre         INTEGER      NOT NULL,
  actif         BOOLEAN      DEFAULT true,
  created_at    TIMESTAMP    DEFAULT NOW()
);

INSERT INTO roles_utilisateur (code, nom, nom_en, couleur, niveau_acces, ordre) VALUES
  ('admin',     'Administrateur', 'Administrator', 'danger', 100, 1),
  ('professor', 'Professeur',     'Professor',     'purple',  50, 2),
  ('member',    'Membre',         'Member',        'success', 10, 3),
  ('parent',    'Parent',         'Parent',        'info',    10, 4)
ON CONFLICT (code) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_roles_utilisateur_actif  ON roles_utilisateur (actif);
CREATE INDEX IF NOT EXISTS idx_roles_utilisateur_ordre  ON roles_utilisateur (ordre);
CREATE INDEX IF NOT EXISTS idx_roles_utilisateur_code   ON roles_utilisateur (code);

-- =============================================================
-- TABLE : roles_familial
-- =============================================================

CREATE TABLE IF NOT EXISTS roles_familial (
  id         SERIAL PRIMARY KEY,
  code       VARCHAR(50)  UNIQUE NOT NULL,
  nom        VARCHAR(100) NOT NULL,
  nom_en     VARCHAR(100),
  couleur    VARCHAR(20)  DEFAULT 'neutral',
  ordre      INTEGER      NOT NULL,
  actif      BOOLEAN      DEFAULT true,
  created_at TIMESTAMP    DEFAULT NOW()
);

INSERT INTO roles_familial (code, nom, nom_en, couleur, ordre) VALUES
  ('parent',   'Parent',        'Parent',        'blue',    1),
  ('tuteur',   'Tuteur légal',  'Legal guardian','purple',  2),
  ('enfant',   'Enfant',        'Child',         'green',   3),
  ('conjoint', 'Conjoint',      'Spouse',        'info',    4),
  ('autre',    'Autre',         'Other',         'neutral', 5)
ON CONFLICT (code) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_roles_familial_actif  ON roles_familial (actif);
CREATE INDEX IF NOT EXISTS idx_roles_familial_ordre  ON roles_familial (ordre);
CREATE INDEX IF NOT EXISTS idx_roles_familial_code   ON roles_familial (code);

-- =============================================================
-- TABLE : genres
-- =============================================================

CREATE TABLE IF NOT EXISTS genres (
  id         SERIAL PRIMARY KEY,
  code       VARCHAR(10)  UNIQUE NOT NULL,
  nom        VARCHAR(50)  NOT NULL,
  nom_en     VARCHAR(50),
  ordre      INTEGER      NOT NULL,
  actif      BOOLEAN      DEFAULT true,
  created_at TIMESTAMP    DEFAULT NOW()
);

INSERT INTO genres (code, nom, nom_en, ordre) VALUES
  ('M',     'Homme', 'Male',   1),
  ('F',     'Femme', 'Female', 2),
  ('autre', 'Autre', 'Other',  3)
ON CONFLICT (code) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_genres_actif  ON genres (actif);
CREATE INDEX IF NOT EXISTS idx_genres_ordre  ON genres (ordre);
CREATE INDEX IF NOT EXISTS idx_genres_code   ON genres (code);

-- =============================================================

COMMIT;
