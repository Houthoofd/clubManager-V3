const fs = require('fs');
let content = fs.readFileSync('backend/src/modules/statistics/infrastructure/repositories/MySQLStatisticsRepository.ts', 'utf8');

content = content.replace(/mp\.code AS methode_paiement,/g, "p.methode_paiement,");
content = content.replace(/GROUP BY mp\.code, mp\.nom/g, "GROUP BY p.methode_paiement");

fs.writeFileSync('backend/src/modules/statistics/infrastructure/repositories/MySQLStatisticsRepository.ts', content);
console.log("Patched mp.code");
