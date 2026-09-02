const fs = require('fs');
const file = 'frontend/src/features/messaging/api/messagingApi.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    'envoye_par_email: boolean;',
    'envoye_par_email: boolean;\n  envoye_en_interne?: boolean;'
);

fs.writeFileSync(file, content, 'utf8');
