-- =====================================================================
-- FICHIER DE CONSOLIDATION DES PROCÉDURES STOCKÉES
-- =====================================================================
-- Projet      : Club Manager V3
-- Description : Consolidation de toutes les procédures stockées
-- Version     : 1.0.0
-- Date        : 2026-06-13
-- =====================================================================
-- Contenu :
--   1. ajouter_cours_recurrent_avec_professeurs
--   2. modifier_cours_recurrent_avec_professeurs
--   3. create_email_validation_token
--   4. validate_email_token
--   5. supprimer_association_professeur_cours
--   6. auto_kill_sleep (EVENT)
--   7. generate_token (FUNCTION)
--   8. obtenir_statistiques_frequentation
--   9. recuperer_userId
--   10. inscrire_utilisateurs_aleatoirement
-- =====================================================================


-- =====================================================================
-- 1. PROCÉDURE : ajouter_cours_recurrent_avec_professeurs
-- =====================================================================
-- Description : Ajoute un cours récurrent avec ses professeurs associés
--               et génère automatiquement les cours pour 1 an
-- Paramètres  :
--   - p_type_cours      : Type du cours (VARCHAR)
--   - p_jour_semaine    : Jour de la semaine (lundi, mardi, etc.)
--   - p_heure_debut     : Heure de début (TIME)
--   - p_heure_fin       : Heure de fin (TIME)
--   - p_professeurs     : Liste des professeurs au format JSON
-- =====================================================================

