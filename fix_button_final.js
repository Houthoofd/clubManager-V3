const fs = require('fs');

let c = fs.readFileSync('frontend/src/features/superadmin/pages/SuperAdminDashboard.tsx', 'utf8');

c = c.replace(
  /<button\s*onClick=\{\(\) => setIsInviteModalOpen\(true\)\}\s*className="px-4 py-2 text-sm font-medium text-white bg-brand-blue rounded-lg hover:bg-brand-blue\/90 transition-colors"\s*>\s*Inviter un Club\s*<\/button>/,
  `<button
              onClick={() => setIsInviteModalOpen(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-blue rounded-lg hover:bg-brand-blue/90 transition-colors inline-flex items-center gap-2"
            >
              <EnvelopeIcon className="h-5 w-5 -mt-1" />
              Inviter un Club
            </button>`
);

fs.writeFileSync('frontend/src/features/superadmin/pages/SuperAdminDashboard.tsx', c);
