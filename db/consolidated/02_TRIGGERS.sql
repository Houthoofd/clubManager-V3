-- ============================================================================
-- FICHIER DE CONSOLIDATION DES TRIGGERS
-- ============================================================================
-- Version: 1.0
-- Date: 2026-06-13
-- Description: Consolidation de tous les triggers de la base de données
-- ============================================================================

-- ============================================================================
-- SECTION 1: TRIGGER AFTER INSERT ON utilisateurs
-- ============================================================================
-- Table concernée: utilisateurs
-- Événement: AFTER INSERT
-- Description: Génère automatiquement les échéances de paiement pour un nouvel
--              utilisateur en fonction de son abonnement. Calcule les dates
--              d'échéance et les montants proratisés pour la saison 2025-2026.
-- ============================================================================

DELIMITER //

DROP TRIGGER IF EXISTS after_utilisateur_insert//

CREATE TRIGGER after_utilisateur_insert
AFTER INSERT ON utilisateurs
FOR EACH ROW
BEGIN
    DECLARE v_abonnement_id INT;
    DECLARE v_date_inscription DATE;
    DECLARE v_periode VARCHAR(20);
    DECLARE v_prix DECIMAL(10, 2);
    DECLARE v_n INT DEFAULT 0;
    DECLARE v_date_echeance DATE;
    DECLARE v_montant DECIMAL(10, 2);
    DECLARE v_season_start DATE DEFAULT '2025-09-01';
    DECLARE v_season_end DATE DEFAULT '2026-08-31';

    -- Récupérer les informations de l'abonnement
    SET v_abonnement_id = NEW.abonnement_id;

    -- Vérifier si l'utilisateur a un abonnement
    IF v_abonnement_id IS NOT NULL THEN
        SELECT periode, prix INTO v_periode, v_prix FROM plans_tarifaires WHERE id = v_abonnement_id;

        -- Utiliser la date d'inscription ou le début de la saison, selon ce qui est le plus récent
        SET v_date_inscription = GREATEST(NEW.date_inscription, v_season_start);

        -- Générer les échéances en fonction de la période de l'abonnement
        WHILE v_n <= 12 DO
            CASE
                WHEN v_periode = 'mois' THEN
                    SET v_date_echeance = LAST_DAY(DATE_ADD(v_date_inscription, INTERVAL v_n MONTH));
                WHEN v_periode = 'trimestre' THEN
                    SET v_date_echeance = LAST_DAY(DATE_ADD(v_date_inscription, INTERVAL v_n*3 MONTH));
                WHEN v_periode = 'an' THEN
                    SET v_date_echeance = LAST_DAY(DATE_ADD(v_date_inscription, INTERVAL v_n YEAR));
            END CASE;

            -- Vérifier que la date d'échéance est dans la saison 2025-2026
            IF v_date_echeance BETWEEN v_season_start AND v_season_end THEN
                -- Calcul du montant proratisé pour la première échéance
                IF v_n = 0 THEN
                    SET v_montant = ROUND(
                        v_prix *
                        CASE v_periode
                            WHEN 'mois' THEN
                                (DAY(LAST_DAY(v_date_inscription)) - DAY(v_date_inscription) + 1) / DAY(LAST_DAY(v_date_inscription))
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

                -- Insérer l'échéance
                INSERT INTO echeances_paiements (utilisateur_id, abonnement_id, date_echeance, montant, statut)
                VALUES (NEW.id, v_abonnement_id, v_date_echeance, v_montant, 'en attente');
            END IF;

            SET v_n = v_n + 1;
        END WHILE;
    END IF;
END//

DELIMITER ;

-- ============================================================================
-- SECTION 2: TRIGGER AFTER UPDATE ON utilisateurs (abonnement)
-- ============================================================================
-- Table concernée: utilisateurs
-- Événement: AFTER UPDATE
-- Description: Réagit au changement d'abonnement d'un utilisateur. Supprime
--              les anciennes échéances et régénère de nouvelles échéances
--              basées sur le nouvel abonnement avec calcul proratisé.
-- ============================================================================

DELIMITER //

DROP TRIGGER IF EXISTS after_utilisateur_update_abonnement//

CREATE TRIGGER after_utilisateur_update_abonnement
AFTER UPDATE ON utilisateurs
FOR EACH ROW
BEGIN
    DECLARE v_old_abonnement_id INT;
    DECLARE v_new_abonnement_id INT;
    DECLARE v_date_inscription DATE;
    DECLARE v_periode VARCHAR(20);
    DECLARE v_prix DECIMAL(10, 2);
    DECLARE v_n INT DEFAULT 0;
    DECLARE v_date_echeance DATE;
    DECLARE v_montant DECIMAL(10, 2);
    DECLARE v_season_start DATE DEFAULT '2025-09-01';
    DECLARE v_season_end DATE DEFAULT '2026-08-31';

    -- Vérifier si l'abonnement a changé
    IF OLD.abonnement_id != NEW.abonnement_id THEN
        -- Supprimer les anciennes échéances de paiement
        DELETE FROM echeances_paiements WHERE utilisateur_id = NEW.id;

        -- Récupérer le nouvel abonnement
        SET v_new_abonnement_id = NEW.abonnement_id;

        -- Vérifier si le nouvel abonnement est valide
        IF v_new_abonnement_id IS NOT NULL THEN
            -- Récupérer les informations du nouvel abonnement
            SELECT periode, prix INTO v_periode, v_prix FROM plans_tarifaires WHERE id = v_new_abonnement_id;

            -- Utiliser la date d'inscription ou le début de la saison, selon ce qui est le plus récent
            SET v_date_inscription = GREATEST(NEW.date_inscription, v_season_start);

            -- Générer les nouvelles échéances en fonction de la période du nouvel abonnement
            WHILE v_n <= 12 DO
                CASE
                    WHEN v_periode = 'mois' THEN
                        SET v_date_echeance = LAST_DAY(DATE_ADD(v_date_inscription, INTERVAL v_n MONTH));
                    WHEN v_periode = 'trimestre' THEN
                        SET v_date_echeance = LAST_DAY(DATE_ADD(v_date_inscription, INTERVAL v_n*3 MONTH));
                    WHEN v_periode = 'an' THEN
                        SET v_date_echeance = LAST_DAY(DATE_ADD(v_date_inscription, INTERVAL v_n YEAR));
                END CASE;

                -- Vérifier que la date d'échéance est dans la saison 2025-2026
                IF v_date_echeance BETWEEN v_season_start AND v_season_end THEN
                    -- Calcul du montant proratisé pour la première échéance
                    IF v_n = 0 THEN
                        SET v_montant = ROUND(
                            v_prix *
                            CASE v_periode
                                WHEN 'mois' THEN
                                    (DAY(LAST_DAY(v_date_inscription)) - DAY(v_date_inscription) + 1) / DAY(LAST_DAY(v_date_inscription))
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

                    -- Insérer la nouvelle échéance
                    INSERT INTO echeances_paiements (utilisateur_id, abonnement_id, date_echeance, montant, statut)
                    VALUES (NEW.id, v_new_abonnement_id, v_date_echeance, v_montant, 'en attente');
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
-- Table concernée: utilisateurs
-- Événements: AFTER INSERT et AFTER UPDATE
-- Description: Gère automatiquement la synchronisation entre la table
--              utilisateurs et la table professeurs. Ajoute, met à jour ou
--              supprime les professeurs en fonction du status_id = 5.
-- ============================================================================

DELIMITER //

-- 1️⃣ Trigger après INSERT dans utilisateurs
DROP TRIGGER IF EXISTS ajouter_professeur_apres_insert//

CREATE TRIGGER ajouter_professeur_apres_insert
AFTER INSERT ON utilisateurs
FOR EACH ROW
BEGIN
    IF NEW.status_id = 5 THEN
        -- Insérer dans professeurs si status_id = 5 et pas déjà présent (email unique)
        IF NOT EXISTS (
            SELECT 1 FROM professeurs WHERE email = NEW.email
        ) THEN
            INSERT INTO professeurs (nom, prenom, email, grade_id, status_id)
            VALUES (NEW.last_name, NEW.first_name, NEW.email, NEW.grade_id, NEW.status_id);
        END IF;
    END IF;
END;
//

-- 2️⃣ Trigger après UPDATE dans utilisateurs
DROP TRIGGER IF EXISTS maj_professeur_apres_update//

CREATE TRIGGER maj_professeur_apres_update
AFTER UPDATE ON utilisateurs
FOR EACH ROW
BEGIN
    -- 1️⃣ Supprimer l'ancien en cas de changement d'email ou de status_id <> 5
    IF OLD.status_id = 5 AND (NEW.status_id <> 5 OR OLD.email <> NEW.email) THEN
        DELETE FROM professeurs WHERE email = OLD.email;
    END IF;

    -- 2️⃣ Ajouter ou mettre à jour si status_id = 5
    IF NEW.status_id = 5 THEN
        IF EXISTS (
            SELECT 1 FROM professeurs WHERE email = NEW.email
        ) THEN
            -- Mettre à jour les informations si déjà présent
            UPDATE professeurs
            SET nom = NEW.last_name,
                prenom = NEW.first_name,
                grade_id = NEW.grade_id,
                status_id = NEW.status_id
            WHERE email = NEW.email;
        ELSE
            -- Insérer si pas présent
            INSERT INTO professeurs (nom, prenom, email, grade_id, status_id)
            VALUES (NEW.last_name, NEW.first_name, NEW.email, NEW.grade_id, NEW.status_id);
        END IF;
    END IF;
END;
//

DELIMITER ;

-- ============================================================================
-- SECTION 4: TRIGGER AFTER UPDATE ON echeances_paiements
-- ============================================================================
-- Table concernée: echeances_paiements
-- Événement: AFTER UPDATE
-- Description: Crée automatiquement une entrée dans la table paiements
--              lorsqu'une échéance passe au statut 'payé'. Évite les doublons
--              et met à jour les paiements existants si nécessaire.
-- ============================================================================

DELIMITER //

DROP TRIGGER IF EXISTS after_echeance_paiement_update//

CREATE TRIGGER after_echeance_paiement_update
AFTER UPDATE ON echeances_paiements
FOR EACH ROW
BEGIN
    -- Vérifier si le statut a changé à 'payé' (que ce soit depuis 'en attente' ou 'échu')
    IF (OLD.statut = 'en attente' OR OLD.statut = 'échu') AND NEW.statut = 'payé' THEN

        -- AJOUTÉ: Vérifier qu'il n'existe pas déjà un paiement pour cette période
        -- Cela évite la violation de contrainte uk_utilisateur_periode_abonnement
        IF NOT EXISTS (
            SELECT 1 FROM paiements
            WHERE utilisateur_id = NEW.utilisateur_id
            AND abonnement_id = NEW.abonnement_id
            AND periode_debut = DATE_SUB(NEW.date_echeance, INTERVAL 1 MONTH)
            AND periode_fin = NEW.date_echeance
        ) THEN
            -- Insérer une nouvelle ligne dans la table paiements SEULEMENT si elle n'existe pas
            INSERT INTO paiements (utilisateur_id, montant, date_paiement, statut, abonnement_id, periode_debut, periode_fin)
            VALUES (
                NEW.utilisateur_id,
                NEW.montant,
                NEW.date_paiement,
                'validé',
                NEW.abonnement_id,
                DATE_SUB(NEW.date_echeance, INTERVAL 1 MONTH),  -- Période de début
                NEW.date_echeance  -- Période de fin
            );
        ELSE
            -- AJOUTÉ: Log pour debug (optionnel)
            -- On peut ajouter une table de logs si nécessaire
            -- INSERT INTO trigger_logs (message, timestamp) VALUES
            -- (CONCAT('Paiement déjà existant pour échéance ', NEW.id, ' utilisateur ', NEW.utilisateur_id), NOW());

            -- AJOUTÉ: Mettre à jour le paiement existant si nécessaire
            UPDATE paiements
            SET
                statut = 'validé',
                date_paiement = NEW.date_paiement,
                montant = NEW.montant
            WHERE utilisateur_id = NEW.utilisateur_id
            AND abonnement_id = NEW.abonnement_id
            AND periode_debut = DATE_SUB(NEW.date_echeance, INTERVAL 1 MONTH)
            AND periode_fin = NEW.date_echeance
            AND statut != 'validé';  -- Éviter les mises à jour inutiles
        END IF;

    END IF;
END//

DELIMITER ;

-- ============================================================================
-- FIN DE LA CONSOLIDATION DES TRIGGERS
-- ============================================================================
