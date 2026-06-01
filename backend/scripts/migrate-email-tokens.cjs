/**
 * Migration script: fix email_validation_tokens schema
 * Adds token_type and used columns, makes email nullable
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
  });

  try {
    // 1. Check current columns
    const [cols] = await conn.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'email_validation_tokens'"
    );
    const existing = cols.map(r => r.COLUMN_NAME);
    console.log('Existing columns:', existing);

    // 2. Add token_type if missing
    if (!existing.includes('token_type')) {
      await conn.query(
        "ALTER TABLE email_validation_tokens ADD COLUMN token_type ENUM('verification', 'change_email') NOT NULL DEFAULT 'verification' AFTER token_hash"
      );
      console.log('✅ Added token_type column');
    } else {
      console.log('⏭️  token_type already exists');
    }

    // 3. Add used if missing
    if (!existing.includes('used')) {
      await conn.query(
        "ALTER TABLE email_validation_tokens ADD COLUMN used BOOLEAN NOT NULL DEFAULT FALSE AFTER expires_at"
      );
      console.log('✅ Added used column');
    } else {
      console.log('⏭️  used already exists');
    }

    // 4. Make email nullable if it's NOT NULL
    const [emailCol] = await conn.query(
      "SELECT IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'email_validation_tokens' AND COLUMN_NAME = 'email'"
    );
    if (emailCol.length > 0 && emailCol[0].IS_NULLABLE === 'NO') {
      await conn.query(
        "ALTER TABLE email_validation_tokens MODIFY email VARCHAR(255) NULL COMMENT 'Nouvel email cible (change_email uniquement)'"
      );
      console.log('✅ Made email column nullable');
    } else {
      console.log('⏭️  email already nullable (or does not exist)');
    }

    // 5. Show final schema
    const [finalCols] = await conn.query('DESCRIBE email_validation_tokens');
    console.log('\nFinal schema:');
    finalCols.forEach(c => console.log(` - ${c.Field} (${c.Type}) NULL=${c.Null} Default=${c.Default}`));

  } finally {
    await conn.end();
  }
}

run().catch(err => { console.error('Migration failed:', err.message); process.exit(1); });
