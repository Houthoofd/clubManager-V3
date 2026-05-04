import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  CalendarDaysIcon,
  PlusIcon,
  XCircleIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { PageHeader } from "../../../shared/components/Layout/PageHeader";
import { DataTable } from "../../../shared/components/Table/DataTable";
import { PaginationBar } from "../../../shared/components/Navigation/PaginationBar";
import { Modal } from "../../../shared/components/Modal/Modal";
import { Button } from "../../../shared/components/Button/Button";
import { Input } from "../../../shared/components/Input/Input";
import { FormField } from "../../../shared/components/Forms/FormField";
import { ConfirmDialog } from "../../../shared/components/Modal/ConfirmDialog";
import { useAuthStore } from "../../../shared/stores/authStore";
import { UserRole } from "@clubmanager/types";
import {
  useReservationsList,
  useMyReservations,
  useCreateReservation,
  useCancelReservation,
} from "../hooks/useReservations";
import type { GetReservationsParams } from "../api/reservationsApi";

// ─── Domain Types (local — do NOT import from @clubmanager/types) ─────────────

type ReservationStatut = "confirmee" | "annulee" | "en_attente";

interface ReservationDto {
  id: number;
  user_id: number;
  cours_id: number;
  statut: ReservationStatut;
  created_at: string;
  updated_at: string;
  user_nom?: string;
  user_prenom?: string;
  user_email?: string;
  cours_date?: string;
  cours_type?: string;
  cours_heure_debut?: string;
  cours_heure_fin?: string;
}

// ─── Modal State Machine ──────────────────────────────────────────────────────

type ModalState =
  | { type: "none" }
  | { type: "create" }
  | { type: "cancel"; reservation: ReservationDto };

// ─── StatusBadge ──────────────────────────────────────────────────────────────

function StatusBadge({ statut }: { statut: ReservationStatut }) {
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

// ─── Component ────────────────────────────────────────────────────────────────

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

  // ── Create form state ─────────────────────────────────────────────────────
  const [formCoursId, setFormCoursId] = useState("");
  const [formUserId, setFormUserId] = useState("");
  const [formErrors, setFormErrors] = useState<{
    cours_id?: string;
    user_id?: string;
  }>({});

  // ── React Query ───────────────────────────────────────────────────────────
  // Both hooks are always called (React hooks rules).
  // One is disabled via `enabled: false` (undefined params) based on role.
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

  const createMutation = useCreateReservation();
  const cancelMutation = useCancelReservation();

  // ── Validate create form ──────────────────────────────────────────────────
  const validateCreateForm = () => {
    const errors: { cours_id?: string; user_id?: string } = {};
    if (!formCoursId.trim()) {
      errors.cours_id = t("validation.courseIdRequired");
    } else if (isNaN(parseInt(formCoursId, 10))) {
      errors.cours_id = t("validation.courseIdInvalid");
    }
    if (formUserId && isNaN(parseInt(formUserId, 10))) {
      errors.user_id = t("validation.userIdInvalid");
    }
    return errors;
  };

  // ── Submit create ─────────────────────────────────────────────────────────
  const handleCreate = () => {
    const errors = validateCreateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    const payload: { cours_id: number; user_id?: number } = {
      cours_id: parseInt(formCoursId, 10),
    };
    if (isAdmin && formUserId) payload.user_id = parseInt(formUserId, 10);
    createMutation.mutate(payload, {
      onSuccess: () => {
        toast.success(t("messages.success.created"));
        closeModal();
      },
      onError: (e: any) =>
        toast.error(
          e?.response?.data?.message ?? t("messages.error.createError"),
        ),
    });
  };

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

  // ── Open create modal ─────────────────────────────────────────────────────
  const openCreate = () => {
    setFormCoursId("");
    setFormUserId("");
    setFormErrors({});
    setModal({ type: "create" });
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
    // Show member column only for admin/prof
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
    <div className="space-y-6">
      {/* PageHeader */}
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
              onClick={openCreate}
            >
              {t("actions.create")}
            </Button>
          ) : undefined
        }
      />

      {/* Filter bar (admin/prof only) */}
      {isPrivileged && (
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
      )}

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={reservations}
        rowKey="id"
        loading={isLoading}
        emptyMessage={t("messages.empty.noReservations")}
      />

      {/* Pagination */}
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

      {/* ── Modal: Create ─────────────────────────────────────────────────── */}
      <Modal isOpen={modal.type === "create"} onClose={closeModal} size="md">
        <Modal.Header
          title={t("modal.createTitle")}
          subtitle={t("modal.createSubtitle")}
          showCloseButton
          onClose={closeModal}
        />
        <Modal.Body>
          <div className="space-y-4">
            <FormField
              id="res-cours-id"
              label={t("fields.course")}
              required
              error={formErrors.cours_id}
            >
              <Input
                id="res-cours-id"
                type="number"
                value={formCoursId}
                onChange={(e) => setFormCoursId(e.target.value)}
                placeholder={t("placeholders.courseId")}
                autoFocus
                error={formErrors.cours_id}
              />
            </FormField>

            {isAdmin && (
              <FormField
                id="res-user-id"
                label={t("fields.userId")}
                error={formErrors.user_id}
              >
                <Input
                  id="res-user-id"
                  type="number"
                  value={formUserId}
                  onChange={(e) => setFormUserId(e.target.value)}
                  placeholder={t("placeholders.userId")}
                  error={formErrors.user_id}
                />
              </FormField>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer align="right">
          <Button
            variant="outline"
            onClick={closeModal}
            disabled={createMutation.isPending}
          >
            {t("actions.cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={handleCreate}
            loading={createMutation.isPending}
          >
            {t("actions.confirm")}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── ConfirmDialog: Cancel ──────────────────────────────────────────── */}
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
