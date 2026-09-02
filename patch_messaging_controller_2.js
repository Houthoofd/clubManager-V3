const fs = require('fs');
const file = 'backend/src/modules/messaging/presentation/controllers/MessagingController.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /envoye_par_email,[\r\n]+\s*\} = req\.body;/g,
    'envoye_par_email,\n          envoye_en_interne,\n        } = req.body;'
);

fs.writeFileSync(file, content, 'utf8');
