USE clubmanager_master;

CREATE TABLE IF NOT EXISTS saas_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    price DECIMAL(10,2),
    billing_cycle VARCHAR(50),
    max_members INT,
    features JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS saas_modules (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    status VARCHAR(50),
    type VARCHAR(50),
    pricing VARCHAR(50),
    clubsUsingCount INT DEFAULT 0,
    isEnabledGlobally BOOLEAN DEFAULT FALSE,
    dependencies JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS saas_subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    club_id INT,
    plan_id INT,
    status VARCHAR(50),
    next_billing_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS saas_invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    club_id INT,
    amount DECIMAL(10,2),
    currency VARCHAR(10),
    status VARCHAR(50),
    date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
