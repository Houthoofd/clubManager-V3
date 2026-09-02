const fs = require('fs');
const file = 'frontend/src/features/events/pages/EventsPage.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('useAuth')) {
    content = content.replace(
        'import { useNavigate } from "react-router-dom";',
        'import { useNavigate } from "react-router-dom";\nimport { useAuth } from "../../../shared/hooks/useAuth";\nimport { UserRole } from "@clubmanager/types";'
    );
    
    content = content.replace(
        'const queryClient = useQueryClient();',
        'const queryClient = useQueryClient();\n  const { user } = useAuth();\n  const isAdminOrProf = user?.role_app === UserRole.ADMIN || user?.role_app === UserRole.PROFESSOR;'
    );
}

// 1. Hide Create Button
// The text is "Créer un évènement" or UTF-8 broken equivalent. 
// Let's use simple match on className
content = content.replace(
    '<button\n                  onClick={() => navigate("/admin/events/create")}',
    '{isAdminOrProf && (\n                <button\n                  onClick={() => navigate("/admin/events/create")}'
);
content = content.replace(
    'un Ã©vÃ¨nement\n                </button>',
    'un Ã©vÃ¨nement\n                </button>\n              )}'
);
content = content.replace( // Try pure French as fallback
    'un évènement\n                </button>',
    'un évènement\n                </button>\n              )}'
);

// 2. Hide Actions Column header
content = content.replace(
    '<th className="pb-3 text-sm font-semibold text-gray-600 text-right">Actions</th>',
    '{isAdminOrProf && <th className="pb-3 text-sm font-semibold text-gray-600 text-right">Actions</th>}'
);

// 3. Hide Actions Column body
content = content.replace(
    '<td className="py-3 text-right relative">',
    '{isAdminOrProf ? (\n                          <td className="py-3 text-right relative">'
);
content = content.replace(
    '</button>\n                              </div>\n                            </div>\n                          )}\n                        </td>',
    '</button>\n                              </div>\n                            </div>\n                          )}\n                        </td>\n                          ) : <td className="py-3 text-right relative"><button onClick={() => navigate(`/events/${evt.id}`)} className="text-blue-600 hover:underline">Détails</button></td>}'
);

// 4. Hide Actions menu on cards (upcoming view)
content = content.replace(
    '<div className="absolute top-4 right-4">',
    '{isAdminOrProf && (\n                    <div className="absolute top-4 right-4">'
);
content = content.replace(
    '</button>\n                          </div>\n                        </div>\n                      )}\n                    </div>',
    '</button>\n                          </div>\n                        </div>\n                      )}\n                    </div>\n                    )}'
);

fs.writeFileSync(file, content, 'utf8');
console.log('EventsPage patched');
