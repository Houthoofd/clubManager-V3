const fs = require('fs');

let content = fs.readFileSync('backend/src/modules/superadmin/presentation/controllers/SuperAdminController.ts', 'utf8');

if (!content.includes('JwtService')) {
  content = "import { JwtService } from '../../../../shared/services/JwtService.js';\n" + content;
} else if (!content.includes('import { JwtService')) {
  content = "import { JwtService } from '../../../../shared/services/JwtService.js';\n" + content;
}

fs.writeFileSync('backend/src/modules/superadmin/presentation/controllers/SuperAdminController.ts', content);
