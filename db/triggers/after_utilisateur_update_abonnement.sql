DELIMITER //

CREATE TRIGGER after_utilisateur_update_abonnement
AFTER UPDATE ON utilisateurs
FOR EACH ROW
BEGIN
    DECLARE v_old_abonnement_id INT;
    DECLARE v_new_abonnement_id INT;
    DECLARE v_date_inscription DATE;
    DECLARE v_duree_mois INT;
    DECLARE v_prix DECIMAL(10, 2);
    DECLARE v_n INT DEFAULT 0;
    DECLARE v_date_echeance DATE;
    DECLARE v_montant DECIMAL(10, 2);
    DECLARE v_season_start DATE DEFAULT '2025-09-01';
    DECLARE v_season_end DATE DEFAULT '2026-08-31';

    -- Vérifier si l'abonnement a changé
    IF OLD.abonnement_id != NEW.abonnement_id THEN
        -- Supprimer les anciennes échéances de paiement
        DELETE FROM echeances_paiements WHERE user_id = NEW.id;

        -- Récupérer le nouvel abonnement
        SET v_new_abonnement_id = NEW.abonnement_id;

        -- Vérifier si le nouvel abonnement est valide
        IF v_new_abonnement_id IS NOT NULL THEN
            -- Récupérer les informations du nouvel abonnement
            SELECT duree_mois, prix INTO v_duree_mois, v_prix FROM plans_tarifaires WHERE id = v_new_abonnement_id;

            -- Utiliser la date d'inscription ou le début de la saison, selon ce qui est le plus récent
            SET v_date_inscription = GREATEST(NEW.date_inscription, v_season_start);

            -- Générer les nouvelles échéances en fonction de la période du nouvel abonnement
            WHILE v_n <= 12 DO
                CASE
                    WHEN v_duree_mois = 1 THEN
                        SET v_date_echeance = LAST_DAY(DATE_ADD(v_date_inscription, INTERVAL v_n MONTH));
                    WHEN v_duree_mois = 3 THEN
                        SET v_date_echeance = LAST_DAY(DATE_ADD(v_date_inscription, INTERVAL v_n*3 MONTH));
                    WHEN v_duree_mois = 12 THEN
                        SET v_date_echeance = LAST_DAY(DATE_ADD(v_date_inscription, INTERVAL v_n YEAR));
                END CASE;

                -- Vérifier que la date d'échéance est dans la saison 2025-2026
                IF v_date_echeance BETWEEN v_season_start AND v_season_end THEN
                    -- Calcul du montant proratisé pour la première échéance
                    IF v_n = 0 THEN
                        SET v_montant = ROUND(
                            v_prix *
                            CASE v_duree_mois
                                WHEN 1 THEN
                                    (DAY(LAST_DAY(v_date_inscription)) - DAY(v_date_inscription) + 1) / DAY(LAST_DAY(v_date_inscription))
                                WHEN 3 THEN
                                    (DATEDIFF(LAST_DAY(DATE_ADD(v_date_inscription, INTERVAL 2 MONTH)), v_date_inscription) + 1) /
                                    DATEDIFF(LAST_DAY(DATE_ADD(v_date_inscription, INTERVAL 2 MONTH)), DATE_SUB(v_date_inscription, INTERVAL 3 MONTH))
                                WHEN 12 THEN
                                    (DATEDIFF(LAST_DAY(DATE_ADD(v_date_inscription, INTERVAL 11 MONTH)), v_date_inscription) + 1) /
                                    DATEDIFF(LAST_DAY(DATE_ADD(v_date_inscription, INTERVAL 11 MONTH)), DATE_SUB(v_date_inscription, INTERVAL 1 YEAR))
                            END,
                            2
                        );
                    ELSE
                        SET v_montant = v_prix;
                    END IF;

                    -- Insérer la nouvelle échéance
                    INSERT INTO echeances_paiements (user_id, plan_tarifaire_id, date_echeance, montant, statut_id)
                    VALUES (NEW.id, v_new_abonnement_id, v_date_echeance, v_montant, 1);
                END IF;

                SET v_n = v_n + 1;
            END WHILE;
        END IF;
    END IF;
END//

DELIMITER ;
