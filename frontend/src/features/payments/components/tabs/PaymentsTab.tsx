/**
 * PaymentsTab - Onglet des paiements
 * Affiche l'historique des paiements avec filtres et actions
 */

import { CheckIcon, CreditCardIcon } from "@heroicons/react/24/outline";
import { DataTable } from "../../../../shared/components/Table/DataTable";
import { SearchBar } from "../../../../shared/components/Forms/SearchBar";
import { DateRangePicker } from "../../../../shared/components/Forms/DateRangePicker";
import { LoadingSpinner } from "../../../../shared/components/Layout/LoadingSpinner";
import { EmptyState } from "../../../../shared/components/Layout/EmptyState";
import { PaginationBar } from "../../../../shared/components/Navigation/PaginationBar";
import type { Column } from "../../../../shared/components/Table/DataTable";

interface PaymentsFilters {
  statut: string;
  methode: string;
  date_debut: string;
  date_fin: string;
}

interface PaymentsTabProps {
  // Données
  filteredPayments: any[];
  paymentsLoading: boolean;
  paymentsPagination: {
    page: number;
    totalPages: number;
    total: number;
    limit: number;
  };
  paymentsColumns: Column<any>[];
  totalValidThisMonth: number;

  // Filtres
  paymentsFilters: PaymentsFilters;
  paymentSearch: string;
  dateRange: {
    startDate: string | null;
    endDate: string | null;
  };

  // Handlers
  setPaymentsPage: (page: number) => void;
  setPaymentsFilter: (key: keyof PaymentsFilters, value: string) => void;
  setPaymentSearch: (value: string) => void;
  setDateRange: (range: {
    startDate: string | null;
    endDate: string | null;
  }) => void;
  setRecordPaymentOpen: (open: boolean) => void;
  setStripeSetup: (setup: any) => void;

  // Permissions
  isAdmin: boolean;
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

export function PaymentsTab({
  filteredPayments,
  paymentsLoading,
  paymentsPagination,
  paymentsColumns,
  totalValidThisMonth,
  paymentsFilters,
  paymentSearch,
  dateRange,
  setPaymentsPage,
  setPaymentsFilter,
  setPaymentSearch,
  setDateRange,
  setRecordPaymentOpen,
  setStripeSetup,
  isAdmin,
}: PaymentsTabProps) {
  return (
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
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium
                         text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200
                         rounded-lg transition-colors"
            >
              <CreditCardIcon className="h-4 w-4" />
              Payer par carte
            </button>
            <button
              type="button"
              onClick={() => setRecordPaymentOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium
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
            className="px-3 py-3 border border-gray-300 rounded-lg text-sm bg-white
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
            className="px-3 py-3 border border-gray-300 rounded-lg text-sm bg-white
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
              className="px-3 py-3 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100
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
        <EmptyState
          title="Aucun paiement trouvé"
          description="Il n'y a aucun paiement correspondant à vos critères de recherche."
        />
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
            currentPage={paymentsPagination.page}
            totalPages={paymentsPagination.totalPages}
            onPageChange={setPaymentsPage}
            showResultsCount
            total={paymentsPagination.total}
            pageSize={paymentsPagination.limit}
          />
        </>
      )}
    </div>
  );
}
