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
  XMarkIcon
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

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  
  // Drawer state
  const [selectedClubForDetails, setSelectedClubForDetails] = useState<ClubInfo | null>(null);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);

  const [selectedClub, setSelectedClub] = useState<ClubInfo | null>(null);

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
        return <span className="inline-flex items-center gap-1.5 rounded-md bg-brand-green/10 px-2.5 py-1.5 text-xs font-semibold text-brand-green ring-1 ring-inset ring-brand-green/20"><CheckCircleIcon className="h-4 w-4" /> Actif</span>;
      case 'trial':
        return <span className="inline-flex items-center gap-1.5 rounded-md bg-brand-blue/10 px-2.5 py-1.5 text-xs font-semibold text-brand-blue ring-1 ring-inset ring-brand-blue/20">En Essai</span>;
      case 'suspended':
        return <span className="inline-flex items-center gap-1.5 rounded-md bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-600/20">Suspendu</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-50 px-2.5 py-1.5 text-xs font-semibold text-gray-600 ring-1 ring-inset ring-gray-500/20">{status}</span>;
    }
  };

  const filteredClubs = clubs.filter(club => {
    const matchesSearch = club.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          club.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || club.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
    <div className="max-w-7xl mx-auto relative">
      
      <div className="flex items-center gap-4 mb-8 justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-brand-green/10 p-3">
            <ShieldCheckIcon className="h-8 w-8 text-brand-green" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-brand-dark">
              Centre de Contrôle Global
            </h1>
            <p className="mt-1 text-sm text-gray-500">Vue d'ensemble et gestion des clubs locataires de la plateforme SaaS.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            Export CSV
          </button>
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-blue rounded-lg hover:bg-brand-blue/90 transition-colors"
          >
            Inviter un Club
          </button>
        </div>
      </div>
        
      {/* STATS */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-10">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <div className="flex items-center gap-x-4">
            <div className="bg-brand-blue/10 p-2 rounded-lg">
              <BuildingOfficeIcon className="h-6 w-6 text-brand-blue" />
            </div>
            <h3 className="text-sm font-semibold leading-7 text-gray-600">Total des Clubs</h3>
          </div>
          <p className="mt-4 text-3xl font-semibold tracking-tight text-brand-dark">{clubs.length}</p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <div className="flex items-center gap-x-4">
            <div className="bg-brand-green/10 p-2 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-brand-green" />
            </div>
            <h3 className="text-sm font-semibold leading-7 text-gray-600">Clubs Actifs</h3>
          </div>
          <p className="mt-4 text-3xl font-semibold tracking-tight text-brand-green">
            {clubs.filter(c => c.status === 'active' || c.status === 'trial').length}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <div className="flex items-center gap-x-4">
            <div className="bg-brand-blue/10 p-2 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-brand-blue" />
            </div>
            <h3 className="text-sm font-semibold leading-7 text-gray-600">Total Admins</h3>
          </div>
          <p className="mt-4 text-3xl font-semibold tracking-tight text-brand-dark">
            {clubs.reduce((acc, curr) => acc + curr.admin_count, 0)}
          </p>
        </div>
      </div>

      {/* CLUBS TABLE */}
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50/30 gap-4">
          <div className="flex items-center gap-3">
            <ChartBarIcon className="h-5 w-5 text-brand-blue" />
            <h2 className="text-lg font-semibold leading-7 text-brand-dark">Clubs inscrits</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher (nom, code)..."
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-brand-blue focus:border-brand-blue w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="relative flex items-center">
              <FunnelIcon className="h-4 w-4 text-gray-400 absolute left-3 pointer-events-none" />
              <select
                className="pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-brand-blue focus:border-brand-blue appearance-none bg-white"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="suspended">Suspendu</option>
                <option value="trial">En Essai</option>
              </select>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="p-12 text-center text-gray-500 animate-pulse">Chargement des données...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-white">
                <tr>
                  <th className="py-4 pl-6 pr-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Organisation</th>
                  <th className="px-3 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Code Unique</th>
                  <th className="px-3 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Base de données</th>
                  <th className="px-3 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="relative py-4 pl-3 pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredClubs.map((club) => (
                  <tr key={club.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => openDetailsDrawer(club)}>
                    <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm">
                      <div className="font-semibold text-brand-dark">{club.name}</div>
                      <div className="text-gray-500 mt-0.5 text-xs">{club.contact_email}</div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <span className="font-mono bg-gray-100 px-2.5 py-1 rounded-md text-gray-700 text-xs">{club.code}</span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 font-mono text-xs">
                      {club.db_name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      {getStatusBadge(club.status)}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => openDetailsDrawer(club)}
                          className="text-gray-500 bg-gray-100 hover:bg-gray-200 p-1.5 rounded-md transition-all"
                          title="Voir les détails"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => openEditModal(club)}
                          className="text-brand-blue bg-brand-blue/10 hover:bg-brand-blue hover:text-white p-1.5 rounded-md transition-all"
                          title="Modifier le club"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        
                        {club.status === 'suspended' ? (
                          <button 
                            onClick={() => handleStatusChange(club.id, 'active')}
                            className="text-brand-green bg-brand-green/10 hover:bg-brand-green hover:text-white p-1.5 rounded-md transition-all"
                            title="Réactiver le club"
                          >
                            <PlayIcon className="h-5 w-5" />
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleStatusChange(club.id, 'suspended')}
                            className="text-orange-500 bg-orange-50 hover:bg-orange-500 hover:text-white p-1.5 rounded-md transition-all"
                            title="Suspendre le club"
                          >
                            <PauseIcon className="h-5 w-5" />
                          </button>
                        )}
                        
                        <button 
                          onClick={() => openDeleteModal(club)}
                          className="text-red-600 bg-red-50 hover:bg-red-600 hover:text-white p-1.5 rounded-md transition-all"
                          title="Supprimer le club"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredClubs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-500">
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
      {isDetailsDrawerOpen && selectedClubForDetails && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/30 transition-opacity" onClick={() => setIsDetailsDrawerOpen(false)} />
          <div className="relative w-full max-w-md bg-white shadow-xl h-full flex flex-col transform transition-transform duration-300 ease-in-out z-10 border-l border-gray-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-brand-dark">Détails du club</h2>
              <button onClick={() => setIsDetailsDrawerOpen(false)} className="text-gray-400 hover:text-gray-500">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold text-xl">
                  {selectedClubForDetails.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedClubForDetails.name}</h3>
                  <p className="text-sm text-gray-500">{selectedClubForDetails.code}</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Informations Générales</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Statut</span>
                      <span className="text-sm font-medium">{getStatusBadge(selectedClubForDetails.status)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Date de création</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(selectedClubForDetails.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Base de données</span>
                      <span className="text-sm font-medium text-gray-900 font-mono text-xs">{selectedClubForDetails.db_name}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Abonnement & Accès</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Admins Actifs</span>
                      <span className="text-sm font-medium text-gray-900">{selectedClubForDetails.admin_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Plan d'abonnement</span>
                      <span className="text-sm font-medium text-gray-900 capitalize">{selectedClubForDetails.subscription_plan || 'Non spécifié'}</span>
                    </div>
                    {selectedClubForDetails.trial_ends_at && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Fin de l'essai</span>
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(selectedClubForDetails.trial_ends_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Contact</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Email</span>
                      <span className="text-sm font-medium text-gray-900">{selectedClubForDetails.contact_email}</span>
                    </div>
                    {selectedClubForDetails.contact_phone && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Téléphone</span>
                        <span className="text-sm font-medium text-gray-900">{selectedClubForDetails.contact_phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => setIsDetailsDrawerOpen(false)}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
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
