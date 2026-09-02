const fs = require('fs');
const file = 'frontend/src/features/settings/pages/SettingsPage.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /<TabGroup\s+tabs=\{tabs\}\s+activeTab=\{activeTab\}\s+onTabChange=\{\(tabId\) => setActiveTab\(tabId as TabId\)\}\s+\/>/,
    '<TabGroup\n          tabs={tabs}\n          activeTab={activeTab}\n          onTabChange={(tabId) => setActiveTab(tabId as TabId)}\n          scrollable={true}\n        />'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed SettingsPage.tsx');
