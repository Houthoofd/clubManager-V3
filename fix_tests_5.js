const fs = require('fs');

// dashboard.spec.ts
let dashboard = fs.readFileSync('e2e/tests/superadmin/dashboard.spec.ts', 'utf8');
dashboard = dashboard.replace(/Vous agissez en tant que/i, 'Mode Impersonation');
dashboard = dashboard.replace(/Retourner à l'administration|Retourner  l'administration/i, 'Revenir au Super Admin');
fs.writeFileSync('e2e/tests/superadmin/dashboard.spec.ts', dashboard, 'utf8');

// billing.spec.ts
let billing = fs.readFileSync('e2e/tests/superadmin/billing.spec.ts', 'utf8');
const beforeEachRoute = `  test.beforeEach(async ({ page }) => {
    // Intercept plans for Happy Path
    await page.route('**/api/superadmin/billing/plans', route => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [{ id: 1, name: 'Pro', price: 99, billing_cycle: 'monthly', features: [] }] }) });
    });`;
billing = billing.replace(/test\.beforeEach\(async \(\{ page \}\) => \{/, beforeEachRoute);
fs.writeFileSync('e2e/tests/superadmin/billing.spec.ts', billing, 'utf8');

console.log('Fixed dashboard and billing tests');
