const fs = require('fs');
const file = 'backend/src/modules/messaging/application/use-cases/SendMessageUseCase.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /envoye_par_email: boolean;[\r\n]+}/,
    'envoye_par_email: boolean;\n  envoye_en_interne?: boolean;\n}'
);

fs.writeFileSync(file, content, 'utf8');
