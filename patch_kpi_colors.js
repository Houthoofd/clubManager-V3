const fs = require('fs');
let file = fs.readFileSync('frontend/src/features/superadmin/pages/SuperAdminBilling.tsx', 'utf8');

// We need to replace the 2nd and 3rd instances of bg-brand-green/10
// The file has:
// 1. CurrencyEuroIcon (MRR) - keep brand-green
// 2. ArrowTrendingUpIcon (ARR) - change to brand-blue
// 3. UserGroupIcon (Clubs Actifs) - change to purple

file = file.replace(
  /<div className="p-3 bg-brand-green\/10 rounded-full">\s*<ArrowTrendingUpIcon className="w-6 h-6 text-brand-green" \/>/g,
  `<div className="p-3 bg-brand-blue/10 rounded-full">
            <ArrowTrendingUpIcon className="w-6 h-6 text-brand-blue" />`
);

file = file.replace(
  /<div className="p-3 bg-brand-green\/10 rounded-full">\s*<UserGroupIcon className="w-6 h-6 text-brand-green" \/>/g,
  `<div className="p-3 bg-purple-50 rounded-full">
            <UserGroupIcon className="w-6 h-6 text-purple-600" />`
);

fs.writeFileSync('frontend/src/features/superadmin/pages/SuperAdminBilling.tsx', file);
