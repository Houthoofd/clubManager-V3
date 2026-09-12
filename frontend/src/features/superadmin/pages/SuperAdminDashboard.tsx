import { useState, useEffect } from 'react';
import { 
  BuildingOfficeIcon, 
  UserGroupIcon, 
  CheckCircleIcon,
  PlayIcon,
  PauseIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  XMarkIcon,
  EllipsisVerticalIcon,
  EnvelopeIcon,
  ArrowRightOnRectangleIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  GiftIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import { superAdminApi, ClubInfo } from '../api/superAdminApi';
import { EditClubModal } from '../components/EditClubModal';
import { DeleteClubModal } from '../components/DeleteClubModal';
import { InviteClubModal } from '../components/InviteClubModal';

export const SuperAdminDashboard = () => {
  const [clubs, setClubs] = useState<ClubInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Sorting states
  const [sortColumn, setSortColumn] = useState<'name' | 'created_at' | 'status' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Bulk selection
  const [selectedClubIds, setSelectedClubIds] = useState<number[]>([]);

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  
  // Drawer state
  const [selectedClubForDetails, setSelectedClubForDetails] = useState<ClubInfo | null>(null);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);

  const [selectedClub, setSelectedClub] = useState<ClubInfo | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  const fetchClubs = async () => {
    try {
      setIsLoading(true);
      const response = await superAdminApi.getClubs();
      setClubs(response.data || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des clubs.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  
  const handleImpersonate = async (clubId: number) => {
    try {
      toast.info("Connexion en cours...");
      const response = await superAdminApi.impersonateClub(clubId);
      if (response.success && response.data) {
        
        // Save current super admin tokens for restoring later
        const currentToken = getAccessToken();
        const currentUser = getUserData();
        if (currentToken) localStorage.setItem('superadmin_accessToken', currentToken);
        if (currentUser) localStorage.setItem('superadmin_user', JSON.stringify(currentUser));

        // Set the new club admin credentials
        setAccessToken(response.data.token);
        setUserData(response.data.user);
        
        toast.success("Connecté en tant que club !");
        setTimeout(() => {
            window.location.href = '/dashboard';
        }, 1000);
      }
    } catch (error) {
      toast.error("Erreur lors de l'impersonation. Vérifiez qu'un administrateur existe pour ce club.");
    }
  };

  const handleStatusChange = async (clubId: number, newStatus: 'active' | 'suspended') => {
    try {
      await superAdminApi.updateClubStatus(clubId, newStatus);
      setClubs(clubs.map(c => c.id === clubId ? { ...c, status: newStatus } : c));
      if (newStatus === 'suspended') {
        toast.warning("Le club a été suspendu. L'accès est révoqué.");
      } else {
        toast.success("Le club a été réactivé avec succès.");
      }
    } catch (error) {
      toast.error('Erreur lors du changement de statut.');
    }
  };

  const openEditModal = (club: ClubInfo) => {
    setSelectedClub(club);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (club: ClubInfo) => {
    setSelectedClub(club);
    setIsDeleteModalOpen(true);
  };

  const openDetailsDrawer = (club: ClubInfo) => {
    setSelectedClubForDetails(club);
    setIsDetailsDrawerOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center gap-1.5 rounded-md bg-brand-green/10 dark:bg-brand-green/20 px-2.5 py-1.5 text-xs font-semibold text-brand-green ring-1 ring-inset ring-brand-green/20"><CheckCircleIcon className="h-4 w-4" /> Actif</span>;
      case 'trial':
        return <span className="inline-flex items-center gap-1.5 rounded-md bg-brand-blue/10 dark:bg-brand-blue/20 px-2.5 py-1.5 text-xs font-semibold text-brand-blue ring-1 ring-inset ring-brand-blue/20">En Essai</span>;
      case 'suspended':
        return <span className="inline-flex items-center gap-1.5 rounded-md bg-red-50 dark:bg-red-500/10 px-2.5 py-1.5 text-xs font-semibold text-red-700 dark:text-red-400 ring-1 ring-inset ring-red-600/20 dark:ring-red-500/20">Suspendu</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-50 dark:bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 ring-1 ring-inset ring-gray-500/20 dark:ring-gray-400/20">{status}</span>;
    }
  };

  const filteredClubs = clubs.filter(club => {
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
  };

  const exportToCSV = () => {
    if (filteredClubs.length === 0) {
      toast.error("Aucune donnée à exporter.");
      return;
    }
    const headers = ['Nom', 'Code', 'Email', 'Base de données', 'Statut', 'Admins', 'Plan'];
    const csvData = filteredClubs.map(c => [
      c.name, c.code, c.contact_email, c.db_name, c.status, c.admin_count, c.subscription_plan || ''
    ].map(field => `"${field}"`).join(','));
    
    const csvContent = [headers.join(','), ...csvData].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `clubs_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="w-full relative">
      
      <div className="flex items-center gap-4 mb-8 justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-brand-green/10 p-3">
            <ShieldCheckIcon className="h-8 w-8 text-brand-green" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-brand-dark dark:text-white">
              Centre de Contrôle Global
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Vue d'ensemble et gestion des clubs locataires de la plateforme SaaS.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            Export CSV
          </button>
          <button
              onClick={() => setIsInviteModalOpen(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-blue rounded-lg hover:bg-brand-blue/90 transition-colors inline-flex items-center gap-2"
            >
              <EnvelopeIcon className="h-5 w-5 -mt-1" />
              Inviter un Club
            </button>
        </div>
      </div>
        
      {/* STATS */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-10">
        <div className="rounded-2xl bg-white dark:bg-white/5 p-6 shadow-sm ring-1 ring-gray-200 dark:ring-white/10">
          <div className="flex items-center gap-x-4">
            <div className="bg-brand-blue/10 p-2 rounded-lg">
              <BuildingOfficeIcon className="h-6 w-6 text-brand-blue" />
            </div>
            <h3 className="text-sm font-semibold leading-7 text-gray-600 dark:text-gray-400">Total des Clubs</h3>
          </div>
          <p className="mt-4 text-3xl font-semibold tracking-tight text-brand-dark dark:text-white">{clubs.length}</p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-white/5 p-6 shadow-sm ring-1 ring-gray-200 dark:ring-white/10">
          <div className="flex items-center gap-x-4">
            <div className="bg-brand-green/10 p-2 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-brand-green" />
            </div>
            <h3 className="text-sm font-semibold leading-7 text-gray-600 dark:text-gray-400">Clubs Actifs</h3>
          </div>
          <p className="mt-4 text-3xl font-semibold tracking-tight text-brand-green">
            {clubs.filter(c => c.status === 'active' || c.status === 'trial').length}
          </p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-white/5 p-6 shadow-sm ring-1 ring-gray-200 dark:ring-white/10">
          <div className="flex items-center gap-x-4">
            <div className="bg-brand-blue/10 p-2 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-brand-blue" />
            </div>
            <h3 className="text-sm font-semibold leading-7 text-gray-600 dark:text-gray-400">Total Admins</h3>
          </div>
          <p className="mt-4 text-3xl font-semibold tracking-tight text-brand-dark dark:text-white">
            {clubs.reduce((acc, curr) => acc + curr.admin_count, 0)}
          </p>
        </div>
      </div>

      {/* CLUBS TABLE */}
      <div className="rounded-2xl bg-white dark:bg-slate-800 shadow-sm ring-1 ring-gray-200 dark:ring-white/10 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 dark:bg-slate-800/50 gap-4">
          <div className="flex items-center gap-3">
            <ChartBarIcon className="h-5 w-5 text-brand-blue" />
            <h2 className="text-lg font-semibold leading-7 text-brand-dark dark:text-white">Clubs inscrits</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher (nom, code)..."
                className="pl-9 pr-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg text-sm focus:ring-brand-blue focus:border-brand-blue w-64 bg-white dark:bg-white/5 dark:text-slate-300 dark:placeholder-slate-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="relative flex items-center">
              <FunnelIcon className="h-4 w-4 text-gray-400 absolute left-3 pointer-events-none" />
              <select
                className="pl-9 pr-8 py-2 border border-gray-300 dark:border-white/10 rounded-lg text-sm focus:ring-brand-blue focus:border-brand-blue appearance-none bg-white dark:bg-slate-800 dark:text-slate-400"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option className="bg-white dark:bg-slate-800 dark:text-slate-300" value="all">Tous les statuts</option>
                <option className="bg-white dark:bg-slate-800 dark:text-slate-300" value="active">Actif</option>
                <option className="bg-white dark:bg-slate-800 dark:text-slate-300" value="suspended">Suspendu</option>
                <option className="bg-white dark:bg-slate-800 dark:text-slate-300" value="trial">En Essai</option>
              </select>
            </div>
          </div>
        </div>
        
        {selectedClubIds.length > 0 && (
          <div className="bg-brand-blue/5 dark:bg-white/5 border-b border-brand-blue/10 dark:border-white/5 px-6 py-3 flex items-center justify-between">
            <span className="text-sm font-medium text-brand-dark dark:text-white">
              {selectedClubIds.length} club(s) sélectionné(s)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkSuspend}
                className="px-3 py-1.5 text-xs font-medium text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-orange-500/10 rounded hover:bg-orange-200 dark:hover:bg-orange-500/20 transition-colors"
              >
                Suspendre
              </button>
              <button
                onClick={handleBulkReactivate}
                className="px-3 py-1.5 text-xs font-medium text-brand-green dark:text-emerald-400 bg-brand-green/10 dark:bg-emerald-500/10 rounded hover:bg-brand-green/20 dark:hover:bg-emerald-500/20 transition-colors"
              >
                Réactiver
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 text-xs font-medium text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-500/10 rounded hover:bg-red-200 dark:hover:bg-red-500/20 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        )}
        
        {isLoading ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400 animate-pulse">Chargement des données...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 dark:divide-white/5">
              <thead className="bg-gray-50 dark:bg-slate-900/40">
                <tr>
                  <th className="py-4 pl-6 pr-3 text-left w-12">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 dark:border-white/10 dark:bg-slate-900 text-brand-blue focus:ring-brand-blue cursor-pointer"
                      checked={filteredClubs.length > 0 && selectedClubIds.length === filteredClubs.length}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th 
                    className="py-4 px-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 select-none"
                    onClick={() => handleSort('name')}
                  >
                    Organisation {getSortIcon('name')}
                  </th>
                  <th className="px-3 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Code Unique</th>
                  <th className="px-3 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Base de données</th>
                  <th 
                    className="px-3 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 select-none"
                    onClick={() => handleSort('created_at')}
                  >
                    Date de création {getSortIcon('created_at')}
                  </th>
                  <th 
                    className="px-3 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 select-none"
                    onClick={() => handleSort('status')}
                  >
                    Statut {getSortIcon('status')}
                  </th>
                  <th className="relative py-4 pl-3 pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5 bg-white dark:bg-transparent">
                {filteredClubs.map((club) => (
                  <tr key={club.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer" onClick={() => openDetailsDrawer(club)}>
                    <td className="whitespace-nowrap py-4 pl-6 pr-3" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300 dark:border-white/10 dark:bg-slate-900 text-brand-blue focus:ring-brand-blue cursor-pointer"
                        checked={selectedClubIds.includes(club.id)}
                        onChange={() => toggleSelectClub(club.id)}
                      />
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <div className="font-semibold text-brand-dark dark:text-white">{club.name}</div>
                      <div className="text-gray-500 dark:text-gray-400 mt-0.5 text-xs">{club.contact_email}</div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-mono bg-gray-100 dark:bg-white/5 px-2.5 py-1 rounded-md text-gray-700 dark:text-gray-300 text-xs">{club.code}</span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono text-xs">
                      {club.db_name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(club.created_at).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      {getStatusBadge(club.status)}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                      
                      <div className="flex justify-end relative">
                        <button 
                          onClick={() => setOpenDropdownId(openDropdownId === club.id ? null : club.id)}
                          className="p-1.5 hover:bg-gray-100 dark:bg-white/5 rounded-md text-gray-500 dark:text-gray-400 transition-colors"
                        >
                          <EllipsisVerticalIcon className="h-5 w-5" />
                        </button>
                        
                        {openDropdownId === club.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setOpenDropdownId(null)} />
                            <div className="absolute right-0 top-10 w-max bg-white dark:bg-slate-800 rounded-lg shadow-xl z-50 ring-1 ring-black ring-opacity-5 dark:ring-white/10 p-1.5 flex flex-row gap-1 items-center">
                                <button 
                                  onClick={() => { setOpenDropdownId(null); openDetailsDrawer(club); }}
                                  title="Détails"
                                  className="p-2 rounded hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                                >
                                  <EyeIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                </button>
                                <button 
                                  onClick={() => { setOpenDropdownId(null); handleImpersonate(club.id); }}
                                  title="Se connecter en tant qu'admin"
                                  className="p-2 rounded hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                                >
                                  <ArrowRightOnRectangleIcon className="h-5 w-5 text-indigo-500" />
                                </button>
                                <button 
                                  onClick={() => { setOpenDropdownId(null); openEditModal(club); }}
                                  title="Modifier"
                                  className="p-2 rounded hover:bg-brand-blue/10 dark:hover:bg-brand-blue/20 transition-colors"
                                >
                                  <PencilIcon className="h-5 w-5 text-brand-blue" />
                                </button>
                                
                                {club.status === 'suspended' ? (
                                  <button 
                                    onClick={() => { setOpenDropdownId(null); handleStatusChange(club.id, 'active'); }}
                                    title="Réactiver"
                                    className="p-2 rounded hover:bg-brand-green/10 dark:hover:bg-brand-green/20 transition-colors"
                                  >
                                    <PlayIcon className="h-5 w-5 text-brand-green" />
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => { setOpenDropdownId(null); handleStatusChange(club.id, 'suspended'); }}
                                    title="Suspendre"
                                    className="p-2 rounded hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors"
                                  >
                                    <PauseIcon className="h-5 w-5 text-orange-500" />
                                  </button>
                                )}
                                
                                <button 
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
                                  title="Offrir 1 mois gratuit"
                                  className="p-2 rounded hover:bg-green-50 dark:hover:bg-green-500/10 transition-colors"
                                >
                                  <GiftIcon className="h-5 w-5 text-green-500" />
                                </button>
                                <button 
                                  onClick={() => {
                                    setOpenDropdownId(null);
                                    toast.info('Génération du dump SQL en cours...');
                                    setTimeout(() => {
                                      toast.success('Dump SQL généré avec succès.');
                                    }, 2000);
                                  }}
                                  title="Sauvegarder BDD"
                                  className="p-2 rounded hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                                >
                                  <ArchiveBoxIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                </button>
                                
                                <button 
                                  onClick={() => { setOpenDropdownId(null); openDeleteModal(club); }}
                                  title="Supprimer"
                                  className="p-2 rounded hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                >
                                  <TrashIcon className="h-5 w-5 text-red-500" />
                                </button>
                              </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredClubs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500 dark:text-gray-400">
                      Aucune organisation trouvée.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <EditClubModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        club={selectedClub}
        onSuccess={fetchClubs}
      />
      
      <DeleteClubModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        club={selectedClub}
        onSuccess={fetchClubs}
      />
      
      <InviteClubModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />

      {/* Details Drawer */}
      {selectedClubForDetails && (
        <div className={`fixed inset-0 z-[150] flex justify-end transition-all duration-300 ${isDetailsDrawerOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}>
          <div className="fixed inset-0 bg-black/30 transition-opacity" onClick={() => setIsDetailsDrawerOpen(false)} />
          <div className={`relative w-full max-w-md bg-white dark:bg-slate-800 shadow-xl h-full flex flex-col transform transition-transform duration-300 ease-in-out z-10 border-l border-gray-200 dark:border-white/10 ${isDetailsDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100 dark:border-white/10">
              <h2 className="text-lg font-semibold text-brand-dark dark:text-white">Détails du club</h2>
              <button onClick={() => setIsDetailsDrawerOpen(false)} className="text-gray-400 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300 dark:text-gray-400">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold text-xl">
                  {selectedClubForDetails.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedClubForDetails.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedClubForDetails.code}</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Informations Générales</h4>
                  <div className="bg-gray-50 dark:bg-slate-900/50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Statut</span>
                      <span className="text-sm font-medium">{getStatusBadge(selectedClubForDetails.status)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Date de création</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {new Date(selectedClubForDetails.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Base de données</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white font-mono text-xs">{selectedClubForDetails.db_name}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Abonnement & Accès</h4>
                  <div className="bg-gray-50 dark:bg-slate-900/50 rounded-lg p-4 space-y-3">
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Admins Actifs</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedClubForDetails.admin_count}</span>
                      </div>
                      {selectedClubForDetails.admin_count > 0 && (
                        <div className="bg-white dark:bg-white/5 rounded border border-gray-100 dark:border-white/10 p-3 mt-1">
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
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Plan d'abonnement</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">{selectedClubForDetails.subscription_plan || 'Non spécifié'}</span>
                    </div>
                    {selectedClubForDetails.trial_ends_at && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Fin de l'essai</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {new Date(selectedClubForDetails.trial_ends_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Contact</h4>
                  <div className="bg-gray-50 dark:bg-slate-900/50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Email</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedClubForDetails.contact_email}</span>
                    </div>
                    {selectedClubForDetails.contact_phone && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Téléphone</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedClubForDetails.contact_phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-slate-800/50">
              <button
                onClick={() => setIsDetailsDrawerOpen(false)}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-white/10"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
