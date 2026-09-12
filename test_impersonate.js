const fs = require('fs');

let content = fs.readFileSync('backend/src/modules/superadmin/presentation/controllers/SuperAdminController.ts', 'utf8');

content = content.replace(
    "if ((req.user as any)?.role_app !== 'super_admin' && (req.user as any)?.global_role !== 'super_admin') {",
    "console.log('USER OBJECT IN IMPERSONATE:', req.user);\n        if ((req.user as any)?.role_app !== 'super_admin' && (req.user as any)?.global_role !== 'super_admin') {"
);

fs.writeFileSync('backend/src/modules/superadmin/presentation/controllers/SuperAdminController.ts', content);
