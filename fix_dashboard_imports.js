const fs = require('fs');

let c = fs.readFileSync('frontend/src/features/superadmin/pages/SuperAdminDashboard.tsx', 'utf8');

c = c.replace(
  /XMarkIcon\r?\n\}\s*from\s*'@heroicons\/react\/24\/outline';/,
  "XMarkIcon,\n  EnvelopeIcon,\n  ArrowRightOnRectangleIcon\n} from '@heroicons/react/24/outline';"
);

fs.writeFileSync('frontend/src/features/superadmin/pages/SuperAdminDashboard.tsx', c);
