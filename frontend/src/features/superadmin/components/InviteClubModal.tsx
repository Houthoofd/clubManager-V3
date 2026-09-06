import React, { useState } from 'react';
import { XMarkIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import { superAdminApi } from '../api/superAdminApi';
import { toast } from 'sonner';

interface InviteClubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InviteClubModal: React.FC<InviteClubModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ inviteLink: string, token: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await superAdminApi.inviteClub(email);
      setInviteResult(response.data);
      toast.success("Invitation créée avec succès.");
    } catch (error: any) {
      toast.error("Erreur lors de la création de l\'invitation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = () => {
    if (inviteResult?.inviteLink) {
      navigator.clipboard.writeText(inviteResult.inviteLink);
      toast.success("Lien copié dans le presse-papiers");
    }
  };

  const handleClose = () => {
    setEmail('');
    setInviteResult(null);
    onClose();
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">Inviter un Club</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!inviteResult ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email du futur administrateur</label>
                <input
                  type="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@nouveauclub.com"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !email}
                  className="px-4 py-2 text-sm font-medium text-white bg-brand-blue rounded-lg hover:bg-brand-blue/90 disabled:opacity-50"
                >
                  {isSubmitting ? 'Génération...' : 'Générer le lien'}
                </button>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lien d'invitation généré</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    value={inviteResult.inviteLink}
                  />
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="p-2 text-brand-blue bg-brand-blue/10 rounded-lg hover:bg-brand-blue hover:text-white transition-colors"
                    title="Copier le lien"
                  >
                    <DocumentDuplicateIcon className="w-5 h-5" />
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Transmettez ce lien à l'administrateur du nouveau club. Il en aura besoin pour s'inscrire.
                </p>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-white bg-brand-blue rounded-lg hover:bg-brand-blue/90"
                >
                  Terminer
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};
