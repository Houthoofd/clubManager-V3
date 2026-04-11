/**
 * Payment Store
 * Store Zustand pour la gestion des paiements, plans tarifaires et échéances.
 * Organisé en 3 sections indépendantes : Plans, Payments, Schedules.
 */

import { create } from 'zustand';
import type { PricingPlan } from '@clubmanager/types';
import type {
  PaymentListItemDto,
  ScheduleListItemDto,
  Pagination,
} from '../api/paymentsApi';
import * as paymentsApi from '../api/paymentsApi';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PaymentsFilters {
  user_id: string;
  statut: string;
  methode: string;
  date_debut: string;
  date_fin: string;
}

interface SchedulesFilters {
  user_id: string;
  statut: string;
}

const DEFAULT_PAGINATION: Pagination = {
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 0,
};

interface PaymentStore {
  // ── Plans ──────────────────────────────────────────────────────────────────
  plans: PricingPlan[];
  plansLoading: boolean;
  plansError: string | null;

  fetchPlans: () => Promise<void>;
  createPlan: (data: { nom: string; description?: string; prix: number; duree_mois: number }) => Promise<void>;
  updatePlan: (id: number, data: { nom?: string; description?: string; prix?: number; duree_mois?: number; actif?: boolean }) => Promise<void>;
  togglePlan: (id: number) => Promise<void>;
  deletePlan: (id: number) => Promise<void>;
  clearPlansError: () => void;

  // ── Payments ───────────────────────────────────────────────────────────────
  payments: PaymentListItemDto[];
  paymentsPagination: Pagination;
  paymentsFilters: PaymentsFilters;
  paymentsPage: number;
  paymentsLoading: boolean;
  paymentsError: string | null;

  fetchPayments: () => Promise<void>;
  setPaymentsFilter: (key: keyof PaymentsFilters, value: string) => void;
  setPaymentsPage: (page: number) => void;
  createPayment: (data: {
    user_id: number;
    montant: number;
    methode_paiement: string;
    plan_tarifaire_id?: number;
    description?: string;
    date_paiement?: string;
  }) => Promise<void>;
  createStripeIntent: (data: {
    user_id: number;
    montant: number;
    plan_tarifaire_id?: number;
    description?: string;
  }) => Promise<{ client_secret: string; payment_intent_id: string; amount: number }>;
  clearPaymentsError: () => void;

  // ── Schedules ──────────────────────────────────────────────────────────────
  schedules: ScheduleListItemDto[];
  schedulesPagination: Pagination;
  schedulesFilters: SchedulesFilters;
  schedulesPage: number;
  schedulesLoading: boolean;
  schedulesError: string | null;
  overdueSchedules: ScheduleListItemDto[];

