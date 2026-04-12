/**
 * @fileoverview Store Statistics Page
 * @module features/statistics/pages
 *
 * Detailed store and sales statistics page.
 * Displays order analytics, popular products, sales by category, and inventory alerts.
 */

import React, { useState } from "react";
import {
  useStoreAnalytics,
  useInvalidateStatistics,
} from "../hooks/useStatistics";
import { PeriodSelector } from "../components/PeriodSelector";
import { StatCard } from "../components/StatCard";
import { StoreStats } from "../components/StoreStats";
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
} from "../utils/formatting";

// ─── Local Types ──────────────────────────────────────────────────────────────

/**
 * Popular product analytics
 */
interface PopularProduct {
  article_id: number;
  article_nom: string;
  categorie: string;
  quantite_vendue: number;
  revenus_total: number;
  nombre_commandes: number;
}

/**
 * Sales by category analytics
 */
interface SalesByCategory {
  categorie_id: number;
  categorie_nom: string;
  total_articles_vendus: number;
  revenus_total: number;
  nombre_commandes: number;
  pourcentage_revenus: number;
}

/**
 * Low stock alert
 */
interface LowStockAlert {
  article_id: number;
  article_nom: string;
  taille: string;
  quantite_disponible: number;
  quantite_minimum: number;
  statut: "bas" | "critique" | "rupture";
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function ShoppingCartIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  );
}

function DollarSignIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function TrendUpIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
      />
    </svg>
  );
}

function BoxIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  );
}

function ExclamationTriangleIcon({
  className = "h-8 w-8",
}: {
  className?: string;
}) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  );
}

function WarningTriangleIcon({
  className = "h-5 w-5",
}: {
  className?: string;
}) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  );
}

/**
 * Store Statistics Page Component
 *
 * Provides detailed analytics for the club store including:
 * - Order statistics (total, paid, pending, cancelled)
 * - Revenue and average cart value
 * - Top selling products
 * - Sales breakdown by category
 * - Low stock inventory alerts
 *
 * @example
 * ```tsx
 * <Route path="/statistics/store" element={<StoreStatsPage />} />
 * ```
 */
