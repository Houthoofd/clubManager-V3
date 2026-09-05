import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ClubInfo, superAdminApi } from '../api/superAdminApi';
import { toast } from 'sonner';

interface EditClubModalProps {
  isOpen: boolean;
  onClose: () => void;
  club: ClubInfo | null;
  onSuccess: () => void;
}

export const EditClubModal: React.FC<EditClubModalProps> = ({ isOpen, onClose, club, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    contact_email: '',
    contact_phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (club && isOpen) {
      setFormData({
        name: club.name || '',
        code: club.code || '',
        contact_email: club.contact_email || '',
        contact_phone: club.contact_phone || ''
      });
    }
  }, [club, isOpen]);

  if (!isOpen || !club) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await superAdminApi.updateClub(club.id, formData);
      toast.success('Le club a été mis à jour avec succès.');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error('Erreur lors de la mise à jour du club.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">Modifier le club</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du club</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code unique</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
              value={formData.code}
              onChange={(e) => setFormData({...formData, code: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email de contact</label>
            <input
              type="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
              value={formData.contact_email}
              onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone de contact</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
              value={formData.contact_phone}
              onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
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
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-blue rounded-lg hover:bg-brand-blue/90 disabled:opacity-50"
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
