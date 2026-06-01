/**
 * CreateAlertModal
 * Modal pour créer une alerte pour un utilisateur (admin)
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { AlertTypeDto } from "../api/alertsApi";
import { useCreateUserAlert } from "../hooks/useAlerts";

interface CreateAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  alertTypes: AlertTypeDto[];
}

export function CreateAlertModal({
  isOpen,
  onClose,
  alertTypes,
}: CreateAlertModalProps) {
  const { t } = useTranslation("alerts");
  const [form, setForm] = useState({
    user_id: "",
    alerte_type_id: "",
    notes: "",
    donnees_contexte: "",
  });
  const [contextError, setContextError] = useState("");

  const { mutate: createAlert, isPending } = useCreateUserAlert();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContextError("");

    let donnees: Record<string, unknown> | undefined;
    if (form.donnees_contexte.trim()) {
      try {
        donnees = JSON.parse(form.donnees_contexte);
      } catch {
        setContextError("JSON invalide");
        return;
      }
    }

    createAlert(
      {
        user_id: Number(form.user_id),
        alerte_type_id: Number(form.alerte_type_id),
        notes: form.notes.trim() || undefined,
        donnees_contexte: donnees,
      },
      {
        onSuccess: () => {
          toast.success(t("userAlerts.messages.created"));
          setForm({
            user_id: "",
            alerte_type_id: "",
            notes: "",
            donnees_contexte: "",
          });
          onClose();
        },
        onError: () => {
          toast.error(t("errors.saveFailed"));
        },
      },
    );
  };

  if (!isOpen) return null;

  return (
    <div
      data-testid="create-alert-modal"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 z-10">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {t("userAlerts.modal.createTitle")}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
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

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("userAlerts.modal.fields.userId")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              data-testid="input-alert-user-id"
              type="number"
              value={form.user_id}
              onChange={(e) =>
                setForm((f) => ({ ...f, user_id: e.target.value }))
              }
              required
              min={1}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("userAlerts.modal.fields.type")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <select
              data-testid="select-alert-type"
              value={form.alerte_type_id}
              onChange={(e) =>
                setForm((f) => ({ ...f, alerte_type_id: e.target.value }))
              }
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Choisir un type --</option>
              {alertTypes
                .filter((at) => at.actif)
                .map((at) => (
                  <option key={at.id} value={at.id}>
                    {at.nom} ({at.code})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("userAlerts.modal.fields.notes")}
            </label>
            <textarea
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("userAlerts.modal.fields.context")}
            </label>
            <textarea
              value={form.donnees_contexte}
              onChange={(e) =>
                setForm((f) => ({ ...f, donnees_contexte: e.target.value }))
              }
              rows={3}
              placeholder={"{}"}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono ${contextError ? "border-red-400" : "border-gray-300"}`}
            />
            {contextError && (
              <p className="text-xs text-red-500 mt-1">{contextError}</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              data-testid="btn-submit-create-alert"
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {isPending && (
                <svg
                  className="animate-spin w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
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
              )}
              {t("userAlerts.actions.create")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
