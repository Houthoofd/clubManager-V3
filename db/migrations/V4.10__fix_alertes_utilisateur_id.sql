-- ============================================================
-- MIGRATION V4.10 - FIX alertes_utilisateurs COLUMN NAME
-- ============================================================
-- Description:
--   Renomme utilisateur_id en user_id dans alertes_utilisateurs
--   (même pattern que V4.8 pour notifications, reservations, groupes_utilisateurs)
--
-- Date: 2026-05-26
-- Précondition: Migration V4.8 déjà appliquée
-- ============================================================

USE clubmanager;

DELIMITER $$

CREATE PROCEDURE V410_FixAlertesUtilisateurId()
BEGIN
    DECLARE col_exists INT;
    DECLARE fk_exists  INT;
    DECLARE fk_name    VARCHAR(200);

    SELECT COUNT(*) INTO col_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = 'alertes_utilisateurs'
      AND COLUMN_NAME  = 'utilisateur_id';

    IF col_exists > 0 THEN

        -- Supprimer la FK existante si présente
        SELECT COUNT(*) INTO fk_exists
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME   = 'alertes_utilisateurs'
          AND COLUMN_NAME  = 'utilisateur_id'
          AND REFERENCED_TABLE_NAME IS NOT NULL;

        IF fk_exists > 0 THEN
            SET fk_name = (
                SELECT CONSTRAINT_NAME
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME   = 'alertes_utilisateurs'
                  AND COLUMN_NAME  = 'utilisateur_id'
                  AND REFERENCED_TABLE_NAME IS NOT NULL
                LIMIT 1
            );
            SET @sql = CONCAT('ALTER TABLE alertes_utilisateurs DROP FOREIGN KEY `', fk_name, '`');
            PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
        END IF;

        -- Renommer la colonne
        ALTER TABLE alertes_utilisateurs
            CHANGE COLUMN utilisateur_id user_id INT UNSIGNED NOT NULL;

        -- Recréer la FK
        ALTER TABLE alertes_utilisateurs
            ADD CONSTRAINT fk_alertes_util_user
            FOREIGN KEY (user_id) REFERENCES utilisateurs(id)
            ON DELETE CASCADE ON UPDATE CASCADE;

        SELECT 'alertes_utilisateurs.utilisateur_id → user_id : OK' AS status;
    ELSE
        SELECT 'alertes_utilisateurs : user_id déjà présent, rien à faire' AS status;
    END IF;
END$$

DELIMITER ;

CALL V410_FixAlertesUtilisateurId();
DROP PROCEDURE V410_FixAlertesUtilisateurId;

SELECT 'Migration V4.10 terminée avec succès !' AS status;
