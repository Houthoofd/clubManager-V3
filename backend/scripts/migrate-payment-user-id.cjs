/**
 * Migration script: rename utilisateur_id → user_id in paiements and echeances_paiements
 *
 * Idempotent: checks column existence before acting.
 * Also drops the old FK and re-adds it as ON DELETE CASCADE ON UPDATE CASCADE.
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

async function renameColumn(conn, tableName, fkConstraintName) {
  // 1. Check if utilisateur_id still exists
  const [cols] = await conn.query(
    `SELECT COUNT(*) AS cnt
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME   = ?
       AND COLUMN_NAME  = 'utilisateur_id'`,
    [tableName]
  );

  if (cols[0].cnt === 0) {
    console.log(`⏭️  ${tableName}: utilisateur_id not found — already migrated or column name differs, skipping`);
    return;
  }

  console.log(`🔄 ${tableName}: utilisateur_id found — starting rename…`);

  // 2. Drop any FK that references utilisateur_id
  const [fkRows] = await conn.query(
    `SELECT CONSTRAINT_NAME
     FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
     WHERE TABLE_SCHEMA          = DATABASE()
       AND TABLE_NAME            = ?
       AND COLUMN_NAME           = 'utilisateur_id'
       AND REFERENCED_TABLE_NAME IS NOT NULL`,
    [tableName]
  );

  for (const row of fkRows) {
    const fkName = row.CONSTRAINT_NAME;
    console.log(`   🗑  Dropping FK: ${fkName}`);
    await conn.query(`ALTER TABLE \`${tableName}\` DROP FOREIGN KEY \`${fkName}\``);
  }

  // 3. Rename column
  await conn.query(
    `ALTER TABLE \`${tableName}\` CHANGE COLUMN utilisateur_id user_id INT UNSIGNED NOT NULL`
  );
  console.log(`   ✅ Renamed utilisateur_id → user_id`);

  // 4. Re-add FK with CASCADE rules
  await conn.query(
    `ALTER TABLE \`${tableName}\`
     ADD CONSTRAINT \`${fkConstraintName}\`
     FOREIGN KEY (user_id) REFERENCES utilisateurs(id)
     ON DELETE CASCADE ON UPDATE CASCADE`
  );
  console.log(`   ✅ Re-added FK constraint: ${fkConstraintName}`);

  console.log(`✅ ${tableName}: migration complete`);
}

async function run() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST,
    port:     Number(process.env.DB_PORT ?? 3306),
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    console.log('🚀 Starting migration: utilisateur_id → user_id in payment tables\n');

    await renameColumn(conn, 'paiements',           'fk_paiements_utilisateur');
    await renameColumn(conn, 'echeances_paiements', 'fk_echeances_utilisateur');

    console.log('\n🎉 Migration finished successfully');

    // Final check
    const [p]  = await conn.query('DESCRIBE paiements');
    const [ep] = await conn.query('DESCRIBE echeances_paiements');

    const colNames = (rows) => rows.map((r) => r.Field).join(', ');
    console.log(`\npaiements columns           : ${colNames(p)}`);
    console.log(`echeances_paiements columns : ${colNames(ep)}`);
  } finally {
    await conn.end();
  }
}

run().catch((err) => {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
});
