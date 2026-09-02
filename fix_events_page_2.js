const fs = require('fs');
const file = 'frontend/src/features/events/pages/EventsPage.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. TabGroup
content = content.replace(
    /<div className="border-b border-gray-100 px-2">\s*<TabGroup[\s\S]*?onTabChange=\{setActiveTab\}\s*\/>\s*<\/div>/g,
    `{isAdminOrProf && (
        <div className="border-b border-gray-100 px-2">
          <TabGroup
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
      )}`
);

// 2. Create Event Button
content = content.replace(
    /<div className="flex justify-end mb-4">\s*<button[\s\S]*?onClick=\{\(\) => navigate\("\/admin\/events\/create"\)\}[\s\S]*?CrÃ©er un Ã©vÃ¨nement[\s\S]*?<\/button>\s*<\/div>/g,
    `{isAdminOrProf && (
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => navigate("/admin/events/create")}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Créer un évènement
                </button>
              </div>
            )}`
);

fs.writeFileSync(file, content, 'utf8');
console.log('EventsPage fully patched');
