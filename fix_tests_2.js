const fs = require('fs');

// billing.spec.ts
let billing = fs.readFileSync('e2e/tests/superadmin/billing.spec.ts', 'utf8');
billing = billing.replace(/Plans tarifaires/g, 'Plans');
billing = billing.replace(/Aucun\|Empty\|No plans/i, 'Aucun plan tarifaire');
fs.writeFileSync('e2e/tests/superadmin/billing.spec.ts', billing, 'utf8');

// audit.spec.ts
let audit = fs.readFileSync('e2e/tests/superadmin/audit.spec.ts', 'utf8');
audit = audit.replace(/getByRole\('textbox', \{ name: \/search\/i \}\)/g, "getByPlaceholder(/Rechercher/i)");
fs.writeFileSync('e2e/tests/superadmin/audit.spec.ts', audit, 'utf8');

// dashboard.spec.ts
let dashboard = fs.readFileSync('e2e/tests/superadmin/dashboard.spec.ts', 'utf8');
dashboard = dashboard.replace(/Rechercher un club\.\.\./g, 'Rechercher (nom, code)...');
fs.writeFileSync('e2e/tests/superadmin/dashboard.spec.ts', dashboard, 'utf8');

// modules.spec.ts
let modules = fs.readFileSync('e2e/tests/superadmin/modules.spec.ts', 'utf8');
modules = modules.replace(/Boutique/g, 'Boutique'); // Was Boutique in mock
fs.writeFileSync('e2e/tests/superadmin/modules.spec.ts', modules, 'utf8');

console.log('Fixed locators in tests!');
