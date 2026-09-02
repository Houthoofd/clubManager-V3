const fs = require('fs');
const file = 'backend/src/modules/messaging/application/use-cases/SendMessageUseCase.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    'envoye_par_email: dto.envoye_par_email,\n    });',
    'envoye_par_email: dto.envoye_par_email,\n      });\n    }'
);
content = content.replace( // Try another spacing if the above didn't match
    'envoye_par_email: dto.envoye_par_email,\n    });\n\n    // Envoyer',
    'envoye_par_email: dto.envoye_par_email,\n    });\n    }\n\n    // Envoyer'
);

fs.writeFileSync(file, content, 'utf8');
