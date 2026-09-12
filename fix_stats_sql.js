const fs = require('fs');
let content = fs.readFileSync('backend/src/modules/statistics/infrastructure/repositories/MySQLStatisticsRepository.ts', 'utf8');

// Fix financial overview
content = content.replace(
  /LEFT JOIN statuts_paiement sp ON sp\.id = p\.statut_id\s*WHERE sp\.code = 'valide'/g,
  "WHERE p.statut = 'valide'"
);
content = content.replace(
  /LEFT JOIN statuts_paiement sp ON sp\.id = p\.statut_id\s*AND sp\.code = 'valide'/g,
  "AND p.statut = 'valide'"
);

content = content.replace(
  /SUM\(CASE WHEN sp\.code = 'en_attente' THEN p\.montant ELSE 0 END\) as montant_en_attente/g,
  "SUM(CASE WHEN p.statut = 'en_attente' THEN p.montant ELSE 0 END) as montant_en_attente"
);

content = content.replace(
  /SUM\(CASE WHEN sp\.code = 'valide'(\s*)THEN 1 ELSE 0 END\)/g,
  "SUM(CASE WHEN p.statut = 'valide'$1THEN 1 ELSE 0 END)"
);

content = content.replace(
  /LEFT JOIN statuts_paiement sp ON sp\.id = p\.statut_id/g,
  ""
);

content = content.replace(
  /LEFT JOIN methodes_paiement\s*mp ON mp\.id = p\.methode_paiement_id/g,
  ""
);

content = content.replace(
  /mp\.nom as methode_paiement,/g,
  "p.methode_paiement,"
);

fs.writeFileSync('backend/src/modules/statistics/infrastructure/repositories/MySQLStatisticsRepository.ts', content);
console.log("Patched MySQLStatisticsRepository.ts!");