DROP PROCEDURE IF EXISTS ajouter_cours_recurrent_avec_professeurs;
DELIMITER //
CREATE PROCEDURE ajouter_cours_recurrent_avec_professeurs(
    IN p_type_cours VARCHAR(50),
    IN p_jour_semaine VARCHAR(20),
    IN p_heure_debut TIME,
    IN p_heure_fin TIME,
    IN p_professeurs JSON
)
BEGIN
    -- Déclaration des variables
    DECLARE v_jour_semaine INT;
    DECLARE v_cours_recurrent_id INT;
    DECLARE v_start_date DATE;
    DECLARE v_end_date DATE;
    DECLARE v_days_until_target_day INT;
    DECLARE i INT DEFAULT 0;  -- Variable locale déclarée correctement
    DECLARE v_professeur_count INT;
    DECLARE v_professeur_nom VARCHAR(255);
    DECLARE v_professeur_id INT;

    -- Gestionnaire d'erreur pour rollback automatique
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    -- 1. Mappage et validation du jour
    SET v_jour_semaine = CASE LOWER(TRIM(p_jour_semaine))
        WHEN 'lundi' THEN 1
        WHEN 'mardi' THEN 2
        WHEN 'mercredi' THEN 3
        WHEN 'jeudi' THEN 4
        WHEN 'vendredi' THEN 5
        WHEN 'samedi' THEN 6
        WHEN 'dimanche' THEN 7
        ELSE NULL
    END;

    IF v_jour_semaine IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Jour de la semaine invalide';
    END IF;

    -- 2. Calcul des dates (1 an comme demandé)
    SET v_days_until_target_day = (v_jour_semaine - (DAYOFWEEK(CURDATE()) - 1) + 7) % 7;
    IF v_days_until_target_day = 0 THEN SET v_days_until_target_day = 7; END IF;
    SET v_start_date = DATE_ADD(CURDATE(), INTERVAL v_days_until_target_day DAY);
    SET v_end_date = DATE_ADD(v_start_date, INTERVAL 1 YEAR);

    -- 3. Configuration pour éviter les timeouts
    SET SESSION innodb_lock_wait_timeout = 10;
    SET autocommit = 0;
    START TRANSACTION;

    -- 4. Insertion cours récurrent
    INSERT INTO cours_recurrent (type_cours, jour_semaine, heure_debut, heure_fin)
    VALUES (p_type_cours, v_jour_semaine, p_heure_debut, p_heure_fin);
    SET v_cours_recurrent_id = LAST_INSERT_ID();

    -- 5. Génération OPTIMISÉE des cours avec batch insert
    SET @batch_size = 10;
    SET @current_date = v_start_date;

    batch_loop: LOOP
        -- Insert par batches de 10 pour éviter les gros locks
        SET @insert_values = '';
        SET @batch_count = 0;

        inner_loop: LOOP
            IF @batch_count > 0 THEN
                SET @insert_values = CONCAT(@insert_values, ',');
            END IF;

            SET @insert_values = CONCAT(@insert_values,
                '(', QUOTE(@current_date), ',',
                     QUOTE(p_type_cours), ',',
                     QUOTE(p_heure_debut), ',',
                     QUOTE(p_heure_fin), ',',
                     v_cours_recurrent_id, ')');

            SET @current_date = DATE_ADD(@current_date, INTERVAL 7 DAY);
            SET @batch_count = @batch_count + 1;

            IF @batch_count >= @batch_size OR @current_date > v_end_date THEN
                LEAVE inner_loop;
            END IF;
        END LOOP inner_loop;

        -- Exécuter le batch
        IF LENGTH(@insert_values) > 0 THEN
            SET @sql = CONCAT('INSERT INTO cours (date_cours, type_cours, heure_debut, heure_fin, cours_recurrent_id) VALUES ', @insert_values);
            PREPARE stmt FROM @sql;
            EXECUTE stmt;
            DEALLOCATE PREPARE stmt;
        END IF;

        IF @current_date > v_end_date THEN
            LEAVE batch_loop;
        END IF;
    END LOOP batch_loop;

    -- 6. Association professeurs (avec mapping utilisateurs -> professeurs)
    SET v_professeur_count = JSON_LENGTH(p_professeurs);
    SET @professeurs_associes = 0;

    WHILE i < v_professeur_count DO
        SET v_professeur_nom = JSON_UNQUOTE(JSON_EXTRACT(p_professeurs, CONCAT('$[', i, ']')));
        SET v_professeur_id = NULL;

        -- 1. Recherche directe dans professeurs - ordre prenom nom
        SELECT id INTO v_professeur_id
        FROM professeurs
        WHERE CONCAT(TRIM(prenom), ' ', TRIM(nom)) = TRIM(v_professeur_nom)
        AND status_id = 5
        LIMIT 1;

        -- 2. Si pas trouvé, recherche dans utilisateurs et mapping vers professeurs
        IF v_professeur_id IS NULL THEN
            SELECT p.id INTO v_professeur_id
            FROM utilisateurs u
            JOIN professeurs p ON (
                TRIM(u.first_name) = TRIM(p.prenom) AND TRIM(u.last_name) = TRIM(p.nom)
            )
            WHERE CONCAT(TRIM(u.first_name), ' ', TRIM(u.last_name)) = TRIM(v_professeur_nom)
            AND u.status_id = 5 AND p.status_id = 5
            LIMIT 1;
        END IF;

        -- 3. Recherche par ordre inverse - nom prenom
        IF v_professeur_id IS NULL THEN
            SELECT id INTO v_professeur_id
            FROM professeurs
            WHERE CONCAT(TRIM(nom), ' ', TRIM(prenom)) = TRIM(v_professeur_nom)
            AND status_id = 5
            LIMIT 1;
        END IF;

        -- Insérer seulement si le professeur existe
        IF v_professeur_id IS NOT NULL THEN
            INSERT INTO cours_recurrent_professeur (cours_recurrent_id, professeur_id)
            VALUES (v_cours_recurrent_id, v_professeur_id);
            SET @professeurs_associes = @professeurs_associes + 1;
        END IF;

        SET i = i + 1;
    END WHILE;

    -- 7. Commit final
    COMMIT;
    SET autocommit = 1;
    SET SESSION innodb_lock_wait_timeout = 50;

    -- Retour du résultat avec information sur les professeurs non trouvés
    SET @professeurs_non_trouves = v_professeur_count - @professeurs_associes;

    SELECT
        v_cours_recurrent_id AS cours_recurrent_id,
        @professeurs_associes AS professeurs_associes,
        @professeurs_non_trouves AS professeurs_non_trouves,
        CASE
            WHEN @professeurs_associes = 0 AND @professeurs_non_trouves > 0 THEN
                CONCAT('Attention: Cours créé mais aucun professeur trouvé (', @professeurs_non_trouves, ' professeur(s) inexistant(s))')
            WHEN @professeurs_non_trouves > 0 THEN
                CONCAT('Succès partiel: ', @professeurs_associes, ' professeur(s) associé(s), ', @professeurs_non_trouves, ' professeur(s) non trouvé(s)')
            ELSE
                CONCAT('Succès: ', @professeurs_associes, ' professeur(s) associé(s)')
        END AS message;
