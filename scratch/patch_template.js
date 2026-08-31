
const fs = require('fs');
let code = fs.readFileSync('/home/bartok-48/Documents/clubManager-V3/backend/src/modules/templates/application/services/TemplateEngineService.ts', 'utf8');
code = code.replace(
  /lien_paiement = \`\${frontendUrl}\/quick-pay\?token=\${token}\`;/,
  'lien_paiement = `${frontendUrl}/quick-pay?token=${token}&type=cotisation`;'
);
fs.writeFileSync('/home/bartok-48/Documents/clubManager-V3/backend/src/modules/templates/application/services/TemplateEngineService.ts', code);
