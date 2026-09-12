const fs = require('fs');
let content = fs.readFileSync('backend/src/modules/superadmin/presentation/controllers/SuperAdminController.ts', 'utf8');

content = content.replace(
    "res.status(500).json({ success: false, message: 'Erreur serveur' });",
    "res.status(500).json({ success: false, message: 'Erreur serveur: ' + (error instanceof Error ? error.message : String(error)), stack: (error instanceof Error ? error.stack : undefined) });"
);

fs.writeFileSync('backend/src/modules/superadmin/presentation/controllers/SuperAdminController.ts', content);