END//
DELIMITER ;


-- =====================================================================
-- 2. PROCÉDURE : modifier_cours_recurrent_avec_professeurs
-- =====================================================================
-- Description : Modifie un cours récurrent existant et ses professeurs
-- Paramètres  :
--   - p_cours_recurrent_id : ID du cours récurrent à modifier
--   - p_type_cours         : Type du cours (VARCHAR)
--   - p_jour_semaine       : Jour de la semaine (lundi, mardi, etc.)
--   - p_heure_debut        : Heure de début (TIME)
--   - p_heure_fin          : Heure de fin (TIME)
--   - p_professeurs        : Liste des professeurs au format JSON
-- =====================================================================

DROP PROCEDURE IF EXISTS modifier_cours_recurrent_avec_professeurs;
DELIMITER //
CREATE PROCEDURE modifier_cours_recurrent_avec_professeurs(
    IN p_cours_recurrent_id INT,
    IN p_type_cours VARCHAR(50),
    IN p_jour_semaine VARCHAR(20),
    IN p_heure_debut TIME,
    IN p_heure_fin TIME,
    IN p_professeurs JSON
)
BEGIN
    DECLARE v_jour_semaine INT;
    DECLARE v_professeur_nom VARCHAR(255);
    DECLARE v_idx INT DEFAULT 0;
    DECLARE v_professeur_count INT;
    DECLARE v_professeur_id INT;
    DECLARE v_professeurs_associes INT DEFAULT 0;
    DECLARE v_existing_count INT;

    -- Gestionnaire d'erreur pour rollback automatique
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    -- 1. Validation du jour
    SET v_jour_semaine = CASE LOWER(TRIM(p_jour_semaine))
        WHEN 'lundi' THEN 1
        WHEN 'mardi' THEN 2
        WHEN 'mercredi' THEN 3
        WHEN 'jeudi' THEN 4
        WHEN 'vendredi' THEN 5
        WHEN 'samedi' THEN 6
        WHEN 'dimanche' THEN 7
        ELSE NULL
    END;

    IF v_jour_semaine IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Jour de la semaine invalide';
    END IF;

    -- 2. Vérification préalable de l'existence du cours
    SELECT COUNT(*) INTO v_existing_count
    FROM cours_recurrent
    WHERE id = p_cours_recurrent_id;

    IF v_existing_count = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cours récurrent non trouvé';
    END IF;

    -- 3. Création d'une table temporaire pour les professeurs (optimisation)
    DROP TEMPORARY TABLE IF EXISTS temp_professeurs;
    CREATE TEMPORARY TABLE temp_professeurs (
        idx INT AUTO_INCREMENT PRIMARY KEY,
        professeur_id INT NOT NULL,
        nom_complet VARCHAR(255) NOT NULL,
        UNIQUE KEY (professeur_id)
    );

    -- 4. Chargement des professeurs en une seule passe (optimisation majeure)
    SET v_professeur_count = JSON_LENGTH(p_professeurs);

    WHILE v_idx < v_professeur_count DO
        SET v_professeur_nom = TRIM(JSON_UNQUOTE(JSON_EXTRACT(p_professeurs, CONCAT('$[', v_idx, ']'))));
        SET v_professeur_id = NULL;

        -- Recherche EXACTE dans professeurs - ordre prenom nom (priorité)
        SELECT p.id INTO v_professeur_id
        FROM professeurs p
        WHERE CONCAT(TRIM(p.prenom), ' ', TRIM(p.nom)) = v_professeur_nom
        AND p.status_id = 5
        LIMIT 1;

        -- Si pas trouvé, recherche dans utilisateurs - ordre prenom nom
        IF v_professeur_id IS NULL THEN
            SELECT u.id INTO v_professeur_id
            FROM utilisateurs u
            WHERE CONCAT(TRIM(u.first_name), ' ', TRIM(u.last_name)) = v_professeur_nom
            AND u.status_id = 5
            LIMIT 1;
        END IF;

        -- N'ajouter que si le professeur existe vraiment
        IF v_professeur_id IS NOT NULL THEN
            INSERT IGNORE INTO temp_professeurs (professeur_id, nom_complet)
            VALUES (v_professeur_id, v_professeur_nom);
        END IF;

        SET v_idx = v_idx + 1;
    END WHILE;

    -- Vérification qu'au moins un professeur a été trouvé
    SELECT COUNT(*) INTO v_professeurs_associes FROM temp_professeurs;

    -- Permettre la modification même si aucun professeur n'est trouvé (cours sans professeur)
    -- IF v_professeurs_associes = 0 THEN
    --     DROP TEMPORARY TABLE IF EXISTS temp_professeurs;
    --     SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Aucun professeur valide trouvé dans la liste fournie';
    -- END IF;

    -- 5. Transaction unique avec timeout optimisé
    SET SESSION innodb_lock_wait_timeout = 5;
    START TRANSACTION;

    -- Mise à jour du cours récurrent
    UPDATE cours_recurrent
    SET
        type_cours = p_type_cours,
        jour_semaine = v_jour_semaine,
        heure_debut = p_heure_debut,
        heure_fin = p_heure_fin
    WHERE id = p_cours_recurrent_id;

    -- Suppression de toutes les anciennes associations (même si aucun nouveau professeur)
    DELETE FROM cours_recurrent_professeur
    WHERE cours_recurrent_id = p_cours_recurrent_id;

    -- Association des nouveaux professeurs (seulement si des professeurs valides ont été trouvés)
    IF v_professeurs_associes > 0 THEN
        INSERT INTO cours_recurrent_professeur (cours_recurrent_id, professeur_id)
        SELECT p_cours_recurrent_id, professeur_id
        FROM temp_professeurs
        WHERE professeur_id IS NOT NULL;
    END IF;

    -- Recompter les professeurs réellement associés
    SELECT COUNT(*) INTO v_professeurs_associes
    FROM temp_professeurs
    WHERE professeur_id IS NOT NULL;

    -- Nettoyage
    DROP TEMPORARY TABLE IF EXISTS temp_professeurs;

    -- Commit final
    COMMIT;
    SET SESSION innodb_lock_wait_timeout = 50;

    -- 6. Retour du résultat avec information détaillée
    SET @professeurs_non_trouves = v_professeur_count - v_professeurs_associes;

    SELECT
        p_cours_recurrent_id AS cours_recurrent_id,
        v_professeurs_associes AS professeurs_associes,
        @professeurs_non_trouves AS professeurs_non_trouves,
        CASE
            WHEN v_professeurs_associes = 0 AND @professeurs_non_trouves > 0 THEN
                CONCAT('Attention: Cours modifié mais aucun professeur trouvé (', @professeurs_non_trouves, ' professeur(s) inexistant(s))')
            WHEN @professeurs_non_trouves > 0 THEN
                CONCAT('Succès partiel: ', v_professeurs_associes, ' professeur(s) associé(s), ', @professeurs_non_trouves, ' professeur(s) non trouvé(s)')
            ELSE
                CONCAT('Succès: ', v_professeurs_associes, ' professeur(s) associé(s)')
        END AS message;
