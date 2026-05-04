/**
 * DeletedUsersPage
 * Page d'administration : liste des utilisateurs supprimés (soft delete)
 * avec actions de restauration et d'anonymisation RGPD.
 *
 * Accessible uniquement aux administrateurs via /users/deleted
 */

import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  TrashIcon,
  ArrowUturnLeftIcon,
  ArrowLeftIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ShieldExclamationIcon,
} from "@heroicons/react/24/outline";

import { PageHeader } from "@/shared/components/Layout/PageHeader";
import { DataTable } from "@/shared/components/Table/DataTable";
import { Modal } from "@/shared/components/Modal/Modal";
import { Button } from "@/shared/components/Button/Button";
import { SubmitButton } from "@/shared/components/Button/SubmitButton";
import { UserRoleBadge } from "../components/UserRoleBadge";

import { getDeletedUsers, restoreUser, anonymizeUser } from "../api/usersApi";
import type { DeletedUserDto } from "../api/usersApi";

// ─── Composant ────────────────────────────────────────────────────────────────

export function DeletedUsersPage() {
  const { t } = useTranslation("users");
  const navigate = useNavigate();

  // ── État ──────────────────────────────────────────────────────────────────
  const [users, setUsers] = useState<DeletedUserDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmUser, setConfirmUser] = useState<DeletedUserDto | null>(null);

  // ── Chargement des utilisateurs supprimés ─────────────────────────────────
  const fetchDeleted = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getDeletedUsers();
      setUsers(data);
    } catch (err: any) {
      toast.error(t("deleted.loadError"), {
        description: err?.response?.data?.message ?? err?.message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchDeleted();
  }, [fetchDeleted]);

  // ── Restaurer un utilisateur ──────────────────────────────────────────────
  const handleRestore = async (user: DeletedUserDto) => {
    try {
      await restoreUser(user.id);
      toast.success(t("deleted.userRestored"), {
        description: `${user.first_name} ${user.last_name}`,
      });
      await fetchDeleted();
    } catch (err: any) {
      toast.error(t("common:messages.error"), {
        description: err?.response?.data?.message ?? err?.message,
      });
    }
  };

  // ── Anonymiser un utilisateur (RGPD) ──────────────────────────────────────
  const handleAnonymizeConfirm = async () => {
    if (!confirmUser) return;
    setIsSubmitting(true);
    try {
      await anonymizeUser(confirmUser.id);
      toast.success(t("deleted.userAnonymized"), {
        description: `${confirmUser.first_name} ${confirmUser.last_name}`,
      });
      setConfirmUser(null);
      await fetchDeleted();
    } catch (err: any) {
      toast.error(t("common:messages.error"), {
        description: err?.response?.data?.message ?? err?.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Formatage de date ─────────────────────────────────────────────────────
  const formatDate = (iso: string) => {
    try {
      return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  // ── Colonnes de la table ──────────────────────────────────────────────────
  const columns = [
    {
      key: "name",
      label: t("firstName"),
      render: (_: any, row: DeletedUserDto) => (
        <div>
          <p className="font-medium text-gray-900">
            {row.first_name} {row.last_name}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{row.email}</p>
        </div>
      ),
    },
    {
      key: "role",
      label: t("role"),
      render: (_: any, row: DeletedUserDto) => (
        <UserRoleBadge role={row.role_app} />
      ),
    },
    {
      key: "deleted_at",
      label: t("deleted.deletedAt"),
      render: (_: any, row: DeletedUserDto) => (
        <span className="text-sm text-gray-600 whitespace-nowrap">
          {formatDate(row.deleted_at)}
        </span>
      ),
    },
    {
      key: "deletion_reason",
      label: t("deleted.deletionReason"),
      render: (_: any, row: DeletedUserDto) =>
        row.deletion_reason ? (
          <span className="text-sm text-gray-600 max-w-xs truncate block">
            {row.deletion_reason}
          </span>
        ) : (
          <span className="text-sm text-gray-400 italic">—</span>
        ),
    },
    {
      key: "actions",
      label: "",
      render: (_: any, row: DeletedUserDto) => (
        <div className="flex items-center gap-2 justify-end">
          {/* Restaurer */}
          <button
            type="button"
            onClick={() => handleRestore(row)}
            title={t("deleted.restore")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-green-200
                       bg-green-50 text-green-700 text-xs font-medium
                       hover:bg-green-100 hover:border-green-300 transition-colors"
          >
            <ArrowUturnLeftIcon className="h-3.5 w-3.5" />
            <span>{t("deleted.restore")}</span>
          </button>

          {/* Anonymiser (RGPD) */}
          <button
            type="button"
            onClick={() => setConfirmUser(row)}
            title={t("deleted.anonymize")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200
                       bg-red-50 text-red-700 text-xs font-medium
                       hover:bg-red-100 hover:border-red-300 transition-colors"
          >
            <ShieldExclamationIcon className="h-3.5 w-3.5" />
            <span>{t("deleted.anonymize")}</span>
          </button>
        </div>
      ),
    },
  ];

  // ── Actions du header ─────────────────────────────────────────────────────
  const headerActions = (
    <div className="flex items-center gap-2">
      {users.length > 0 && (
        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-red-50 text-red-700 border border-red-100">
          {users.length}
        </span>
      )}
      <button
        type="button"
        onClick={fetchDeleted}
        disabled={isLoading}
        title={t("common:buttons.refresh")}
        className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200
                   text-gray-500 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200
                   transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ArrowPathIcon className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
      </button>
    </div>
  );

  // ── Breadcrumb (back link) ────────────────────────────────────────────────
  const breadcrumb = (
    <button
      type="button"
      onClick={() => navigate("/users")}
      className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
    >
      <ArrowLeftIcon className="h-3.5 w-3.5" />
      {t("deleted.backToUsers")}
    </button>
  );

  // ── Rendu ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ── En-tête ── */}
      <PageHeader
        icon={<TrashIcon className="h-8 w-8 text-red-500" />}
        title={t("deleted.title")}
        description={t("deleted.description")}
        actions={headerActions}
        breadcrumb={breadcrumb}
      />

      {/* ── Table ── */}
      <DataTable
        columns={columns}
        data={users}
        rowKey="id"
        loading={isLoading}
        emptyMessage={t("deleted.noDeleted")}
      />

      {/* ── Modal de confirmation d'anonymisation ── */}
      <Modal
        isOpen={confirmUser !== null}
        onClose={() => !isSubmitting && setConfirmUser(null)}
        size="md"
      >
        <Modal.Header
          title={t("deleted.anonymizeTitle")}
          showCloseButton={!isSubmitting}
          onClose={() => !isSubmitting && setConfirmUser(null)}
        />
        <Modal.Body>
          {/* Avertissement irréversible */}
          <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-700 leading-relaxed">
                <p className="font-semibold mb-1">
                  {confirmUser?.first_name} {confirmUser?.last_name}
                </p>
                <p>{t("deleted.anonymizeWarning")}</p>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer align="right">
          <Button
            variant="outline"
            onClick={() => setConfirmUser(null)}
            disabled={isSubmitting}
          >
            {t("modal.editRole.cancel")}
          </Button>
          <SubmitButton
            isLoading={isSubmitting}
            loadingText={`${t("deleted.anonymizeConfirm")}…`}
            onClick={handleAnonymizeConfirm}
            type="button"
            disabled={isSubmitting}
          >
            {t("deleted.anonymizeConfirm")}
          </SubmitButton>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
