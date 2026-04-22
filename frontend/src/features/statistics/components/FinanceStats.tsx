/**
 * @fileoverview FinanceStats Component
 * @module features/statistics/components
 *
 * Component for displaying financial statistics and payment analytics.
 */

import React from "react";
import { StatCard } from "./StatCard";
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatDate,
  formatRelativeDate,
} from "../utils/formatting";

/**
 * Financial Analytics Response Interface
 */
export interface FinancialAnalyticsResponse {
  overview: {
    total_revenus: number;
    total_paiements_valides: number;
    total_paiements_en_attente: number;
    total_paiements_echoues: number;
    montant_en_attente: number;
    montant_echeances_retard: number;
    nombre_echeances_retard: number;
    taux_paiement: number;
  };
  by_payment_method: Array<{
    methode_paiement: string;
    montant_total: number;
    pourcentage: number;
  }>;
  by_subscription_plan: Array<{
    plan_nom: string;
    montant_total: number;
    pourcentage: number;
  }>;
  late_payments: Array<{
    echeance_id: number;
    utilisateur_id: number;
    utilisateur_nom: string;
    utilisateur_prenom: string;
    montant: number;
    date_echeance: string;
    jours_retard: number;
  }>;
}

/**
 * Props for FinanceStats component
 */
export interface FinanceStatsProps {
  /** Financial analytics data */
  data?: FinancialAnalyticsResponse;

  /** Whether the data is loading */
  isLoading?: boolean;

  /** Error message if any */
  error?: Error | null;

  /** Whether to show in compact mode */
  isCompact?: boolean;
}

/**
 * Chart colors for payment method distribution
 */
const PAYMENT_METHOD_COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-cyan-500",
  "bg-yellow-500",
];

/**
 * Chart colors for subscription plan distribution
 */
const PLAN_COLORS = [
  "bg-blue-600",
  "bg-cyan-600",
  "bg-green-600",
  "bg-yellow-600",
  "bg-orange-600",
  "bg-purple-600",
];

/**
 * Get severity label based on days late
 */
const getLateSeverity = (
  daysLate: number,
): { label: string; color: string } => {
  if (daysLate >= 60) {
    return { label: "Critique", color: "bg-red-100 text-red-800" };
  } else if (daysLate >= 30) {
    return { label: "Urgent", color: "bg-orange-100 text-orange-800" };
  } else {
    return { label: "En retard", color: "bg-purple-100 text-purple-800" };
  }
};

/**
 * DollarSign Icon SVG
 */
const DollarSignIcon: React.FC<{ className?: string }> = ({
  className = "",
}) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

/**
 * CheckCircle Icon SVG
 */
const CheckCircleIcon: React.FC<{ className?: string }> = ({
  className = "",
}) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

/**
 * Clock Icon SVG
 */
const ClockIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

/**
 * TimesCircle Icon SVG
 */
const TimesCircleIcon: React.FC<{ className?: string }> = ({
  className = "",
}) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

/**
 * Warning Icon SVG
 */
const WarningIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    />
  </svg>
);

/**
 * X Icon SVG
 */
const XIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

/**
 * Skeleton Loader Component
 */
const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
);

/**
 * Alert Component
 */
interface AlertProps {
  variant: "warning" | "danger" | "info" | "success";
  title: string;
  children: React.ReactNode;
  onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({ variant, title, children, onClose }) => {
  const variantClasses = {
    warning: "bg-yellow-50 border-yellow-400 text-yellow-800",
    danger: "bg-red-50 border-red-400 text-red-800",
    info: "bg-blue-50 border-blue-400 text-blue-800",
    success: "bg-green-50 border-green-400 text-green-800",
  };

  const iconColorClasses = {
    warning: "text-yellow-400",
    danger: "text-red-400",
    info: "text-blue-400",
    success: "text-green-400",
  };

  return (
    <div
      className={`border-l-4 p-4 ${variantClasses[variant]} rounded-r-lg relative`}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <WarningIcon className={`h-5 w-5 ${iconColorClasses[variant]}`} />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium">{title}</h3>
          <div className="mt-2 text-sm">{children}</div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              onClick={onClose}
              className="inline-flex rounded-lg p-1.5 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * FinanceStats Component
 *
 * Displays comprehensive financial statistics including:
 * - Total revenue and payment status
 * - Late payments with alerts
 * - Revenue distribution by payment method
 * - Revenue distribution by subscription plan
 *
 * @example
 * ```tsx
 * <FinanceStats data={financialAnalytics} isLoading={isLoading} />
 * ```
 */
export const FinanceStats: React.FC<FinanceStatsProps> = ({
  data,
  isLoading = false,
  error = null,
  isCompact = false,
}) => {
  const [showLatePaymentsAlert, setShowLatePaymentsAlert] =
    React.useState(true);

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <WarningIcon className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Erreur de chargement
        </h2>
        <p className="text-sm text-gray-600 text-center">
          Une erreur est survenue lors du chargement des statistiques
          financières.
          <br />
          {error.message}
        </p>
      </div>
    );
  }

  // No data state
  if (!isLoading && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <DollarSignIcon className="h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Aucune donnée disponible
        </h2>
        <p className="text-sm text-gray-600">
          Les statistiques financières ne sont pas disponibles pour le moment.
        </p>
      </div>
    );
  }

  const hasLatePayments = data && data.late_payments.length > 0;