END//
DELIMITER ;


-- =====================================================================
-- 3. PROCÉDURE : create_email_validation_token
-- =====================================================================
-- Description : Crée un token de validation d'email pour un utilisateur
-- Paramètres  :
--   - p_user_id : ID de l'utilisateur
-- Retour      : Token de validation (valable 24h)
-- =====================================================================

DELIMITER //
CREATE PROCEDURE create_email_validation_token(IN p_user_id INT)
BEGIN
    DECLARE v_token VARCHAR(64);

    -- Supprimer les tokens existants non utilisés
    DELETE FROM email_validation_tokens
    WHERE user_id = p_user_id AND token_type = 'email_validation' AND is_used = FALSE;

    -- Générer un nouveau token
    SET v_token = generate_token();

    -- Insérer le token (valable 24h)
    INSERT INTO email_validation_tokens (user_id, token, token_type, expires_at)
    VALUES (p_user_id, v_token, 'email_validation', DATE_ADD(NOW(), INTERVAL 24 HOUR));

    SELECT v_token AS validation_token;
END//
DELIMITER ;


-- =====================================================================
-- 4. PROCÉDURE : validate_email_token
-- =====================================================================
-- Description : Valide un token d'email et active le compte utilisateur
-- Paramètres  :
--   - p_token : Token de validation à vérifier
-- Retour      : Informations sur l'utilisateur activé
-- =====================================================================

