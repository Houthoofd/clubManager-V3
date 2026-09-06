const fs = require('fs');

let c = fs.readFileSync('frontend/src/features/superadmin/pages/SuperAdminDashboard.tsx', 'utf8');

const regexOld = /\{isDetailsDrawerOpen && selectedClubForDetails && \(\s*<div className="fixed inset-0 z-50 flex justify-end">\s*<div className="fixed inset-0 bg-black\/30 transition-opacity" onClick=\{\(\) => setIsDetailsDrawerOpen\(false\)\} \/>\s*<div className="relative w-full max-w-md bg-white shadow-xl h-full flex flex-col transform transition-transform duration-300 ease-in-out z-10 border-l border-gray-200">/m;

const replacement = `{selectedClubForDetails && (
        <div className={\`fixed inset-0 z-50 flex justify-end transition-all duration-300 \${isDetailsDrawerOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}\`}>
          <div className="fixed inset-0 bg-black/30 transition-opacity" onClick={() => setIsDetailsDrawerOpen(false)} />
          <div className={\`relative w-full max-w-md bg-white shadow-xl h-full flex flex-col transform transition-transform duration-300 ease-in-out z-10 border-l border-gray-200 \${isDetailsDrawerOpen ? 'translate-x-0' : 'translate-x-full'}\`}>`;

c = c.replace(regexOld, replacement);

fs.writeFileSync('frontend/src/features/superadmin/pages/SuperAdminDashboard.tsx', c);
