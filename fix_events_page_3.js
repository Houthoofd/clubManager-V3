const fs = require('fs');
const file = 'frontend/src/features/events/pages/EventsPage.tsx';
let content = fs.readFileSync(file, 'utf8');

// Ensure list view never renders for members
content = content.replace(
    /\{activeTab === "list" && \(/g,
    '{activeTab === "list" && isAdminOrProf && ('
);

fs.writeFileSync(file, content, 'utf8');
console.log('EventsPage patched: list view strictly hidden for members');
