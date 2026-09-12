const fs = require('fs');
let content = fs.readFileSync('backend/src/modules/statistics/infrastructure/repositories/MySQLStatisticsRepository.ts', 'utf8');

content = content.replace(/sp\.code/g, "p.statut");
content = content.replace(/LEFT JOIN statuts_paiement\s*sp ON sp\.id = p\.statut_id/g, "");

fs.writeFileSync('backend/src/modules/statistics/infrastructure/repositories/MySQLStatisticsRepository.ts', content);
console.log("Patched sp.code");
