const fs = require('fs');
let content = fs.readFileSync('e2e/playwright.config.ts', 'utf8');

const newProject = `
    {
      name: "chromium-superadmin",
      testMatch: /tests\\/superadmin\\/.*/,
      use: {
        ...devices["Desktop Chrome"],
      },
    },
`;

// Insert the new project after chromium-no-auth
content = content.replace(
  /name: "chromium-no-auth",[\s\S]*?},[\s\S]*?},/,
  "$&" + newProject
);

fs.writeFileSync('e2e/playwright.config.ts', content);
console.log("Patched playwright config!");
