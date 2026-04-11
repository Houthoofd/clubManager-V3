/**
 * RecordPaymentModal
 * Modal pour enregistrer un paiement manuel (espèces, virement, autre).
 * Utilise react-hook-form pour la gestion du formulaire.
 */

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { PricingPlan } from "@clubmanager/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserOption {
  id: number;
  nom_complet: string;
}

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  users: UserOption[];
  plans: PricingPlan[];
  onSubmit: (data: RecordPaymentFormData) => Promise<void>;
}

export interface RecordPaymentFormData {
  user_id: number;
  montant: number;
  methode_paiement: "especes" | "virement" | "autre";
  plan_tarifaire_id?: number;
  description?: string;
  date_paiement: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

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
 * RecordPaymentModal — Modal d'enregistrement d'un paiement manuel.
 *
 * Méthodes disponibles : Espèces, Virement, Autre (Stripe exclu).
 * Fermeture sur Escape ou clic overlay (hors chargement).
 */
export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  users,
  plans,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RecordPaymentFormData>({
    defaultValues: {
      user_id: undefined,
      montant: undefined,
      methode_paiement: "especes",
      plan_tarifaire_id: undefined,
      description: "",
      date_paiement: todayISO(),
    },
  });

  // ── Réinitialise le formulaire à l'ouverture ──────────────────────────────
  useEffect(() => {
    if (isOpen) {
      reset({
        user_id: undefined,
        montant: undefined,
        methode_paiement: "especes",
        plan_tarifaire_id: undefined,
        description: "",
        date_paiement: todayISO(),
      });
    }
  }, [isOpen, reset]);

  // ── Fermeture sur Escape ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  // ── Bloquer le scroll du body ─────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // ── Soumission ────────────────────────────────────────────────────────────
  const handleFormSubmit = async (data: RecordPaymentFormData) => {
    const payload: RecordPaymentFormData = {
      ...data,
      user_id: Number(data.user_id),
      montant: Number(data.montant),
      plan_tarifaire_id: data.plan_tarifaire_id
        ? Number(data.plan_tarifaire_id)
        : undefined,
    };
    await onSubmit(payload);
    onSuccess();
    onClose();
  };

  if (!isOpen) return null;

  // ── Rendu ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="record-payment-title"
      onClick={() => {
        if (!isSubmitting) onClose();
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── En-tête ── */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2
              id="record-payment-title"
              className="text-xl font-semibold text-gray-900"
            >
              Enregistrer un paiement
            </h2>
            <button
              type="button"
              onClick={() => {
                if (!isSubmitting) onClose();
              }}
              disabled={isSubmitting}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100
                         transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Fermer"
            >
              <svg
                className="h-5 w-5"
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
          <p className="mt-1 text-sm text-gray-500">
            Enregistrez un paiement manuel (espèces, virement ou autre).
          </p>
        </div>

        {/* ── Formulaire ── */}
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="px-6 py-5 space-y-5"
        >
          {/* Membre */}
          <div>
            <label
              htmlFor="user_id"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Membre <span className="text-red-500">*</span>
            </label>
            <select
              id="user_id"
              disabled={isSubmitting}
              className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm text-sm bg-white
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                          disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors
                          ${errors.user_id ? "border-red-400" : "border-gray-300"}`}
              {...register("user_id", {
                required: "Veuillez sélectionner un membre.",
                validate: (v) =>
                  Number(v) > 0 || "Veuillez sélectionner un membre.",
              })}
            >
              <option value="">— Sélectionner un membre —</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nom_complet}
                </option>
              ))}
            </select>
            {errors.user_id && (
              <p className="mt-1 text-xs text-red-600">
                {errors.user_id.message}
              </p>
            )}
          </div>

          {/* Montant + Méthode (2 colonnes) */}
          <div className="grid grid-cols-2 gap-4">
            {/* Montant */}
            <div>
              <label
                htmlFor="montant"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Montant (€) <span className="text-red-500">*</span>
              </label>
              <input
                id="montant"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0,00"
                disabled={isSubmitting}
                className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm text-sm
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                            disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors
                            ${errors.montant ? "border-red-400" : "border-gray-300"}`}
                {...register("montant", {
                  required: "Le montant est requis.",
                  min: {
                    value: 0.01,
                    message: "Le montant doit être supérieur à 0.",
                  },
                  valueAsNumber: true,
                })}
              />
              {errors.montant && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.montant.message}
                </p>
              )}
            </div>

            {/* Méthode */}
            <div>
              <label
                htmlFor="methode_paiement"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Méthode <span className="text-red-500">*</span>
              </label>
              <select
                id="methode_paiement"
                disabled={isSubmitting}
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm bg-white
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
                {...register("methode_paiement", { required: true })}
              >
                <option value="especes">Espèces</option>
                <option value="virement">Virement bancaire</option>
                <option value="autre">Autre</option>
              </select>
            </div>
          </div>

          {/* Plan tarifaire */}
          <div>
            <label
              htmlFor="plan_tarifaire_id"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Plan tarifaire
              <span className="ml-1 text-xs text-gray-400 font-normal">
                (optionnel)
              </span>
            </label>
            <select
              id="plan_tarifaire_id"
              disabled={isSubmitting}
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm bg-white
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
              {...register("plan_tarifaire_id")}
            >
              <option value="">— Aucun plan —</option>
              {plans
                .filter((p) => p.actif)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nom} —{" "}
                    {p.prix.toLocaleString("fr-FR", {
                      style: "currency",
                      currency: "EUR",
                    })}{" "}
                    / {p.duree_mois} mois
                  </option>
                ))}
            </select>
          </div>

          {/* Date de paiement */}
          <div>
            <label
              htmlFor="date_paiement"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Date de paiement <span className="text-red-500">*</span>
            </label>
            <input
              id="date_paiement"
              type="date"
              disabled={isSubmitting}
              className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm text-sm
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                          disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors
                          ${errors.date_paiement ? "border-red-400" : "border-gray-300"}`}
              {...register("date_paiement", {
                required: "La date est requise.",
              })}
            />
            {errors.date_paiement && (
              <p className="mt-1 text-xs text-red-600">
                {errors.date_paiement.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Description
              <span className="ml-1 text-xs text-gray-400 font-normal">
                (optionnel)
              </span>
            </label>
            <textarea
              id="description"
              rows={3}
              placeholder="Note ou détail sur ce paiement…"
              disabled={isSubmitting}
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm
                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500
                         focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed
                         transition-colors resize-none"
              {...register("description")}
            />
          </div>

          {/* ── Actions ── */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                if (!isSubmitting) onClose();
              }}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200
                         active:bg-gray-300 rounded-lg transition-colors
                         disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white
                         bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-sm
                         transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting && <SpinnerIcon />}
              {isSubmitting ? "Enregistrement…" : "Enregistrer le paiement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
