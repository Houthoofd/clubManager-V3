-- ============================================================================
-- MIGRATION V4.6: TABLES DE RÉFÉRENCE - PHASE 1 (CRITIQUE)
-- ============================================================================
-- Date        : Décembre 2024
-- Version     : 4.6
-- Moteur      : MySQL 8.0+
-- Idempotent  : Oui (safe à ré-exécuter — CREATE TABLE IF NOT EXISTS +
--               INSERT IGNORE)
--
-- PHASE 1 INCLUT:
--   1. methodes_paiement  (especes, virement, stripe, autre)
--   2. statuts_commande   (en_attente, payee, livree, annulee, etc.)
--   3. transitions_statut_commande (workflow)
--   4. types_cours        (karate, judo, taekwondo, etc.)
--
-- ROLLBACK:
--   DROP TABLE IF EXISTS transitions_statut_commande;
--   DROP TABLE IF EXISTS statuts_commande;
--   DROP TABLE IF EXISTS methodes_paiement;
--   DROP TABLE IF EXISTS types_cours;
-- ============================================================================

-- ============================================================================
-- 1. MÉTHODES DE PAIEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS methodes_paiement (
  id                INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  code              VARCHAR(50)     NOT NULL,
  nom               VARCHAR(100)    NOT NULL,
  nom_en            VARCHAR(100)    DEFAULT NULL,
  description       TEXT            DEFAULT NULL,
  description_en    TEXT            DEFAULT NULL,
  icone             VARCHAR(50)     DEFAULT NULL   COMMENT 'Nom du composant React icône',
  couleur           VARCHAR(20)     NOT NULL DEFAULT 'neutral' COMMENT 'Variant badge: success, info, purple, warning, danger, neutral',
  ordre             INT             NOT NULL DEFAULT 99,
  actif             TINYINT(1)      NOT NULL DEFAULT 1,
  visible_frontend  TINYINT(1)      NOT NULL DEFAULT 1 COMMENT 'Affiché dans les sélecteurs côté utilisateur',
  visible_admin     TINYINT(1)      NOT NULL DEFAULT 1 COMMENT 'Affiché dans les interfaces admin',
  created_at        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_methodes_paiement_code (code),
  KEY idx_methodes_paiement_actif  (actif),
  KEY idx_methodes_paiement_ordre  (ordre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Table de référence : Méthodes de paiement disponibles';

INSERT IGNORE INTO methodes_paiement
  (code, nom, nom_en, description, description_en, icone, couleur, ordre, actif, visible_frontend, visible_admin)
VALUES
  ('especes',  'Espèces',          'Cash',          'Paiement en argent liquide',       'Cash payment',                  'BanknotesIcon',       'success', 1, 1, 1, 1),
  ('virement', 'Virement bancaire','Bank transfer',  'Virement SEPA ou autre',           'SEPA or other bank transfer',   'BuildingLibraryIcon', 'purple',  2, 1, 1, 1),
  ('stripe',   'Carte bancaire',   'Credit card',    'Paiement en ligne via Stripe',     'Online payment via Stripe',     'CreditCardIcon',      'info',    3, 1, 1, 1),
  ('autre',    'Autre',            'Other',          'Autre mode de paiement',           'Other payment method',          'TagIcon',             'neutral', 4, 1, 1, 1);


-- ============================================================================
-- 2. STATUTS DE COMMANDE
-- ============================================================================

CREATE TABLE IF NOT EXISTS statuts_commande (
  id             INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  code           VARCHAR(50)   NOT NULL,
  nom            VARCHAR(100)  NOT NULL,
  nom_en         VARCHAR(100)  DEFAULT NULL,
  description    TEXT          DEFAULT NULL,
  description_en TEXT          DEFAULT NULL,
  couleur        VARCHAR(20)   NOT NULL DEFAULT 'neutral' COMMENT 'Variant badge: success, warning, danger, info, neutral, purple',
  ordre          INT           NOT NULL DEFAULT 99,
  est_final      TINYINT(1)    NOT NULL DEFAULT 0 COMMENT 'Aucune transition possible depuis cet état',
  peut_modifier  TINYINT(1)    NOT NULL DEFAULT 1 COMMENT 'Modification des articles autorisée',
  peut_annuler   TINYINT(1)    NOT NULL DEFAULT 1 COMMENT 'Annulation autorisée',
  compte_stock   TINYINT(1)    NOT NULL DEFAULT 0 COMMENT 'Décrémente le stock des articles',
  actif          TINYINT(1)    NOT NULL DEFAULT 1,
  created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_statuts_commande_code  (code),
  KEY idx_statuts_commande_actif       (actif),
  KEY idx_statuts_commande_est_final   (est_final),
  KEY idx_statuts_commande_ordre       (ordre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Table de référence : Statuts du cycle de vie d une commande';

INSERT IGNORE INTO statuts_commande
  (code, nom, nom_en, description, description_en, couleur, ordre, est_final, peut_modifier, peut_annuler, compte_stock)
VALUES
  ('en_attente', 'En attente', 'Pending',   'Commande en attente de paiement',       'Order pending payment',         'warning', 1, 0, 1, 1, 0),
  ('en_cours',   'En cours',   'In progress','Commande en cours de préparation',     'Order being prepared',          'info',    2, 0, 1, 1, 0),
  ('payee',      'Payée',      'Paid',       'Commande payée, prête à être expédiée','Order paid, ready to ship',     'info',    3, 0, 1, 1, 0),
  ('expediee',   'Expédiée',   'Shipped',    'Commande expédiée',                    'Order shipped',                 'purple',  4, 0, 0, 1, 1),
  ('prete',      'Prête',      'Ready',      'Commande prête pour retrait',          'Order ready for pickup',        'purple',  5, 0, 0, 1, 1),
  ('livree',     'Livrée',     'Delivered',  'Commande livrée au client',            'Order delivered to customer',   'success', 6, 1, 0, 0, 1),
  ('annulee',    'Annulée',    'Cancelled',  'Commande annulée',                     'Order cancelled',               'danger',  7, 1, 0, 0, 0);


-- ============================================================================
-- 3. TRANSITIONS DE STATUT (WORKFLOW COMMANDES)
-- ============================================================================

CREATE TABLE IF NOT EXISTS transitions_statut_commande (
  id                INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  statut_depart_id  INT UNSIGNED  NOT NULL,
  statut_arrivee_id INT UNSIGNED  NOT NULL,
  role_requis       VARCHAR(50)   DEFAULT NULL COMMENT 'NULL = tous les rôles, sinon: admin, professor...',
  description       TEXT          DEFAULT NULL,
  description_en    TEXT          DEFAULT NULL,
  ordre_priorite    INT           NOT NULL DEFAULT 100,
  actif             TINYINT(1)    NOT NULL DEFAULT 1,
  created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_transition (statut_depart_id, statut_arrivee_id),
  KEY idx_transitions_depart  (statut_depart_id),
  KEY idx_transitions_arrivee (statut_arrivee_id),
  KEY idx_transitions_actif   (actif),
  CONSTRAINT fk_transition_depart  FOREIGN KEY (statut_depart_id)  REFERENCES statuts_commande(id) ON DELETE CASCADE,
  CONSTRAINT fk_transition_arrivee FOREIGN KEY (statut_arrivee_id) REFERENCES statuts_commande(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Transitions autorisées entre statuts de commande (workflow)';

-- Insertion des transitions via sous-requêtes (idempotent grâce à INSERT IGNORE)
INSERT IGNORE INTO transitions_statut_commande
  (statut_depart_id, statut_arrivee_id, role_requis, description, description_en, ordre_priorite)
VALUES
  -- Depuis en_attente
  ((SELECT id FROM statuts_commande WHERE code = 'en_attente'),
   (SELECT id FROM statuts_commande WHERE code = 'payee'),
   NULL, 'Paiement reçu', 'Payment received', 1),

  ((SELECT id FROM statuts_commande WHERE code = 'en_attente'),
   (SELECT id FROM statuts_commande WHERE code = 'annulee'),
   NULL, 'Annuler la commande', 'Cancel order', 99),

  -- Depuis en_cours
  ((SELECT id FROM statuts_commande WHERE code = 'en_cours'),
   (SELECT id FROM statuts_commande WHERE code = 'payee'),
   'admin', 'Marquer comme payée', 'Mark as paid', 1),

  ((SELECT id FROM statuts_commande WHERE code = 'en_cours'),
   (SELECT id FROM statuts_commande WHERE code = 'annulee'),
   'admin', 'Annuler la commande', 'Cancel order', 99),

  -- Depuis payee
  ((SELECT id FROM statuts_commande WHERE code = 'payee'),
   (SELECT id FROM statuts_commande WHERE code = 'expediee'),
   'admin', 'Expédier la commande', 'Ship order', 1),

  ((SELECT id FROM statuts_commande WHERE code = 'payee'),
   (SELECT id FROM statuts_commande WHERE code = 'prete'),
   'admin', 'Marquer comme prête', 'Mark as ready', 2),

  ((SELECT id FROM statuts_commande WHERE code = 'payee'),
   (SELECT id FROM statuts_commande WHERE code = 'annulee'),
   'admin', 'Annuler la commande', 'Cancel order', 99),

  -- Depuis expediee
  ((SELECT id FROM statuts_commande WHERE code = 'expediee'),
   (SELECT id FROM statuts_commande WHERE code = 'livree'),
   'admin', 'Confirmer la livraison', 'Confirm delivery', 1),

  -- Depuis prete
  ((SELECT id FROM statuts_commande WHERE code = 'prete'),
   (SELECT id FROM statuts_commande WHERE code = 'livree'),
   'admin', 'Confirmer le retrait', 'Confirm pickup', 1);


-- ============================================================================
-- 4. TYPES DE COURS
-- ============================================================================

CREATE TABLE IF NOT EXISTS types_cours (
  id                     INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  code                   VARCHAR(50)   NOT NULL,
  nom                    VARCHAR(100)  NOT NULL,
  nom_en                 VARCHAR(100)  DEFAULT NULL,
  description            TEXT          DEFAULT NULL,
  description_en         TEXT          DEFAULT NULL,
  couleur                VARCHAR(20)   NOT NULL DEFAULT 'blue',
  duree_defaut_minutes   INT           NOT NULL DEFAULT 60,
  capacite_max_defaut    INT           DEFAULT NULL,
  niveau                 VARCHAR(50)   DEFAULT NULL COMMENT 'debutant, intermediaire, avance, tous',
  icone                  VARCHAR(50)   DEFAULT NULL,
  ordre                  INT           NOT NULL DEFAULT 99,
  actif                  TINYINT(1)    NOT NULL DEFAULT 1,
  created_at             DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at             DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_types_cours_code (code),
  KEY idx_types_cours_actif  (actif),
  KEY idx_types_cours_ordre  (ordre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Table de référence : Types de cours disponibles dans le club';

-- Données initiales — à adapter selon les disciplines réelles du club
INSERT IGNORE INTO types_cours
  (code, nom, nom_en, description, description_en, couleur, duree_defaut_minutes, ordre, actif)
VALUES
  ('karate',    'Karaté',    'Karate',    'Art martial japonais traditionnel',  'Traditional Japanese martial art',  'blue',   60, 1,  1),
  ('judo',      'Judo',      'Judo',      'Art martial et sport de combat',     'Martial art and combat sport',      'green',  60, 2,  1),
  ('taekwondo', 'Taekwondo', 'Taekwondo', 'Art martial coréen',                 'Korean martial art',                'red',    60, 3,  1),
  ('aikido',    'Aïkido',    'Aikido',    'Art martial japonais défensif',      'Japanese defensive martial art',    'purple', 60, 4,  1),
  ('kendo',     'Kendo',     'Kendo',     'Escrime japonaise',                  'Japanese fencing',                  'orange', 60, 5,  1),
  ('autre',     'Autre',     'Other',     'Autre type de cours',                'Other course type',                 'gray',   60, 99, 1);


-- ============================================================================
-- VÉRIFICATIONS POST-MIGRATION
-- ============================================================================

SELECT 'methodes_paiement'        AS table_name, COUNT(*) AS nb_lignes FROM methodes_paiement
UNION ALL
SELECT 'statuts_commande'         AS table_name, COUNT(*) AS nb_lignes FROM statuts_commande
UNION ALL
SELECT 'transitions_statut_commande' AS table_name, COUNT(*) AS nb_lignes FROM transitions_statut_commande
UNION ALL
SELECT 'types_cours'              AS table_name, COUNT(*) AS nb_lignes FROM types_cours;

-- ============================================================================
-- FIN DE LA MIGRATION V4.6 (idempotente — MySQL)
-- ============================================================================
