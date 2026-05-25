/**
 * BroadcastNotificationModal
 * Modal admin pour envoyer une notification broadcast à un groupe d'utilisateurs
 */
import { useState } from "react";
import { toast } from "sonner";
import { useBroadcastNotification } from "../hooks/useNotifications";
import type { BroadcastNotificationPayload } from "../api/notificationsApi";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const TYPE_OPTIONS = [
  { value: "info", label: "Info" },
  { value: "warning", label: "Attention" },
  { value: "error", label: "Erreur" },
  { value: "success", label: "Succès" },
] as const;

const CIBLE_OPTIONS = [
  { value: "tous", label: "Tous les membres" },
  { value: "admin", label: "Administrateurs" },
  { value: "professor", label: "Professeurs" },
  { value: "member", label: "Membres" },
] as const;

export function BroadcastNotificationModal({ isOpen, onClose }: Props) {
  const { mutate: broadcast, isPending } = useBroadcastNotification();

  const [form, setForm] = useState<BroadcastNotificationPayload>({
    titre: "",
    contenu: "",
    type: "info",
    cible: "tous",
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titre.trim() || !form.contenu.trim()) {
      toast.error("Titre et contenu sont requis");
      return;
    }
    broadcast(form, {
      onSuccess: (data) => {
        toast.success(`Notification envoyée à ${data.sent} utilisateur(s)`);
        setForm({ titre: "", contenu: "", type: "info", cible: "tous" });
        onClose();
      },
      onError: () => toast.error("Erreur lors de l'envoi du broadcast"),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Envoyer une notification broadcast
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fermer"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="px-6 py-5 space-y-4"
          data-testid="broadcast-notification-form"
        >
          {/* Type + Cible */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    type: e.target
                      .value as BroadcastNotificationPayload["type"],
                  }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destinataires
              </label>
              <select
                value={form.cible}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    cible: e.target
                      .value as BroadcastNotificationPayload["cible"],
                  }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CIBLE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre
            </label>
            <input
              type="text"
              value={form.titre}
              onChange={(e) =>
                setForm((f) => ({ ...f, titre: e.target.value }))
              }
              placeholder="Titre de la notification..."
              maxLength={255}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Contenu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contenu
            </label>
            <textarea
              value={form.contenu}
              onChange={(e) =>
                setForm((f) => ({ ...f, contenu: e.target.value }))
              }
              placeholder="Message de la notification..."
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Envoi..." : "Envoyer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BroadcastNotificationModal;
