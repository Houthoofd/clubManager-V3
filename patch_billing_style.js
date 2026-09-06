const fs = require('fs');

let file = fs.readFileSync('frontend/src/features/superadmin/pages/SuperAdminBilling.tsx', 'utf8');

// Update header
file = file.replace(
  /<div className="mb-8">\s*<h1 className="text-3xl font-bold text-gray-900">Abonnements SaaS<\/h1>\s*<p className="mt-2 text-gray-600">Gérez la facturation, les revenus et les abonnements des clubs.<\/p>\s*<\/div>/,
  `<div className="flex items-center gap-4 mb-8 justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-brand-green/10 p-3">
            <CurrencyEuroIcon className="h-8 w-8 text-brand-green" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-brand-dark">
              Abonnements SaaS
            </h1>
            <p className="mt-1 text-sm text-gray-500">Gérez la facturation, les revenus et les abonnements des clubs.</p>
          </div>
        </div>
      </div>`
);

// Update root wrapper
file = file.replace(/<div className="p-8 max-w-7xl mx-auto">/, '<div className="max-w-7xl mx-auto relative">');

// Update tabs colors (indigo -> brand-green)
file = file.replaceAll('border-indigo-500', 'border-brand-green');
file = file.replaceAll('text-indigo-600', 'text-brand-green');

// Update KPI icon colors to brand colors (they are all different right now)
file = file.replace(/bg-blue-50/g, 'bg-brand-green/10');
file = file.replace(/text-blue-600/g, 'text-brand-green');
file = file.replace(/bg-green-50/g, 'bg-brand-green/10');
file = file.replace(/text-green-600/g, 'text-brand-green');
file = file.replace(/bg-indigo-50/g, 'bg-brand-green/10');
file = file.replace(/text-indigo-600/g, 'text-brand-green');
file = file.replace(/bg-red-50/g, 'bg-red-100'); // keep red for failed payments

// Make sure BanknotesIcon is imported
if (!file.includes('BanknotesIcon')) {
  file = file.replace(/CurrencyEuroIcon,/, 'CurrencyEuroIcon, BanknotesIcon,');
}

fs.writeFileSync('frontend/src/features/superadmin/pages/SuperAdminBilling.tsx', file);
