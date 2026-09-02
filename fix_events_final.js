const fs = require('fs');
const file = 'frontend/src/features/events/pages/EventsPage.tsx';
let content = fs.readFileSync(file, 'utf8');

// Use a very flexible regex to wrap the TabGroup in {isAdminOrProf && (...)}
content = content.replace(
    /<div className="border-b border-gray-100 px-2">\s*<TabGroup\s*tabs=\{tabs\}\s*activeTab=\{activeTab\}\s*onTabChange=\{setActiveTab\}\s*\/>\s*<\/div>/g,
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

// Use flexible regex to wrap the Create button in {isAdminOrProf && (...)}
// Note: handle possible Windows newlines and tabs
content = content.replace(
    /<div className="flex justify-end mb-4">\s*<button\s*onClick=\{\(\) => navigate\("\/admin\/events\/create"\)\}\s*className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"\s*>\s*Cr[^<]+<\/button>\s*<\/div>/g,
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

// Do the same for the "Actions" column header
content = content.replace(
    /<th className="pb-3 text-sm font-semibold text-gray-600 text-right">Actions<\/th>/g,
    `{isAdminOrProf && <th className="pb-3 text-sm font-semibold text-gray-600 text-right">Actions</th>}`
);

// And the "Actions" column body for the list view
content = content.replace(
    /<td className="py-3 text-right relative">\s*<button onClick=\{\(\) => setOpenDropdownId\(openDropdownId === evt.id \? null : evt.id\)\}[\s\S]*?<\/div>\s*<\/div>\s*\)\}\s*<\/td>/g,
    `{isAdminOrProf ? (
                          <td className="py-3 text-right relative">
                            <button onClick={() => setOpenDropdownId(openDropdownId === evt.id ? null : evt.id)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                              <EllipsisVerticalIcon className="h-5 w-5" />
                            </button>
                            {openDropdownId === evt.id && (
                              <div className="absolute right-0 top-full mt-1 bg-white rounded-md shadow-lg p-2 z-50 border border-gray-100 overflow-visible">
                                <div className="flex flex-row items-center gap-1">
                                  <button onClick={() => { setOpenDropdownId(null); setMessageModalEventId(evt.id); }} title="Message aux membres" className="p-2 rounded-md text-gray-500 hover:text-green-600 hover:bg-green-50 transition-colors">
                                    <EnvelopeIcon className="h-5 w-5" />
                                  </button>
                                  <button onClick={() => { setOpenDropdownId(null); setAnnounceModalEventId(evt.id); }} title="Annoncer à tous les membres" className="p-2 rounded-md text-gray-500 hover:text-purple-600 hover:bg-purple-50 transition-colors">
                                    <MegaphoneIcon className="h-5 w-5" />
                                  </button>
                                  <button onClick={() => { setOpenDropdownId(null); navigate(\`/admin/events/edit/\${evt.id}\`); }} title="Modifier" className="p-2 rounded-md text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                                    <PencilIcon className="h-5 w-5" />
                                  </button>
                                  <div className="w-px h-6 bg-gray-200 mx-1"></div>
                                  <button onClick={() => { setOpenDropdownId(null); if (window.confirm('Voulez-vous vraiment supprimer cet événement ?')) deleteMutation.mutate(evt.id); }} title="Supprimer" className="p-2 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors">
                                    <TrashIcon className="h-5 w-5" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </td>
                        ) : (
                          <td className="py-3 text-right relative">
                            <button onClick={() => navigate(\`/events/\${evt.id}\`)} className="text-blue-600 hover:underline">
                              Détails
                            </button>
                          </td>
                        )}`
);

// Write to file
fs.writeFileSync(file, content, 'utf8');
console.log('Regex patch applied!');
