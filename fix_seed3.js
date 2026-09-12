const fs = require('fs');
let content = fs.readFileSync('e2e/setup/seed-e2e.ts', 'utf8');

const replacement = `
  console.log("\\n🔧 Insertion de l'organisation E2E (prefix U) dans clubmanager_master...");
  const masterConn = await mysql.createConnection({ ...DB_CONFIG, database: 'clubmanager_master' });
  await masterConn.query("INSERT IGNORE INTO organizations (id, name, code, db_name) VALUES (9999, 'E2E Test Club', 'U', '" + DB_CONFIG.database + "')");
  await masterConn.query("INSERT IGNORE INTO master_users (id, organization_id, email, password_hash, global_role) VALUES (9999, 9999, 'e2e_admin@test.local', '', 'admin'), (9998, 9999, 'e2e_member@test.local', '', 'member'), (9997, 9999, 'e2e_prof@test.local', '', 'professor')");
  await masterConn.end();
  console.log("   ✓ Organisation E2E insérée");
`;

content = content.replace(
  /console\.log\("\\n🔧 Insertion de l'organisation E2E \(prefix U\)\.\.\."\);\s*await connection\.query\("INSERT IGNORE INTO organizations \([^)]+\) VALUES \([^)]+\)"\);\s*console\.log\("   ✓ Organisation E2E insérée"\);/,
  replacement
);

fs.writeFileSync('e2e/setup/seed-e2e.ts', content);
console.log("Patched seed-e2e.ts for master!");
