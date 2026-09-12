const fs = require('fs');
const mysql = require('mysql2/promise');

const dbs = ['tenant_fcbj', 'tenant_tcp', 'tenant_jcl', 'tenant_asmn', 'tenant_bdxa'];
let schema = fs.readFileSync('../db/creation/SCHEMA_CONSOLIDATE.sql', 'utf8');

(async () => {
  const connection = await mysql.createConnection({ host: 'localhost', user: 'root', password: '', multipleStatements: true });
  for (const db of dbs) {
    console.log('Creating ' + db + '...');
    const localSchema = `SET FOREIGN_KEY_CHECKS=0;\nCREATE DATABASE IF NOT EXISTS ${db} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\nUSE ${db};\n` + schema.replace(/CREATE DATABASE clubmanager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;/g, '').replace(/DROP DATABASE IF EXISTS clubmanager;/g, '').replace(/USE clubmanager;/g, '').replace(/clubmanager/g, db);
    try {
        await connection.query(localSchema);
        console.log(db + ' created successfully!');
    } catch (e) {
        console.error("Error with " + db + ": " + e.message);
    }
  }
  process.exit(0);
})();
