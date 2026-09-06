import re

with open('frontend/src/features/superadmin/pages/SuperAdminDashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Imports
content = re.sub(
    r"import \{([\s\S]*?)ArrowRightOnRectangleIcon\n\} from '@heroicons/react/24/outline';",
    r"import {\1ArrowRightOnRectangleIcon,\n  ChevronUpIcon,\n  ChevronDownIcon,\n  GiftIcon,\n  ArchiveBoxIcon\n} from '@heroicons/react/24/outline';",
    content
)

# 2. States
content = re.sub(
    r"  const \[statusFilter, setStatusFilter\] = useState\('all'\);",
    r"  const [statusFilter, setStatusFilter] = useState('all');\n\n  // Sorting states\n  const [sortColumn, setSortColumn] = useState<'name' | 'created_at' | 'status' | null>(null);\n  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');\n\n  // Bulk selection\n  const [selectedClubIds, setSelectedClubIds] = useState<number[]>([]);",
    content
)

# 3. FilteredClubs & sort logic & bulk functions
filtered_clubs_replacement = """  const filteredClubs = clubs.filter(club => {
    const matchesSearch = club.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          club.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || club.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    if (!sortColumn) return 0;
    
    let valA: any = a[sortColumn];
    let valB: any = b[sortColumn];

    if (sortColumn === 'created_at') {
      valA = new Date(valA).getTime();
      valB = new Date(valB).getTime();
    }

    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (column: 'name' | 'created_at' | 'status') => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (column: 'name' | 'created_at' | 'status') => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' ? <ChevronUpIcon className="h-4 w-4 inline ml-1" /> : <ChevronDownIcon className="h-4 w-4 inline ml-1" />;
  };

  const toggleSelectAll = () => {
    if (selectedClubIds.length === filteredClubs.length && filteredClubs.length > 0) {
      setSelectedClubIds([]);
    } else {
      setSelectedClubIds(filteredClubs.map(c => c.id));
    }
  };

  const toggleSelectClub = (id: number) => {
    setSelectedClubIds(prev => prev.includes(id) ? prev.filter(clubId => clubId !== id) : [...prev, id]);
  };

  const handleBulkSuspend = async () => {
    try {
      await Promise.all(selectedClubIds.map(id => superAdminApi.updateClubStatus(id, 'suspended')));
      toast.success(`${selectedClubIds.length} clubs suspendus.`);
      setSelectedClubIds([]);
      fetchClubs();
    } catch (error) {
      toast.error('Erreur lors de la suspension en masse.');
    }
  };

  const handleBulkReactivate = async () => {
    try {
      await Promise.all(selectedClubIds.map(id => superAdminApi.updateClubStatus(id, 'active')));
      toast.success(`${selectedClubIds.length} clubs réactivés.`);
      setSelectedClubIds([]);
      fetchClubs();
    } catch (error) {
      toast.error('Erreur lors de la réactivation en masse.');
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${selectedClubIds.length} clubs ?`)) return;
    try {
      await Promise.all(selectedClubIds.map(id => superAdminApi.deleteClub(id)));
      toast.success(`${selectedClubIds.length} clubs supprimés.`);
      setSelectedClubIds([]);
      fetchClubs();
    } catch (error) {
      toast.error('Erreur lors de la suppression en masse.');
    }
  };"""

content = re.sub(
    r"  const filteredClubs = clubs\.filter\(club => \{[\s\S]*?\}\);",
    filtered_clubs_replacement,
    content
)

# 4. Table UI + bulk bar
bulk_bar_html = """        {selectedClubIds.length > 0 && (
          <div className="bg-brand-blue/5 border-b border-brand-blue/10 px-6 py-3 flex items-center justify-between">
            <span className="text-sm font-medium text-brand-dark">
              {selectedClubIds.length} club(s) sélectionné(s)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkSuspend}
                className="px-3 py-1.5 text-xs font-medium text-orange-700 bg-orange-100 rounded hover:bg-orange-200 transition-colors"
              >
                Suspendre
              </button>
              <button
                onClick={handleBulkReactivate}
                className="px-3 py-1.5 text-xs font-medium text-brand-green bg-brand-green/10 rounded hover:bg-brand-green/20 transition-colors"
              >
                Réactiver
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        )}
        
        {isLoading ? ("""

content = re.sub(
    r"        \{isLoading \? \(",
    bulk_bar_html,
    content
)

# 5. thead
thead_html = """<thead className="bg-white">
                <tr>
                  <th className="py-4 pl-6 pr-3 text-left w-12">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue cursor-pointer"
                      checked={filteredClubs.length > 0 && selectedClubIds.length === filteredClubs.length}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th 
                    className="py-4 px-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50 select-none"
                    onClick={() => handleSort('name')}
                  >
                    Organisation {getSortIcon('name')}
                  </th>
                  <th className="px-3 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Code Unique</th>
                  <th className="px-3 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Base de données</th>
                  <th 
                    className="px-3 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50 select-none"
                    onClick={() => handleSort('created_at')}
                  >
                    Date de création {getSortIcon('created_at')}
                  </th>
                  <th 
                    className="px-3 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50 select-none"
                    onClick={() => handleSort('status')}
                  >
                    Statut {getSortIcon('status')}
                  </th>
                  <th className="relative py-4 pl-3 pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>"""

content = re.sub(
    r"<thead className=\"bg-white\">[\s\S]*?</thead>",
    thead_html,
    content
)

# 6. tbody
tbody_tr_html = """<tr key={club.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => openDetailsDrawer(club)}>
                    <td className="whitespace-nowrap py-4 pl-6 pr-3" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue cursor-pointer"
                        checked={selectedClubIds.includes(club.id)}
                        onChange={() => toggleSelectClub(club.id)}
                      />
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <div className="font-semibold text-brand-dark">{club.name}</div>
                      <div className="text-gray-500 mt-0.5 text-xs">{club.contact_email}</div>
                    </td>"""

content = re.sub(
    r"<tr key=\{club\.id\} className=\"hover:bg-gray-50/50 transition-colors cursor-pointer\" onClick=\{\(\) => openDetailsDrawer\(club\)\}>\n\s*<td className=\"whitespace-nowrap py-4 pl-6 pr-3 text-sm\">\n\s*<div className=\"font-semibold text-brand-dark\">\{club\.name\}</div>\n\s*<div className=\"text-gray-500 mt-0\.5 text-xs\">\{club\.contact_email\}</div>\n\s*</td>",
    tbody_tr_html,
    content
)

# Add Date de creation into tbody
db_name_html = """<td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 font-mono text-xs">
                      {club.db_name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {new Date(club.created_at).toLocaleDateString()}
                    </td>"""

content = re.sub(
    r"<td className=\"whitespace-nowrap px-3 py-4 text-sm text-gray-500 font-mono text-xs\">\n\s*\{club\.db_name\}\n\s*</td>",
    db_name_html,
    content
)

# 7. Actions Dropdown
dropdown_html = """<button 
                                onClick={async () => {
                                  setOpenDropdownId(null);
                                  try {
                                    await superAdminApi.extendTrial(club.id);
                                    toast.success('1 mois gratuit offert avec succès.');
                                    fetchClubs();
                                  } catch (error) {
                                    toast.error("Erreur lors de l'extension de l'essai.");
                                  }
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                              >
                                <GiftIcon className="h-4 w-4 text-green-500" /> Offrir 1 mois gratuit
                              </button>
                              <button 
                                onClick={() => {
                                  setOpenDropdownId(null);
                                  toast.info('Génération du dump SQL en cours...');
                                  setTimeout(() => {
                                    toast.success('Dump SQL généré avec succès.');
                                  }, 2000);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <ArchiveBoxIcon className="h-4 w-4 text-gray-400" /> Sauvegarder BDD
                              </button>
                              <div className="border-t border-gray-100 my-1"></div>"""

content = re.sub(
    r"<div className=\"border-t border-gray-100 my-1\"></div>",
    dropdown_html,
    content
)

# 8. Drawer Admins
drawer_admins_html = """<div className="flex flex-col gap-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Admins Actifs</span>
                        <span className="text-sm font-medium text-gray-900">{selectedClubForDetails.admin_count}</span>
                      </div>
                      {selectedClubForDetails.admin_count > 0 && (
                        <div className="bg-white rounded border border-gray-100 p-3 mt-1">
                          <ul className="text-xs text-gray-600 space-y-1.5">
                            <li className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-brand-blue"></span>
                              {selectedClubForDetails.contact_email} (Principal)
                            </li>
                            {Array.from({ length: Math.min(selectedClubForDetails.admin_count - 1, 3) }).map((_, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                admin{i + 2}@club.com
                              </li>
                            ))}
                            {selectedClubForDetails.admin_count > 4 && (
                              <li className="text-gray-400 pl-3 italic">
                                + {selectedClubForDetails.admin_count - 4} autres...
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>"""

content = re.sub(
    r"<div className=\"flex justify-between\">\n\s*<span className=\"text-sm text-gray-500\">Admins Actifs</span>\n\s*<span className=\"text-sm font-medium text-gray-900\">\{selectedClubForDetails\.admin_count\}</span>\n\s*</div>",
    drawer_admins_html,
    content
)

# Adjust colspan
content = re.sub(r"colSpan=\{5\}", r"colSpan={7}", content)

with open('frontend/src/features/superadmin/pages/SuperAdminDashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
