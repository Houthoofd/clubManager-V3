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
import { getErrorMessage, formatCurrency, formatDateTime } from "../../../../shared/utils";

export function OrdersTab() {
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
            Suivi des commandes
          </h2>
          <Badge variant="info">
            {ordersQuery.data?.pagination.total ?? 0} commande
            {(ordersQuery.data?.pagination.total ?? 0) > 1 ? "s" : ""}
          </Badge>
          {enAttenteCount > 0 && (
            <Badge variant="orange">{enAttenteCount} en attente</Badge>
          )}
          {annuleeCount > 0 && (
            <Badge variant="danger">
              {annuleeCount} annulée{annuleeCount > 1 ? "s" : ""}
            </Badge>
          )}
        </div>
      </div>

      {/* Filtres - MIGRATION : SelectField */}
      <div className="p-4 border-b border-gray-50">
        <SelectField
          id="order-status-filter"
          label=""
          placeholder="Tous les statuts"
          options={[
            { value: "en_attente", label: "En attente" },
            { value: "payee", label: "Payée" },
            { value: "expediee", label: "Expédiée" },
            { value: "livree", label: "Livrée" },
            { value: "annulee", label: "Annulée" },
          ]}
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

        {ordersQuery.isLoading && <LoadingSpinner text="Chargement..." />}

        {!ordersQuery.isLoading &&
          !ordersQuery.isError &&
          !ordersQuery.data?.items.length && (
            <EmptyState
              title="Aucune commande trouvée"
              description="Les commandes passées apparaîtront ici."
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
                        Commande
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Membre
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Total
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Statut
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Actions
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
                            : (order.user_email ?? "Utilisateur inconnu")}
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
                              Détails
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
                                  Confirmer
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
                                  Annuler
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
                                Expédier
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
                                Marquer livrée
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