export const StoreStatsPage: React.FC = () => {
  const { data, isLoading, error, refetch } = useStoreAnalytics();
  const invalidateStats = useInvalidateStatistics();
  const [isRefreshing, setIsRefreshing] = useState(false);

  /**
   * Handle manual refresh of statistics
   */
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await invalidateStats();
    await refetch();
    setIsRefreshing(false);
  };

  /**
   * Navigate back to dashboard
   */
  const handleBackToDashboard = () => {
    window.history.back();
  };

  /**
   * Get status color classes for stock level
   */
  const getStockStatusColor = (
    status: string,
  ): { bg: string; text: string } => {
    switch (status) {
      case "critique":
      case "rupture":
        return { bg: "bg-red-100", text: "text-red-800" };
      case "bas":
        return { bg: "bg-yellow-100", text: "text-yellow-800" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-800" };
    }
  };

  /**
   * Get status label for stock level
   */
  const getStockStatusLabel = (status: string): string => {
    switch (status) {
      case "critique":
        return "Stock critique";
      case "bas":
        return "Stock bas";
      case "rupture":
        return "Rupture de stock";
      default:
        return "Normal";
    }
  };

  /**
   * Render loading state
   */
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Statistiques Magasin
          </h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow p-6 animate-pulse"
            >
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /**
   * Render error state
   */
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Statistiques Magasin
          </h1>
        </div>
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Erreur de chargement: {error.message}
              </p>
              <button
                onClick={handleRefresh}
                className="mt-2 text-sm font-medium text-red-700 hover:text-red-600"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Render empty state
   */
  if (!data) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Statistiques Magasin
          </h1>
        </div>
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <ShoppingCartIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Aucune donnée disponible
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Les statistiques du magasin ne sont pas encore disponibles.
          </p>
        </div>
      </div>
    );
  }

  const { overview, popular_products, by_category, low_stock } = data;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <button
              onClick={handleBackToDashboard}
              className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              Tableau de bord
            </button>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <svg
                className="w-3 h-3 text-gray-400 mx-1"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 6 10"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 9 4-4-4-4"
                />
              </svg>
              <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                Statistiques Magasin
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Page Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Statistiques Magasin
            </h1>
            <p className="text-sm text-gray-600">
              Vue détaillée des ventes, commandes et analytics du magasin
            </p>
          </div>
          <button
            onClick={handleBackToDashboard}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Retour au tableau de bord
          </button>
        </div>

        {/* Period Selector */}
        <div className="flex justify-between items-center">
          <PeriodSelector showPeriodType={false} />
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRefreshing ? "Actualisation..." : "Actualiser"}
          </button>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {low_stock && low_stock.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <WarningTriangleIcon className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>{low_stock.length} article(s)</strong> nécessitent votre
                attention - Des articles ont un stock bas ou sont en rupture de
                stock.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Commandes"
          value={formatNumber(overview.total_commandes)}
          icon={ShoppingCartIcon}
          variant="info"
        />

        <StatCard
          title="Commandes Payées"
          value={formatNumber(overview.commandes_payees)}
          description={formatPercentage(
            (overview.commandes_payees / overview.total_commandes) * 100,
          )}
          icon={DollarSignIcon}
          variant="success"
        />

        <StatCard
          title="Revenus Total"
          value={formatCurrency(overview.total_revenus)}
          icon={TrendUpIcon}
          variant="info"
        />

        <StatCard
          title="Panier Moyen"
          value={formatCurrency(overview.panier_moyen)}
          icon={ShoppingCartIcon}
          variant="default"
        />

        <StatCard
          title="En Attente"
          value={formatNumber(overview.commandes_en_attente)}
          icon={BoxIcon}
          variant="warning"
        />

        <StatCard
          title="Annulées"
          value={formatNumber(overview.commandes_annulees)}
          icon={ExclamationTriangleIcon}
          variant="danger"
        />

        <StatCard
          title="Articles Vendus"
          value={formatNumber(overview.total_articles_vendus)}
          icon={BoxIcon}
          variant="success"
        />

        <StatCard
          title="Taux de Conversion"
          value={formatPercentage(overview.taux_conversion)}
          icon={TrendUpIcon}
          variant="info"
        />
      </div>

      {/* Popular Products */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">
              Produits Populaires
            </h2>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              Top 10
            </span>
          </div>
        </div>
        <div className="p-6">
          {popular_products && popular_products.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rang
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produit
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantité
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenus
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {popular_products.map(
                    (product: PopularProduct, index: number) => (
                      <tr key={product.article_id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-sm font-bold text-gray-900">
                            #{index + 1}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">
                            {product.article_nom}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.categorie}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <div className="text-sm text-gray-900">
                            {formatNumber(product.quantite_vendue)} vendus
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.nombre_commandes} commandes
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(product.revenus_total)}
                          </span>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <BoxIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Aucun produit vendu
              </h3>
            </div>
          )}
        </div>
      </div>

      {/* Sales by Category and Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Category */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Ventes par Catégorie
            </h2>
          </div>
          <div className="p-6">
            {by_category && by_category.length > 0 ? (
              <div className="space-y-4">
                {by_category.map((category: SalesByCategory) => (
                  <div
                    key={category.categorie_id}
                    className="border-l-4 border-blue-500 pl-4 py-2 hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {category.categorie_nom}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {formatNumber(category.total_articles_vendus)}{" "}
                          articles • {category.nombre_commandes} commandes
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(category.revenus_total)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatPercentage(category.pourcentage_revenus)} du
                          total
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BoxIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Aucune catégorie
                </h3>
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Alertes Stock</h2>
              {low_stock && low_stock.length > 0 && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  <WarningTriangleIcon className="h-4 w-4 mr-1" />
                  {low_stock.length} alerte(s)
                </span>
              )}
            </div>
          </div>
          <div className="p-6">
            {low_stock && low_stock.length > 0 ? (
              <div className="space-y-4">
                {low_stock.map((item: LowStockAlert) => {
                  const colors = getStockStatusColor(item.statut);
                  return (
                    <div
                      key={`${item.article_id}-${item.taille}`}
                      className="border-l-4 border-red-500 pl-4 py-2 hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {item.article_nom}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            Taille: {item.taille}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-900">
                            <strong>
                              {formatNumber(item.quantite_disponible)}
                            </strong>{" "}
                            / {formatNumber(item.quantite_minimum)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            disponible / minimum
                          </div>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text} mt-2`}
                          >
                            {getStockStatusLabel(item.statut)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <BoxIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Aucune alerte
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Tous les articles ont un stock suffisant.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Store Statistics Component (Charts and Trends) */}
      <StoreStats data={data} />
    </div>
  );
};
