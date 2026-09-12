const fs = require('fs');

let dashboard = fs.readFileSync('e2e/tests/superadmin/dashboard.spec.ts', 'utf8');

dashboard = dashboard.replace(/const impersonateBtn = page.getByRole\('button', \{ name: \/Accéder au club\/i \}\)\.first\(\);/g, 
  "await page.locator('tbody tr').first().locator('button').last().click();\n    const impersonateBtn = page.getByRole('button', { name: /Se connecter en tant qu'admin/i }).first();"
);

dashboard = dashboard.replace(/Total Clubs/g, "Total des Clubs");

fs.writeFileSync('e2e/tests/superadmin/dashboard.spec.ts', dashboard, 'utf8');

let audit = fs.readFileSync('e2e/tests/superadmin/audit.spec.ts', 'utf8');
audit = audit.replace(/too many requests\|rate limit\|error/i, "Rate limit exceeded");
fs.writeFileSync('e2e/tests/superadmin/audit.spec.ts', audit, 'utf8');

console.log("Fixed dashboard and audit tests");
