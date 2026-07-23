-- ============================================================================
-- FICHIER DE CONSOLIDATION DES TRIGGERS — v5.2 (adapté schéma v5.1)
-- ============================================================================
-- Corrections appliquées :
--   - utilisateur_id → user_id
--   - abonnement_id  → plan_tarifaire_id
--   - statut (ENUM)  → statut_id (FK vers statuts_echeance / statuts_paiement)
--   - Suppression des colonnes periode_debut/periode_fin (inexistantes en v5.1)
--   - after_echeance_paiement_update simplifié (lie echeance↔paiement via paiement_id)
-- ============================================================================

-- ============================================================================
-- SECTION 1: TRIGGER AFTER INSERT ON utilisateurs
-- ============================================================================

DELIMITER //

DROP TRIGGER IF EXISTS after_utilisateur_insert//

CREATE TRIGGER after_utilisateur_insert
AFTER INSERT ON utilisateurs
FOR EACH ROW
BEGIN
    DECLARE v_abonnement_id   INT;
    DECLARE v_date_inscription DATE;
    DECLARE v_periode         VARCHAR(20);
    DECLARE v_prix            DECIMAL(10, 2);
    DECLARE v_n               INT DEFAULT 0;
    DECLARE v_date_echeance   DATE;
    DECLARE v_montant         DECIMAL(10, 2);
    DECLARE v_season_start    DATE DEFAULT '2025-09-01';
    DECLARE v_season_end      DATE DEFAULT '2026-08-31';
    DECLARE v_statut_id       INT;

    SET v_abonnement_id = NEW.abonnement_id;
    SELECT id INTO v_statut_id FROM statuts_echeance WHERE code = 'en_attente' LIMIT 1;

    IF v_abonnement_id IS NOT NULL THEN
        SELECT periode, prix INTO v_periode, v_prix
        FROM plans_tarifaires WHERE id = v_abonnement_id;

        SET v_date_inscription = GREATEST(NEW.date_inscription, v_season_start);

        WHILE v_n <= 12 DO
            CASE
                WHEN v_periode = 'mois' THEN
                    SET v_date_echeance = LAST_DAY(DATE_ADD(v_date_inscription, INTERVAL v_n MONTH));
                WHEN v_periode = 'trimestre' THEN
                    SET v_date_echeance = LAST_DAY(DATE_ADD(v_date_inscription, INTERVAL v_n * 3 MONTH));
                WHEN v_periode = 'an' THEN
                    SET v_date_echeance = LAST_DAY(DATE_ADD(v_date_inscription, INTERVAL v_n YEAR));
            END CASE;

            IF v_date_echeance BETWEEN v_season_start AND v_season_end THEN
                IF v_n = 0 THEN
                    SET v_montant = ROUND(
                        v_prix *
                        CASE v_periode
                            WHEN 'mois' THEN
                                (DAY(LAST_DAY(v_date_inscription)) - DAY(v_date_inscription) + 1)
                                / DAY(LAST_DAY(v_date_inscription))
                            WHEN 'trimestre' THEN
                                (DATEDIFF(LAST_DAY(DATE_ADD(v_date_inscription, INTERVAL 2 MONTH)), v_date_inscription) + 1) /
                                DATEDIFF(LAST_DAY(DATE_ADD(v_date_inscription, INTERVAL 2 MONTH)), DATE_SUB(v_date_inscription, INTERVAL 3 MONTH))
                            WHEN 'an' THEN
                                (DATEDIFF(LAST_DAY(DATE_ADD(v_date_inscription, INTERVAL 11 MONTH)), v_date_inscription) + 1) /
                                DATEDIFF(LAST_DAY(DATE_ADD(v_date_inscription, INTERVAL 11 MONTH)), DATE_SUB(v_date_inscription, INTERVAL 1 YEAR))
                        END,
                        2
                    );
                ELSE
                    SET v_montant = v_prix;
                END IF;

                INSERT INTO echeances_paiements (user_id, plan_tarifaire_id, date_echeance, montant, statut_id)
                VALUES (NEW.id, v_abonnement_id, v_date_echeance, v_montant, v_statut_id);
            END IF;

            SET v_n = v_n + 1;
        END WHILE;
    END IF;
END//

DELIMITER ;

