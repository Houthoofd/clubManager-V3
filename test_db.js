const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'backend/.env' });

async function check() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  
  console.log("=== Event Registrations ===");
  const [rows] = await connection.execute('SELECT * FROM event_registrations ORDER BY created_at DESC LIMIT 5');
  console.log(rows);
  
  console.log("=== Paiements ===");
  const [rows2] = await connection.execute('SELECT * FROM paiements ORDER BY created_at DESC LIMIT 5');
  console.log(rows2);
  
  connection.end();
}
check();
