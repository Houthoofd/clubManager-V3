/**
 * DeleteUserModal
 * Modal de confirmation de suppression d'un utilisateur.
 * Requiert une raison d'au moins 5 caractères avant de confirmer.
 */

import { useState, useEffect } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DeleteUserModalProps {
  userId: number;
  userName: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}

// ─── Icônes inline ────────────────────────────────────────────────────────────

function SpinnerIcon() {
  return (
    <svg
      className="animate-spin h-4 w-4 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg
      className="h-6 w-6 text-red-600 flex-shrink-0"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
      />
    </svg>
  );
}

// ─── Composant ────────────────────────────────────────────────────────────────

/**
 * DeleteUserModal — Modal de confirmation de suppression d'un utilisateur.
 *
 * Affiche un avertissement rouge avec le nom de l'utilisateur ciblé et exige
 * une raison d'au moins 5 caractères avant d'autoriser la confirmation.
 * Se ferme sur Escape ou clic sur l'overlay (sauf pendant le chargement).
 */
export const DeleteUserModal: React.FC<DeleteUserModalProps> = ({
  userName,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState(false);

  // ── Réinitialisation à l'ouverture ────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setReason('');
      setIsLoading(false);
      setTouched(false);
    }
  }, [isOpen]);

  // ── Fermeture sur Escape ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  // ── Bloquer le scroll du body ─────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // ── Validation ────────────────────────────────────────────────────────────

  const trimmedReason = reason.trim();
  const isReasonValid = trimmedReason.length >= 5;
  const showError = touched && !isReasonValid;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleConfirm = async () => {
    setTouched(true);
    if (!isReasonValid) return;

    setIsLoading(true);
    try {
      await onConfirm(trimmedReason);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverlayClick = () => {
    if (!isLoading) onClose();
  };

  const handleClose = () => {
    if (!isLoading) onClose();
  };

  if (!isOpen) return null;

  // ── Rendu ─────────────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-user-title"
      onClick={handleOverlayClick}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Titre ── */}
        <div className="flex items-center gap-3 mb-4">
          <WarningIcon />
          <h2
            id="delete-user-title"
            className="text-xl font-semibold text-gray-900"
          >
            Supprimer l'utilisateur
          </h2>
        </div>

        {/* ── Avertissement ── */}
        <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 leading-relaxed">
          <p>
            Vous êtes sur le point de supprimer le compte de{' '}
            <span className="font-semibold">{userName}</span>.
          </p>
          <p className="mt-1">
            Cette action est <span className="font-semibold">irréversible</span>.
            L'utilisateur n'aura plus accès à son compte.
          </p>
        </div>

        {/* ── Champ raison ── */}
        <div className="mb-6">
          <label
            htmlFor="delete-reason"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Raison de la suppression{' '}
            <span className="text-red-500">*</span>
          </label>
          <textarea
            id="delete-reason"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            onBlur={() => setTouched(true)}
            disabled={isLoading}
            placeholder="Décrivez la raison de cette suppression (min. 5 caractères)…"
            className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm text-sm resize-none
                        placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors
                        disabled:bg-gray-50 disabled:cursor-not-allowed
                        ${
                          showError
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }`}
          />
          {showError && (
            <p className="mt-1.5 text-xs text-red-600">
              La raison doit contenir au moins 5 caractères.
            </p>
          )}
          {!showError && (
            <p className="mt-1.5 text-xs text-gray-400">
              {trimmedReason.length} / 5 caractères minimum
            </p>
          )}
        </div>

        {/* ── Actions ── */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200
                       active:bg-gray-300 rounded-lg transition-colors
                       disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white
                       bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-lg shadow-sm
                       transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading && <SpinnerIcon />}
            {isLoading ? 'Suppression…' : 'Supprimer'}
          </button>
        </div>
      </div>
    </div>
  );
};
