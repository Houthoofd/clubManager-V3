const fs = require('fs');
let modules = fs.readFileSync('e2e/tests/superadmin/modules.spec.ts', 'utf8');
modules = modules.replace(/const toggle = page\.locator\('button\[role="switch"\]'\)\.first\(\);/g, "const firstSwitch = page.locator('button[role=\"switch\"]').first();\n    const toggle = firstSwitch;");
fs.writeFileSync('e2e/tests/superadmin/modules.spec.ts', modules, 'utf8');