DELIMITER //
CREATE PROCEDURE validate_email_token(IN p_token VARCHAR(64))
BEGIN
    DECLARE v_user_id INT;
    DECLARE v_email VARCHAR(100);
    DECLARE v_first_name VARCHAR(50);

    -- Vérifier que le token existe et n'est pas expiré
    SELECT user_id INTO v_user_id
    FROM email_validation_tokens
    WHERE token = p_token
    AND token_type = 'email_validation'
    AND is_used = FALSE
    AND expires_at > NOW()
    LIMIT 1;

    IF v_user_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Token invalide ou expiré';
    ELSE
        -- Marquer le token comme utilisé
        UPDATE email_validation_tokens
        SET is_used = TRUE
        WHERE token = p_token;

        -- Activer le compte utilisateur
        UPDATE utilisateurs
        SET active = TRUE
        WHERE id = v_user_id;

        -- Récupérer les infos pour l'email de confirmation
        SELECT email, first_name INTO v_email, v_first_name
        FROM utilisateurs
        WHERE id = v_user_id;

        -- Retourner les infos pour l'email de confirmation
        SELECT
            v_user_id AS user_id,
            v_email AS email,
            v_first_name AS first_name,
            'Compte activé avec succès' AS message;
    END IF;
END//
DELIMITER ;


-- =====================================================================
-- 5. PROCÉDURE : supprimer_association_professeur_cours
-- =====================================================================
-- Description : Supprime l'association entre un professeur et un cours
--               récurrent pour un jour donné
-- Paramètres  :
--   - p_professeur_id : ID du professeur
--   - p_jour_semaine  : Jour de la semaine (1-7)
-- =====================================================================

DELIMITER //
CREATE PROCEDURE supprimer_association_professeur_cours(
    IN p_professeur_id INT,
    IN p_jour_semaine INT
)
BEGIN
    DECLARE association_id INT;

    -- Trouver l'ID de l'association
    SELECT id INTO association_id
    FROM cours_recurrent_professeur
    WHERE professeur_id = p_professeur_id
      AND cours_recurrent_id IN (
          SELECT id
          FROM cours_recurrent
          WHERE jour_semaine = p_jour_semaine
      )
    LIMIT 1;

    -- Supprimer l'association si elle existe
    IF association_id IS NOT NULL THEN
        DELETE FROM cours_recurrent_professeur
        WHERE id = association_id;
        SELECT CONCAT('Association supprimée avec succès (ID: ', association_id, ')') AS message;
    ELSE
        SELECT 'Aucune association trouvée pour ce professeur et ce jour.' AS message;
    END IF;
