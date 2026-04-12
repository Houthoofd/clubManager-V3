/**
 * OrderDetailModal
 * Modal pour afficher les détails d'une commande (lecture seule).
 * Avec actions admin optionnelles pour changer le statut.
 */

import { useEffect, useState } from "react";
import type { OrderWithItems } from "../api/storeApi";
import { OrderStatusBadge } from "./OrderStatusBadge";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderWithItems;
  onUpdateStatus?: (id: number, statut: string) => Promise<void>;
  canManage: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SpinnerIcon() {
  return (
    <svg
      className="animate-spin h-4 w-4 text-white"
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
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

// ─── Composant ────────────────────────────────────────────────────────────────

/**
 * OrderDetailModal — Affiche les détails d'une commande.
 *
 * Mode lecture seule avec actions admin optionnelles pour gérer le statut.
 */
export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  isOpen,
  onClose,
  order,
  onUpdateStatus,
  canManage,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);

  // ── Fermeture sur Escape ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isUpdating) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isUpdating, onClose]);

  // ── Bloquer le scroll du body ─────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // ── Gestion du changement de statut ───────────────────────────────────────
  const handleStatusChange = async (newStatus: string) => {
    if (!onUpdateStatus) return;
    setIsUpdating(true);
    try {
      await onUpdateStatus(order.id, newStatus);
      onClose();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isOpen) return null;

  // Calcul du total
  const total = order.items.reduce(
    (sum, item) => sum + item.prix * item.quantite,
    0,
  );

  // Vérifier si on peut afficher certains boutons selon le statut
  const canMarkAsPaid = order.statut === "en_attente";
  const canMarkAsShipped = order.statut === "payee";
  const canMarkAsDelivered = order.statut === "expediee";
  const canCancel = order.statut !== "annulee" && order.statut !== "livree";

  // Nom complet du client
  const clientName =
    order.user_first_name && order.user_last_name
      ? `${order.user_first_name} ${order.user_last_name}`
      : "Client inconnu";

  // ── Rendu ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-detail-title"
      onClick={() => {
        if (!isUpdating) onClose();
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── En-tête ── */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2
                id="order-detail-title"
                className="text-xl font-semibold text-gray-900"
              >
                Détails de la commande
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {order.numero_commande}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (!isUpdating) onClose();
              }}
              disabled={isUpdating}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100
                         transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Fermer"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Contenu ── */}
        <div className="px-6 py-5 space-y-6">
          {/* Informations générales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Statut</p>
              <OrderStatusBadge statut={order.statut} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                Date de commande
              </p>
              <p className="text-sm text-gray-900">
                {formatDate(order.date_commande)}
              </p>
            </div>
          </div>

          {/* Informations client */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Informations client
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div>
                <p className="text-sm font-medium text-gray-500">Nom</p>
                <p className="text-sm text-gray-900">{clientName}</p>
              </div>
              {order.user_email && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-sm text-gray-900">{order.user_email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Articles commandés */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Articles commandés
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Article
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Taille
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Quantité
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Prix unitaire
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Sous-total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          {item.article_image_url && (
                            <img
                              src={item.article_image_url}
                              alt={item.article_nom || "Article"}
                              className="h-10 w-10 rounded object-cover mr-3"
                            />
                          )}
                          <span className="text-sm font-medium text-gray-900">
                            {item.article_nom || "Article inconnu"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {item.taille_nom || "—"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                        {item.quantite}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                        {item.prix.toFixed(2)} €
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                        {(item.prix * item.quantite).toFixed(2)} €
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-3 text-right text-sm font-semibold text-gray-900"
                    >
                      Total
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-lg font-bold text-blue-600">
                      {total.toFixed(2)} €
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Actions admin */}
          {canManage && onUpdateStatus && (
            <div className="border-t border-gray-200 pt-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Actions administrateur
              </h3>
              <div className="flex flex-wrap gap-2">
                {canMarkAsPaid && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange("payee")}
                    disabled={isUpdating}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white
                               bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-sm
                               transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isUpdating && <SpinnerIcon />}
                    Marquer comme payée
                  </button>
                )}
                {canMarkAsShipped && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange("expediee")}
                    disabled={isUpdating}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white
                               bg-purple-600 hover:bg-purple-700 active:bg-purple-800 rounded-lg shadow-sm
                               transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isUpdating && <SpinnerIcon />}
                    Marquer comme expédiée
                  </button>
                )}
                {canMarkAsDelivered && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange("livree")}
                    disabled={isUpdating}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white
                               bg-green-600 hover:bg-green-700 active:bg-green-800 rounded-lg shadow-sm
                               transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isUpdating && <SpinnerIcon />}
                    Marquer comme livrée
                  </button>
                )}
                {canCancel && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange("annulee")}
                    disabled={isUpdating}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white
                               bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-lg shadow-sm
                               transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isUpdating && <SpinnerIcon />}
                    Annuler la commande
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Footer / Fermer ── */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-2xl">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                if (!isUpdating) onClose();
              }}
              disabled={isUpdating}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300
                         hover:bg-gray-50 active:bg-gray-100 rounded-lg transition-colors
                         disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
