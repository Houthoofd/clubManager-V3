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
import { toast } from "sonner";
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

// ─── Composants réutilisables ─────────────────────────────────────────────────
import { Modal, Button } from "../../../shared/components";
import { TabGroup } from "../../../shared/components/Navigation/TabGroup";
import { DataTable } from "../../../shared/components/Table/DataTable";
import { SearchBar } from "../../../shared/components/Forms/SearchBar";
import { DateRangePicker } from "../../../shared/components/Forms/DateRangePicker";
import type { Column } from "../../../shared/components/Table/DataTable";
import type { Tab } from "../../../shared/components/Navigation/TabGroup";

// ─── Composants spécifiques paiements ─────────────────────────────────────────
import { PaymentStatusBadge } from "../components/PaymentStatusBadge";
import { PaymentMethodBadge } from "../components/PaymentMethodBadge";
import { ScheduleStatusBadge } from "../components/ScheduleStatusBadge";
import { RecordPaymentModal } from "../components/RecordPaymentModal";
import type { RecordPaymentFormData } from "../components/RecordPaymentModal";
import { PricingPlanFormModal } from "../components/PricingPlanFormModal";
import type { PricingPlanFormData } from "../components/PricingPlanFormModal";
import { StripePaymentModal } from "../components/StripePaymentModal";

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

// ─── Types pour DataTable ─────────────────────────────────────────────────────
interface PaymentRow {
  id: number;
  utilisateur_nom_complet: string;
  utilisateur_email: string;
  montant: number;
  methode_paiement: string;
  statut: string;
  plan_tarifaire_nom?: string | null;
  date_paiement: string | null;
}

interface ScheduleRow {
  id: number;
  utilisateur_nom_complet: string;
  utilisateur_email: string;
  plan_tarifaire_nom: string;
  montant: number;
  date_echeance: string;
  statut: string;
  jours_retard?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return amount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

function formatDate(date: string | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("fr-FR");
}

function buildPageRange(current: number, total: number): (number | "...")[] {
  if (total <= 1) return total === 1 ? [1] : [];
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "...")[] = [];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  pages.push(1);
  if (start > 2) pages.push("...");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("...");
  pages.push(total);

  return pages;
}

// ─── Icônes SVG ───────────────────────────────────────────────────────────────

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 12.75l6 6 9-13.5"
      />
    </svg>
  );
}

function CreditCardIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.8}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
      />
    </svg>
  );
}

function ExclamationTriangleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
      />
    </svg>
  );
}

// ─── Sous-composants ──────────────────────────────────────────────────────────

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-16 gap-3">
      <svg
        className="animate-spin h-6 w-6 text-blue-600"
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
      <span className="text-sm text-gray-500">Chargement…</span>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <svg
        className="h-12 w-12 text-gray-300"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
        />
      </svg>
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}

interface PaginationBarProps {
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
}

