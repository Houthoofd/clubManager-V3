const fs = require('fs');
let schema = fs.readFileSync('db/creation/SCHEMA_CONSOLIDATE.sql', 'utf8');
schema = schema.replace(/REFERENCES users\(id\)/g, 'REFERENCES utilisateurs(id)');
fs.writeFileSync('db/creation/SCHEMA_CONSOLIDATE.sql', schema);
console.log('Fixed REFERENCES users(id)');
