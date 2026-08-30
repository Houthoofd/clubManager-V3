import { useTranslation } from "react-i18next";
import { formatCurrency } from "../../statistics/utils/formatting";
import type { OrderWithItems } from "../api/storeApi";

interface OrderDetailItemsTableProps {
  items: OrderWithItems["items"];
  total: number;
}

export const OrderDetailItemsTable: React.FC<OrderDetailItemsTableProps> = ({
  items,
  total,
}) => {
  const { t } = useTranslation("store");

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {t("orderDetailModal.items.article")}
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {t("orderDetailModal.items.size")}
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {t("orderDetailModal.items.quantity")}
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {t("orderDetailModal.items.unitPrice")}
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {t("orderDetailModal.items.subtotal")}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((item) => (
            <tr key={item.id}>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center">
                  {item.article_image_url && (
                    <img
                      src={item.article_image_url}
                      alt={item.article_nom || t("orderDetailModal.items.altFallback")}
                      className="h-10 w-10 rounded object-cover mr-3"
                    />
                  )}
                  <span className="text-sm font-medium text-gray-900">
                    {item.article_nom || t("orderDetailModal.items.unknown")}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                {item.taille_nom || t("orderDetailModal.items.unknownSize")}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                {item.quantite}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                {formatCurrency(item.prix)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                {formatCurrency(item.prix * item.quantite)}
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
              {t("orderDetailModal.items.total")}
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-right text-lg font-bold text-blue-600">
              {formatCurrency(total)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
