/**
 * usePaymentHandlers - Hook personnalisé pour gérer les actions de paiement
 *
 * Centralise toute la logique métier liée aux paiements, échéances et plans tarifaires.
 */

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
    toast.success("Paiement enregistré", {
      description: "Le paiement manuel a été enregistré avec succès.",
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
          "Impossible de créer le Payment Intent.",
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
      toast.success("Échéance payée", {
        description: "L'échéance a été marquée comme payée.",
      });
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      toast.error("Erreur", {
        description:
          error.response?.data?.message ??
          error.message ??
          "Impossible de marquer l'échéance comme payée.",
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
      toast.success(plan.actif ? "Plan désactivé" : "Plan activé", {
        description: `"${plan.nom}" a été ${plan.actif ? "désactivé" : "activé"}.`,
      });
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      toast.error("Erreur", {
        description:
          error.response?.data?.message ??
          error.message ??
          "Impossible de modifier le plan.",
      });
    }
  };

  /**
   * Supprime un plan tarifaire
   */
  const handleDeletePlan = async (id: number, nom: string) => {
    try {
      await deletePlan(id);
      toast.success("Plan supprimé", {
        description: `"${nom}" a été supprimé.`,
      });
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      toast.error("Erreur", {
        description:
          error.response?.data?.message ??
          error.message ??
          "Impossible de supprimer le plan.",
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
      toast.success("Plan mis à jour", {
        description: `"${data.nom}" a été modifié.`,
      });
    } else {
      await createPlan(data);
      toast.success("Plan créé", { description: `"${data.nom}" a été créé.` });
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
