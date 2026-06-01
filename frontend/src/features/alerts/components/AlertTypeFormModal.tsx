/**
 * AlertTypeFormModal
 * Modal pour créer ou modifier un type d'alerte (admin)
 */

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { AlertTypeDto, AlertPriorite } from "../api/alertsApi";
import { useCreateAlertType, useUpdateAlertType } from "../hooks/useAlerts";

interface AlertTypeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  alertType?: AlertTypeDto | null;
}

const PRIORITIES: AlertPriorite[] = ["basse", "normale", "haute", "critique"];

export function AlertTypeFormModal({
  isOpen,
  onClose,
  alertType,
}: AlertTypeFormModalProps) {
  const { t } = useTranslation("alerts");
  const isEdit = !!alertType;

  const [form, setForm] = useState({
    code: "",
    nom: "",
    description: "",
    priorite: "normale" as AlertPriorite,
    actif: true,
  });

  useEffect(() => {
    if (alertType) {
      setForm({
        code: alertType.code,
        nom: alertType.nom,
        description: alertType.description ?? "",
        priorite: alertType.priorite,
        actif: alertType.actif,
      });
    } else {
      setForm({
        code: "",
        nom: "",
        description: "",
        priorite: "normale",
        actif: true,
      });
    }
  }, [alertType, isOpen]);

  const { mutate: createType, isPending: isCreating } = useCreateAlertType();
  const { mutate: updateType, isPending: isUpdating } = useUpdateAlertType();
  const isPending = isCreating || isUpdating;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim() || !form.nom.trim()) return;

    const payload = {
      code: form.code.trim().toUpperCase(),
      nom: form.nom.trim(),
      description: form.description.trim() || undefined,
      priorite: form.priorite,
      actif: form.actif,
    };

    if (isEdit && alertType) {
      updateType(
        { id: alertType.id, payload },
        {
          onSuccess: () => {
            toast.success(t("alertTypes.messages.updated"));
            onClose();
          },
          onError: () => {
            toast.error(t("errors.saveFailed"));
          },
        },
      );
    } else {
      createType(payload, {
        onSuccess: () => {
          toast.success(t("alertTypes.messages.created"));
          onClose();
        },
        onError: () => {
          toast.error(t("errors.saveFailed"));
        },
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      data-testid="alert-type-form-modal"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit
              ? t("alertTypes.modal.editTitle")
              : t("alertTypes.modal.createTitle")}
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("alertTypes.modal.fields.code")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              data-testid="input-type-code"
              type="text"
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              placeholder={t("alertTypes.modal.placeholders.code")}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("alertTypes.modal.fields.name")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              data-testid="input-type-name"
              type="text"
              value={form.nom}
              onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
              placeholder={t("alertTypes.modal.placeholders.name")}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("alertTypes.modal.fields.description")}
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("alertTypes.modal.fields.priority")}
            </label>
            <select
              data-testid="select-type-priority"
              value={form.priorite}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  priorite: e.target.value as AlertPriorite,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {t(`priority.${p}`)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="alert-type-actif"
              type="checkbox"
              checked={form.actif}
              onChange={(e) =>
                setForm((f) => ({ ...f, actif: e.target.checked }))
              }
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label
              htmlFor="alert-type-actif"
              className="text-sm font-medium text-gray-700"
            >
              {t("alertTypes.modal.fields.active")}
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              data-testid="btn-cancel-type-form"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              data-testid="btn-submit-type-form"
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
              {isEdit
                ? t("alertTypes.actions.edit")
                : t("alertTypes.actions.create")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
