/**
 * usePaymentHandlers - Hook personnalisé pour gérer les actions de paiement
 *
 * Centralise toute la logique métier liée aux paiements, échéances et plans tarifaires.
 */

import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { PricingPlan } from "@clubmanager/types";
import type { RecordPaymentFormData } from "../components/RecordPaymentModal";
import type { PricingPlanFormData } from "../components/PricingPlanFormModal";

interface StripeSetupState {
  isOpen: boolean;
  userId: string;
  montant: string;
  planId: string;
  description: string;
  isLoading: boolean;
  error: string | null;
}

interface StripeModalState {
  isOpen: boolean;
  clientSecret: string;
  amount: number;
}

interface UsePaymentHandlersParams {
  // Mutations pour les paiements
  createPayment: (data: any) => Promise<any>;
  createStripeIntent: (data: any) => Promise<any>;

  // Mutations pour les échéances
  markAsPaid: (id: number) => Promise<void>;

  // Mutations pour les plans tarifaires
  togglePlan: (id: number) => Promise<void>;
  deletePlan: (id: number) => Promise<void>;
  createPlan: (data: PricingPlanFormData) => Promise<void>;
  updatePlan: (id: number, data: PricingPlanFormData) => Promise<void>;

  // États et setters pour les modals Stripe
  stripeSetup: StripeSetupState;
  setStripeSetup: React.Dispatch<React.SetStateAction<StripeSetupState>>;
  setStripeModal: React.Dispatch<React.SetStateAction<StripeModalState>>;

  // États pour les indicateurs de chargement
  setMarkingScheduleId: React.Dispatch<React.SetStateAction<number | null>>;
  setDeletingPlanId: React.Dispatch<React.SetStateAction<number | null>>;

  // Plan sélectionné pour l'édition
  selectedPlan?: PricingPlan;
}

export function usePaymentHandlers({
  createPayment,
  createStripeIntent,
  markAsPaid,
  togglePlan,
  deletePlan,
  createPlan,
  updatePlan,
  stripeSetup,
  setStripeSetup,
  setStripeModal,
  setMarkingScheduleId,
  setDeletingPlanId,
  selectedPlan,
}: UsePaymentHandlersParams) {
  const { t } = useTranslation("payments");

  /**
   * Enregistre un paiement manuel
   */
  const handleRecordPayment = async (data: RecordPaymentFormData) => {
    await createPayment({
      user_id: data.user_id,
      montant: data.montant,
      methode_paiement: data.methode_paiement,
      plan_tarifaire_id: data.plan_tarifaire_id,
      description: data.description,
      date_paiement: data.date_paiement,
    });
    toast.success(t("messages.paymentRecorded"), {
      description: t("messages.paymentRecordedSuccess"),
    });
  };

  /**
   * Soumet le formulaire de configuration Stripe et crée un Payment Intent
   */
  const handleStripeSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripeSetup.userId || !stripeSetup.montant) return;

    setStripeSetup((s) => ({ ...s, isLoading: true, error: null }));

    try {
      const result = await createStripeIntent({
        user_id: Number(stripeSetup.userId),
        montant: Number(stripeSetup.montant),
        plan_tarifaire_id: stripeSetup.planId
          ? Number(stripeSetup.planId)
          : undefined,
        description: stripeSetup.description || undefined,
      });

      setStripeSetup((s) => ({ ...s, isOpen: false, isLoading: false }));
      setStripeModal({
        isOpen: true,
        clientSecret: result.client_secret,
        amount: result.amount,
      });
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setStripeSetup((s) => ({
        ...s,
        isLoading: false,
        error:
          error.response?.data?.message ??
          error.message ??
          t("messages.errorCreatingIntent"),
      }));
    }
  };

  /**
   * Marque une échéance comme payée
   */
  const handleMarkAsPaid = async (id: number) => {
    setMarkingScheduleId(id);
    try {
      await markAsPaid(id);
      toast.success(t("messages.schedulePaid"), {
        description: t("messages.schedulePaidSuccess"),
      });
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      toast.error(t("messages.error"), {
        description:
          error.response?.data?.message ??
          error.message ??
          t("messages.errorMarkingSchedule"),
      });
    } finally {
      setMarkingScheduleId(null);
    }
  };

  /**
   * Active ou désactive un plan tarifaire
   */
  const handleTogglePlan = async (plan: PricingPlan) => {
    try {
      await togglePlan(plan.id);
      toast.success(
        plan.actif
          ? t("messages.planDeactivated")
          : t("messages.planActivated"),
        {
          description: `"${plan.nom}" ${plan.actif ? t("messages.planDeactivatedSuccess") : t("messages.planActivatedSuccess")}`,
        },
      );
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      toast.error(t("messages.error"), {
        description:
          error.response?.data?.message ??
          error.message ??
          t("messages.errorTogglingPlan"),
      });
    }
  };

  /**
   * Supprime un plan tarifaire
   */
  const handleDeletePlan = async (id: number, nom: string) => {
    try {
      await deletePlan(id);
      toast.success(t("messages.planDeleted"), {
        description: `"${nom}" ${t("messages.planDeletedSuccess")}`,
      });
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      toast.error(t("messages.error"), {
        description:
          error.response?.data?.message ??
          error.message ??
          t("messages.errorDeletingPlan"),
      });
    } finally {
      setDeletingPlanId(null);
    }
  };

  /**
   * Soumet le formulaire de création/modification d'un plan tarifaire
   */
  const handlePlanFormSubmit = async (data: PricingPlanFormData) => {
    if (selectedPlan) {
      await updatePlan(selectedPlan.id, data);
      toast.success(t("messages.planUpdated"), {
        description: `"${data.nom}" ${t("messages.planUpdatedSuccess")}`,
      });
    } else {
      await createPlan(data);
      toast.success(t("messages.planCreatedTitle"), {
        description: `"${data.nom}" ${t("messages.planCreatedSuccess")}`,
      });
    }
  };

  return {
    handleRecordPayment,
    handleStripeSetupSubmit,
    handleMarkAsPaid,
    handleTogglePlan,
    handleDeletePlan,
    handlePlanFormSubmit,
  };
}
