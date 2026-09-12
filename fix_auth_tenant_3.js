const fs = require('fs');
let content = fs.readFileSync('backend/src/shared/middleware/authMiddleware.ts', 'utf8');

content = content.replace(/decoded\?\.tenantDbName/g, "(req as any).user?.tenantDbName");
content = content.replace(/decoded\?\.role_app/g, "(req as any).user?.role_app");

fs.writeFileSync('backend/src/shared/middleware/authMiddleware.ts', content);
console.log("Patched decoded to req.user!");
