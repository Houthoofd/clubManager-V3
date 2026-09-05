import React, { useState } from 'react';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { ClubInfo, superAdminApi } from '../api/superAdminApi';
import { toast } from 'sonner';

interface DeleteClubModalProps {
  isOpen: boolean;
  onClose: () => void;
  club: ClubInfo | null;
  onSuccess: () => void;
}

export const DeleteClubModal: React.FC<DeleteClubModalProps> = ({ isOpen, onClose, club, onSuccess }) => {
  const [confirmationName, setConfirmationName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !club) return null;

  const isConfirmed = confirmationName === club.name;

  const handleDelete = async () => {
    if (!isConfirmed) return;
    
    setIsDeleting(true);
    try {
      await superAdminApi.deleteClub(club.id);
      toast.success('Le club a été supprimé définitivement.');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error('Erreur lors de la suppression du club.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-start p-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Supprimer le club</h2>
              <p className="mt-2 text-sm text-gray-500">
                Êtes-vous sûr de vouloir supprimer le club <strong className="text-gray-900">{club.name}</strong> ? 
                Cette action est irréversible et supprimera toutes les données associées.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="px-6 pb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Veuillez taper <strong>{club.name}</strong> pour confirmer.
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              value={confirmationName}
              onChange={(e) => setConfirmationName(e.target.value)}
              placeholder={club.name}
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={!isConfirmed || isDeleting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
