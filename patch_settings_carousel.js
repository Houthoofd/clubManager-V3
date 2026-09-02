const fs = require('fs');
const file = 'frontend/src/features/settings/pages/SettingsPage.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /scrollable=\{true\}/,
    'scrollable={true}\n          variant="highlight"'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed SettingsPage.tsx variant');
