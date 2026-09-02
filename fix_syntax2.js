const fs = require('fs');
const file = 'frontend/src/features/events/pages/EventsPage.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /\{isAdminOrProf \? \(\r?\n\s*\{isAdminOrProf \? \(/g,
    '{isAdminOrProf ? ('
);

fs.writeFileSync(file, content, 'utf8');
