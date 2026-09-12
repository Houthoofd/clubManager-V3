const fs = require('fs');
let content = fs.readFileSync('backend/src/modules/statistics/infrastructure/repositories/MySQLStatisticsRepository.ts', 'utf8');

content = content.replace(/LEFT JOIN statuts_paiement sp2 ON sp2\.id = p2\.statut_id\s*WHERE sp2\.code = 'valide'/g, "WHERE p2.statut = 'valide'");
content = content.replace(/e\.statut_id = 1/g, "e.statut = 'en_attente'");
content = content.replace(/WHERE statut_id = 1/g, "WHERE statut = 'en_attente'");

fs.writeFileSync('backend/src/modules/statistics/infrastructure/repositories/MySQLStatisticsRepository.ts', content);
console.log("Patched echeances and p2!");
