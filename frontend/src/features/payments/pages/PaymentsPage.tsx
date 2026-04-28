/**
 * PaymentsPage - Version migrée avec composants réutilisables
 *
 * Utilise :
 * - TabGroup (navigation par onglets)
 * - DataTable (tableaux de paiements et échéances)
 * - SearchBar (recherche de paiements)
 * - DateRangePicker (filtres de dates)
 *
 * Page principale du module paiements.
 * Organisée en 3 onglets : Paiements, Échéances, Plans tarifaires.
 */

import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  CheckIcon,
  CreditCardIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { PageHeader } from "@/shared/components/Layout/PageHeader";
import { useAuth } from "../../../shared/hooks/useAuth";
import apiClient from "../../../shared/api/apiClient";
import { UserRole, PaymentStatus } from "@clubmanager/types";
import type { PricingPlan } from "@clubmanager/types";

// ─── Hooks ────────────────────────────────────────────────────────────────────
import {
  usePayments,
  usePaymentSchedules,
  usePricingPlans,
} from "../hooks/usePayments";
import { usePaymentHandlers } from "../hooks/usePaymentHandlers";

// ─── Composants réutilisables ─────────────────────────────────────────────────
import { Modal, Button, Badge } from "../../../shared/components";
import { TabGroup } from "../../../shared/components/Navigation/TabGroup";
import { DataTable } from "../../../shared/components/Table/DataTable";
import { SearchBar } from "../../../shared/components/Forms/SearchBar";
import { DateRangePicker } from "../../../shared/components/Forms/DateRangePicker";
import { LoadingSpinner } from "../../../shared/components/Layout/LoadingSpinner";
import { EmptyState } from "../../../shared/components/Layout/EmptyState";
import { PaginationBar } from "../../../shared/components/Navigation/PaginationBar";
import type { Tab } from "../../../shared/components/Navigation/TabGroup";

// ─── Composants spécifiques paiements ─────────────────────────────────────────
import { RecordPaymentModal } from "../components/RecordPaymentModal";
import { PricingPlanFormModal } from "../components/PricingPlanFormModal";
import { StripePaymentModal } from "../components/StripePaymentModal";

// ─── Configurations de tables ─────────────────────────────────────────────────
import {
  createPaymentsColumns,
  createSchedulesColumns,
} from "../components/tables";

// ─── Composants tabs ──────────────────────────────────────────────────────────
import { PaymentsTab, SchedulesTab, PlansTab } from "../components/tabs";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId = "payments" | "schedules" | "plans";

interface UserOption {
  id: number;
  nom_complet: string;
}

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

interface DateRange {
  startDate: string | null;
  endDate: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return amount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

// ─── Sous-composants ──────────────────────────────────────────────────────────

// ─── Composant principal ──────────────────────────────────────────────────────

export function PaymentsPage() {
  const { t } = useTranslation("payments");

  // ── Onglet actif ──────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabId>("payments");

  // ── Hooks données ─────────────────────────────────────────────────────────
  const {
    payments,
    paymentsPagination,
    paymentsFilters,
    paymentsLoading,
    paymentsError,
    setPaymentsFilter,
    setPaymentsPage,
    createPayment,
    createStripeIntent,
    clearPaymentsError,
    refetch: refetchPayments,
  } = usePayments();

  const {
    schedules,
    schedulesPagination,
    schedulesFilters,
    schedulesLoading,
    schedulesError,
    overdueSchedules,
    setSchedulesFilter,
    setSchedulesPage,
    markAsPaid,
    clearSchedulesError,
    refetch: refetchSchedules,
  } = usePaymentSchedules();

  const {
    plans,
    plansLoading,
    plansError,
    createPlan,
    updatePlan,
    togglePlan,
    deletePlan,
    clearPlansError,
    refetch: refetchPlans,
  } = usePricingPlans();

  // ── Auth ──────────────────────────────────────────────────────────────────
  const { hasRole } = useAuth();
  const isAdmin = hasRole(UserRole.ADMIN);

  // ── Users pour les modals ─────────────────────────────────────────────────
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);

