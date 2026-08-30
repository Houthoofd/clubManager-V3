-- ============================================================
-- MIGRATION V5.1 - MODULE EVENEMENTS (EVENTS)
-- ============================================================
-- Description:
-- Création des tables nécessaires pour la gestion des évènements.
-- 1. events : Stocke les détails de l'évènement.
-- 2. event_registrations : Gère les inscriptions des utilisateurs.
-- ============================================================

-- 1. Table events
CREATE TABLE IF NOT EXISTS events (
    id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
    title           VARCHAR(255) NOT NULL,
    description     TEXT DEFAULT NULL,
    location        VARCHAR(255) DEFAULT NULL,
    start_date      DATETIME NOT NULL,
    end_date        DATETIME NOT NULL,
    capacity        INT UNSIGNED DEFAULT NULL COMMENT 'NULL means unlimited',
    price           DECIMAL(10,2) DEFAULT 0.00,
    visibility      ENUM('PUBLIC', 'MEMBERS_ONLY', 'SPECIFIC_GRADES') NOT NULL DEFAULT 'MEMBERS_ONLY',
    min_grade_id    INT UNSIGNED DEFAULT NULL,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    CONSTRAINT fk_events_min_grade FOREIGN KEY (min_grade_id) REFERENCES grades(id) ON DELETE SET NULL,
    INDEX idx_events_start_date (start_date),
    INDEX idx_events_visibility (visibility)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Table event_registrations
CREATE TABLE IF NOT EXISTS event_registrations (
    id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
    event_id        INT UNSIGNED NOT NULL,
    user_id         INT UNSIGNED NOT NULL,
    status          ENUM('CONFIRMED', 'WAITLIST', 'CANCELLED') NOT NULL DEFAULT 'CONFIRMED',
    payment_status  ENUM('PENDING', 'PAID', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    payment_id      INT UNSIGNED DEFAULT NULL COMMENT 'Lien potentiel vers le module payments',
    registered_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_event_user (event_id, user_id),
    CONSTRAINT fk_registration_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    CONSTRAINT fk_registration_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
