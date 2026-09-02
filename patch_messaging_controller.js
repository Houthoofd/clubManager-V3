const fs = require('fs');
const file = 'backend/src/modules/messaging/presentation/controllers/MessagingController.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    'envoye_par_email,\n        } = req.body;',
    'envoye_par_email,\n          envoye_en_interne,\n        } = req.body;'
);

content = content.replace(
    'envoye_par_email: Boolean(envoye_par_email),',
    'envoye_par_email: Boolean(envoye_par_email),\n          envoye_en_interne: envoye_en_interne !== undefined ? Boolean(envoye_en_interne) : true,'
);

// If there's an error because it didn't find the exact match, we'll see
fs.writeFileSync(file, content, 'utf8');
console.log('MessagingController patched');
