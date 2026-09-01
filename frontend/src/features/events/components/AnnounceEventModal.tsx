import React, { useState } from 'react';
import { Modal } from '../../../shared/components/Modal/Modal';
import { MegaphoneIcon } from '@heroicons/react/24/outline';
import { useMutation } from '@tanstack/react-query';
import { eventsService } from '../api/eventsService';

interface AnnounceEventModalProps {
  eventId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AnnounceEventModal: React.FC<AnnounceEventModalProps> = ({
  eventId,
  isOpen,
  onClose,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const announceMutation = useMutation({
    mutationFn: async () => {
      if (!eventId) throw new Error('Event ID is missing');
      return eventsService.announceEvent(eventId);
    },
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    },
    onError: (err: any) => {
      setError(err.message || "Une erreur est survenue lors de l'envoi de l'annonce.");
    },
  });

  const handleConfirm = () => {
    setError(null);
    announceMutation.mutate();
  };

  React.useEffect(() => {
    if (!isOpen) {
      setSuccess(false);
      setError(null);
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <Modal.Header 
        title="Annoncer l'événement" 
        onClose={onClose} 
      />
      <Modal.Body>
        {success ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Annonce envoyée !</h3>
            <p className="text-gray-500 text-sm">Tous les membres du club ont été prévenus.</p>
          </div>
        ) : (
          <div className="py-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 mb-4 mx-auto">
              <MegaphoneIcon className="w-6 h-6 text-purple-600" />
            </div>
            {error && (
              <div className="p-3 mb-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200 text-center">
                {error}
              </div>
            )}
            <p className="text-gray-700 text-center text-sm">
              Voulez-vous vraiment annoncer cet événement à tous les membres du club ?
            </p>
            <p className="text-gray-500 text-center text-xs mt-2">
              Un e-mail automatique sera envoyé avec les détails de l'événement.
            </p>
          </div>
        )}
      </Modal.Body>
      {!success && (
        <Modal.Footer align="center">
          <button
            type="button"
            onClick={onClose}
            disabled={announceMutation.isPending}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={announceMutation.isPending}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50"
          >
            {announceMutation.isPending ? 'Envoi en cours...' : 'Oui, annoncer'}
          </button>
        </Modal.Footer>
      )}
    </Modal>
  );
};
