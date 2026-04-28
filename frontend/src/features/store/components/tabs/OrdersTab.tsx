/**
 * OrdersTab
 * Onglet de gestion des commandes pour les administrateurs et professeurs.
 *
 * Fonctionnalités :
 * - Affichage de toutes les commandes avec pagination
 * - Filtrage par statut de commande
 * - Visualisation des détails de commande
 * - Modification du statut des commandes (confirmer, expédier, livrer, annuler)
 * - Statistiques en temps réel (commandes en attente, annulées)
 *
 * MIGRATION : Utilise les composants réutilisables de la bibliothèque shared
 * - SelectField pour les filtres
 * - PaginationBar pour la navigation
 * - Badge pour les compteurs
 * - AlertBanner pour les erreurs
 * - LoadingSpinner et EmptyState pour le feedback
 */

import { useTranslation } from "react-i18next";
import { useStatutsCommande } from "../../../../shared/hooks/useReferences";
import { Badge } from "../../../../shared/components/Badge/Badge";
import { AlertBanner } from "../../../../shared/components/Feedback/AlertBanner";
import { LoadingSpinner } from "../../../../shared/components/Layout/LoadingSpinner";
import { EmptyState } from "../../../../shared/components/Layout/EmptyState";
import { PaginationBar } from "../../../../shared/components/Navigation/PaginationBar";
import { SelectField } from "../../../../shared/components/Forms/SelectField";
import { useOrders, useUpdateOrderStatus } from "../../hooks/useStore";
import { useStoreUI } from "../../stores/storeStore";
import { OrderDetailModal } from "../";
import { OrderStatusBadge } from "../OrderStatusBadge";
import {
  getErrorMessage,
  formatCurrency,
  formatDateTime,
} from "../../../../shared/utils";

export function OrdersTab() {
  const { t, i18n } = useTranslation("store");
  const statutsQuery = useStatutsCommande();
  const store = useStoreUI();
  const ordersQuery = useOrders({
    page: store.orderPage,
    limit: 10,
    statut: store.orderStatusFilter || undefined,
  });

  const updateOrderStatusMutation = useUpdateOrderStatus();

  const enAttenteCount =
    ordersQuery.data?.items.filter((order) => order.statut === "en_attente")
      .length ?? 0;
  const annuleeCount =
    ordersQuery.data?.items.filter((order) => order.statut === "annulee")
      .length ?? 0;

  return (
    <div>
      {/* En-tête de l'onglet */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b border-gray-50">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-base font-semibold text-gray-900">
            {t("orders.title")}
          </h2>
          <Badge variant="info">
            {ordersQuery.data?.pagination.total ?? 0}{" "}
            {(ordersQuery.data?.pagination.total ?? 0) > 1
              ? t("orders.count.orders")
              : t("orders.count.order")}
          </Badge>
          {enAttenteCount > 0 && (
            <Badge variant="orange">
              {enAttenteCount} {t("orders.count.pending")}
            </Badge>
          )}
          {annuleeCount > 0 && (
            <Badge variant="danger">
              {annuleeCount}{" "}
              {annuleeCount > 1
                ? t("orders.count.cancelledPlural")
                : t("orders.count.cancelled")}
            </Badge>
          )}
        </div>
      </div>

      {/* Filtres - MIGRATION : SelectField */}
      <div className="p-4 border-b border-gray-50">
        <SelectField
          id="order-status-filter"
          label=""
          placeholder={t("orders.filters.allStatuses")}
          options={
            statutsQuery.length > 0
              ? statutsQuery.map((s) => ({
                  value: s.code,
                  label: i18n.language === "en" && s.nom_en ? s.nom_en : s.nom,
                }))
              : [
                  { value: "en_attente", label: t("orders.filters.pending") },
                  { value: "payee", label: t("orders.filters.paid") },
                  { value: "expediee", label: t("orders.filters.shipped") },
                  { value: "livree", label: t("orders.filters.delivered") },
                  { value: "annulee", label: t("orders.filters.cancelled") },
                ]
          }
          value={store.orderStatusFilter}
          onChange={(value) => store.setOrderStatusFilter(String(value))}
          className="[&>label]:hidden max-w-xs"
        />
      </div>

      {/* Contenu - MIGRATION : LoadingSpinner, ErrorBanner, EmptyState */}
      <div className="p-4">
        {ordersQuery.isError && (
          <AlertBanner
            variant="error"
            message={getErrorMessage(ordersQuery.error)}
          />
        )}

        {ordersQuery.isLoading && <LoadingSpinner text={t("common.loading")} />}

        {!ordersQuery.isLoading &&
          !ordersQuery.isError &&
          !ordersQuery.data?.items.length && (
            <EmptyState
              title={t("orders.empty.title")}
              description={t("orders.empty.description")}
              variant="dashed"
            />
          )}

        {ordersQuery.data?.items.length ? (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {t("orders.table.order")}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {t("orders.table.member")}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {t("orders.table.date")}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {t("orders.table.total")}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {t("orders.table.status")}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {t("orders.table.actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {ordersQuery.data.items.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          #{order.numero_commande || order.id}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {order.user_first_name || order.user_last_name
                            ? `${order.user_first_name ?? ""} ${order.user_last_name ?? ""}`.trim()
                            : (order.user_email ?? t("orders.unknownUser"))}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatDateTime(order.date_commande)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {formatCurrency(order.total)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <OrderStatusBadge statut={order.statut} />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                store.openOrderDetailModal(order as any)
                              }
                              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
                            >
                              {t("orders.actions.details")}
                            </button>
                            {order.statut === "en_attente" && (
                              <>
                                <button
                                  onClick={async () => {
                                    await updateOrderStatusMutation.mutateAsync(
                                      {
                                        id: order.id,
                                        statut: "payee",
                                      },
                                    );
                                  }}
                                  className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-green-700"
                                >
                                  {t("orders.actions.confirm")}
                                </button>
                                <button
                                  onClick={async () => {
                                    await updateOrderStatusMutation.mutateAsync(
                                      {
                                        id: order.id,
                                        statut: "annulee",
                                      },
                                    );
                                  }}
                                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-700"
                                >
                                  {t("orders.actions.cancel")}
                                </button>
                              </>
                            )}
                            {order.statut === "payee" && (
                              <button
                                onClick={async () => {
                                  await updateOrderStatusMutation.mutateAsync({
                                    id: order.id,
                                    statut: "expediee",
                                  });
                                }}
                                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
                              >
                                {t("orders.actions.ship")}
                              </button>
                            )}
                            {order.statut === "expediee" && (
                              <button
                                onClick={async () => {
                                  await updateOrderStatusMutation.mutateAsync({
                                    id: order.id,
                                    statut: "livree",
                                  });
                                }}
                                className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-green-700"
                              >
                                {t("orders.actions.markDelivered")}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <PaginationBar
              currentPage={ordersQuery.data.pagination.page}
              totalPages={ordersQuery.data.pagination.totalPages}
              onPageChange={store.setOrderPage}
              showResultsCount
              total={ordersQuery.data.pagination.total}
              pageSize={ordersQuery.data.pagination.limit || 10}
            />
          </div>
        ) : null}
      </div>

      {/* Modal détails commande */}
      {store.selectedOrder && (
        <OrderDetailModal
          isOpen={store.orderDetailModalOpen}
          onClose={store.closeOrderDetailModal}
          order={store.selectedOrder}
          canManage={true}
          onUpdateStatus={async (id, statut) => {
            await updateOrderStatusMutation.mutateAsync({ id, statut });
            store.closeOrderDetailModal();
          }}
        />
      )}
    </div>
  );
}
