-- ==============================================================================
-- ClubManager - MASTER DATABASE SCHEMA
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `clubmanager_master` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `clubmanager_master`;

-- 1. Table des Organisations (Tenants)
CREATE TABLE IF NOT EXISTS `organizations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `uuid` VARCHAR(36) NOT NULL UNIQUE,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `code` VARCHAR(10) NOT NULL UNIQUE,
  `db_name` VARCHAR(255) NOT NULL UNIQUE,
  `contact_email` VARCHAR(255) NOT NULL,
  `contact_phone` VARCHAR(50) DEFAULT NULL,
  `status` ENUM('trial', 'active', 'suspended', 'cancelled') DEFAULT 'trial',
  `stripe_customer_id` VARCHAR(255) DEFAULT NULL,
  `subscription_plan` VARCHAR(50) DEFAULT 'pro',
  `trial_ends_at` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `master_users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NULL,
  `organization_id` INT NULL,
  `global_role` ENUM('super_admin', 'org_admin', 'user') DEFAULT 'user',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_master_users_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
