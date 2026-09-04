-- ==============================================================================
-- ClubManager - MASTER DATABASE SCHEMA
-- ==============================================================================
-- Cette base de données (clubmanager_master) sert de registre central pour le multi-tenant.
-- Elle ne contient AUCUNE donnée métier des clubs (pas de membres, cours, etc.).
-- Elle stocke uniquement les informations des organisations (tenants) et la 
-- correspondance (mapping) entre les emails des utilisateurs et leur base de données.
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS \`clubmanager_master\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`clubmanager_master\`;

-- 1. Table des Organisations (Tenants)
CREATE TABLE IF NOT EXISTS \`organizations\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`uuid\` VARCHAR(36) NOT NULL UNIQUE,
  \`name\` VARCHAR(255) NOT NULL,
  \`slug\` VARCHAR(255) NOT NULL UNIQUE,          -- ex: "judo-club-paris" (utilisé pour les sous-domaines ou URLs)
  \`db_name\` VARCHAR(255) NOT NULL UNIQUE,       -- ex: "clubmanager_tenant_5"
  \`contact_email\` VARCHAR(255) NOT NULL,
  \`contact_phone\` VARCHAR(50) DEFAULT NULL,
  \`status\` ENUM('trial', 'active', 'suspended', 'cancelled') DEFAULT 'trial',
  \`stripe_customer_id\` VARCHAR(255) DEFAULT NULL,
  \`subscription_plan\` VARCHAR(50) DEFAULT 'pro',
  \`trial_ends_at\` DATETIME DEFAULT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Table de Mapping des Utilisateurs (Master Users)
-- Un utilisateur s'identifie avec son email sur la plateforme globale.
-- Cette table permet de savoir vers quelle base de données (organization) 
-- ses requêtes doivent être redirigées.
CREATE TABLE IF NOT EXISTS \`master_users\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`email\` VARCHAR(255) NOT NULL UNIQUE,
  \`organization_id\` INT NOT NULL,
  \`global_role\` ENUM('super_admin', 'org_admin', 'user') DEFAULT 'user',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_master_users_org\` FOREIGN KEY (\`organization_id\`) REFERENCES \`organizations\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Table des Tâches de Provisioning (Optionnel, pour suivre les déploiements)
CREATE TABLE IF NOT EXISTS \`provisioning_tasks\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`organization_id\` INT DEFAULT NULL,
  \`status\` ENUM('pending', 'in_progress', 'completed', 'failed') DEFAULT 'pending',
  \`logs\` TEXT,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_provisioning_org\` FOREIGN KEY (\`organization_id\`) REFERENCES \`organizations\` (\`id\`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
