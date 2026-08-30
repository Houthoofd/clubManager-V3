import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  CalendarDaysIcon,
  PlusIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { PageHeader } from "../../../shared/components/Layout/PageHeader";
import { DataTable } from "../../../shared/components/Table/DataTable";
import { PaginationBar } from "../../../shared/components/Navigation/PaginationBar";
import { Button } from "../../../shared/components/Button/Button";
import { ConfirmDialog } from "../../../shared/components/Modal/ConfirmDialog";
import { useAuthStore } from "../../../shared/stores/authStore";
import { UserRole } from "@clubmanager/types";
import {
  useReservationsList,
  useMyReservations,
  useCancelReservation,
} from "../hooks/useReservations";
import type { GetReservationsParams } from "../api/reservationsApi";
import { ReservationDto, ReservationStatut, ModalState } from "./types";
import { StatusBadge } from "./StatusBadge";
import { ReservationsFilterBar } from "./ReservationsFilterBar";
import { ReservationCreateModal } from "./ReservationCreateModal";

export function ReservationsPage() {
  const { t } = useTranslation("reservations");
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role_app === UserRole.ADMIN;
  const isPrivileged =
    user?.role_app === UserRole.ADMIN || user?.role_app === UserRole.PROFESSOR;

  // ── Pagination & filters ──────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [filterStatut, setFilterStatut] = useState<ReservationStatut | "">("");
  const [filterCoursId, setFilterCoursId] = useState("");
  const [filterUserId, setFilterUserId] = useState("");
  const [params, setParams] = useState<GetReservationsParams>({
    page: 1,
    limit: 20,
  });

  // ── Sync filters → params (debounced 400ms) ────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setParams({
        page: 1,
        limit: 20,
        statut: filterStatut || undefined,
        cours_id: filterCoursId
          ? parseInt(filterCoursId, 10) || undefined
          : undefined,
        user_id: filterUserId
          ? parseInt(filterUserId, 10) || undefined
          : undefined,
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [filterStatut, filterCoursId, filterUserId]);

  // ── Modal state ───────────────────────────────────────────────────────────
  const [modal, setModal] = useState<ModalState>({ type: "none" });
  const closeModal = () => setModal({ type: "none" });

  // ── React Query ───────────────────────────────────────────────────────────
  const adminQuery = useReservationsList(isPrivileged ? params : undefined);
  const memberQuery = useMyReservations(
    !isPrivileged ? { page, limit: 20 } : undefined,
  );

  const activeQuery = isPrivileged ? adminQuery : memberQuery;
  const reservations = (activeQuery.data?.reservations ??
    []) as ReservationDto[];
  const pagination = activeQuery.data?.pagination ?? {
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  };
  const isLoading = activeQuery.isLoading;

  const cancelMutation = useCancelReservation();

  // ── Submit cancel ─────────────────────────────────────────────────────────
  const handleCancel = () => {
    if (modal.type !== "cancel") return;
    cancelMutation.mutate(modal.reservation.id, {
      onSuccess: () => {
        toast.success(t("messages.success.cancelled"));
        closeModal();
      },
      onError: (e: any) =>
        toast.error(
          e?.response?.data?.message ?? t("messages.error.cancelError"),
        ),
    });
  };

  // ── DataTable columns ─────────────────────────────────────────────────────
  const columns = [
    {
      key: "id",
      label: t("fields.id"),
      render: (_: any, row: ReservationDto) => (
        <span className="font-mono text-xs text-gray-500">#{row.id}</span>
      ),
    },
    {
      key: "course",
      label: t("fields.course"),
      render: (_: any, row: ReservationDto) => (
        <div>
          <p className="text-sm font-medium text-gray-900">
            {row.cours_type ?? `Cours #${row.cours_id}`}
          </p>
          {row.cours_date && (
            <p className="text-xs text-gray-500">
              {new Date(row.cours_date).toLocaleDateString()}
              {row.cours_heure_debut && ` — ${row.cours_heure_debut}`}
              {row.cours_heure_fin && ` → ${row.cours_heure_fin}`}
            </p>
          )}
        </div>
      ),
    },
    ...(isPrivileged
      ? [
          {
            key: "member",
            label: t("fields.member"),
            render: (_: any, row: ReservationDto) => (
              <div>
                <p className="text-sm text-gray-900">
                  {row.user_prenom && row.user_nom
                    ? `${row.user_prenom} ${row.user_nom}`
                    : `User #${row.user_id}`}
                </p>
                {row.user_email && (
                  <p className="text-xs text-gray-500">{row.user_email}</p>
                )}
              </div>
            ),
          },
        ]
      : []),
    {
      key: "statut",
      label: t("fields.status"),
      render: (_: any, row: ReservationDto) => (
        <StatusBadge statut={row.statut} />
      ),
    },
    {
      key: "created_at",
      label: t("fields.createdAt"),
      render: (_: any, row: ReservationDto) => (
        <span className="text-sm text-gray-500">
          {new Date(row.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (_: any, row: ReservationDto) =>
        row.statut !== "annulee" ? (
          <div className="flex justify-end">
            <button
              onClick={() => setModal({ type: "cancel", reservation: row })}
              data-testid={`btn-cancel-reservation-${row.id}`}
              className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title={t("aria.cancelReservation", { id: row.id })}
            >
              <XCircleIcon className="h-4 w-4" />
            </button>
          </div>
        ) : null,
    },
  ];

  // ── JSX ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6" data-testid="reservations-page">
      <PageHeader
        icon={<CalendarDaysIcon className="h-8 w-8 text-blue-600" />}
        title={isPrivileged ? t("page.title") : t("page.myTitle")}
        description={
          isPrivileged ? t("page.description") : t("page.myDescription")
        }
        actions={
          isAdmin ? (
            <Button
              variant="primary"
              icon={<PlusIcon className="h-4 w-4" />}
              onClick={() => setModal({ type: "create" })}
              data-testid="btn-create-reservation"
            >
              {t("actions.create")}
            </Button>
          ) : undefined
        }
      />

      {isPrivileged && (
        <ReservationsFilterBar
          isAdmin={isAdmin}
          filterStatut={filterStatut}
          setFilterStatut={setFilterStatut}
          filterCoursId={filterCoursId}
          setFilterCoursId={setFilterCoursId}
          filterUserId={filterUserId}
          setFilterUserId={setFilterUserId}
        />
      )}

      <div data-testid="reservations-table">
        <DataTable
          columns={columns}
          data={reservations}
          rowKey="id"
          loading={isLoading}
          emptyMessage={t("messages.empty.noReservations")}
        />
      </div>

      {!isLoading && pagination.totalPages > 1 && (
        <PaginationBar
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={(p) => {
            setPage(p);
            setParams((prev) => ({ ...prev, page: p }));
          }}
          showResultsCount
          total={pagination.total}
          pageSize={pagination.limit}
        />
      )}

      <ReservationCreateModal
        isOpen={modal.type === "create"}
        onClose={closeModal}
        isAdmin={isAdmin}
      />

      <ConfirmDialog
        isOpen={modal.type === "cancel"}
        onClose={closeModal}
        onConfirm={handleCancel}
        title={t("modal.cancelTitle")}
        message={
          modal.type === "cancel"
            ? t("messages.confirm.cancelMessage", {
                id: modal.reservation.id,
              })
            : ""
        }
        variant="danger"
        confirmLabel={t("actions.cancelReservation")}
        cancelLabel={t("actions.close")}
        isLoading={cancelMutation.isPending}
      />
    </div>
  );
}

export default ReservationsPage;
