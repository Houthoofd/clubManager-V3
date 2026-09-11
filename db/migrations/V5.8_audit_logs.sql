CREATE TABLE audit_logs (
  id VARCHAR(36) NOT NULL,
  club_id INT DEFAULT NULL,
  user_id INT DEFAULT NULL,
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100) DEFAULT NULL,
  entity_id VARCHAR(100) DEFAULT NULL,
  metadata JSON DEFAULT NULL,
  severity ENUM('info', 'warning', 'critical') DEFAULT 'info',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
