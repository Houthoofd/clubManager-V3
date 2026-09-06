const fs = require('fs');

let file = fs.readFileSync('frontend/src/features/superadmin/pages/SuperAdminBilling.tsx', 'utf8');

// Add states for kebab menu
if (!file.includes('openDropdownId')) {
  file = file.replace(
    /const \[loading, setLoading\] = useState\(true\);/,
    "const [loading, setLoading] = useState(true);\n  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);"
  );
}

// Ensure correct icons are imported
const requiredIcons = ['EllipsisVerticalIcon', 'PencilIcon', 'NoSymbolIcon'];
requiredIcons.forEach(icon => {
  if (!file.includes(icon)) {
    file = file.replace(/CurrencyEuroIcon,/, `${icon}, CurrencyEuroIcon,`);
  }
});

// Update table wrapper classes
file = file.replace(
  /<div className="overflow-x-auto bg-white rounded-lg shadow">/g,
  '<div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden overflow-x-auto">'
);

// Update table divide
file = file.replace(
  /<table className="min-w-full divide-y divide-gray-200">/g,
  '<table className="min-w-full divide-y divide-gray-100">'
);

// Update thead
file = file.replace(
  /<thead className="bg-gray-50">/g,
  '<thead className="bg-gray-50/50">'
);

// Update th classes
file = file.replace(
  /<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">/g,
  '<th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">'
);

// Replace clubs table actions with Kebab Menu
const kebabMenuHtml = `
                    <div className="flex justify-end relative">
                      <button 
                        onClick={() => setOpenDropdownId(openDropdownId === sub.id ? null : sub.id)}
                        className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 transition-colors"
                      >
                        <EllipsisVerticalIcon className="h-5 w-5" />
                      </button>
                      
                      {openDropdownId === sub.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setOpenDropdownId(null)} />
                          <div className="absolute right-0 top-10 w-48 bg-white rounded-md shadow-lg z-50 ring-1 ring-black ring-opacity-5 py-1 text-left overflow-hidden">
                            <button 
                              onClick={() => { setOpenDropdownId(null); handlePlanChange(sub.id); }}
                              className="w-full text-left px-4 py-2 text-sm text-brand-blue hover:bg-brand-blue/10 flex items-center gap-2"
                            >
                              <PencilIcon className="h-4 w-4 text-brand-blue" /> Changer de plan
                            </button>
                            <div className="border-t border-gray-100 my-1"></div>
                            <button 
                              onClick={() => { setOpenDropdownId(null); handleCancelSubscription(sub.id); }}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <NoSymbolIcon className="h-4 w-4 text-red-500" /> Annuler
                            </button>
                          </div>
                        </>
                      )}
                    </div>`;

file = file.replace(
  /<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">[\s\S]*?<\/td>/,
  `<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
${kebabMenuHtml}
                  </td>`
);

fs.writeFileSync('frontend/src/features/superadmin/pages/SuperAdminBilling.tsx', file);
