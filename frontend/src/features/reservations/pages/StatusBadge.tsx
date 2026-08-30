import { useTranslation } from "react-i18next";
import { ReservationStatut } from "./types";

export function StatusBadge({ statut }: { statut: ReservationStatut }) {
  const { t } = useTranslation("reservations");
  const config = {
    confirmee: {
      label: t("status.confirmee"),
      className: "bg-green-100 text-green-800",
    },
    annulee: {
      label: t("status.annulee"),
      className: "bg-red-100 text-red-800",
    },
    en_attente: {
      label: t("status.en_attente"),
      className: "bg-yellow-100 text-yellow-800",
    },
  }[statut] ?? { label: statut, className: "bg-gray-100 text-gray-800" };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
