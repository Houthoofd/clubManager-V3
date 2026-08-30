import { useTranslation } from "react-i18next";
import { FunnelIcon } from "@heroicons/react/24/outline";
import { Input } from "../../../shared/components/Input/Input";
import { Button } from "../../../shared/components/Button/Button";
import { ReservationStatut } from "./types";

interface Props {
  isAdmin: boolean;
  filterStatut: ReservationStatut | "";
  setFilterStatut: (val: ReservationStatut | "") => void;
  filterCoursId: string;
  setFilterCoursId: (val: string) => void;
  filterUserId: string;
  setFilterUserId: (val: string) => void;
}

export function ReservationsFilterBar({
  isAdmin,
  filterStatut,
  setFilterStatut,
  filterCoursId,
  setFilterCoursId,
  filterUserId,
  setFilterUserId,
}: Props) {
  const { t } = useTranslation("reservations");

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex flex-col sm:flex-row gap-3 items-end">
        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
          <FunnelIcon className="h-4 w-4" />
          {t("filters.title")}
        </div>

        {/* Status filter */}
        <div className="flex-1 max-w-[180px]">
          <label className="block text-xs text-gray-500 mb-1">
            {t("filters.status")}
          </label>
          <select
            value={filterStatut}
            onChange={(e) =>
              setFilterStatut(e.target.value as ReservationStatut | "")
            }
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t("status.all")}</option>
            <option value="confirmee">{t("status.confirmee")}</option>
            <option value="en_attente">{t("status.en_attente")}</option>
            <option value="annulee">{t("status.annulee")}</option>
          </select>
        </div>

        {/* Course ID filter */}
        <div className="flex-1 max-w-[160px]">
          <label className="block text-xs text-gray-500 mb-1">
            {t("filters.courseId")}
          </label>
          <Input
            type="number"
            value={filterCoursId}
            onChange={(e) => setFilterCoursId(e.target.value)}
            placeholder={t("placeholders.searchCourse")}
          />
        </div>

        {/* User ID filter (admin only) */}
        {isAdmin && (
          <div className="flex-1 max-w-[160px]">
            <label className="block text-xs text-gray-500 mb-1">
              {t("filters.userId")}
            </label>
            <Input
              type="number"
              value={filterUserId}
              onChange={(e) => setFilterUserId(e.target.value)}
              placeholder={t("placeholders.searchUser")}
            />
          </div>
        )}

        {/* Clear filters */}
        {(filterStatut || filterCoursId || filterUserId) && (
          <Button
            variant="ghost"
            size="sm"
            data-testid="btn-clear-filters"
            onClick={() => {
              setFilterStatut("");
              setFilterCoursId("");
              setFilterUserId("");
            }}
          >
            {t("filters.clear")}
          </Button>
        )}
      </div>
    </div>
  );
}
