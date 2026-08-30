const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function run() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'clubmanager',
  });

  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tutoriels_vus (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        utilisateur_id INT UNSIGNED NOT NULL,
        tutoriel_id VARCHAR(50) NOT NULL,
        date_vue TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_tutorial (utilisateur_id, tutoriel_id),
        FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('Table tutoriels_vus created successfully!');
  } catch (error) {
    console.error('Error creating table:', error);
  } finally {
    await pool.end();
  }
}

run();
