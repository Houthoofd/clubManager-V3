const fs = require('fs');
let content = fs.readFileSync('e2e/setup/seed-e2e.ts', 'utf8');

const insertOrgCode = `
  console.log("\\n🔧 Insertion de l'organisation E2E (prefix U)...");
  await connection.query("INSERT IGNORE INTO organizations (id, name, code, db_name) VALUES (9999, 'E2E Test Club', 'U', '" + DB_CONFIG.database + "')");
  console.log("   ✓ Organisation E2E insérée");
`;

content = content.replace(
  /console\.log\("✅ Connexion MySQL établie"\);/g,
  "console.log(\"✅ Connexion MySQL établie\");" + insertOrgCode
);

fs.writeFileSync('e2e/setup/seed-e2e.ts', content);
console.log("Patched seed-e2e.ts!");
