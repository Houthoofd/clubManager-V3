const fs = require('fs');
const file = 'backend/src/modules/messaging/application/use-cases/SendMessageUseCase.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    'envoye_par_email: dto.envoye_par_email,\n    });\n\n    // Envoyer la notification',
    'envoye_par_email: dto.envoye_par_email,\n    });\n    }\n\n    // Envoyer la notification'
);
content = content.replace( // Try with carriage returns
    'envoye_par_email: dto.envoye_par_email,\r\n    });\r\n\r\n    // Envoyer la notification',
    'envoye_par_email: dto.envoye_par_email,\r\n    });\r\n    }\r\n\r\n    // Envoyer la notification'
);

fs.writeFileSync(file, content, 'utf8');