END //
DELIMITER ;


-- =====================================================================
-- 6. EVENT : auto_kill_sleep
-- =====================================================================
-- Description : Nettoie automatiquement les connexions Sleep indésirables
--               toutes les 5 minutes (sauf rdsadmin et event_scheduler)
-- Type        : EVENT (tâche planifiée)
-- =====================================================================

DELIMITER //

CREATE EVENT IF NOT EXISTS auto_kill_sleep
ON SCHEDULE EVERY 5 MINUTE
DO
BEGIN
    -- Construire la liste des process à tuer
    SET @kill_list = (
        SELECT GROUP_CONCAT(CONCAT('KILL ', id) SEPARATOR '; ')
        FROM information_schema.processlist
        WHERE user NOT IN ('rdsadmin')
          AND command = 'Sleep'
          AND id != CONNECTION_ID()
    );

    -- Exécuter la liste des KILLs si elle n'est pas vide
    IF @kill_list IS NOT NULL THEN
        PREPARE stmt FROM @kill_list;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END;
//

DELIMITER ;


-- =====================================================================
-- 7. FUNCTION : generate_token
-- =====================================================================
-- Description : Génère un token aléatoire sécurisé de 64 caractères
-- Retour      : Token VARCHAR(64)
-- Type        : FUNCTION DETERMINISTIC
-- =====================================================================

DELIMITER //
CREATE FUNCTION generate_token()
RETURNS VARCHAR(64)
DETERMINISTIC
BEGIN
    DECLARE random_string VARCHAR(64);
    SET random_string = TO_BASE64(SHA2(CONCAT(NOW(), RAND(), UUID()), 256));
    RETURN SUBSTRING(random_string, 1, 64);
END//
DELIMITER ;


-- =====================================================================
-- 8. PROCÉDURE : obtenir_statistiques_frequentation
-- =====================================================================
-- Description : Calcule les statistiques de fréquentation d'un utilisateur
--               par mois avec pourcentages et totaux
-- Paramètres  :
--   - utilisateur_id : ID de l'utilisateur
-- Retour      : Statistiques mensuelles de fréquentation
-- =====================================================================

DELIMITER //
CREATE PROCEDURE obtenir_statistiques_frequentation(IN utilisateur_id INT)
BEGIN
    WITH
    cours_recurrents_actifs AS (
      SELECT COUNT(*) AS total_cours_recurrents_actifs
      FROM cours_recurrent
      WHERE active = 1
    ),
    cours_par_mois AS (
      SELECT
        MONTHNAME(c.date_cours) as mois,
        MONTH(c.date_cours) as mois_num,
        YEAR(c.date_cours) as annee,
        (SELECT total_cours_recurrents_actifs FROM cours_recurrents_actifs) * 4 as total_cours_mois
      FROM cours c
      GROUP BY YEAR(c.date_cours), MONTH(c.date_cours)
    ),
    presences_par_mois AS (
      SELECT
        MONTHNAME(c.date_cours) as mois,
        MONTH(c.date_cours) as mois_num,
        YEAR(c.date_cours) as annee,
        COUNT(DISTINCT DATE(c.date_cours)) as presences_validees
      FROM inscriptions i
      JOIN cours c ON i.cours_id = c.id
      WHERE i.utilisateur_id = utilisateur_id
      AND i.status_id = 1
      GROUP BY YEAR(c.date_cours), MONTH(c.date_cours)
    ),
    total_frequentation AS (
      SELECT COUNT(*) as total FROM inscriptions WHERE utilisateur_id = utilisateur_id AND status_id = 1
    )
    SELECT
      COALESCE(p.mois, c.mois) as mois,
      COALESCE(p.presences_validees, 0) as frequentation,
      c.total_cours_mois as nombres_total_de_cours_du_mois,
      ROUND(COALESCE(p.presences_validees, 0) * 100.0 / NULLIF(c.total_cours_mois, 0), 2) as pourcentage_de_cours_valides,
      (SELECT total FROM total_frequentation) as totalFrequentation
    FROM cours_par_mois c
    LEFT JOIN presences_par_mois p ON c.annee = p.annee AND c.mois_num = p.mois_num
    ORDER BY c.annee, c.mois_num;
