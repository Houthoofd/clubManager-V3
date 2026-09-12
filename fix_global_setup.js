const fs = require('fs');
let content = fs.readFileSync('e2e/setup/globalSetup.ts', 'utf8');

content = content.replace(
  /body: JSON\.stringify\(\{ userId, password \}\)/g,
  "body: JSON.stringify({ identifier: userId, password })"
);

fs.writeFileSync('e2e/setup/globalSetup.ts', content);
console.log("Patched globalSetup.ts for identifier!");
