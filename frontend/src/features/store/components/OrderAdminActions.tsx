import { useTranslation } from "react-i18next";
import { BUTTON, cn } from "@/shared/styles/designTokens";
import type { OrderWithItems } from "../api/storeApi";
import { getTransitionBtnClass } from "./orderUtils";
import { SpinnerIcon } from "./SpinnerIcon";

interface OrderAdminActionsProps {
  order: OrderWithItems;
  isUpdating: boolean;
  onStatusChange: (status: string) => void;
  dynamicTransitions: any[] | null;
}

export const OrderAdminActions: React.FC<OrderAdminActionsProps> = ({
  order,
  isUpdating,
  onStatusChange,
  dynamicTransitions,
}) => {
  const { t } = useTranslation("store");

  const canMarkAsPaid = order.statut === "en_attente";
  const canMarkAsShipped = order.statut === "payee";
  const canMarkAsDelivered = order.statut === "expediee";
  const canCancel = order.statut !== "annulee" && order.statut !== "livree";

  return (
    <div className="flex flex-wrap gap-2">
      {dynamicTransitions && dynamicTransitions.length > 0 ? (
        dynamicTransitions.map((targetStatut) => (
          <button
            key={targetStatut.code}
            type="button"
            onClick={() => onStatusChange(targetStatut.code)}
            disabled={isUpdating}
            className={cn(
              BUTTON.base,
              getTransitionBtnClass(targetStatut.couleur),
              BUTTON.size.md,
            )}
          >
            {isUpdating && (
              <span className="mr-2">
                <SpinnerIcon />
              </span>
            )}
            {targetStatut.nom}
          </button>
        ))
      ) : (
        <>
          {canMarkAsPaid && (
            <button
              type="button"
              onClick={() => onStatusChange("payee")}
              disabled={isUpdating}
              className={cn(BUTTON.base, BUTTON.variant.primary, BUTTON.size.md)}
            >
              {isUpdating && (
                <span className="mr-2">
                  <SpinnerIcon />
                </span>
              )}
              {t("orderDetailModal.admin.markAsPaid")}
            </button>
          )}
          {canMarkAsShipped && (
            <button
              type="button"
              onClick={() => onStatusChange("expediee")}
              disabled={isUpdating}
              className={cn(
                BUTTON.base,
                "text-white bg-purple-600 hover:bg-purple-700 focus:ring-purple-500 shadow-sm",
                BUTTON.size.md,
              )}
            >
              {isUpdating && (
                <span className="mr-2">
                  <SpinnerIcon />
                </span>
              )}
              {t("orderDetailModal.admin.markAsShipped")}
            </button>
          )}
          {canMarkAsDelivered && (
            <button
              type="button"
              onClick={() => onStatusChange("livree")}
              disabled={isUpdating}
              className={cn(BUTTON.base, BUTTON.variant.success, BUTTON.size.md)}
            >
              {isUpdating && (
                <span className="mr-2">
                  <SpinnerIcon />
                </span>
              )}
              {t("orderDetailModal.admin.markAsDelivered")}
            </button>
          )}
          {canCancel && (
            <button
              type="button"
              onClick={() => onStatusChange("annulee")}
              disabled={isUpdating}
              className={cn(BUTTON.base, BUTTON.variant.danger, BUTTON.size.md)}
            >
              {isUpdating && (
                <span className="mr-2">
                  <SpinnerIcon />
                </span>
              )}
              {t("orderDetailModal.admin.cancelOrder")}
            </button>
          )}
        </>
      )}
    </div>
  );
};