  fetchSchedules: () => Promise<void>;
  fetchOverdueSchedules: () => Promise<void>;
  setSchedulesFilter: (key: keyof SchedulesFilters, value: string) => void;
  setSchedulesPage: (page: number) => void;
  markAsPaid: (id: number, paiementId?: number) => Promise<void>;
  clearSchedulesError: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const usePaymentStore = create<PaymentStore>((set, get) => ({
  // ══════════════════════════════════════════════════════════════════════════
  // SECTION : PLANS
  // ══════════════════════════════════════════════════════════════════════════

  plans: [],
  plansLoading: false,
  plansError: null,

  // ── fetchPlans ─────────────────────────────────────────────────────────────
  fetchPlans: async () => {
    set({ plansLoading: true, plansError: null });
    try {
      const result = await paymentsApi.getPlans();
      set({ plans: result, plansLoading: false });
    } catch (error: any) {
      set({
        plansLoading: false,
        plansError: error.response?.data?.message ?? error.message ?? 'Impossible de charger les plans tarifaires.',
      });
    }
  },

  // ── createPlan ─────────────────────────────────────────────────────────────
  createPlan: async (data) => {
    await paymentsApi.createPlan(data);
    await get().fetchPlans();
  },

  // ── updatePlan ─────────────────────────────────────────────────────────────
  updatePlan: async (id, data) => {
    await paymentsApi.updatePlan(id, data);
    await get().fetchPlans();
  },

  // ── togglePlan ─────────────────────────────────────────────────────────────
  togglePlan: async (id) => {
    await paymentsApi.togglePlan(id);
    await get().fetchPlans();
  },

  // ── deletePlan ─────────────────────────────────────────────────────────────
  deletePlan: async (id) => {
    await paymentsApi.deletePlan(id);
    await get().fetchPlans();
  },

  clearPlansError: () => set({ plansError: null }),

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION : PAYMENTS
  // ══════════════════════════════════════════════════════════════════════════

  payments: [],
  paymentsPagination: { ...DEFAULT_PAGINATION },
  paymentsFilters: { user_id: '', statut: '', methode: '', date_debut: '', date_fin: '' },
  paymentsPage: 1,
  paymentsLoading: false,
  paymentsError: null,

  // ── fetchPayments ──────────────────────────────────────────────────────────
  fetchPayments: async () => {
    set({ paymentsLoading: true, paymentsError: null });
    const { paymentsFilters, paymentsPage, paymentsPagination } = get();

    try {
      const result = await paymentsApi.getPayments({
        page: paymentsPage,
        limit: paymentsPagination.limit,
        user_id: paymentsFilters.user_id || undefined,
        statut: paymentsFilters.statut || undefined,
        methode: paymentsFilters.methode || undefined,
        date_debut: paymentsFilters.date_debut || undefined,
        date_fin: paymentsFilters.date_fin || undefined,
      });

      set({
        payments: result.payments,
        paymentsPagination: result.pagination,
        paymentsLoading: false,
      });
    } catch (error: any) {
      set({
        paymentsLoading: false,
        paymentsError: error.response?.data?.message ?? error.message ?? 'Impossible de charger les paiements.',
      });
    }
  },

  // ── setPaymentsFilter — remet la page à 1 ──────────────────────────────────
  setPaymentsFilter: (key, value) => {
    set((state) => ({
      paymentsFilters: { ...state.paymentsFilters, [key]: value },
      paymentsPage: 1,
      paymentsPagination: { ...state.paymentsPagination, page: 1 },
    }));
  },

  // ── setPaymentsPage ────────────────────────────────────────────────────────
  setPaymentsPage: (page) => {
    set({ paymentsPage: page });
  },

  // ── createPayment ──────────────────────────────────────────────────────────
  createPayment: async (data) => {
    await paymentsApi.createPayment(data);
    await get().fetchPayments();
  },

  // ── createStripeIntent ─────────────────────────────────────────────────────
  createStripeIntent: async (data) => {
    return paymentsApi.createStripeIntent(data);
  },

  clearPaymentsError: () => set({ paymentsError: null }),

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION : SCHEDULES
  // ══════════════════════════════════════════════════════════════════════════

  schedules: [],
  schedulesPagination: { ...DEFAULT_PAGINATION },
  schedulesFilters: { user_id: '', statut: '' },
  schedulesPage: 1,
  schedulesLoading: false,
  schedulesError: null,
  overdueSchedules: [],

  // ── fetchSchedules ─────────────────────────────────────────────────────────
  fetchSchedules: async () => {
    set({ schedulesLoading: true, schedulesError: null });
    const { schedulesFilters, schedulesPage, schedulesPagination } = get();

    try {
      const result = await paymentsApi.getSchedules({
        page: schedulesPage,
        limit: schedulesPagination.limit,
        user_id: schedulesFilters.user_id || undefined,
        statut: schedulesFilters.statut || undefined,
      });

      set({
        schedules: result.schedules,
        schedulesPagination: result.pagination,
        schedulesLoading: false,
      });
    } catch (error: any) {
      set({
        schedulesLoading: false,
        schedulesError: error.response?.data?.message ?? error.message ?? 'Impossible de charger les échéances.',
      });
    }
  },

  // ── fetchOverdueSchedules ──────────────────────────────────────────────────
  fetchOverdueSchedules: async () => {
    try {
      const result = await paymentsApi.getOverdueSchedules();
      set({ overdueSchedules: result });
    } catch {
      // Silencieux : les retards sont un indicateur secondaire
      set({ overdueSchedules: [] });
    }
  },

  // ── setSchedulesFilter — remet la page à 1 ────────────────────────────────
  setSchedulesFilter: (key, value) => {
    set((state) => ({
      schedulesFilters: { ...state.schedulesFilters, [key]: value },
      schedulesPage: 1,
      schedulesPagination: { ...state.schedulesPagination, page: 1 },
    }));
  },

  // ── setSchedulesPage ───────────────────────────────────────────────────────
  setSchedulesPage: (page) => {
    set({ schedulesPage: page });
  },

  // ── markAsPaid ─────────────────────────────────────────────────────────────
  markAsPaid: async (id, paiementId) => {
    await paymentsApi.markScheduleAsPaid(id, paiementId);
    // Rafraîchit à la fois la liste et les retards
    await Promise.all([get().fetchSchedules(), get().fetchOverdueSchedules()]);
  },

  clearSchedulesError: () => set({ schedulesError: null }),
}));