function PaginationBar({ pagination, onPageChange }: PaginationBarProps) {
  if (pagination.totalPages <= 1) return null;

  const pages = buildPageRange(pagination.page, pagination.totalPages);
  const start = (pagination.page - 1) * pagination.limit + 1;
  const end = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100">
      <p className="text-sm text-gray-500">
        Affichage de{" "}
        <span className="font-medium text-gray-700">
          {start}–{end}
        </span>{" "}
        sur{" "}
        <span className="font-medium text-gray-700">{pagination.total}</span>{" "}
        résultats
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(pagination.page - 1)}
          disabled={pagination.page === 1}
          className="px-2.5 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100
                     rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ‹
        </button>
        {pages.map((p, i) =>
          p === "..." ? (
            <span
              key={`ellipsis-${i}`}
              className="px-2 py-1.5 text-sm text-gray-400"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p as number)}
              className={`min-w-[32px] px-2.5 py-1.5 text-sm rounded-md transition-colors ${
                p === pagination.page
                  ? "bg-blue-600 text-white font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {p}
            </button>
          ),
        )}
        <button
          type="button"
          onClick={() => onPageChange(pagination.page + 1)}
          disabled={pagination.page === pagination.totalPages}
          className="px-2.5 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100
                     rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ›
        </button>
      </div>
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

export function PaymentsPage() {
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
      toast.error("Erreur paiements", { description: paymentsError });
      clearPaymentsError();
    }
  }, [paymentsError, clearPaymentsError]);

  useEffect(() => {
    if (schedulesError) {
      toast.error("Erreur échéances", { description: schedulesError });
      clearSchedulesError();
    }
  }, [schedulesError, clearSchedulesError]);

  useEffect(() => {
    if (plansError) {
      toast.error("Erreur plans tarifaires", { description: plansError });
      clearPlansError();
    }
  }, [plansError, clearPlansError]);

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

  // ── Handlers ──────────────────────────────────────────────────────────────

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

  // ── Configuration TabGroup ────────────────────────────────────────────────
  const tabs: Tab[] = [
    { id: "payments", label: "Paiements" },
    {
      id: "schedules",
      label: "Échéances",
      badge: overdueSchedules.length > 0 ? overdueSchedules.length : undefined,
    },
    ...(isAdmin ? [{ id: "plans" as const, label: "Plans tarifaires" }] : []),
  ];

  // ── Configuration colonnes DataTable (Paiements) ──────────────────────────
  const paymentsColumns: Column<PaymentRow>[] = useMemo(
    () => [
      {
        key: "utilisateur_nom_complet",
        label: "Membre",
        render: (_, row) => (
          <div>
            <div className="text-sm font-medium text-gray-900">
              {row.utilisateur_nom_complet}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              {row.utilisateur_email}
            </div>
          </div>
        ),
      },
      {
        key: "montant",
        label: "Montant",
        render: (value) => (
          <span className="text-sm font-semibold text-gray-900">
            {formatCurrency(value)}
          </span>
        ),
      },
      {
        key: "methode_paiement",
        label: "Méthode",
        render: (value) => <PaymentMethodBadge methode={value} />,
      },
      {
        key: "statut",
        label: "Statut",
        render: (value) => <PaymentStatusBadge statut={value} />,
      },
      {
        key: "plan_tarifaire_nom",
        label: "Plan",
        render: (value) => (
          <span className="text-sm text-gray-600">{value ?? "—"}</span>
        ),
      },
      {
        key: "date_paiement",
        label: "Date",
        render: (value) => (
          <span className="text-sm text-gray-600">{formatDate(value)}</span>
        ),
      },
      {
        key: "id",
        label: "Actions",
        render: (value) => (
          <span className="text-xs text-gray-400">#{value}</span>
        ),
      },
    ],
    [],
  );

  // ── Configuration colonnes DataTable (Échéances) ──────────────────────────
  const schedulesColumns: Column<ScheduleRow>[] = useMemo(
    () => [
      {
        key: "utilisateur_nom_complet",
        label: "Membre",
        render: (_, row) => (
          <div>
            <div className="text-sm font-medium text-gray-900">
              {row.utilisateur_nom_complet}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              {row.utilisateur_email}
            </div>
          </div>
        ),
      },
      {
        key: "plan_tarifaire_nom",
        label: "Plan",
        render: (value) => (
          <span className="text-sm text-gray-600">{value}</span>
        ),
      },
      {
        key: "montant",
        label: "Montant",
        render: (value) => (
          <span className="text-sm font-semibold text-gray-900">
            {formatCurrency(value)}
          </span>
        ),
      },
      {
        key: "date_echeance",
        label: "Date échéance",
        render: (value) => (
          <span className="text-sm text-gray-600">{formatDate(value)}</span>
        ),
      },
      {
        key: "statut",
        label: "Statut",
        render: (value, row) => (
          <ScheduleStatusBadge statut={value} joursRetard={row.jours_retard} />
        ),
      },
      {
        key: "jours_retard",
        label: "Jours retard",
        render: (value) =>
          value !== undefined && value > 0 ? (
            <span className="text-sm font-medium text-red-600">{value}j</span>
          ) : (
            <span className="text-sm text-gray-400">—</span>
          ),
      },
      {
        key: "id",
        label: "Actions",
        render: (_, row) => {
          if (isAdmin && row.statut !== "paye" && row.statut !== "annule") {
            return (
              <button
                type="button"
                onClick={() => handleMarkAsPaid(row.id)}
                disabled={markingScheduleId === row.id}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium
                         text-white bg-green-600 hover:bg-green-700 rounded-md
                         transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {markingScheduleId === row.id ? (
                  <svg
                    className="animate-spin h-3 w-3"
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
                ) : (
                  <CheckIcon className="h-3.5 w-3.5" />
                )}
                Marquer payé
              </button>
            );
          }
          return <span className="text-xs text-gray-400">—</span>;
        },
      },
    ],
    [isAdmin, markingScheduleId],
  );

  // ── Rendu ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ── En-tête ── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paiements</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Gestion des paiements, échéances et plans tarifaires du club
        </p>
      </div>

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
          <div>
            {/* En-tête de l'onglet */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b border-gray-50">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-base font-semibold text-gray-900">
                  Historique des paiements
                </h2>
                {totalValidThisMonth > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                    <CheckIcon className="h-3.5 w-3.5" />
                    {formatCurrency(totalValidThisMonth)} validés ce mois
                  </span>
                )}
                {paymentsPagination.total > 0 && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                    {paymentsPagination.total} paiement
                    {paymentsPagination.total > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              {isAdmin && (
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() =>
                      setStripeSetup({
                        isOpen: true,
                        userId: "",
                        montant: "",
                        planId: "",
                        description: "",
                        isLoading: false,
                        error: null,
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium
                               text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200
                               rounded-lg transition-colors"
                  >
                    <CreditCardIcon className="h-4 w-4" />
                    Payer par carte
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecordPaymentOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium
                               text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm
                               transition-colors"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                    Enregistrer un paiement
                  </button>
                </div>
              )}
            </div>

            {/* Filtres */}
            <div className="p-4 border-b border-gray-50">
              <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
                {/* Recherche avec SearchBar */}
                <div className="flex-1 min-w-[200px]">
                  <SearchBar
                    value={paymentSearch}
                    onChange={setPaymentSearch}
                    placeholder="Rechercher par nom de membre…"
                    size="md"
                    showClear
                  />
                </div>

                {/* Filtre statut */}
                <select
                  value={paymentsFilters.statut}
                  onChange={(e) => setPaymentsFilter("statut", e.target.value)}
                  className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                             transition-colors min-w-[150px]"
                >
                  <option value="">Tous les statuts</option>
                  <option value="en_attente">En attente</option>
                  <option value="valide">Validé</option>
                  <option value="echoue">Échoué</option>
                  <option value="rembourse">Remboursé</option>
                </select>

                {/* Filtre méthode */}
                <select
                  value={paymentsFilters.methode}
                  onChange={(e) => setPaymentsFilter("methode", e.target.value)}
                  className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                             transition-colors min-w-[160px]"
                >
                  <option value="">Toutes les méthodes</option>
                  <option value="stripe">Stripe</option>
                  <option value="especes">Espèces</option>
                  <option value="virement">Virement</option>
                  <option value="autre">Autre</option>
                </select>

                {/* DateRangePicker pour les dates */}
                <div className="flex items-center gap-2">
                  <DateRangePicker value={dateRange} onChange={setDateRange} />
                </div>

                {/* Réinitialiser filtres */}
                {(paymentsFilters.statut ||
                  paymentsFilters.methode ||
                  dateRange.startDate ||
                  dateRange.endDate ||
                  paymentSearch) && (
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentsFilter("statut", "");
                      setPaymentsFilter("methode", "");
                      setDateRange({ startDate: null, endDate: null });
                      setPaymentSearch("");
                    }}
                    className="px-3 py-2.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100
                               border border-gray-300 rounded-lg transition-colors"
                  >
                    Réinitialiser
                  </button>
                )}
              </div>
            </div>

            {/* DataTable pour les paiements */}
            {paymentsLoading ? (
              <LoadingSpinner />
            ) : filteredPayments.length === 0 ? (
              <EmptyState message="Aucun paiement trouvé." />
            ) : (
              <>
                <DataTable
                  columns={paymentsColumns}
                  data={filteredPayments}
                  rowKey="id"
                  loading={paymentsLoading}
                  emptyMessage="Aucun paiement trouvé."
                />
                <PaginationBar
                  pagination={paymentsPagination}
                  onPageChange={setPaymentsPage}
                />
              </>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            ONGLET 2 : ÉCHÉANCES
            ════════════════════════════════════════════════════════════════ */}
        {activeTab === "schedules" && (
          <div>
            {/* En-tête de l'onglet */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b border-gray-50">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-base font-semibold text-gray-900">
                  Échéances de paiement
                </h2>
                {overdueSchedules.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                    <ExclamationTriangleIcon className="h-3.5 w-3.5" />
                    {overdueSchedules.length} en retard
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={refetchSchedules}
                disabled={schedulesLoading}
                title="Rafraîchir les échéances"
                className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200
                           text-gray-500 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200
                           transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <svg
                  className={`h-4 w-4 ${schedulesLoading ? "animate-spin" : ""}`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
              </button>
            </div>

            {/* Filtre statut */}
            <div className="p-4 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <select
                  value={schedulesFilters.statut}
                  onChange={(e) => setSchedulesFilter("statut", e.target.value)}
                  className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                             transition-colors min-w-[180px]"
                >
                  <option value="">Tous les statuts</option>
                  <option value="en_attente">En attente</option>
                  <option value="paye">Payé</option>
                  <option value="en_retard">En retard</option>
                  <option value="annule">Annulé</option>
                </select>
                {schedulesFilters.statut && (
                  <button
                    type="button"
                    onClick={() => setSchedulesFilter("statut", "")}
                    className="px-3 py-2.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100
                               border border-gray-300 rounded-lg transition-colors"
                  >
                    Réinitialiser
                  </button>
                )}
              </div>
            </div>

            {/* Section échéances en retard */}
            {overdueSchedules.length > 0 && (
              <div className="p-4 bg-red-50 border-b border-red-100">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-red-100">
                    <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-red-800 mb-3">
                      {overdueSchedules.length} échéance
                      {overdueSchedules.length > 1 ? "s" : ""} en retard
                    </h3>
                    <div className="space-y-2">
                      {overdueSchedules.slice(0, 5).map((s) => (
                        <div
                          key={s.id}
                          className="flex flex-wrap items-center justify-between gap-3 py-2.5 px-3
                                     bg-white rounded-lg border border-red-200 shadow-sm"
                        >
                          <div className="min-w-0">
                            <span className="text-sm font-medium text-gray-900">
                              {s.utilisateur_nom_complet}
                            </span>
                            <span
                              className="mx-2 text-gray-300"
                              aria-hidden="true"
                            >
                              ·
                            </span>
                            <span className="text-sm text-gray-500">
                              {s.plan_tarifaire_nom}
                            </span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <span className="text-sm font-semibold text-red-700">
                              {formatCurrency(s.montant)}
                            </span>
                            <ScheduleStatusBadge
                              statut={s.statut}
                              joursRetard={s.jours_retard}
                            />
                            {isAdmin && (
                              <button
                                type="button"
                                onClick={() => handleMarkAsPaid(s.id)}
                                disabled={markingScheduleId === s.id}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium
                                           text-white bg-green-600 hover:bg-green-700 rounded-md
                                           transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {markingScheduleId === s.id ? (
                                  "…"
                                ) : (
                                  <>
                                    <CheckIcon className="h-3.5 w-3.5" />
                                    Payer
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      {overdueSchedules.length > 5 && (
                        <p className="text-xs text-red-600 text-center pt-1">
                          + {overdueSchedules.length - 5} autre
                          {overdueSchedules.length - 5 > 1 ? "s" : ""} en retard
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DataTable pour les échéances */}
            {schedulesLoading ? (
              <LoadingSpinner />
            ) : schedules.length === 0 ? (
              <EmptyState message="Aucune échéance trouvée." />
            ) : (
              <>
                <DataTable
                  columns={schedulesColumns}
                  data={schedules}
                  rowKey="id"
                  loading={schedulesLoading}
                  emptyMessage="Aucune échéance trouvée."
                />
                <PaginationBar
                  pagination={schedulesPagination}
                  onPageChange={setSchedulesPage}
                />
              </>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            ONGLET 3 : PLANS TARIFAIRES (admin uniquement)
            ════════════════════════════════════════════════════════════════ */}
        {activeTab === "plans" && isAdmin && (
          <div>
            {/* En-tête */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-semibold text-gray-900">
                  Plans tarifaires
                </h2>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                  {plans.length} plan{plans.length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={refetchPlans}
                  disabled={plansLoading}
                  title="Rafraîchir les plans"
                  className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200
                             text-gray-500 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200
                             transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <svg
                    className={`h-4 w-4 ${plansLoading ? "animate-spin" : ""}`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPlan(undefined);
                    setPlanFormOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium
                             text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm
                             transition-colors"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                  Nouveau plan
                </button>
              </div>
            </div>

            {/* Grille de cartes */}
            <div className="p-4">
              {plansLoading && <LoadingSpinner />}

              {!plansLoading && plans.length === 0 && (
                <EmptyState message="Aucun plan tarifaire créé." />
              )}

              {!plansLoading && plans.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`relative flex flex-col rounded-xl border shadow-sm transition-all
                        ${
                          plan.actif
                            ? "bg-white border-gray-200 hover:border-blue-200 hover:shadow-md"
                            : "bg-gray-50 border-gray-200 opacity-70"
                        }`}
                    >
                      {/* Badge actif/inactif */}
                      <div className="absolute top-3 right-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            plan.actif
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {plan.actif ? "Actif" : "Inactif"}
                        </span>
                      </div>

                      {/* Corps de la carte */}
                      <div className="p-5 flex-1">
                        <h3 className="text-base font-semibold text-gray-900 pr-16 leading-tight">
                          {plan.nom}
                        </h3>

                        {/* Prix et durée */}
                        <div className="mt-3 flex items-baseline gap-1.5">
                          <span className="text-2xl font-bold text-blue-600">
                            {formatCurrency(plan.prix)}
                          </span>
                          <span className="text-sm text-gray-500">
                            / {plan.duree_mois} mois
                          </span>
                        </div>

                        {/* Prix mensuel si durée > 1 */}
                        {plan.duree_mois > 1 && (
                          <p className="mt-0.5 text-xs text-gray-400">
                            ≈ {formatCurrency(plan.prix / plan.duree_mois)} /
                            mois
                          </p>
                        )}

                        {/* Description */}
                        {plan.description && (
                          <p className="mt-3 text-sm text-gray-500 leading-relaxed line-clamp-3">
                            {plan.description}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between gap-2">
                        {/* Bouton activer/désactiver */}
                        <button
                          type="button"
                          onClick={() => handleTogglePlan(plan)}
                          title={plan.actif ? "Désactiver" : "Activer"}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                            plan.actif
                              ? "text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200"
                              : "text-green-700 bg-green-50 hover:bg-green-100 border border-green-200"
                          }`}
                        >
                          {plan.actif ? (
                            <>
                              <svg
                                className="h-3.5 w-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636"
                                />
                              </svg>
                              Désactiver
                            </>
                          ) : (
                            <>
                              <svg
                                className="h-3.5 w-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
                                />
                              </svg>
                              Activer
                            </>
                          )}
                        </button>

                        <div className="flex items-center gap-1.5">
                          {/* Modifier */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPlan(plan);
                              setPlanFormOpen(true);
                            }}
                            title="Modifier"
                            className="p-1.5 rounded-md text-gray-500 hover:text-blue-600 hover:bg-blue-50
                                       transition-colors"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125"
                              />
                            </svg>
                          </button>

                          {/* Supprimer */}
                          {deletingPlanId === plan.id ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-gray-500">
                                Confirmer ?
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  handleDeletePlan(plan.id, plan.nom)
                                }
                                className="px-2 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                              >
                                Oui
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingPlanId(null)}
                                className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                              >
                                Non
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeletingPlanId(plan.id)}
                              title="Supprimer"
                              className="p-1.5 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50
                                         transition-colors"
                            >
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
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
        onSubmit={handleRecordPayment}
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
        onSubmit={handlePlanFormSubmit}
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
          title="Paiement par carte"
          subtitle="Initier un paiement Stripe pour un membre du club."
          showCloseButton
          onClose={() => setStripeSetup((s) => ({ ...s, isOpen: false }))}
        />

        <Modal.Body>
          <form
            id="stripe-setup-form"
            onSubmit={handleStripeSetupSubmit}
            className="space-y-4"
          >
            {/* Membre */}
            <div>
              <label
                htmlFor="stripe-user"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Membre <span className="text-red-500">*</span>
              </label>
              <select
                id="stripe-user"
                required
                value={stripeSetup.userId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setStripeSetup((s) => ({ ...s, userId: e.target.value }))
                }
                disabled={stripeSetup.isLoading}
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           disabled:bg-gray-50 transition-colors"
              >
                <option value="">— Sélectionner un membre —</option>
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
                Montant (€) <span className="text-red-500">*</span>
              </label>
              <input
                id="stripe-montant"
                type="number"
                min="0.5"
                step="0.01"
                placeholder="0,00"
                required
                value={stripeSetup.montant}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setStripeSetup((s) => ({ ...s, montant: e.target.value }))
                }
                disabled={stripeSetup.isLoading}
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
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
                Plan tarifaire
                <span className="ml-1 text-xs text-gray-400 font-normal">
                  (optionnel)
                </span>
              </label>
              <select
                id="stripe-plan"
                value={stripeSetup.planId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setStripeSetup((s) => ({ ...s, planId: e.target.value }))
                }
                disabled={stripeSetup.isLoading}
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           disabled:bg-gray-50 transition-colors"
              >
                <option value="">— Aucun plan —</option>
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
                Description
                <span className="ml-1 text-xs text-gray-400 font-normal">
                  (optionnel)
                </span>
              </label>
              <input
                id="stripe-description"
                type="text"
                placeholder="Objet du paiement…"
                value={stripeSetup.description}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setStripeSetup((s) => ({
                    ...s,
                    description: e.target.value,
                  }))
                }
                disabled={stripeSetup.isLoading}
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
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
            Annuler
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
            Continuer vers le paiement
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Stripe — étape 2 : formulaire de carte */}
      <StripePaymentModal
        isOpen={stripeModal.isOpen}
        onClose={() => setStripeModal((s) => ({ ...s, isOpen: false }))}
        onSuccess={() => {
          toast.success("Paiement réussi", {
            description: "Le paiement par carte a été confirmé avec succès.",
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
