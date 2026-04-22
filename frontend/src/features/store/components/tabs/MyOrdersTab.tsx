/**
 * MyOrdersTab
 * Onglet permettant aux membres de consulter leurs commandes.
 *
 * Fonctionnalités :
 * - Affichage de la liste des commandes de l'utilisateur
 * - Filtrage par statut (en attente, livrées)
 * - Consultation des détails d'une commande
 * - Annulation des commandes en attente
 *
 * MIGRATION : Utilise les composants réutilisables de la bibliothèque shared
 * - Badge pour les compteurs
 * - AlertBanner pour les erreurs
 * - LoadingSpinner et EmptyState pour le feedback
 */

import { Badge } from "../../../../shared/components/Badge/Badge";
import { AlertBanner } from "../../../../shared/components/Feedback/AlertBanner";
import { LoadingSpinner } from "../../../../shared/components/Layout/LoadingSpinner";
import { EmptyState } from "../../../../shared/components/Layout/EmptyState";
import { useMyOrders, useUpdateOrderStatus } from "../../hooks/useStore";
import { useStoreUI } from "../../stores/storeStore";
import { OrderDetailModal, OrderStatusBadge } from "../";
import { getErrorMessage, formatCurrency, formatDateTime } from "../../../../shared/utils";

export function MyOrdersTab() {
  const store = useStoreUI();
  const ordersQuery = useMyOrders();
  const updateOrderStatusMutation = useUpdateOrderStatus();

  const enAttenteCount =
    ordersQuery.data?.filter((order) => order.statut === "en_attente").length ??
    0;
  const livreeCount =
    ordersQuery.data?.filter((order) => order.statut === "livree").length ?? 0;

  return (
    <div>
      {/* En-tête de l'onglet */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b border-gray-50">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-base font-semibold text-gray-900">
            Mes commandes
          </h2>
          <Badge variant="info">
            {ordersQuery.data?.length ?? 0} commande
            {(ordersQuery.data?.length ?? 0) > 1 ? "s" : ""}
          </Badge>
          {enAttenteCount > 0 && (
            <Badge variant="orange">{enAttenteCount} en attente</Badge>
          )}
          {livreeCount > 0 && (
            <Badge variant="success">
              {livreeCount} livrée{livreeCount > 1 ? "s" : ""}
            </Badge>
          )}
        </div>
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
          !ordersQuery.data?.length && (
            <EmptyState
              title="Aucune commande"
              description="Vous n'avez pas encore passé de commande."
              variant="dashed"
            />
          )}

        {ordersQuery.data && ordersQuery.data.length > 0 && (
          <div className="space-y-4">
            {ordersQuery.data.map((order) => (
              <article
                key={order.id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      Commande #{order.numero_commande || order.id}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {formatDateTime(order.date_commande)}
                    </p>
                  </div>
                  <OrderStatusBadge statut={order.statut} />
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                  <span className="text-lg font-semibold text-gray-900">
                    {formatCurrency(order.total)}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => store.openOrderDetailModal(order as any)}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                    >
                      Voir les détails
                    </button>
                    {order.statut === "en_attente" && (
                      <button
                        onClick={async () => {
                          if (
                            window.confirm(
                              "Êtes-vous sûr de vouloir annuler cette commande ?",
                            )
                          ) {
                            await updateOrderStatusMutation.mutateAsync({
                              id: order.id,
                              statut: "annulee",
                            });
                          }
                        }}
                        className="rounded-lg border border-red-600 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Modal détails commande */}
      {store.selectedOrder && (
        <OrderDetailModal
          isOpen={store.orderDetailModalOpen}
          onClose={store.closeOrderDetailModal}
          order={store.selectedOrder}
          canManage={false}
          onUpdateStatus={async (id, statut) => {
            await updateOrderStatusMutation.mutateAsync({ id, statut });
            store.closeOrderDetailModal();
          }}
        />
      )}
    </div>
  );
}
