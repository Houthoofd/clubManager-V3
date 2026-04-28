/**
 * RecordPaymentModal
 * Modal pour enregistrer un paiement manuel (espèces, virement, autre).
 * Utilise react-hook-form pour la gestion du formulaire.
 */

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import type { PricingPlan } from "@clubmanager/types";
import { Modal, Button } from "../../../shared/components";
import { Input } from "../../../shared/components/Input/Input";
import { useMethodesPaiement } from "../../../shared/hooks/useReferences";

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
  methode_paiement: string;
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
  const { t, i18n } = useTranslation("payments");
  const methodesPaiement = useMethodesPaiement();

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
        title={t("modal.recordPayment.title")}
        subtitle={t("modal.recordPayment.subtitle")}
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
            label={t("fields.member")}
            id="user_id"
            required
            disabled={isSubmitting}
            error={errors.user_id?.message}
            {...register("user_id", {
              required: t("modal.recordPayment.selectMemberError"),
              validate: (v) =>
                Number(v) > 0 || t("modal.recordPayment.selectMemberError"),
            })}
          >
            <option value="">{t("modal.recordPayment.selectMember")}</option>
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
              label={`${t("fields.amount")} (€)`}
              id="montant"
              type="number"
              step="0.01"
              min="0.01"
              placeholder={t("common:placeholders.amount")}
              required
              disabled={isSubmitting}
              error={errors.montant?.message}
              {...register("montant", {
                required: t("modal.recordPayment.amountRequired"),
                min: {
                  value: 0.01,
                  message: t("modal.recordPayment.amountPositiveError"),
                },
                valueAsNumber: true,
              })}
            />

            {/* Méthode */}
            <Input.Select
              label={t("fields.method")}
              id="methode_paiement"
              required
              disabled={isSubmitting}
              {...register("methode_paiement", { required: true })}
            >
              {methodesPaiement.length > 0 ? (
                methodesPaiement.map((m) => (
                  <option key={m.code} value={m.code}>
                    {i18n.language === "en" && m.nom_en ? m.nom_en : m.nom}
                  </option>
                ))
              ) : (
                <>
                  <option value="especes">{t("methods.cash")}</option>
                  <option value="virement">{t("methods.transfer")}</option>
                  <option value="autre">{t("methods.other")}</option>
                </>
              )}
            </Input.Select>
          </div>

          {/* Plan tarifaire */}
          <Input.Select
            label={t("fields.type")}
            id="plan_tarifaire_id"
            helperText={t("modal.recordPayment.optional")}
            disabled={isSubmitting}
            {...register("plan_tarifaire_id")}
          >
            <option value="">{t("modal.recordPayment.noPlan")}</option>
            {plans
              .filter((p) => p.actif)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nom} —{" "}
                  {p.prix.toLocaleString("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  })}{" "}
                  / {p.duree_mois} {t("tabs.perMonth")}
                </option>
              ))}
          </Input.Select>

          {/* Date de paiement */}
          <Input
            label={t("fields.paymentDate")}
            id="date_paiement"
            type="date"
            required
            disabled={isSubmitting}
            error={errors.date_paiement?.message}
            {...register("date_paiement", {
              required: t("modal.recordPayment.dateRequired"),
            })}
          />

          {/* Description */}
          <Input.Textarea
            label={t("fields.description")}
            id="description"
            rows={3}
            placeholder={t("modal.recordPayment.noteOrDetail")}
            helperText={t("modal.recordPayment.optional")}
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
          {t("modal.recordPayment.cancel")}
        </Button>
        <Button
          type="submit"
          form="record-payment-form"
          variant="primary"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {t("modal.recordPayment.submit")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
