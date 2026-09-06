const fs = require('fs');

let c = fs.readFileSync('frontend/src/features/superadmin/pages/SuperAdminDashboard.tsx', 'utf8');

// Add EllipsisVerticalIcon
c = c.replace(
  /XMarkIcon,/,
  "XMarkIcon,\n  EllipsisVerticalIcon,"
);

// Add openDropdownId state
c = c.replace(
  /const \[selectedClub, setSelectedClub\] = useState<ClubInfo \| null>\(null\);/,
  "const [selectedClub, setSelectedClub] = useState<ClubInfo | null>(null);\n  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);"
);

// Replace actions in the table
const oldActionsStart = /<div className="flex justify-end gap-2">\s*<button/;
const oldActionsRegex = /<div className="flex justify-end gap-2">[\s\S]*?<\/div>\s*<\/td>/;

const newActions = `<div className="flex justify-end relative">
                        <button 
                          onClick={() => setOpenDropdownId(openDropdownId === club.id ? null : club.id)}
                          className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 transition-colors"
                        >
                          <EllipsisVerticalIcon className="h-5 w-5" />
                        </button>
                        
                        {openDropdownId === club.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setOpenDropdownId(null)} />
                            <div className="absolute right-0 top-10 w-48 bg-white rounded-md shadow-lg z-50 ring-1 ring-black ring-opacity-5 py-1 text-left overflow-hidden">
                              <button 
                                onClick={() => { setOpenDropdownId(null); openDetailsDrawer(club); }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <EyeIcon className="h-4 w-4 text-gray-400" /> Détails
                              </button>
                              <button 
                                onClick={() => { setOpenDropdownId(null); handleImpersonate(club.id); }}
                                className="w-full text-left px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 flex items-center gap-2"
                              >
                                <ArrowRightOnRectangleIcon className="h-4 w-4 text-indigo-500" /> Se connecter
                              </button>
                              <button 
                                onClick={() => { setOpenDropdownId(null); openEditModal(club); }}
                                className="w-full text-left px-4 py-2 text-sm text-brand-blue hover:bg-brand-blue/10 flex items-center gap-2"
                              >
                                <PencilIcon className="h-4 w-4 text-brand-blue" /> Modifier
                              </button>
                              
                              {club.status === 'suspended' ? (
                                <button 
                                  onClick={() => { setOpenDropdownId(null); handleStatusChange(club.id, 'active'); }}
                                  className="w-full text-left px-4 py-2 text-sm text-brand-green hover:bg-brand-green/10 flex items-center gap-2"
                                >
                                  <PlayIcon className="h-4 w-4 text-brand-green" /> Réactiver
                                </button>
                              ) : (
                                <button 
                                  onClick={() => { setOpenDropdownId(null); handleStatusChange(club.id, 'suspended'); }}
                                  className="w-full text-left px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2"
                                >
                                  <PauseIcon className="h-4 w-4 text-orange-500" /> Suspendre
                                </button>
                              )}
                              
                              <div className="border-t border-gray-100 my-1"></div>
                              
                              <button 
                                onClick={() => { setOpenDropdownId(null); openDeleteModal(club); }}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <TrashIcon className="h-4 w-4 text-red-500" /> Supprimer
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>`;

c = c.replace(oldActionsRegex, newActions);

fs.writeFileSync('frontend/src/features/superadmin/pages/SuperAdminDashboard.tsx', c);
