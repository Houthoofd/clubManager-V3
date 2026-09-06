const fs = require('fs');
let c = fs.readFileSync('frontend/src/features/superadmin/pages/SuperAdminDashboard.tsx', 'utf8');

const oldBtn = `          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-blue rounded-lg hover:bg-brand-blue/90 transition-colors"
            >
              Inviter un Club
            </button>
          </div>`;

const newBtn = `          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm inline-flex items-center gap-2"
            >
              <ArrowDownTrayIcon className="w-5 h-5 -mt-1" />
              Exporter CSV
            </button>
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-blue rounded-lg hover:bg-brand-blue/90 transition-colors shadow-sm inline-flex items-center gap-2"
            >
              <EnvelopeIcon className="w-5 h-5 -mt-1" />
              Inviter un Club
            </button>
          </div>`;

// Check if Export CSV is already there
if (c.includes('Exporter CSV')) {
  // If it's there but without the icon for Invite
  c = c.replace(/className="px-4 py-2 text-sm font-medium text-white bg-brand-blue rounded-lg hover:bg-brand-blue\/90 transition-colors shadow-sm inline-flex items-center gap-2"\s*>\s*Inviter un Club/g, 'className="px-4 py-2 text-sm font-medium text-white bg-brand-blue rounded-lg hover:bg-brand-blue/90 transition-colors shadow-sm inline-flex items-center gap-2">\n              <EnvelopeIcon className="w-5 h-5 -mt-1" />\n              Inviter un Club');
  
  // Just in case it's exactly the plain button string
  c = c.replace(/className="px-4 py-2 text-sm font-medium text-white bg-brand-blue rounded-lg hover:bg-brand-blue\/90 transition-colors"\s*>\s*Inviter un Club/g, 'className="px-4 py-2 text-sm font-medium text-white bg-brand-blue rounded-lg hover:bg-brand-blue/90 transition-colors shadow-sm inline-flex items-center gap-2">\n              <EnvelopeIcon className="w-5 h-5 -mt-1" />\n              Inviter un Club');
} else {
  c = c.replace(oldBtn, newBtn);
}

fs.writeFileSync('frontend/src/features/superadmin/pages/SuperAdminDashboard.tsx', c);
