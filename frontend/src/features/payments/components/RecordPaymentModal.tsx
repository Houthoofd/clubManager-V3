/**
 * RecordPaymentModal
 * Modal pour enregistrer un paiement manuel (espèces, virement, autre).
 * Utilise react-hook-form pour la gestion du formulaire.
 */

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { PricingPlan } from "@clubmanager/types";
import { Modal, Input, Button } from "../../../shared/components";

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

// ─── Composant ────────────────────────────────────────────────────────────────

/**
 * RecordPaymentModal — Modal d'enregistrement d'un paiement manuel.
 *
 * Méthodes disponibles : Espèces, Virement, Autre (Stripe exclu).
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

  // ── Rendu ─────────────────────────────────────────────────────────────────
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      closeOnOverlayClick={!isSubmitting}
      closeOnEscape={!isSubmitting}
    >
      <Modal.Header
        title="Enregistrer un paiement"
        subtitle="Enregistrez un paiement manuel (espèces, virement ou autre)."
        showCloseButton
        onClose={onClose}
      />

      <Modal.Body>
        <form
          id="record-payment-form"
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-5"
        >
          {/* Membre */}
          <Input.Select
            label="Membre"
            id="user_id"
            required
            disabled={isSubmitting}
            error={errors.user_id?.message}
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
          </Input.Select>

          {/* Montant + Méthode (2 colonnes) */}
          <div className="grid grid-cols-2 gap-4">
            {/* Montant */}
            <Input
              label="Montant (€)"
              id="montant"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0,00"
              required
              disabled={isSubmitting}
              error={errors.montant?.message}
              {...register("montant", {
                required: "Le montant est requis.",
                min: {
                  value: 0.01,
                  message: "Le montant doit être supérieur à 0.",
                },
                valueAsNumber: true,
              })}
            />

            {/* Méthode */}
            <Input.Select
              label="Méthode"
              id="methode_paiement"
              required
              disabled={isSubmitting}
              {...register("methode_paiement", { required: true })}
            >
              <option value="especes">Espèces</option>
              <option value="virement">Virement bancaire</option>
              <option value="autre">Autre</option>
            </Input.Select>
          </div>

          {/* Plan tarifaire */}
          <Input.Select
            label="Plan tarifaire"
            id="plan_tarifaire_id"
            helperText="Optionnel"
            disabled={isSubmitting}
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
          </Input.Select>

          {/* Date de paiement */}
          <Input
            label="Date de paiement"
            id="date_paiement"
            type="date"
            required
            disabled={isSubmitting}
            error={errors.date_paiement?.message}
            {...register("date_paiement", {
              required: "La date est requise.",
            })}
          />

          {/* Description */}
          <Input.Textarea
            label="Description"
            id="description"
            rows={3}
            placeholder="Note ou détail sur ce paiement…"
            helperText="Optionnel"
            disabled={isSubmitting}
            {...register("description")}
          />
        </form>
      </Modal.Body>

      <Modal.Footer align="right">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          form="record-payment-form"
          variant="primary"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          Enregistrer le paiement
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
