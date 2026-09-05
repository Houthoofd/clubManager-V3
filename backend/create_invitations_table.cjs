const mysql = require('mysql2/promise');

async function run() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Assuming no password for local dev root, or I should check environment variables.
    database: 'clubmanager_master'
  });

  const query = `
    CREATE TABLE IF NOT EXISTS organization_invitations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      token VARCHAR(64) NOT NULL UNIQUE,
      status ENUM('pending', 'accepted', 'expired') DEFAULT 'pending',
      expires_at DATETIME NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  await connection.query(query);
  console.log('Table organization_invitations created successfully.');
  await connection.end();
}

run().catch(console.error);
