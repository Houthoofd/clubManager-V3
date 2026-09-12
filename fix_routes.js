const fs = require('fs');

let content = fs.readFileSync('backend/src/modules/superadmin/presentation/routes/superAdminRoutes.ts', 'utf8');
content = content.replace(
  "import { authMiddleware, requireRole } from '../../../shared/middleware/authMiddleware.js';",
  "import { authMiddleware, requireRole } from '../../../../shared/middleware/authMiddleware.js';"
);
fs.writeFileSync('backend/src/modules/superadmin/presentation/routes/superAdminRoutes.ts', content);
