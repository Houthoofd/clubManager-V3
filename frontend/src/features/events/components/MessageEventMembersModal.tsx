import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../../shared/components/Modal/Modal';
import { Input } from '../../../shared/components/Input';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import { useMutation } from '@tanstack/react-query';
import { eventsService } from '../api/eventsService';

interface MessageEventMembersModalProps {
  eventId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MessageEventMembersModal: React.FC<MessageEventMembersModalProps> = ({
  eventId,
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation('common');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const messageMutation = useMutation({
    mutationFn: async () => {
      if (!eventId) throw new Error('Event ID is missing');
      return eventsService.messageMembers(eventId, { subject, message });
    },
    onSuccess: () => {
      onClose();
      setSubject('');
      setMessage('');
      setError(null);
    },
    onError: (err: any) => {
      setError(err.message || 'Une erreur est survenue lors de l\\'envoi.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setError('Le sujet et le message sont obligatoires.');
      return;
    }
    messageMutation.mutate();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Envoyer un message aux participants"
      description="Ce message sera envoy? par email à tous les membres inscrits  cet ?vnement."
    >
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
            {error}
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sujet du message
          </label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Ex: Modification de l'horaire"
            disabled={messageMutation.isPending}
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contenu du message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Bonjour à tous..."
            rows={5}
            disabled={messageMutation.isPending}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 resize-none"
          />
        </div>
        
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={messageMutation.isPending}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={messageMutation.isPending}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
          >
            {messageMutation.isPending ? 'Envoi en cours...' : (
              <>
                <EnvelopeIcon className="w-5 h-5 mr-2" />
                Envoyer
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};


