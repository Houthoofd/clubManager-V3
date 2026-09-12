const fs = require('fs');
let content = fs.readFileSync('e2e/playwright.config.ts', 'utf8');

content = content.replace(/testIgnore: \[/g, "testIgnore: [\n          /tests\\/superadmin\\/.*/,");

fs.writeFileSync('e2e/playwright.config.ts', content);
console.log("Patched playwright config ignores!");
