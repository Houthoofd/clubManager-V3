const fs = require('fs');

let content = fs.readFileSync('frontend/src/layouts/SuperAdminLayout.tsx', 'utf8');

// Fix category paddings in mobile menu
content = content.replace(
  /<div className="text-xs font-semibold leading-6 text-gray-400 uppercase tracking-wider mb-2 text-left px-2">/g,
  '<div className="text-xs font-semibold leading-6 text-gray-400 uppercase tracking-wider mb-2 text-left px-4">'
);

// Fix settings button padding
content = content.replace(
  /"group rounded-lg p-2\.5 text-sm leading-6 font-semibold transition-all " \+\s*\(location\.pathname\.startsWith\('\/superadmin\/settings'\) \? "bg-brand-green\/10 dark:bg-brand-green\/20 text-brand-green dark:text-brand-green" : "text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-white\/10 hover:text-brand-dark dark:hover:text-slate-200"\) \+\s*\(isCollapsed \? " flex items-center justify-center" : " flex items-center gap-x-4 px-2"\)/g,
  '"group rounded-lg py-2 text-sm leading-6 font-semibold transition-all " +\n                    (location.pathname.startsWith(\'/superadmin/settings\') ? "bg-brand-green/10 dark:bg-brand-green/20 text-brand-green dark:text-brand-green" : "text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-white/10 hover:text-brand-dark dark:hover:text-slate-200") + \n                    (isCollapsed ? " flex items-center justify-center px-2" : " flex items-center gap-x-4 px-4")'
);

fs.writeFileSync('frontend/src/layouts/SuperAdminLayout.tsx', content);
