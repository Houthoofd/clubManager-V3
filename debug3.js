const fs = require('fs');
let content = fs.readFileSync('backend/src/modules/superadmin/presentation/controllers/SuperAdminController.ts', 'utf8');

content = content.replace(
    "console.error('[SuperAdminController] Error impersonating club:', error);\n      res.status(500).json({ success: false, message: 'Erreur serveur' });",
    "console.error('[SuperAdminController] Error impersonating club:', error);\n      res.status(500).json({ success: false, message: 'Erreur serveur: ' + (error instanceof Error ? error.message : String(error)) });"
);

fs.writeFileSync('backend/src/modules/superadmin/presentation/controllers/SuperAdminController.ts', content);
