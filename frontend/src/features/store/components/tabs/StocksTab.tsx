/**
 * StocksTab
 * Onglet de gestion des stocks pour les administrateurs.
 *
 * Fonctionnalités :
 * - Affichage des niveaux de stock par article et taille
 * - Alertes pour les stocks faibles et ruptures
 * - Ajustement manuel des quantités
 * - Suivi des seuils minimums
 *
 * MIGRATION : Utilise les composants réutilisables de la bibliothèque shared
 * - Badge pour les compteurs et statuts
 * - AlertBanner pour les erreurs
 * - LoadingSpinner et EmptyState pour le feedback
 * - StockBadge pour l'état des stocks
 */

import { useTranslation } from "react-i18next";
import { Badge } from "../../../../shared/components/Badge/Badge";
import { AlertBanner } from "../../../../shared/components/Feedback/AlertBanner";
import { LoadingSpinner } from "../../../../shared/components/Layout/LoadingSpinner";
import { EmptyState } from "../../../../shared/components/Layout/EmptyState";
import { useStocks, useLowStocks, useAdjustStock } from "../../hooks/useStore";
import { useStoreUI } from "../../stores/storeStore";
import { StockBadge, StockAdjustModal } from "../";
import { getErrorMessage } from "../../../../shared/utils";

export function StocksTab() {
  const { t } = useTranslation("store");
  const store = useStoreUI();
  const stocksQuery = useStocks();
  const lowStocksQuery = useLowStocks();
  const adjustStockMutation = useAdjustStock();

  const ruptureCount =
    stocksQuery.data?.filter((stock) => stock.quantite <= 0).length ?? 0;
  const articlesCount = new Set(
    (stocksQuery.data ?? []).map((stock) => stock.article_id),
  ).size;

  return (
    <div>
      {/* En-tête de l'onglet */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b border-gray-50">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-base font-semibold text-gray-900">
            {t("stocks.title")}
          </h2>
          <Badge variant="info">
            {stocksQuery.data?.length ?? 0}{" "}
            {(stocksQuery.data?.length ?? 0) > 1
              ? t("stocks.count.lines")
              : t("stocks.count.line")}
          </Badge>
          {lowStocksQuery.data && lowStocksQuery.data.length > 0 && (
            <Badge variant="orange">
              {lowStocksQuery.data.length}{" "}
              {lowStocksQuery.data.length > 1
                ? t("stocks.count.lowStocks")
                : t("stocks.count.lowStock")}
            </Badge>
          )}
          {ruptureCount > 0 && (
            <Badge variant="danger">
              {ruptureCount}{" "}
              {ruptureCount > 1
                ? t("stocks.count.outOfStocks")
                : t("stocks.count.outOfStock")}
            </Badge>
          )}
          {articlesCount > 0 && (
            <Badge variant="purple">
              {articlesCount}{" "}
              {articlesCount > 1
                ? t("stocks.count.articles")
                : t("stocks.count.article")}
            </Badge>
          )}
        </div>
      </div>

      {/* Alertes stock faible */}
      {lowStocksQuery.data && lowStocksQuery.data.length > 0 && (
        <div className="p-4 border-b border-gray-50">
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
            <h3 className="text-sm font-semibold text-orange-900">
              {t("stocks.alerts.title")}
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {lowStocksQuery.data.map((stock) => (
                <span
                  key={stock.id}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm text-orange-800 ring-1 ring-orange-200"
                >
                  <span className="font-medium">{stock.article_nom}</span>
                  <span className="text-orange-600">/</span>
                  <span>{stock.taille_nom}</span>
                  <span className="text-orange-600">:</span>
                  <span className="font-semibold">{stock.quantite}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Contenu - MIGRATION : LoadingSpinner, ErrorBanner, EmptyState */}
      <div className="p-4">
        {lowStocksQuery.isError && (
          <AlertBanner
            variant="error"
            message={getErrorMessage(lowStocksQuery.error)}
          />
        )}
        {stocksQuery.isError && (
          <AlertBanner
            variant="error"
            message={getErrorMessage(stocksQuery.error)}
          />
        )}

        {(stocksQuery.isLoading || lowStocksQuery.isLoading) && (
          <LoadingSpinner text={t("common.loading")} />
        )}

        {!stocksQuery.isLoading &&
          !stocksQuery.isError &&
          !stocksQuery.data?.length && (
            <EmptyState
              title={t("stocks.empty.title")}
              description={t("stocks.empty.description")}
              variant="dashed"
            />
          )}

        {stocksQuery.data && stocksQuery.data.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {t("stocks.table.article")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {t("stocks.table.size")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {t("stocks.table.quantity")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {t("stocks.table.minimum")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {t("stocks.table.status")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {t("stocks.table.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stocksQuery.data.map((stock) => (
                    <tr
                      key={stock.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {stock.article_nom ?? `Article #${stock.article_id}`}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {stock.taille_nom ?? `Taille #${stock.taille_id}`}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {stock.quantite}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {stock.quantite_minimum}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <StockBadge
                          quantite={stock.quantite}
                          quantite_minimum={stock.quantite_minimum}
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <button
                          onClick={() => store.openStockAdjustModal(stock)}
                          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
                        >
                          {t("stocks.actions.adjust")}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal d'ajustement stock */}
      {store.adjustingStock && (
        <StockAdjustModal
          isOpen={store.stockAdjustModalOpen}
          onClose={store.closeStockAdjustModal}
          stock={store.adjustingStock}
          onSubmit={async (data) => {
            await adjustStockMutation.mutateAsync({
              id: store.adjustingStock!.id,
              data,
            });
            store.closeStockAdjustModal();
          }}
        />
      )}
    </div>
  );
}
