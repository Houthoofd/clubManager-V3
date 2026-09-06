const fs = require('fs');

const files = [
  'frontend/src/features/superadmin/pages/SuperAdminBilling.tsx',
  'frontend/src/features/superadmin/pages/SuperAdminDashboard.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // Replace max-w-7xl mx-auto with w-full
  content = content.replace(/className="max-w-7xl mx-auto relative"/g, 'className="w-full relative"');
  fs.writeFileSync(file, content);
});