  useEffect(() => {
    apiClient
      .get("/users", { params: { limit: 500, page: 1 } })
      .then((res) => {
        const users = res.data.data?.users ?? [];
        setUserOptions(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          users.map((u: any) => ({
            id: u.id,
            nom_complet: `${u.first_name} ${u.last_name}`,
          })),
        );
      })
      .catch(() => {
        /* silencieux */
      });
  }, []);

  // ── Recherche locale sur les paiements ────────────────────────────────────
  const [paymentSearch, setPaymentSearch] = useState("");

  // ── États date range pour filtres ─────────────────────────────────────────
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: paymentsFilters.date_debut || null,
    endDate: paymentsFilters.date_fin || null,
  });

  // Synchroniser dateRange avec les filtres
  useEffect(() => {
    setPaymentsFilter("date_debut", dateRange.startDate || "");
    setPaymentsFilter("date_fin", dateRange.endDate || "");
  }, [dateRange.startDate, dateRange.endDate, setPaymentsFilter]);

  // ── États des modals ──────────────────────────────────────────────────────
  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);

  const [stripeSetup, setStripeSetup] = useState<StripeSetupState>({
    isOpen: false,
    userId: "",
    montant: "",
    planId: "",
    description: "",
    isLoading: false,
    error: null,
  });

  const [stripeModal, setStripeModal] = useState<StripeModalState>({
    isOpen: false,
    clientSecret: "",
    amount: 0,
  });

  const [planFormOpen, setPlanFormOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | undefined>(
    undefined,
  );
  const [deletingPlanId, setDeletingPlanId] = useState<number | null>(null);
  const [markingScheduleId, setMarkingScheduleId] = useState<number | null>(
    null,
  );

  // ── Propagation des erreurs du store vers les toasts ──────────────────────
  useEffect(() => {
    if (paymentsError) {
      toast.error(t("messages.errorLoadingPayments"), {
        description: paymentsError,
      });
      clearPaymentsError();
    }
  }, [paymentsError, clearPaymentsError, t]);

  useEffect(() => {
    if (schedulesError) {
      toast.error(t("messages.errorLoadingPayments"), {
        description: schedulesError,
      });
      clearSchedulesError();
    }
  }, [schedulesError, clearSchedulesError, t]);

  useEffect(() => {
    if (plansError) {
      toast.error(t("messages.errorLoadingPayments"), {
        description: plansError,
      });
      clearPlansError();
    }
  }, [plansError, clearPlansError, t]);

  // ── Filtrage côté client : recherche par nom ──────────────────────────────
  const filteredPayments = paymentSearch.trim()
    ? payments.filter((p) =>
        p.utilisateur_nom_complet
          .toLowerCase()
          .includes(paymentSearch.toLowerCase()),
      )
    : payments;

  // ── Badge : total validé ce mois ──────────────────────────────────────────
  const now = new Date();
  const totalValidThisMonth = payments
    .filter((p) => {
      if (p.statut !== PaymentStatus.VALIDE || !p.date_paiement) return false;
      const d = new Date(p.date_paiement);
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, p) => sum + p.montant, 0);

  // ── Handlers (extraits dans usePaymentHandlers) ───────────────────────────
  const handlers = usePaymentHandlers({
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
  });

  // ── Configuration TabGroup ────────────────────────────────────────────────
  const tabs: Tab[] = [
    { id: "payments", label: t("tabs.payments") },
    {
      id: "schedules",
      label: t("tabs.pending"),
      badge: overdueSchedules.length > 0 ? overdueSchedules.length : undefined,
    },
    ...(isAdmin ? [{ id: "plans" as const, label: t("tabs.plans") }] : []),
  ];

  // ── Configuration colonnes DataTable ──────────────────────────────────────
  const paymentsColumns = useMemo(() => createPaymentsColumns(t), [t]);

  const schedulesColumns = useMemo(
    () =>
      createSchedulesColumns({
        isAdmin,
        markingScheduleId,
        onMarkAsPaid: handlers.handleMarkAsPaid,
        t,
      }),
    [isAdmin, markingScheduleId, handlers.handleMarkAsPaid, t],
  );

  // ── Rendu ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ── En-tête ── */}
      <PageHeader title={t("title")} description={t("subtitle")} />

      {/* ── Conteneur onglets ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* ── Navigation avec TabGroup ── */}
        <div className="border-b border-gray-100 px-2">
          <TabGroup
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(id) => setActiveTab(id as TabId)}
          />
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            ONGLET 1 : PAIEMENTS
            ════════════════════════════════════════════════════════════════ */}
        {activeTab === "payments" && (
          <PaymentsTab
            filteredPayments={filteredPayments}
            paymentsLoading={paymentsLoading}
            paymentsPagination={paymentsPagination}
            paymentsColumns={paymentsColumns}
            totalValidThisMonth={totalValidThisMonth}
            paymentsFilters={paymentsFilters}
            paymentSearch={paymentSearch}
            dateRange={dateRange}
            setPaymentsPage={setPaymentsPage}
            setPaymentsFilter={setPaymentsFilter}
            setPaymentSearch={setPaymentSearch}
            setDateRange={setDateRange}
            setRecordPaymentOpen={setRecordPaymentOpen}
            setStripeSetup={setStripeSetup}
            isAdmin={isAdmin}
          />
        )}

        {/* ════════════════════════════════════════════════════════════════════
            ONGLET 2 : ÉCHÉANCES
            ════════════════════════════════════════════════════════════════ */}
        {activeTab === "schedules" && (
          <SchedulesTab
            schedules={schedules}
            schedulesLoading={schedulesLoading}
            schedulesPagination={schedulesPagination}
            schedulesColumns={schedulesColumns}
            overdueSchedules={overdueSchedules}
            schedulesFilters={schedulesFilters}
            setSchedulesPage={setSchedulesPage}
            setSchedulesFilter={setSchedulesFilter}
            refetchSchedules={refetchSchedules}
            handleMarkAsPaid={handlers.handleMarkAsPaid}
            markingScheduleId={markingScheduleId}
            isAdmin={isAdmin}
          />
        )}

        {/* ════════════════════════════════════════════════════════════════════
            ONGLET 3 : PLANS TARIFAIRES (admin uniquement)
            ════════════════════════════════════════════════════════════════ */}
        {activeTab === "plans" && isAdmin && (
          <PlansTab
            plans={plans}
            plansLoading={plansLoading}
            refetchPlans={refetchPlans}
            setPlanFormOpen={setPlanFormOpen}
            setSelectedPlan={setSelectedPlan}
            handleTogglePlan={handlers.handleTogglePlan}
            handleDeletePlan={handlers.handleDeletePlan}
            deletingPlanId={deletingPlanId}
            setDeletingPlanId={setDeletingPlanId}
          />
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          MODALS
          ════════════════════════════════════════════════════════════════════ */}

      {/* Modal paiement manuel */}
      <RecordPaymentModal
        isOpen={recordPaymentOpen}
        onClose={() => setRecordPaymentOpen(false)}
        onSuccess={refetchPayments}
        users={userOptions}
        plans={plans}
        onSubmit={handlers.handleRecordPayment}
      />

      {/* Modal plans tarifaires */}
      <PricingPlanFormModal
        isOpen={planFormOpen}
        onClose={() => {
          setPlanFormOpen(false);
          setSelectedPlan(undefined);
        }}
        onSuccess={refetchPlans}
        plan={selectedPlan}
        onSubmit={handlers.handlePlanFormSubmit}
      />

      {/* Modal Stripe — étape 1 : saisie des informations */}
      <Modal
        isOpen={stripeSetup.isOpen}
        onClose={() => setStripeSetup((s) => ({ ...s, isOpen: false }))}
        size="md"
        closeOnOverlayClick={!stripeSetup.isLoading}
        closeOnEscape={!stripeSetup.isLoading}
      >
        <Modal.Header
          title={t("modal.stripe.title")}
          subtitle={t("modal.stripe.subtitle")}
          showCloseButton
          onClose={() => setStripeSetup((s) => ({ ...s, isOpen: false }))}
        />

        <Modal.Body>
          <form
            id="stripe-setup-form"
            onSubmit={handlers.handleStripeSetupSubmit}
            className="space-y-4"
          >
            {/* Membre */}
            <div>
              <label
                htmlFor="stripe-user"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                {t("fields.member")} <span className="text-red-500">*</span>
              </label>
              <select
                id="stripe-user"
                required
                value={stripeSetup.userId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setStripeSetup((s) => ({ ...s, userId: e.target.value }))
                }
                disabled={stripeSetup.isLoading}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg text-sm bg-white
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           disabled:bg-gray-50 transition-colors"
              >
                <option value="">
                  {t("modal.recordPayment.selectMember")}
                </option>
                {userOptions.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nom_complet}
                  </option>
                ))}
              </select>
            </div>

            {/* Montant */}
            <div>
              <label
                htmlFor="stripe-montant"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                {t("fields.amount")} (€) <span className="text-red-500">*</span>
              </label>
              <input
                id="stripe-montant"
                type="number"
                min="0.5"
                step="0.01"
                placeholder={t("common:placeholders.amount")}
                required
                value={stripeSetup.montant}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setStripeSetup((s) => ({ ...s, montant: e.target.value }))
                }
                disabled={stripeSetup.isLoading}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           disabled:bg-gray-50 transition-colors"
              />
            </div>

            {/* Plan (optionnel) */}
            <div>
              <label
                htmlFor="stripe-plan"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                {t("fields.type")}
                <span className="ml-1 text-xs text-gray-400 font-normal">
                  ({t("modal.recordPayment.optional")})
                </span>
              </label>
              <select
                id="stripe-plan"
                value={stripeSetup.planId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setStripeSetup((s) => ({ ...s, planId: e.target.value }))
                }
                disabled={stripeSetup.isLoading}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg text-sm bg-white
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           disabled:bg-gray-50 transition-colors"
              >
                <option value="">{t("modal.recordPayment.noPlan")}</option>
                {plans
                  .filter((p) => p.actif)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nom} — {formatCurrency(p.prix)}
                    </option>
                  ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="stripe-description"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                {t("fields.description")}
                <span className="ml-1 text-xs text-gray-400 font-normal">
                  ({t("modal.recordPayment.optional")})
                </span>
              </label>
              <input
                id="stripe-description"
                type="text"
                placeholder={t("modal.stripe.paymentPurpose")}
                value={stripeSetup.description}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setStripeSetup((s) => ({
                    ...s,
                    description: e.target.value,
                  }))
                }
                disabled={stripeSetup.isLoading}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           disabled:bg-gray-50 transition-colors"
              />
            </div>

            {/* Erreur */}
            {stripeSetup.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {stripeSetup.error}
              </div>
            )}
          </form>
        </Modal.Body>

        <Modal.Footer align="right">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStripeSetup((s) => ({ ...s, isOpen: false }))}
            disabled={stripeSetup.isLoading}
          >
            {t("modal.recordPayment.cancel")}
          </Button>
          <Button
            type="submit"
            form="stripe-setup-form"
            variant="primary"
            loading={stripeSetup.isLoading}
            disabled={
              stripeSetup.isLoading ||
              !stripeSetup.userId ||
              !stripeSetup.montant
            }
          >
            {t("modal.stripe.continueToPayment")}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Stripe — étape 2 : formulaire de carte */}
      <StripePaymentModal
        isOpen={stripeModal.isOpen}
        onClose={() => setStripeModal((s) => ({ ...s, isOpen: false }))}
        onSuccess={() => {
          toast.success(t("messages.paymentCreated"), {
            description: t("messages.paymentMarkedPaid"),
          });
          setStripeModal((s) => ({ ...s, isOpen: false }));
          refetchPayments();
        }}
        clientSecret={stripeModal.clientSecret}
        amount={stripeModal.amount}
      />
    </div>
  );
}
