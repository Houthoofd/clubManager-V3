/**
 * AlertActionsModal
 * Modal affichant l'historique des actions d'une alerte
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { AlertUserDto, AlertActionType } from '../api/alertsApi';
import { useAlertActions, useAddAlertAction } from '../hooks/useAlerts';

interface AlertActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  alert: AlertUserDto | null;
}

const ACTION_TYPES: AlertActionType[] = [
  'message_envoye',
  'information_mise_a_jour',
  'paiement_recu',
  'statut_change',
  'autre',
];

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function AlertActionsModal({ isOpen, onClose, alert }: AlertActionsModalProps) {
  const { t } = useTranslation('alerts');
  const [newAction, setNewAction] = useState<AlertActionType>('autre');
  const [newDesc, setNewDesc] = useState('');

  const { data: actions = [], isLoading } = useAlertActions(alert?.id ?? null);
  const { mutate: addAction, isPending } = useAddAlertAction();

  const handleAddAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alert) return;
    addAction(
      { id: alert.id, payload: { action_type: newAction, description: newDesc.trim() || undefined } },
      {
        onSuccess: () => {
          toast.success(t('userAlerts.messages.actionAdded'));
          setNewDesc('');
        },
        onError: () => {
          toast.error(t('errors.saveFailed'));
        },
      },
    );
  };

  if (!isOpen || !alert) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">
            {t('userAlerts.modal.actionsTitle')}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Alert info */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex-shrink-0">
          <p className="text-sm text-gray-600">
            Alerte #{alert.id} — Utilisateur #{alert.user_id}
          </p>
          {alert.alerte_type && (
            <p className="text-xs text-gray-500 mt-0.5">{alert.alerte_type.nom}</p>
          )}
        </div>

        {/* Actions list */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <svg className="animate-spin h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : actions.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Aucune action enregistrée</p>
          ) : (
            actions.map((action) => (
              <div key={action.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                      {t(`actionTypes.${action.action_type}`)}
                    </span>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {formatDate(action.created_at)}
                    </span>
                  </div>
                  {action.description && (
                    <p className="text-sm text-gray-600 mt-1.5">{action.description}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add action form */}
        <div className="border-t border-gray-200 px-6 py-4 flex-shrink-0">
          <p className="text-sm font-medium text-gray-700 mb-3">
            {t('userAlerts.modal.addActionTitle')}
          </p>
          <form onSubmit={handleAddAction} className="space-y-3">
            <select
              value={newAction}
              onChange={(e) => setNewAction(e.target.value as AlertActionType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ACTION_TYPES.map((at) => (
                <option key={at} value={at}>{t(`actionTypes.${at}`)}</option>
              ))}
            </select>
            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder={t('userAlerts.modal.actionFields.description')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {isPending && (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
