const mysql = require('mysql2/promise');

async function run() {
  const c = await mysql.createConnection({host:'localhost',user:'root',database:'clubmanager_master'});
  await c.query(`
    CREATE TABLE IF NOT EXISTS saas_plans (
      id INT AUTO_INCREMENT PRIMARY KEY, 
      stripe_product_id VARCHAR(255), 
      stripe_price_id VARCHAR(255), 
      name VARCHAR(100) NOT NULL, 
      description TEXT, 
      price DECIMAL(10,2) NOT NULL, 
      currency VARCHAR(10) DEFAULT 'EUR', 
      billing_cycle ENUM('monthly', 'yearly') DEFAULT 'monthly', 
      max_members INT, 
      features JSON, 
      is_active BOOLEAN DEFAULT true, 
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `);
  
  // Seed initial plans
  await c.query(`
    INSERT INTO saas_plans (name, description, price, max_members, features)
    VALUES 
      ('Basic', 'Idéal pour les petits clubs', 29.00, 50, '["Gestion des membres", "1 administrateur", "Support email"]'),
      ('Pro', 'Pour les clubs en développement', 59.00, 200, '["Gestion des membres", "Administrateurs illimités", "Paiements en ligne", "Support prioritaire"]'),
      ('Premium', 'La solution complète', 99.00, NULL, '["Tout en illimité", "Boutique en ligne", "API / Marque blanche", "Manager dédié"]')
  `);

  console.log('Table created and seeded');
  await c.end();
}
run();