-- ============================================================================
-- SECTION 2: TRIGGER AFTER UPDATE ON utilisateurs (changement d'abonnement)
-- ============================================================================

DELIMITER //

DROP TRIGGER IF EXISTS after_utilisateur_update_abonnement//

CREATE TRIGGER after_utilisateur_update_abonnement
AFTER UPDATE ON utilisateurs
FOR EACH ROW
BEGIN
    DECLARE v_new_abonnement_id INT;
    DECLARE v_date_inscription  DATE;
    DECLARE v_periode           VARCHAR(20);
    DECLARE v_prix              DECIMAL(10, 2);
    DECLARE v_n                 INT DEFAULT 0;
    DECLARE v_date_echeance     DATE;
    DECLARE v_montant           DECIMAL(10, 2);
    DECLARE v_season_start      DATE DEFAULT '2025-09-01';
    DECLARE v_season_end        DATE DEFAULT '2026-08-31';
    DECLARE v_statut_id         INT;

    IF OLD.abonnement_id != NEW.abonnement_id OR
       (OLD.abonnement_id IS NULL AND NEW.abonnement_id IS NOT NULL) THEN

        DELETE FROM echeances_paiements WHERE user_id = NEW.id;

        SET v_new_abonnement_id = NEW.abonnement_id;
        SELECT id INTO v_statut_id FROM statuts_echeance WHERE code = 'en_attente' LIMIT 1;

        IF v_new_abonnement_id IS NOT NULL THEN
            SELECT periode, prix INTO v_periode, v_prix
            FROM plans_tarifaires WHERE id = v_new_abonnement_id;

            SET v_date_inscription = GREATEST(NEW.date_inscription, v_season_start);

            WHILE v_n <= 12 DO
                CASE
                    WHEN v_periode = 'mois' THEN
                        SET v_date_echeance = LAST_DAY(DATE_ADD(v_date_inscription, INTERVAL v_n MONTH));
                    WHEN v_periode = 'trimestre' THEN
                        SET v_date_echeance = LAST_DAY(DATE_ADD(v_date_inscription, INTERVAL v_n * 3 MONTH));
                    WHEN v_periode = 'an' THEN
                        SET v_date_echeance = LAST_DAY(DATE_ADD(v_date_inscription, INTERVAL v_n YEAR));
                END CASE;

                IF v_date_echeance BETWEEN v_season_start AND v_season_end THEN
                    IF v_n = 0 THEN
                        SET v_montant = ROUND(
                            v_prix *
                            CASE v_periode
                                WHEN 'mois' THEN
                                    (DAY(LAST_DAY(v_date_inscription)) - DAY(v_date_inscription) + 1)
                                    / DAY(LAST_DAY(v_date_inscription))
                                WHEN 'trimestre' THEN
                                    (DATEDIFF(LAST_DAY(DATE_ADD(v_date_inscription, INTERVAL 2 MONTH)), v_date_inscription) + 1) /
                                    DATEDIFF(LAST_DAY(DATE_ADD(v_date_inscription, INTERVAL 2 MONTH)), DATE_SUB(v_date_inscription, INTERVAL 3 MONTH))
                                WHEN 'an' THEN
                                    (DATEDIFF(LAST_DAY(DATE_ADD(v_date_inscription, INTERVAL 11 MONTH)), v_date_inscription) + 1) /
                                    DATEDIFF(LAST_DAY(DATE_ADD(v_date_inscription, INTERVAL 11 MONTH)), DATE_SUB(v_date_inscription, INTERVAL 1 YEAR))
                            END,
                            2
                        );
                    ELSE
                        SET v_montant = v_prix;
                    END IF;

                    INSERT INTO echeances_paiements (user_id, plan_tarifaire_id, date_echeance, montant, statut_id)
                    VALUES (NEW.id, v_new_abonnement_id, v_date_echeance, v_montant, v_statut_id);
                END IF;

                SET v_n = v_n + 1;
            END WHILE;
        END IF;
    END IF;
END//

DELIMITER ;

-- ============================================================================
-- SECTION 3: TRIGGERS AFTER INSERT/UPDATE ON utilisateurs (professeurs)
-- ============================================================================

DELIMITER //

DROP TRIGGER IF EXISTS ajouter_professeur_apres_insert//

CREATE TRIGGER ajouter_professeur_apres_insert
AFTER INSERT ON utilisateurs
FOR EACH ROW
BEGIN
    IF NEW.status_id = 5 THEN
        IF NOT EXISTS (SELECT 1 FROM professeurs WHERE email = NEW.email) THEN
            INSERT INTO professeurs (nom, prenom, email, grade_id, status_id)
            VALUES (NEW.last_name, NEW.first_name, NEW.email, NEW.grade_id, NEW.status_id);
        END IF;
    END IF;
END//

DROP TRIGGER IF EXISTS maj_professeur_apres_update//

CREATE TRIGGER maj_professeur_apres_update
AFTER UPDATE ON utilisateurs
FOR EACH ROW
BEGIN
    IF OLD.status_id = 5 AND (NEW.status_id <> 5 OR OLD.email <> NEW.email) THEN
        DELETE FROM professeurs WHERE email = OLD.email;
    END IF;

    IF NEW.status_id = 5 THEN
        IF EXISTS (SELECT 1 FROM professeurs WHERE email = NEW.email) THEN
            UPDATE professeurs
            SET nom = NEW.last_name, prenom = NEW.first_name,
                grade_id = NEW.grade_id, status_id = NEW.status_id
            WHERE email = NEW.email;
        ELSE
            INSERT INTO professeurs (nom, prenom, email, grade_id, status_id)
            VALUES (NEW.last_name, NEW.first_name, NEW.email, NEW.grade_id, NEW.status_id);
        END IF;
    END IF;
END//

DELIMITER ;

-- ============================================================================
-- SECTION 4: TRIGGER AFTER UPDATE ON echeances_paiements
-- ============================================================================
-- Lorsqu'une échéance passe au statut 'paye', crée un paiement automatique
-- (méthode : espèces par défaut) et lie l'échéance au paiement via paiement_id.
-- ============================================================================

DELIMITER //

DROP TRIGGER IF EXISTS after_echeance_paiement_update//

CREATE TRIGGER after_echeance_paiement_update
AFTER UPDATE ON echeances_paiements
FOR EACH ROW
BEGIN
    DECLARE v_statut_paye_echeance  INT;
    DECLARE v_statut_retard_echeance INT;
    DECLARE v_statut_attente_echeance INT;
    DECLARE v_statut_paye_paiement  INT;
    DECLARE v_methode_defaut        INT;
    DECLARE v_paiement_id           INT;

    -- Récupérer les IDs de référence
    SELECT id INTO v_statut_paye_echeance   FROM statuts_echeance WHERE code = 'paye'       LIMIT 1;
    SELECT id INTO v_statut_retard_echeance  FROM statuts_echeance WHERE code = 'en_retard'  LIMIT 1;
    SELECT id INTO v_statut_attente_echeance FROM statuts_echeance WHERE code = 'en_attente' LIMIT 1;
    SELECT id INTO v_statut_paye_paiement   FROM statuts_paiement  WHERE code = 'paye'       LIMIT 1;
    SELECT id INTO v_methode_defaut         FROM methodes_paiement WHERE code = 'especes'    LIMIT 1;

    -- Agir uniquement quand l'échéance passe à 'payé'
    IF (OLD.statut_id = v_statut_attente_echeance OR OLD.statut_id = v_statut_retard_echeance)
       AND NEW.statut_id = v_statut_paye_echeance THEN

        -- Vérifier s'il existe déjà un paiement lié
        IF NEW.paiement_id IS NULL THEN
            -- Créer un paiement automatique (espèces par défaut)
            INSERT INTO paiements (user_id, plan_tarifaire_id, montant, methode_paiement_id, statut_id, date_paiement)
            VALUES (
                NEW.user_id,
                NEW.plan_tarifaire_id,
                NEW.montant,
                v_methode_defaut,
                v_statut_paye_paiement,
                NOW()
            );

            SET v_paiement_id = LAST_INSERT_ID();

            -- Lier l'échéance au paiement créé
            UPDATE echeances_paiements
            SET paiement_id = v_paiement_id
            WHERE id = NEW.id;
        END IF;

    END IF;
END//

DELIMITER ;

-- ============================================================================
-- FIN DE LA CONSOLIDATION DES TRIGGERS v5.2
-- ============================================================================
