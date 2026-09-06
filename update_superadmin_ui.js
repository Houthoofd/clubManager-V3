const fs = require('fs');
let c = fs.readFileSync('frontend/src/features/superadmin/pages/SuperAdminDashboard.tsx', 'utf8');

// Add ArrowRightOnRectangleIcon (Impersonate), MagnifyingGlassIcon (Search), ArrowDownTrayIcon (Export), EyeIcon (Details)
c = c.replace(/EnvelopeIcon/g, 'EnvelopeIcon,\n  ArrowRightOnRectangleIcon,\n  MagnifyingGlassIcon,\n  ArrowDownTrayIcon,\n  EyeIcon,\n  XMarkIcon');
c = c.replace(/const \[clubs, setClubs\] = useState<ClubInfo\[\]>\(\[\]\);/, 'const [clubs, setClubs] = useState<ClubInfo[]>([]);\n  const [searchQuery, setSearchQuery] = useState(\'\');\n  const [statusFilter, setStatusFilter] = useState(\'all\');\n  const [selectedClubForDetails, setSelectedClubForDetails] = useState<ClubInfo | null>(null);\n  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);');

// Handle export CSV
const exportLogic = `
  const handleExportCSV = () => {
    const csvRows = [];
    csvRows.push(['ID', 'Nom', 'Code', 'Email', 'DB', 'Statut'].join(','));
    filteredClubs.forEach(club => {
      csvRows.push([club.id, club.name, club.code, club.contact_email, club.db_name, club.status].join(','));
    });
    const blob = new Blob([csvRows.join('\\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clubs_export.csv';
    a.click();
  };
`;
c = c.replace(/const fetchClubs = async/, exportLogic + '\n  const fetchClubs = async');

// Filter logic
const filterLogic = `
  const filteredClubs = clubs.filter(club => {
    const matchesSearch = club.name.toLowerCase().includes(searchQuery.toLowerCase()) || club.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || club.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
`;
c = c.replace(/useEffect\(\(\) => \{\n    fetchClubs\(\);\n  \}, \[\]\);/, 'useEffect(() => {\n    fetchClubs();\n  }, []);\n' + filterLogic);

// Impersonate logic
const impersonateLogic = `
  const handleImpersonate = async (clubId: number) => {
    try {
      toast.info("Connexion en cours...");
      const response = await superAdminApi.impersonateClub(clubId);
      // Simulate auth token saving
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('auth_refresh', response.data.refreshToken);
      window.location.href = '/dashboard';
    } catch (error) {
      toast.error("Erreur lors de l'impersonation.");
    }
  };
`;
c = c.replace(/const handleStatusChange = async/, impersonateLogic + '\n  const handleStatusChange = async');

// Add tools to the top bar
const toolsBar = `
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm inline-flex items-center gap-2"
          >
            <ArrowDownTrayIcon className="w-5 h-5 -mt-1" />
            Exporter CSV
          </button>
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-blue rounded-lg hover:bg-brand-blue/90 transition-colors shadow-sm inline-flex items-center gap-2"
          >
            <EnvelopeIcon className="w-5 h-5 -mt-1" />
            Inviter un Club
          </button>
        </div>
`;
c = c.replace(/<\/div>\s*<button[\s\S]*?<\/button>\s*<\/div>/, toolsBar + '\n      </div>');

// Add search and filter to the table header
const tableHeader = `
        <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50/30 gap-4">
          <div className="flex items-center gap-3">
            <ChartBarIcon className="h-5 w-5 text-brand-blue" />
            <h2 className="text-lg font-semibold leading-7 text-brand-dark">Clubs inscrits</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Rechercher..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-brand-blue focus:border-brand-blue w-64"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg text-sm py-2 pl-3 pr-8 focus:ring-brand-blue focus:border-brand-blue"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="trial">En Essai</option>
              <option value="suspended">Suspendus</option>
            </select>
          </div>
        </div>
`;
c = c.replace(/<div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50\/30">[\s\S]*?<\/div>\s*<\/div>/, tableHeader);

// Update clubs.map to filteredClubs.map
c = c.replace(/\{clubs\.map\(\(club\) => \(/, '{filteredClubs.map((club) => (');
c = c.replace(/\{clubs\.length === 0 && \(/, '{filteredClubs.length === 0 && (');

// Add Impersonate and Eye icons to actions
const newActions = `
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleImpersonate(club.id)}
                          className="text-brand-blue bg-brand-blue/10 hover:bg-brand-blue hover:text-white p-1.5 rounded-md transition-all"
                          title="Se connecter en tant que"
                        >
                          <ArrowRightOnRectangleIcon className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => { setSelectedClubForDetails(club); setIsDetailsDrawerOpen(true); }}
                          className="text-gray-500 bg-gray-100 hover:bg-gray-500 hover:text-white p-1.5 rounded-md transition-all"
                          title="Voir les détails"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => openEditModal(club)}
`;
c = c.replace(/<div className="flex justify-end gap-2">\s*<button \s*onClick=\{\(\) => openEditModal/, newActions);

// Add the Details Drawer at the bottom
const detailsDrawer = `
      {isDetailsDrawerOpen && selectedClubForDetails && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsDetailsDrawerOpen(false)} />
          <div className="fixed inset-y-0 right-0 max-w-md w-full flex bg-white shadow-xl flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Détails du Club</h2>
              <button onClick={() => setIsDetailsDrawerOpen(false)} className="text-gray-400 hover:text-gray-500">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Informations générales</h3>
                  <div className="mt-2 bg-gray-50 rounded-lg p-4 space-y-3">
                    <p className="text-sm"><span className="font-medium">Nom :</span> {selectedClubForDetails.name}</p>
                    <p className="text-sm"><span className="font-medium">Code :</span> {selectedClubForDetails.code}</p>
                    <p className="text-sm"><span className="font-medium">Créé le :</span> {new Date(selectedClubForDetails.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Base de données</h3>
                  <div className="mt-2 bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-mono">{selectedClubForDetails.db_name}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Statistiques</h3>
                  <div className="mt-2 bg-gray-50 rounded-lg p-4 flex gap-4">
                    <div className="text-center px-4 border-r border-gray-200">
                      <p className="text-2xl font-bold text-brand-dark">{selectedClubForDetails.admin_count}</p>
                      <p className="text-xs text-gray-500 uppercase">Administrateurs</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
`;
c = c.replace(/<EditClubModal/, detailsDrawer + '\n      <EditClubModal');

fs.writeFileSync('frontend/src/features/superadmin/pages/SuperAdminDashboard.tsx', c);
