const fs = require('fs');
const file = 'frontend/src/features/events/pages/EventsPage.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Change initial state of activeTab
content = content.replace(
    'const [activeTab, setActiveTab] = useState("list");',
    'const [activeTab, setActiveTab] = useState(isAdminOrProf ? "list" : "upcoming");'
);

// 2. Hide TabGroup for members
content = content.replace(
    '<div className="border-b border-gray-100 px-2">\n          <TabGroup',
    '{isAdminOrProf && (\n          <div className="border-b border-gray-100 px-2">\n            <TabGroup'
);
content = content.replace(
    'onTabChange={setActiveTab}\n          />\n        </div>',
    'onTabChange={setActiveTab}\n            />\n          </div>\n        )}'
);

// 3. Update description of PageHeader
content = content.replace(
    'description="GÃ©rez les Ã©vÃ¨nements de votre club et les inscriptions."',
    'description={isAdminOrProf ? "GÃ©rez les Ã©vÃ¨nements de votre club et les inscriptions." : "DÃ©couvrez et inscrivez-vous aux prochains Ã©vÃ¨nements du club."}'
);
content = content.replace( // Try pure French if previous failed
    'description="Gérez les évènements de votre club et les inscriptions."',
    'description={isAdminOrProf ? "Gérez les évènements de votre club et les inscriptions." : "Découvrez et inscrivez-vous aux prochains évènements du club."}'
);

fs.writeFileSync(file, content, 'utf8');
console.log('EventsPage patched for tabs');
