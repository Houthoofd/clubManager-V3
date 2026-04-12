/**
 * usePayments Hooks
 * Bridges entre le store Zustand et les composants pour le module paiements.
 * Déclenche automatiquement les fetchs lors des changements de filtres ou de page.
 */

import { useEffect, useCallback } from 'react';
import { usePaymentStore } from '../stores/paymentStore';

// ─── usePricingPlans ──────────────────────────────────────────────────────────

/**
 * usePricingPlans — Hook pour la gestion des plans tarifaires.
 *
 * Auto-fetch au montage du composant.
 * Expose toutes les propriétés plans du store ainsi qu'un callback `refetch` stable.
 */
export const usePricingPlans = () => {
  const store = usePaymentStore();

  // ── Fetch automatique au montage ──────────────────────────────────────────
  useEffect(() => {
    store.fetchPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Callback stable pour les rafraîchissements manuels ────────────────────
  const refetch = useCallback(() => {
    store.fetchPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    plans: store.plans,
    plansLoading: store.plansLoading,
    plansError: store.plansError,
    fetchPlans: store.fetchPlans,
    createPlan: store.createPlan,
    updatePlan: store.updatePlan,
    togglePlan: store.togglePlan,
    deletePlan: store.deletePlan,
    clearPlansError: store.clearPlansError,
    refetch,
  };
};

// ─── usePayments ──────────────────────────────────────────────────────────────

/**
 * usePayments — Hook principal pour la liste des paiements.
 *
 * Auto-fetch sur changement de filtres ou de page.
 * Expose toutes les propriétés payments du store ainsi qu'un callback `refetch` stable.
 */
export const usePayments = () => {
  const store = usePaymentStore();

  // ── Fetch automatique sur changement de filtres ou de page ────────────────
  useEffect(() => {
    store.fetchPayments();
    // On dépend des valeurs primitives pour éviter les re-renders en boucle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    store.paymentsFilters.user_id,
    store.paymentsFilters.statut,
    store.paymentsFilters.methode,
    store.paymentsFilters.date_debut,
    store.paymentsFilters.date_fin,
    store.paymentsPage,
  ]);

  // ── Callback stable pour les rafraîchissements manuels ────────────────────
  const refetch = useCallback(() => {
    store.fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    payments: store.payments,
    paymentsPagination: store.paymentsPagination,
    paymentsFilters: store.paymentsFilters,
    paymentsPage: store.paymentsPage,
    paymentsLoading: store.paymentsLoading,
    paymentsError: store.paymentsError,
    fetchPayments: store.fetchPayments,
    setPaymentsFilter: store.setPaymentsFilter,
    setPaymentsPage: store.setPaymentsPage,
    createPayment: store.createPayment,
    createStripeIntent: store.createStripeIntent,
    clearPaymentsError: store.clearPaymentsError,
    refetch,
  };
};

// ─── usePaymentSchedules ──────────────────────────────────────────────────────

/**
 * usePaymentSchedules — Hook pour la gestion des échéances de paiement.
 *
 * Auto-fetch sur changement de filtres ou de page.
 * Déclenche également fetchOverdueSchedules pour maintenir le compteur de retards à jour.
 * Expose toutes les propriétés schedules du store ainsi qu'un callback `refetch` stable.
 */
export const usePaymentSchedules = () => {
  const store = usePaymentStore();

  // ── Fetch automatique sur changement de filtres ou de page ────────────────
  useEffect(() => {
    store.fetchSchedules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    store.schedulesFilters.user_id,
    store.schedulesFilters.statut,
    store.schedulesPage,
  ]);

  // ── Fetch des échéances en retard au montage ──────────────────────────────
  useEffect(() => {
    store.fetchOverdueSchedules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Callback stable pour les rafraîchissements manuels ────────────────────
  const refetch = useCallback(() => {
    store.fetchSchedules();
    store.fetchOverdueSchedules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    schedules: store.schedules,
    schedulesPagination: store.schedulesPagination,
    schedulesFilters: store.schedulesFilters,
    schedulesPage: store.schedulesPage,
    schedulesLoading: store.schedulesLoading,
    schedulesError: store.schedulesError,
    overdueSchedules: store.overdueSchedules,
    fetchSchedules: store.fetchSchedules,
    fetchOverdueSchedules: store.fetchOverdueSchedules,
    setSchedulesFilter: store.setSchedulesFilter,
    setSchedulesPage: store.setSchedulesPage,
    markAsPaid: store.markAsPaid,
    clearSchedulesError: store.clearSchedulesError,
    refetch,
  };
};
