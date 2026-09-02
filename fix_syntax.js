const fs = require('fs');
const file = 'frontend/src/features/events/pages/EventsPage.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /\{isAdminOrProf && \{isAdminOrProf && <th className="pb-3 text-sm font-semibold text-gray-600 text-right">Actions<\/th>\}\}/g,
    '{isAdminOrProf && <th className="pb-3 text-sm font-semibold text-gray-600 text-right">Actions</th>}'
);
content = content.replace(
    /\{isAdminOrProf && \{isAdminOrProf && \(\n *<div className="border-b/g,
    '{isAdminOrProf && (\n          <div className="border-b'
);

fs.writeFileSync(file, content, 'utf8');
