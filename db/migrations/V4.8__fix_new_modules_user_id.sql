-- ============================================================
-- MIGRATION V4.8 - FIX NEW MODULES USER_ID COLUMNS
-- ============================================================
-- Description:
--   Renomme utilisateur_id en user_id dans les tables des nouveaux modules
--   (si la colonne utilisateur_id existe encore — même pattern que migration 008)
--
--   Tables concernées :
--     - notifications        (module notifications)
--     - reservations         (module reservations)
--     - groupes_utilisateurs (module groups)
--
-- Date: 2025
-- Précondition: Migration 008 déjà appliquée (commandes, mouvements_stock OK)
-- ============================================================

USE clubmanager;

-- ============================================================
-- 1. notifications — utilisateur_id → user_id
-- ============================================================

DELIMITER $$

CREATE PROCEDURE V48_FixNotificationsUserId()
BEGIN
    DECLARE col_exists INT;
    DECLARE fk_exists  INT;
    DECLARE fk_name    VARCHAR(200);

    SELECT COUNT(*) INTO col_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = 'notifications'
      AND COLUMN_NAME  = 'utilisateur_id';

    IF col_exists > 0 THEN

        -- Supprimer la FK existante si présente
        SELECT COUNT(*) INTO fk_exists
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME   = 'notifications'
          AND COLUMN_NAME  = 'utilisateur_id'
          AND REFERENCED_TABLE_NAME IS NOT NULL;

        IF fk_exists > 0 THEN
            SET fk_name = (
                SELECT CONSTRAINT_NAME
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME   = 'notifications'
                  AND COLUMN_NAME  = 'utilisateur_id'
                  AND REFERENCED_TABLE_NAME IS NOT NULL
                LIMIT 1
            );
            SET @sql = CONCAT('ALTER TABLE notifications DROP FOREIGN KEY `', fk_name, '`');
            PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
        END IF;

        -- Renommer la colonne
        ALTER TABLE notifications
            CHANGE COLUMN utilisateur_id user_id INT UNSIGNED NOT NULL;

        -- Recréer la FK
        ALTER TABLE notifications
            ADD CONSTRAINT fk_notifications_utilisateur
            FOREIGN KEY (user_id) REFERENCES utilisateurs(id)
            ON DELETE CASCADE ON UPDATE CASCADE;

        SELECT 'notifications.utilisateur_id → user_id : OK' AS status;
    ELSE
        SELECT 'notifications : user_id déjà présent, rien à faire' AS status;
    END IF;
END$$

DELIMITER ;

CALL V48_FixNotificationsUserId();
DROP PROCEDURE V48_FixNotificationsUserId;

-- ============================================================
-- 2. reservations — utilisateur_id → user_id
-- ============================================================

DELIMITER $$

CREATE PROCEDURE V48_FixReservationsUserId()
BEGIN
    DECLARE col_exists INT;
    DECLARE fk_exists  INT;
    DECLARE fk_name    VARCHAR(200);

    SELECT COUNT(*) INTO col_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = 'reservations'
      AND COLUMN_NAME  = 'utilisateur_id';

    IF col_exists > 0 THEN

        SELECT COUNT(*) INTO fk_exists
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME   = 'reservations'
          AND COLUMN_NAME  = 'utilisateur_id'
          AND REFERENCED_TABLE_NAME IS NOT NULL;

        IF fk_exists > 0 THEN
            SET fk_name = (
                SELECT CONSTRAINT_NAME
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME   = 'reservations'
                  AND COLUMN_NAME  = 'utilisateur_id'
                  AND REFERENCED_TABLE_NAME IS NOT NULL
                LIMIT 1
            );
            SET @sql = CONCAT('ALTER TABLE reservations DROP FOREIGN KEY `', fk_name, '`');
            PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
        END IF;

        ALTER TABLE reservations
            CHANGE COLUMN utilisateur_id user_id INT UNSIGNED NOT NULL;

        ALTER TABLE reservations
            ADD CONSTRAINT fk_reservations_utilisateur
            FOREIGN KEY (user_id) REFERENCES utilisateurs(id)
            ON DELETE CASCADE ON UPDATE CASCADE;

        SELECT 'reservations.utilisateur_id → user_id : OK' AS status;
    ELSE
        SELECT 'reservations : user_id déjà présent, rien à faire' AS status;
    END IF;
END$$

DELIMITER ;

CALL V48_FixReservationsUserId();
DROP PROCEDURE V48_FixReservationsUserId;

-- ============================================================
-- 3. groupes_utilisateurs — utilisateur_id → user_id
-- ============================================================

DELIMITER $$

CREATE PROCEDURE V48_FixGroupesUtilisateursUserId()
BEGIN
    DECLARE col_exists INT;
    DECLARE fk_exists  INT;
    DECLARE fk_name    VARCHAR(200);

    SELECT COUNT(*) INTO col_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = 'groupes_utilisateurs'
      AND COLUMN_NAME  = 'utilisateur_id';

    IF col_exists > 0 THEN

        SELECT COUNT(*) INTO fk_exists
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME   = 'groupes_utilisateurs'
          AND COLUMN_NAME  = 'utilisateur_id'
          AND REFERENCED_TABLE_NAME IS NOT NULL;

        IF fk_exists > 0 THEN
            SET fk_name = (
                SELECT CONSTRAINT_NAME
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME   = 'groupes_utilisateurs'
                  AND COLUMN_NAME  = 'utilisateur_id'
                  AND REFERENCED_TABLE_NAME IS NOT NULL
                LIMIT 1
            );
            SET @sql = CONCAT('ALTER TABLE groupes_utilisateurs DROP FOREIGN KEY `', fk_name, '`');
            PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
        END IF;

        ALTER TABLE groupes_utilisateurs
            CHANGE COLUMN utilisateur_id user_id INT UNSIGNED NOT NULL;

        ALTER TABLE groupes_utilisateurs
            ADD CONSTRAINT fk_groupes_util_user
            FOREIGN KEY (user_id) REFERENCES utilisateurs(id)
            ON DELETE CASCADE ON UPDATE CASCADE;

        SELECT 'groupes_utilisateurs.utilisateur_id → user_id : OK' AS status;
    ELSE
        SELECT 'groupes_utilisateurs : user_id déjà présent, rien à faire' AS status;
    END IF;
END$$

DELIMITER ;

CALL V48_FixGroupesUtilisateursUserId();
DROP PROCEDURE V48_FixGroupesUtilisateursUserId;

-- ============================================================
-- Vérification finale
-- ============================================================

SELECT 'Migration V4.8 terminée avec succès !' AS status;

SELECT 'Structure notifications :' AS info; DESCRIBE notifications;
SELECT 'Structure reservations :'  AS info; DESCRIBE reservations;
SELECT 'Structure groupes_utilisateurs :' AS info; DESCRIBE groupes_utilisateurs;
