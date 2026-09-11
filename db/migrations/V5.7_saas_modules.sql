CREATE TABLE saas_modules (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    type VARCHAR(50) NOT NULL DEFAULT 'standard',
    pricing JSON,
    is_enabled_globally BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE saas_module_dependencies (
    module_id VARCHAR(36) NOT NULL,
    depends_on_module_id VARCHAR(36) NOT NULL,
    PRIMARY KEY (module_id, depends_on_module_id),
    FOREIGN KEY (module_id) REFERENCES saas_modules(id) ON DELETE CASCADE,
    FOREIGN KEY (depends_on_module_id) REFERENCES saas_modules(id) ON DELETE CASCADE
);

CREATE TABLE saas_module_changelogs (
    id VARCHAR(36) PRIMARY KEY,
    module_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (module_id) REFERENCES saas_modules(id) ON DELETE CASCADE
);

CREATE TABLE club_modules (
    club_id VARCHAR(36) NOT NULL,
    module_id VARCHAR(36) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    activated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (club_id, module_id),
    FOREIGN KEY (module_id) REFERENCES saas_modules(id) ON DELETE CASCADE
);
