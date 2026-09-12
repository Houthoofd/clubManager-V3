const fs = require('fs');
let content = fs.readFileSync('backend/src/shared/middleware/authMiddleware.ts', 'utf8');

if (!content.includes('tenantContext.getTenant')) {
    content = "import { tenantContext } from '@/core/context/tenantContext.js';\n" + content;
}

content = content.replace(/tenantDbName\?: string;/g, ""); // clear if any
content = content.replace(/role_app\?: UserRole;/g, "role_app?: UserRole;\n    tenantDbName?: string;");

content = content.replace(/tenantDbName: decoded\.tenantDbName,/g, ""); // clear if any
content = content.replace(/role_app: decoded\.role_app,/g, "role_app: decoded.role_app,\n        tenantDbName: decoded.tenantDbName,");

content = content.replace(/next\(\);/g, `
        const contextData = {
          tenantId: null,
          dbName: decoded?.tenantDbName || null,
          isMaster: !decoded?.tenantDbName || decoded?.role_app === 'super_admin'
        };
        tenantContext.run(contextData, () => {
          next();
        });
`);

fs.writeFileSync('backend/src/shared/middleware/authMiddleware.ts', content);
console.log("Patched next()!");