END //
DELIMITER ;


-- =====================================================================
-- 9. PROCÉDURE : recuperer_userId
-- =====================================================================
-- Description : Récupère le userId d'un utilisateur par son email
--               (utilisé pour renvoyer le userId par email/SMS)
-- Paramètres  :
--   - p_email : Email de l'utilisateur
-- Retour      : Message avec le userId
-- =====================================================================

DELIMITER //
CREATE PROCEDURE recuperer_userId(IN p_email VARCHAR(100))
BEGIN
    DECLARE v_userId VARCHAR(20);
    DECLARE v_first_name VARCHAR(50);
    DECLARE v_count INT;

    SELECT COUNT(*) INTO v_count FROM utilisateurs WHERE email = p_email;
    IF v_count = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Aucun compte trouvé avec cet email.';
    ELSE
        SELECT userId, first_name INTO v_userId, v_first_name
        FROM utilisateurs
        WHERE email = p_email
        LIMIT 1;

        -- Envoyer un email avec le userId (à implémenter côté application)
        SELECT CONCAT('Votre userId est : ', v_userId) AS message;
        -- Exemple de contenu d'email :
        -- "Bonjour ', v_first_name, ', voici votre userId pour vous connecter : ', v_userId, '. Conservez-le précieusement."
    END IF;
END//
DELIMITER ;


-- =====================================================================
-- 10. PROCÉDURE : inscrire_utilisateurs_aleatoirement
-- =====================================================================
-- Description : Inscrit tous les utilisateurs à tous les cours et
--               valide aléatoirement les présences (pour tests)
-- Note        : Cette procédure VIDE la table inscriptions avant insertion
-- Utilisation : CALL inscrire_utilisateurs_aleatoirement();
-- =====================================================================

DROP PROCEDURE IF EXISTS inscrire_utilisateurs_aleatoirement;

DELIMITER //
CREATE PROCEDURE inscrire_utilisateurs_aleatoirement()
BEGIN
    -- Vider la table inscriptions pour éviter les doublons
    TRUNCATE TABLE inscriptions;

    -- Inscrire tous les utilisateurs à tous les cours
    INSERT INTO inscriptions (utilisateur_id, cours_id, date_inscription)
    SELECT u.id, c.id, NOW()
    FROM utilisateurs u
    CROSS JOIN cours c;

    -- Mettre à jour aléatoirement les présences
    UPDATE inscriptions i
    JOIN (
        SELECT id, (0.5 + (grade_id * 0.02)) AS user_activity_level
        FROM utilisateurs
    ) u ON i.utilisateur_id = u.id
    SET i.status_id = IF(RAND() < u.user_activity_level, 1, NULL);

    SELECT 'Inscription et validation des présences terminées avec succès' AS message;
END //
DELIMITER ;


-- =====================================================================
-- FIN DU FICHIER DE CONSOLIDATION
-- =====================================================================
-- Note : Pour exécuter la procédure de test (inscrire_utilisateurs_aleatoirement) :
--   CALL inscrire_utilisateurs_aleatoirement();
--
-- Vérification des résultats :
--   SELECT COUNT(*) AS total_inscriptions FROM inscriptions;
--   SELECT COUNT(*) AS total_presences_validees FROM inscriptions WHERE status_id = 1;
-- =====================================================================