  return (
    <div className="space-y-4">
      {/* Late Payments Alert */}
      {hasLatePayments && showLatePaymentsAlert && (
        <Alert
          variant="warning"
          title={`${data.late_payments.length} paiement(s) en retard`}
          onClose={() => setShowLatePaymentsAlert(false)}
        >
          <p>
            Montant total en retard:{" "}
            <strong>
              {formatCurrency(data.overview.montant_echeances_retard)}
            </strong>
          </p>
          <p className="mt-2">
            Consultez la liste des paiements en retard ci-dessous pour effectuer
            le suivi.
          </p>
        </Alert>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenus"
          value={data?.overview.total_revenus || 0}
          valueFormat="currency"
          icon={DollarSignIcon}
          variant="success"
          isLoading={isLoading}
          isCompact={isCompact}
        />

        <StatCard
          title="Paiements Valides"
          value={data?.overview.total_paiements_valides || 0}
          valueFormat="number"
          icon={CheckCircleIcon}
          variant="success"
          isLoading={isLoading}
          isCompact={isCompact}
          description={
            data
              ? `${formatPercentage(data.overview.taux_paiement, 1)} de taux de succès`
              : undefined
          }
        />

        <StatCard
          title="Paiements En Attente"
          value={data?.overview.total_paiements_en_attente || 0}
          valueFormat="number"
          icon={ClockIcon}
          variant={
            data && data.overview.total_paiements_en_attente > 10
              ? "warning"
              : "default"
          }
          isLoading={isLoading}
          isCompact={isCompact}
          description={
            data
              ? `${formatCurrency(data.overview.montant_en_attente)} en attente`
              : undefined
          }
        />

        <StatCard
          title="Paiements Échoués"
          value={data?.overview.total_paiements_echoues || 0}
          valueFormat="number"
          icon={TimesCircleIcon}
          variant={
            data && data.overview.total_paiements_echoues > 0
              ? "danger"
              : "default"
          }
          isLoading={isLoading}
          isCompact={isCompact}
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          title="Échéances en Retard"
          value={data?.overview.nombre_echeances_retard || 0}
          valueFormat="number"
          icon={WarningIcon}
          variant={
            data && data.overview.nombre_echeances_retard > 0
              ? "danger"
              : "success"
          }
          isLoading={isLoading}
          isCompact={isCompact}
          description={
            data && data.overview.montant_echeances_retard > 0
              ? `${formatCurrency(data.overview.montant_echeances_retard)} à recouvrer`
              : "Aucun retard"
          }
        />

        <StatCard
          title="Taux de Paiement"
          value={data?.overview.taux_paiement || 0}
          valueFormat="percentage"
          icon={CheckCircleIcon}
          variant={
            data && data.overview.taux_paiement >= 90
              ? "success"
              : data && data.overview.taux_paiement >= 75
                ? "warning"
                : "danger"
          }
          isLoading={isLoading}
          isCompact={isCompact}
          description="Paiements valides / Total"
        />
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Payment Method Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Revenus par Méthode de Paiement
          </h3>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : data && data.by_payment_method.length > 0 ? (
            <div className="space-y-4">
              {data.by_payment_method.map((item, index) => {
                const barWidth = item.pourcentage;

                return (
                  <div key={item.methode_paiement} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-900">
                        {item.methode_paiement}
                      </span>
                      <span className="text-gray-600">
                        {formatCurrency(item.montant_total)} (
                        {formatPercentage(item.pourcentage, 1)})
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${PAYMENT_METHOD_COLORS[index % PAYMENT_METHOD_COLORS.length]} transition-all duration-300`}
                        style={{ width: `${barWidth}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-600 text-center py-8">
              Aucune donnée de méthode de paiement disponible
            </p>
          )}
        </div>

        {/* Subscription Plan Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Revenus par Plan d'Abonnement
          </h3>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : data && data.by_subscription_plan.length > 0 ? (
            <div className="space-y-4">
              {data.by_subscription_plan.map((item, index) => {
                const barWidth = item.pourcentage;

                return (
                  <div key={item.plan_nom} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-900">
                        {item.plan_nom}
                      </span>
                      <span className="text-gray-600">
                        {formatCurrency(item.montant_total)} (
                        {formatPercentage(item.pourcentage, 1)})
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${PLAN_COLORS[index % PLAN_COLORS.length]} transition-all duration-300`}
                        style={{ width: `${barWidth}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-600 text-center py-8">
              Aucune donnée de plan d'abonnement disponible
            </p>
          )}
        </div>
      </div>

      {/* Late Payments List */}
      {hasLatePayments && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Paiements en Retard
            </h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              <WarningIcon className="h-4 w-4 mr-1" />
              {data.late_payments.length} en retard
            </span>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : (
            <div className="space-y-3">
              {data.late_payments.map((payment) => {
                const severity = getLateSeverity(payment.jours_retard);
                return (
                  <div
                    key={payment.echeance_id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${severity.color}`}
                        >
                          {severity.label}
                        </span>
                      </div>

                      <div>
                        <div className="font-semibold text-gray-900">
                          {payment.utilisateur_prenom} {payment.utilisateur_nom}
                        </div>
                        <div className="text-xs text-gray-600">
                          ID: {payment.utilisateur_id}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-gray-600 mb-1">
                          Montant
                        </div>
                        <div className="font-semibold text-gray-900">
                          {formatCurrency(payment.montant)}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-gray-600 mb-1">
                          Date d'échéance
                        </div>
                        <div className="font-semibold text-gray-900">
                          {formatDate(payment.date_echeance)}
                        </div>
                        <div className="text-xs text-gray-600">
                          {formatRelativeDate(payment.date_echeance)}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-gray-600 mb-1">Retard</div>
                        <div className="font-semibold text-red-600">
                          {payment.jours_retard} jour
                          {payment.jours_retard > 1 ? "s" : ""}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FinanceStats;
