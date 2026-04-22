/**
 * MessageDetail.tsx
 * Panneau de détail d'un message sélectionné
 */

import type { MessageWithDetails } from "../api/messagingApi";
import {
  ArrowLeftIcon,
  BullhornIcon,
  EnvelopeIcon,
  TrashIcon,
} from "@patternfly/react-icons";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MessageDetailProps {
  message: MessageWithDetails;
  onDelete: () => void;
  onBack?: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Formate une date ISO en "15 janvier 2025 à 14h30"
 */
function formatFullDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const dateFormatted = date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${dateFormatted} à ${hours}h${minutes}`;
  } catch {
    return dateStr;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export const MessageDetail: React.FC<MessageDetailProps> = ({
  message,
  onDelete,
  onBack,
}) => {
  const handleDelete = () => {
    const confirmed = window.confirm(
      "Êtes-vous sûr de vouloir supprimer ce message ? Cette action est irréversible.",
    );
    if (confirmed) {
      onDelete();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* ── Barre d'actions ── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
        {/* Bouton retour (visible sur mobile ou si callback fourni) */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeftIcon style={{ fontSize: "16px" }} />
          <span>Retour</span>
        </button>

        {/* Bouton supprimer */}
        <button
          onClick={handleDelete}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-red-200 hover:border-red-300"
        >
          <TrashIcon className="w-4 h-4" />
          <span>Supprimer</span>
        </button>
      </div>

      {/* ── En-tête du message ── */}
      <div className="px-6 py-5 border-b border-gray-100 flex-shrink-0">
        {/* Sujet */}
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {message.sujet ?? "(Pas de sujet)"}
        </h2>

        {/* Métadonnées */}
        <dl className="space-y-2 text-sm">
          <div className="flex gap-2">
            <dt className="w-14 text-gray-500 font-medium flex-shrink-0">
              De :
            </dt>
            <dd className="text-gray-900">
              {message.expediteur_nom}
              {message.expediteur_userId && (
                <span className="ml-1.5 text-gray-400 text-xs font-mono">
                  ({message.expediteur_userId})
                </span>
              )}
            </dd>
          </div>

          <div className="flex gap-2">
            <dt className="w-14 text-gray-500 font-medium flex-shrink-0">
              À :
            </dt>
            <dd className="text-gray-900">{message.destinataire_nom}</dd>
          </div>

          <div className="flex gap-2">
            <dt className="w-14 text-gray-500 font-medium flex-shrink-0">
              Date :
            </dt>
            <dd className="text-gray-600">
              {formatFullDate(message.created_at)}
            </dd>
          </div>

          {/* Badges informatifs */}
          <div className="flex items-center gap-2 pt-1">
            {message.envoye_par_email && (
              <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-600 border border-blue-200 rounded-full px-2.5 py-0.5">
                <EnvelopeIcon
                  className="inline-block align-middle"
                  style={{ fontSize: "12px" }}
                />
                Envoyé par email
              </span>
            )}
            {message.broadcast_id !== null && (
              <span className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-600 border border-purple-200 rounded-full px-2.5 py-0.5">
                <BullhornIcon
                  className="inline-block align-middle"
                  style={{ fontSize: "12px" }}
                />
                Message groupé
              </span>
            )}
          </div>
        </dl>
      </div>

      {/* ── Contenu du message ── */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <div className="prose prose-sm max-w-none">
          {message.contenu.split("\n").map((line, index) => (
            <p
              key={index}
              className="text-gray-800 leading-relaxed mb-3 last:mb-0"
            >
              {line || <>&nbsp;</>}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MessageDetail;
