/**
 * MyPaymentsPage
 * Page membre : historique des paiements + échéances à venir + paiement Stripe
 */
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { CreditCardIcon } from "@heroicons/react/24/outline";
import { useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/shared/components/Layout/PageHeader";
import { useAuth } from "../../../shared/hooks/useAuth";
import { useMyPayments, useMySchedules } from "../hooks/usePayments";
import { StripePaymentModal } from "../components/StripePaymentModal";
import * as paymentsApi from "../api/paymentsApi";
import type { ScheduleListItemDto } from "../api/paymentsApi";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return amount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("fr-FR");
}

type BadgeColor = "green" | "yellow" | "red" | "gray" | "blue";

function getStatusBadge(statut: string): { label: string; color: BadgeColor } {
  switch (statut) {
    case "valide":     return { label: "Validé",     color: "green"  };
    case "en_attente": return { label: "En attente", color: "yellow" };
    case "echoue":     return { label: "Échoué",     color: "red"    };
    case "rembourse":  return { label: "Remboursé",  color: "blue"   };
    case "en_retard":  return { label: "En retard",  color: "red"    };
    case "paye":       return { label: "Payé",       color: "green"  };
    default:           return { label: statut,       color: "gray"   };
  }
}

const BADGE_CLASSES: Record<BadgeColor, string> = {
  green:  "bg-green-100 text-green-800",
  yellow: "bg-yellow-100 text-yellow-800",
  red:    "bg-red-100 text-red-800",
  gray:   "bg-gray-100 text-gray-600",
  blue:   "bg-blue-100 text-blue-800",
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const MyPaymentsPage: React.FC = () => {
  const { t } = useTranslation("payments");
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // ── Data ───────────────────────────────────────────────────────────────────
  const {
    data: payments = [],
    isLoading: paymentsLoading,
    isError: paymentsError,
  } = useMyPayments(user?.id);

  const {
    data: schedules = [],
    isLoading: schedulesLoading,
    isError: schedulesError,
  } = useMySchedules(user?.id);

  // ── State ──────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<"payments" | "schedules">("payments");
  const [stripeOpen, setStripeOpen]                 = useState(false);
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const [stripeAmount, setStripeAmount]             = useState(0);
  const [paying, setPaying]                         = useState(false);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalPaid = useMemo(
    () =>
      payments
        .filter((p) => p.statut === "valide")
        .reduce((s, p) => s + p.montant, 0),
    [payments],
  );

  const totalPending = useMemo(
    () =>
      schedules
        .filter((s) => s.statut === "en_attente" || s.statut === "en_retard")
        .reduce((sum, sch) => sum + sch.montant, 0),
    [schedules],
  );

  const nextDueDate = useMemo(() => {
    const pending = schedules
      .filter((s) => s.statut === "en_attente" || s.statut === "en_retard")
      .sort(
        (a, b) =>
          new Date(a.date_echeance).getTime() -
          new Date(b.date_echeance).getTime(),
      );
    return pending[0]?.date_echeance ?? null;
  }, [schedules]);

  // ── Stripe payment ─────────────────────────────────────────────────────────
  const handlePaySchedule = async (schedule: ScheduleListItemDto) => {
    if (!user) return;
    setPaying(true);
    try {
      const result = await paymentsApi.createStripeIntent({
        user_id: user.id,
        montant: Math.round(schedule.montant * 100),
        plan_tarifaire_id: schedule.plan_tarifaire_id,
      });
      setStripeClientSecret(result.client_secret);
      setStripeAmount(result.amount);
      setStripeOpen(true);
    } catch {
      toast.error(t("myPayments.paymentError"));
    } finally {
      setPaying(false);
    }
  };

  const handleStripeSuccess = () => {
    setStripeOpen(false);
    setStripeClientSecret(null);
    queryClient.invalidateQueries({ queryKey: ["my-schedules", user?.id] });
    queryClient.invalidateQueries({ queryKey: ["my-payments", user?.id] });
    toast.success(t("myPayments.paymentSuccess"));
  };

  const isLoading = paymentsLoading || schedulesLoading;
  const isError   = paymentsError   || schedulesError;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <PageHeader
        title={t("myPayments.title")}
        description={t("myPayments.description")}
      />

      {/* ── Error state ── */}
      {isError && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {t("myPayments.loadError")}
        </div>
      )}

      {/* ── Stats row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total payé */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            {t("myPayments.totalPaid")}
          </p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(totalPaid)}
          </p>
        </div>

        {/* Total en attente */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            {t("myPayments.totalPending")}
          </p>
          <p className="text-2xl font-bold text-yellow-600">
            {formatCurrency(totalPending)}
          </p>
        </div>

        {/* Prochain paiement */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            {t("myPayments.nextDueDate")}
          </p>
          <p className="text-2xl font-bold text-gray-800">
            {nextDueDate ? formatDate(nextDueDate) : t("myPayments.noDueDate")}
          </p>
        </div>
      </div>

      {/* ── Tabs container ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {/* Tab navigation */}
        <div className="border-b border-gray-200 px-4">
          <nav className="flex gap-1 -mb-px">
            {(["payments", "schedules"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab === "payments"
                  ? t("myPayments.tabPayments")
                  : t("myPayments.tabSchedules")}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : activeTab === "payments" ? (
            /* ─── Payments tab ─── */
            payments.length === 0 ? (
              <p className="text-center text-gray-400 py-12">
                {t("myPayments.noPayments")}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100">
                      <th className="pb-3 pr-6">{t("table.date")}</th>
                      <th className="pb-3 pr-6">{t("fields.amount")}</th>
                      <th className="pb-3 pr-6">{t("table.method")}</th>
                      <th className="pb-3 pr-6">{t("table.status")}</th>
                      <th className="pb-3">{t("fields.description")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {payments.map((payment) => {
                      const badge = getStatusBadge(payment.statut);
                      return (
                        <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 pr-6 text-gray-600 whitespace-nowrap">
                            {formatDate(payment.date_paiement ?? payment.created_at)}
                          </td>
                          <td className="py-3 pr-6 font-semibold text-gray-900 whitespace-nowrap">
                            {formatCurrency(payment.montant)}
                          </td>
                          <td className="py-3 pr-6 text-gray-600 capitalize">
                            {payment.methode_paiement}
                          </td>
                          <td className="py-3 pr-6">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${BADGE_CLASSES[badge.color]}`}
                            >
                              {badge.label}
                            </span>
                          </td>
                          <td className="py-3 text-gray-500 truncate max-w-xs">
                            {payment.description ?? "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            /* ─── Schedules tab ─── */
            schedules.length === 0 ? (
              <p className="text-center text-gray-400 py-12">
                {t("myPayments.noSchedules")}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100">
                      <th className="pb-3 pr-6">{t("fields.dueDate")}</th>
                      <th className="pb-3 pr-6">{t("fields.amount")}</th>
                      <th className="pb-3 pr-6">{t("types.subscription")}</th>
                      <th className="pb-3 pr-6">{t("table.status")}</th>
                      <th className="pb-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {schedules.map((schedule) => {
                      const badge = getStatusBadge(schedule.statut);
                      const canPay =
                        schedule.statut === "en_attente" ||
                        schedule.statut === "en_retard";
                      return (
                        <tr
                          key={schedule.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-3 pr-6 text-gray-600 whitespace-nowrap">
                            {formatDate(schedule.date_echeance)}
                          </td>
                          <td className="py-3 pr-6 font-semibold text-gray-900 whitespace-nowrap">
                            {formatCurrency(schedule.montant)}
                          </td>
                          <td className="py-3 pr-6 text-gray-600">
                            {schedule.plan_tarifaire_nom}
                          </td>
                          <td className="py-3 pr-6">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${BADGE_CLASSES[badge.color]}`}
                            >
                              {badge.label}
                            </span>
                          </td>
                          <td className="py-3">
                            {canPay && (
                              <button
                                type="button"
                                onClick={() => handlePaySchedule(schedule)}
                                disabled={paying}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                           bg-blue-600 text-white text-xs font-medium
                                           hover:bg-blue-700 active:bg-blue-800
                                           disabled:opacity-50 disabled:cursor-not-allowed
                                           transition-colors"
                              >
                                <CreditCardIcon className="h-3.5 w-3.5" />
                                {paying ? t("myPayments.paying") : t("myPayments.payNow")}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </div>

      {/* ── Stripe Payment Modal ── */}
      {stripeClientSecret && (
        <StripePaymentModal
          isOpen={stripeOpen}
          onClose={() => {
            setStripeOpen(false);
            setStripeClientSecret(null);
          }}
          onSuccess={handleStripeSuccess}
          clientSecret={stripeClientSecret}
          amount={stripeAmount}
        />
      )}
    </div>
  );
};
