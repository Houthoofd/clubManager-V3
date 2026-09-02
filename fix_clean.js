const fs = require('fs');
const file = 'frontend/src/features/events/pages/EventsPage.tsx';
let content = fs.readFileSync(file, 'utf8');

// I'll replace everything below "return (" and above "      {announceModalEventId && ("
// I will just construct the clean JSX manually.
// First, find the boundaries.
const startMarker = 'return (';
const endMarker = '{announceModalEventId && (';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
    console.error("Could not find boundaries");
    process.exit(1);
}

const newJsx = `return (
    <div className="space-y-6" data-testid="events-page">
      <PageHeader
        title={t("navigation.events", { defaultValue: "Évènements" })}
        description={isAdminOrProf ? "Gérez les évènements de votre club et les inscriptions." : "Découvrez et inscrivez-vous aux prochains évènements du club."}
        icon={<CalendarAltIcon className="w-8 h-8 text-blue-600" />}
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {isAdminOrProf && (
          <div className="border-b border-gray-100 px-2">
            <TabGroup
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>
        )}

        <div className="p-6">
          {activeTab === "list" && isAdminOrProf && (
            <div className="space-y-4">
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => navigate("/admin/events/create")}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Créer un évènement
                </button>
              </div>
              <div className="overflow-x-auto pb-20">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="pb-3 text-sm font-semibold text-gray-600">Titre</th>
                      <th className="pb-3 text-sm font-semibold text-gray-600">Date</th>
                      <th className="pb-3 text-sm font-semibold text-gray-600">Capacité</th>
                      <th className="pb-3 text-sm font-semibold text-gray-600">Prix</th>
                      <th className="pb-3 text-sm font-semibold text-gray-600 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((evt) => (
                      <tr key={evt.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="py-3 font-medium text-gray-800">{evt.title}</td>
                        <td className="py-3 text-gray-600">{new Date(evt.start_date).toLocaleString()}</td>
                        <td className="py-3 text-gray-600">{evt.capacity}</td>
                        <td className="py-3 text-gray-600">{evt.price} €</td>
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
                                <button onClick={() => { setOpenDropdownId(null); if (window.confirm('Voulez-vous vraiment supprimer cet évènement ?')) deleteMutation.mutate(evt.id); }} title="Supprimer" className="p-2 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors">
                                  <TrashIcon className="h-5 w-5" />
                                </button>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "upcoming" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((evt) => (
                <div key={evt.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col justify-between h-full relative">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">{evt.title}</h2>
                    
                    {isAdminOrProf && (
                      <div className="absolute top-4 right-4">
                        <button onClick={(e) => { e.stopPropagation(); setOpenDropdownId(openDropdownId === evt.id ? null : evt.id); }} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
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
                      </div>
                    )}

                    <div className="flex items-center text-gray-500 mb-4 text-sm">
                      <CalendarAltIcon className="w-4 h-4 mr-2" />
                      {new Date(evt.start_date).toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(\`/events/\${evt.id}\`)}
                    className="w-full bg-blue-50 text-blue-700 font-medium px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors mt-4"
                  >
                    Voir les détails
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      `;

content = content.substring(0, startIndex) + newJsx + content.substring(endIndex);
fs.writeFileSync(file, content, 'utf8');
console.log('EventsPage cleaned and patched!');
