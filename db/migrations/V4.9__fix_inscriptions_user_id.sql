-- ============================================================
-- MIGRATION V4.9 - FIX INSCRIPTIONS USER_ID COLUMN
-- ============================================================
-- Description:
--   Renomme utilisateur_id en user_id dans la table inscriptions
--   (même pattern que migrations 008 et V4.8)
--
--   Cause : SCHEMA_CONSOLIDATE.sql utilise user_id mais la table
--   inscriptions n'a jamais été migrée (oubliée dans V4.8).
--   Symptôme : GET /api/courses/sessions/my-enrollments → 500
--              (Unknown column 'i.user_id' in 'where clause')
--
-- Préconditions :
--   - Migrations 008 et V4.8 déjà appliquées
--   - Table inscriptions existe avec colonne utilisateur_id
--
-- Idempotent : la procédure vérifie l'existence de la colonne
--              avant d'agir — sans risque si déjà migrée.
-- ============================================================

USE clubmanager;

DELIMITER $$

CREATE PROCEDURE V49_FixInscriptionsUserId()
BEGIN
    DECLARE col_exists INT;
    DECLARE fk_exists  INT;
    DECLARE fk_name    VARCHAR(200);

    -- Vérifier si la colonne utilisateur_id existe encore
    SELECT COUNT(*) INTO col_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = 'inscriptions'
      AND COLUMN_NAME  = 'utilisateur_id';

    IF col_exists > 0 THEN

        -- Chercher et supprimer la FK si elle référence utilisateur_id
        SELECT COUNT(*) INTO fk_exists
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA        = DATABASE()
          AND TABLE_NAME          = 'inscriptions'
          AND COLUMN_NAME         = 'utilisateur_id'
          AND REFERENCED_TABLE_NAME IS NOT NULL;

        IF fk_exists > 0 THEN
            SET fk_name = (
                SELECT CONSTRAINT_NAME
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                WHERE TABLE_SCHEMA        = DATABASE()
                  AND TABLE_NAME          = 'inscriptions'
                  AND COLUMN_NAME         = 'utilisateur_id'
                  AND REFERENCED_TABLE_NAME IS NOT NULL
                LIMIT 1
            );
            SET @sql = CONCAT('ALTER TABLE inscriptions DROP FOREIGN KEY `', fk_name, '`');
            PREPARE stmt FROM @sql;
            EXECUTE stmt;
            DEALLOCATE PREPARE stmt;
        END IF;

        -- Renommer la colonne (les index et UNIQUE KEY suivent automatiquement)
        ALTER TABLE inscriptions
            CHANGE COLUMN utilisateur_id user_id INT UNSIGNED NOT NULL;

        -- Recréer la FK vers utilisateurs(id)
        ALTER TABLE inscriptions
            ADD CONSTRAINT fk_inscriptions_utilisateur
            FOREIGN KEY (user_id) REFERENCES utilisateurs(id)
            ON DELETE CASCADE ON UPDATE CASCADE;

        SELECT 'inscriptions.utilisateur_id → user_id : OK' AS status;

    ELSE
        SELECT 'inscriptions : user_id déjà présent, rien à faire' AS status;
    END IF;
END$$

DELIMITER ;

CALL V49_FixInscriptionsUserId();
DROP PROCEDURE V49_FixInscriptionsUserId;

-- ============================================================
-- Vérification finale
-- ============================================================
SELECT 'Migration V4.9 terminée !' AS status;
SELECT 'Structure inscriptions :' AS info;
DESCRIBE inscriptions;
