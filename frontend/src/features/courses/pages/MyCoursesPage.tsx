/**
 * MyCoursesPage
 * Page vue membre : historique de ses inscriptions et présences aux cours.
 */

import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { PageHeader } from "../../../shared/components/Layout/PageHeader";
import { DataTable } from "../../../shared/components/Table/DataTable";
import { useCourses } from "../hooks/useCourses";
import type { MyEnrollmentDto } from "../api/coursesApi";

// ─── Presence Badge ───────────────────────────────────────────────────────────

function PresenceBadge({ presence }: { presence: boolean | null }) {
  const { t } = useTranslation("courses");

  if (presence === null)
    return (
      <span className="inline-flex items-center gap-1 text-xs text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded-full">
        <ClockIcon className="h-3 w-3" />
        {t("myCourses.presence.pending")}
      </span>
    );

  if (presence)
    return (
      <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
        <CheckCircleIcon className="h-3 w-3" />
        {t("myCourses.presence.present")}
      </span>
    );

  return (
    <span className="inline-flex items-center gap-1 text-xs text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
      <XCircleIcon className="h-3 w-3" />
      {t("myCourses.presence.absent")}
    </span>
  );
}

// ─── Page Component ───────────────────────────────────────────────────────────

export function MyCoursesPage() {
  const { t } = useTranslation("courses");
  const {
    myEnrollments,
    myEnrollmentsLoading,
    deleteInscription,
    deleteInscriptionLoading,
  } = useCourses();

  // Format "HH:MM:SS" → "HH:MM"
  const formatTime = (time: string) => time?.slice(0, 5) ?? "—";

  const columns = [
    {
      key: "date_cours",
      label: t("myCourses.columns.date"),
      render: (_: unknown, row: MyEnrollmentDto) => (
        <span className="text-sm font-medium text-gray-900">
          {new Date(row.date_cours).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "type_cours",
      label: t("myCourses.columns.type"),
      render: (_: unknown, row: MyEnrollmentDto) => (
        <span className="text-sm text-gray-700">{row.type_cours}</span>
      ),
    },
    {
      key: "horaire",
      label: t("myCourses.columns.time"),
      render: (_: unknown, row: MyEnrollmentDto) => (
        <span className="text-sm text-gray-500">
          {formatTime(row.heure_debut)} → {formatTime(row.heure_fin)}
        </span>
      ),
    },
    {
      key: "presence",
      label: t("myCourses.columns.presence"),
      render: (_: unknown, row: MyEnrollmentDto) => (
        <PresenceBadge presence={row.presence} />
      ),
    },
    {
      key: "status_nom",
      label: t("myCourses.columns.status"),
      render: (_: unknown, row: MyEnrollmentDto) => (
        <span className="text-sm text-gray-500">{row.status_nom ?? "—"}</span>
      ),
    },
    {
      key: "actions",
      label: t("myCourses.columns.actions"),
      render: (_: unknown, row: MyEnrollmentDto) => (
        <button
          onClick={async () => {
            try {
              await deleteInscription(row.inscription_id);
              toast.success(t("myCourses.unsubscribeSuccess"));
            } catch {
              toast.error(t("myCourses.unsubscribeError"));
            }
          }}
          disabled={deleteInscriptionLoading}
          data-testid={`course-unsubscribe-btn-${row.inscription_id}`}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <TrashIcon className="h-3.5 w-3.5" />
          {t("myCourses.unsubscribe")}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6" data-testid="my-courses-page">
      <PageHeader
        icon={<CalendarDaysIcon className="h-8 w-8 text-blue-600" />}
        title={t("myCourses.title")}
        description={t("myCourses.description")}
      />
      <div data-testid="my-courses-table">
        <DataTable
          columns={columns}
          data={myEnrollments}
          rowKey="inscription_id"
          loading={myEnrollmentsLoading}
          emptyMessage={t("myCourses.empty")}
        />
      </div>
    </div>
  );
}

export default MyCoursesPage;
