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
  TrashIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import { superAdminApi, ClubInfo } from '../api/superAdminApi';
import { EditClubModal } from '../components/EditClubModal';
import { DeleteClubModal } from '../components/DeleteClubModal';

export const SuperAdminDashboard = () => {
  const [clubs, setClubs] = useState<ClubInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
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
        toast.warning(Le club a été suspendu. L'accès est révoqué.);
      } else {
        toast.success(Le club a été réactivé avec succès.);
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

  return (
    <div className="max-w-7xl mx-auto">
      
      <div className="flex items-center gap-4 mb-8">
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
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
          <div className="flex items-center gap-3">
            <ChartBarIcon className="h-5 w-5 text-brand-blue" />
            <h2 className="text-lg font-semibold leading-7 text-brand-dark">Clubs inscrits</h2>
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
                {clubs.map((club) => (
                  <tr key={club.id} className="hover:bg-gray-50/50 transition-colors">
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
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
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
                {clubs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-500">
                      Aucune organisation inscrite pour le moment.
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
    </div>
  );
};
