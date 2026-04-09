/**
 * EditUserRoleModal
 * Modal permettant à un admin de modifier le rôle applicatif d'un utilisateur.
 */

import { useState, useEffect } from 'react';
import { UserRole } from '@clubmanager/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface EditUserRoleModalProps {
  userId: number;
  currentRole: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (role: string) => Promise<void>;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const roleOptions: { value: string; label: string }[] = [
  { value: UserRole.ADMIN,     label: 'Admin'      },
  { value: UserRole.PROFESSOR, label: 'Professeur' },
  { value: UserRole.MEMBER,    label: 'Membre'     },
];

// ─── Spinner ──────────────────────────────────────────────────────────────────

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

// ─── Composant ────────────────────────────────────────────────────────────────

/**
 * EditUserRoleModal — Modal de modification du rôle applicatif.
 *
 * Pré-sélectionne le rôle courant de l'utilisateur.
 * Affiche un spinner durant la confirmation et bloque les interactions.
 * Se ferme sur Escape ou clic sur l'overlay.
 */
export const EditUserRoleModal: React.FC<EditUserRoleModalProps> = ({
  currentRole,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [selectedRole, setSelectedRole] = useState<string>(currentRole);
  const [isLoading, setIsLoading] = useState(false);

  // ── Synchronise la valeur initiale quand la modal s'ouvre ─────────────────
  useEffect(() => {
    if (isOpen) {
      setSelectedRole(currentRole);
      setIsLoading(false);
    }
  }, [isOpen, currentRole]);

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

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm(selectedRole);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverlayClick = () => {
    if (!isLoading) onClose();
  };

  if (!isOpen) return null;

  // ── Rendu ─────────────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-role-title"
      onClick={handleOverlayClick}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Titre ── */}
        <h2
          id="edit-role-title"
          className="text-xl font-semibold text-gray-900 mb-5"
        >
          Modifier le rôle
        </h2>

        {/* ── Select ── */}
        <div className="mb-6">
          <label
            htmlFor="role-select"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Rôle applicatif
          </label>
          <select
            id="role-select"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            disabled={isLoading}
            className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                       disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
          >
            {roleOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* ── Actions ── */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
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
            disabled={isLoading || selectedRole === currentRole}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white
                       bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-sm
                       transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading && <SpinnerIcon />}
            {isLoading ? 'Enregistrement…' : 'Confirmer'}
          </button>
        </div>
      </div>
    </div>
  );
};
