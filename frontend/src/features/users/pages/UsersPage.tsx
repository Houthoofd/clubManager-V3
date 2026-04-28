/**
 * UsersPage
 * Page principale de gestion des utilisateurs.
 * Accessible aux admins et professeurs.
 *
 * ✅ Migré vers le design system partagé :
 * - Modal, SelectField, SubmitButton
 * - Code plus propre et maintenable
 */

import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  UsersIcon,
  PencilIcon,
  TagIcon,
  TrashIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  EnvelopeIcon,
  BellAlertIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

import { useUsers } from "../hooks/useUsers";
import { useAuth } from "../../../shared/hooks/useAuth";
import { UserRoleBadge } from "../components/UserRoleBadge";
import { UserStatusBadge } from "../components/UserStatusBadge";
import { SendToUserModal } from "../components/SendToUserModal";
import { NotifyUsersModal } from "../components/NotifyUsersModal";
import { UserRole } from "@clubmanager/types";
import type { UserListItemDto } from "@clubmanager/types";

import { PageHeader } from "@/shared/components/Layout/PageHeader";
import { DataTable } from "@/shared/components/Table/DataTable";
import { PaginationBar } from "@/shared/components/Navigation/PaginationBar";
import { Input } from "@/shared/components/Input";
import { Modal } from "@/shared/components/Modal/Modal";
import { SelectField } from "@/shared/components/Forms/SelectField";
import { SubmitButton } from "@/shared/components/Button/SubmitButton";
import { Button } from "@/shared/components/Button/Button";

// ─── Types état modal ─────────────────────────────────────────────────────────

type ModalState =
  | { type: "none" }
  | { type: "editRole"; user: UserListItemDto }
  | { type: "editStatus"; user: UserListItemDto }
  | { type: "delete"; user: UserListItemDto }
  | { type: "sendEmail"; user: UserListItemDto }
  | { type: "notifyBulk" };

// ─── Configuration des options ────────────────────────────────────────────────

// ─── Composant ────────────────────────────────────────────────────────────────

/**
 * UsersPage — Page de gestion des utilisateurs.
 *
 * Fonctionnalités :
 * - Liste paginée avec filtres (recherche, rôle, statut)
 * - Debounce 300 ms sur la recherche textuelle
 * - Modification du rôle et du statut via modals partagées
 * - Suppression avec raison (admin uniquement)
 * - Restauration d'un compte archivé (admin uniquement)
 * - Notifications sonner sur succès / erreur
 */
export function UsersPage() {
  const { t } = useTranslation("users");

  // ── Options dynamiques avec i18n ──
  const roleOptions = [
    { value: UserRole.ADMIN, label: t("roles.admin") },
    { value: UserRole.PROFESSOR, label: t("roles.professor") },
    { value: UserRole.MEMBER, label: t("roles.member") },
  ];

  const statusOptions = [
    { value: 1, label: t("statuses.active") },
    { value: 2, label: t("statuses.inactive") },
    { value: 3, label: t("statuses.suspended") },
    { value: 4, label: t("statuses.pending") },
    { value: 5, label: t("statuses.archived") },
  ];
  const {
    users,
    pagination,
    filters,
    isLoading,
    error,
    setFilter,
    setPage,
    updateUserRole,
    updateUserStatus,
    deleteUser,
    restoreUser,
    clearError,
    refetch,
  } = useUsers();

  const { hasRole } = useAuth();
  const isAdmin = hasRole(UserRole.ADMIN);

  // ── État local de la recherche (pour le debounce) ─────────────────────────
  const [searchInput, setSearchInput] = useState(filters.search);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── État des modals ───────────────────────────────────────────────────────
  const [modal, setModal] = useState<ModalState>({ type: "none" });

  // ── État des formulaires ──────────────────────────────────────────────────
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedStatusId, setSelectedStatusId] = useState<number>(1);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteReasonTouched, setDeleteReasonTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Propagation de l'erreur du store vers le toast ────────────────────────
  useEffect(() => {
    if (error) {
      toast.error(t("common:messages.error"), { description: error });
      clearError();
    }
  }, [error, clearError]);

  // ── Debounce recherche → setFilter ────────────────────────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      setFilter("search", searchInput);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchInput]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Synchronise l'input si le filtre est réinitialisé de l'extérieur ──────
  useEffect(() => {
    setSearchInput(filters.search);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Initialisation des états lors de l'ouverture d'une modal ──────────────
  useEffect(() => {
    if (modal.type === "editRole") {
      setSelectedRole(modal.user.role_app ?? "member");
      setIsSubmitting(false);
    } else if (modal.type === "editStatus") {
      setSelectedStatusId(modal.user.status_id);
      setIsSubmitting(false);
    } else if (modal.type === "delete") {
      setDeleteReason("");
      setDeleteReasonTouched(false);
      setIsSubmitting(false);
    }
  }, [modal]);

  // ── Handlers modals ───────────────────────────────────────────────────────

  const handleRoleSubmit = async () => {
    if (modal.type !== "editRole") return;

    setIsSubmitting(true);
    try {
      await updateUserRole(modal.user.id, selectedRole);
      toast.success(t("roleUpdated"), {
        description: `${modal.user.first_name} ${modal.user.last_name}`,
      });
      closeModal();
    } catch (err: any) {
      toast.error(t("common:messages.error"), {
        description:
          err.response?.data?.message ??
          err.message ??
          t("common:messages.error"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusSubmit = async () => {
    if (modal.type !== "editStatus") return;

    setIsSubmitting(true);
    try {
      await updateUserStatus(modal.user.id, selectedStatusId);
      toast.success(t("statusUpdated"), {
        description: `${modal.user.first_name} ${modal.user.last_name}`,
      });
      closeModal();
    } catch (err: any) {
      toast.error(t("common:messages.error"), {
        description:
          err.response?.data?.message ??
          err.message ??
          t("common:messages.error"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (modal.type !== "delete") return;

    setDeleteReasonTouched(true);
    const trimmedReason = deleteReason.trim();
    if (trimmedReason.length < 5) return;

    setIsSubmitting(true);
    try {
      await deleteUser(modal.user.id, trimmedReason);
      toast.success(t("userDeleted"), {
        description: `${modal.user.first_name} ${modal.user.last_name}`,
      });
      closeModal();
    } catch (err: any) {
      toast.error(t("common:messages.error"), {
        description:
          err.response?.data?.message ??
          err.message ??
          t("common:messages.error"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestore = async (user: UserListItemDto) => {
    try {
      await restoreUser(user.id);
      toast.success(t("userRestored"), {
        description: `${user.first_name} ${user.last_name}`,
      });
    } catch (err: any) {
      toast.error(t("common:messages.error"), {
        description:
          err.response?.data?.message ??
          err.message ??
          t("common:messages.error"),
      });
    }
  };

  const closeModal = () => setModal({ type: "none" });

  // ── Numéro de ligne absolu ────────────────────────────────────────────────

  const rowOffset = (pagination.page - 1) * pagination.limit;

  // ── Actions du header ─────────────────────────────────────────────────────

  const headerActions = (
    <div className="flex items-center gap-2">
      {pagination.total > 0 && (
        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100">
          {t("common:common.total")} : {pagination.total}
        </span>
      )}
      {isAdmin && (
        <button
          type="button"
          onClick={() => setModal({ type: "notifyBulk" })}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-orange-200
                     bg-orange-50 text-orange-700 text-sm font-medium
                     hover:bg-orange-100 hover:border-orange-300 transition-colors"
          title={t("notifyUsers")}
        >
          <BellAlertIcon className="h-4 w-4" />
          <span className="hidden sm:inline">{t("notifyUsers")}</span>
        </button>
      )}
      <button
        type="button"
        onClick={refetch}
        disabled={isLoading}
        title={t("common:buttons.refresh")}
        className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200
                   text-gray-500 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200
                   transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ArrowPathIcon
          className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
        />
      </button>
    </div>
  );

  // ── Colonnes de la table ──────────────────────────────────────────────────

  const columns = [
    {
      key: "#",
      label: "#",
      render: (_: any, row: UserListItemDto) => {
        const index = users.findIndex((u) => u.id === row.id);
        return (
          <span className="text-sm text-gray-400 tabular-nums">
            {rowOffset + index + 1}
          </span>
        );
      },
    },
    {
      key: "name",
      label: t("firstName"),
      render: (_: any, row: UserListItemDto) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {row.first_name} {row.last_name}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">{row.userId}</div>
        </div>
      ),
    },
    {
      key: "email",
      label: t("common:common.email"),
      render: (_: any, row: UserListItemDto) => (
        <div className="text-sm text-gray-700 flex items-center">
          <span className="truncate max-w-[220px]">{row.email}</span>
          {row.email_verified && (
            <CheckIcon
              className="h-3.5 w-3.5 text-green-500 inline-block ml-1"
              aria-label={t("emailVerified")}
            />
          )}
        </div>
      ),
    },
    {
      key: "role",
      label: t("role"),
      render: (_: any, row: UserListItemDto) => (
        <UserRoleBadge role={row.role_app} />
      ),
    },
    {
      key: "status",
      label: t("status"),
      render: (_: any, row: UserListItemDto) => (
        <UserStatusBadge statusId={row.status_id} />
      ),
    },
    {
      key: "actions",
      label: t("common:common.actions"),
      render: (_: any, row: UserListItemDto) => (
        <div className="flex items-center justify-end gap-1">
          {/* Modifier le rôle */}
          <button
            type="button"
            onClick={() => setModal({ type: "editRole", user: row })}
            title={t("changeRole")}
            className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50
                       transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <TagIcon className="h-4 w-4" />
          </button>

          {/* Modifier le statut */}
          <button
            type="button"
            onClick={() => setModal({ type: "editStatus", user: row })}
            title={t("changeStatus")}
            className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50
                       transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <PencilIcon className="h-4 w-4" />
          </button>

          {/* Envoyer un message — visible aux admins et professeurs */}
          {row.status_id !== 5 && (
            <button
              type="button"
              onClick={() => setModal({ type: "sendEmail", user: row })}
              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              title={t("sendMessageTo", {
                name: `${row.first_name} ${row.last_name}`,
              })}
              aria-label={t("sendMessageTo", {
                name: `${row.first_name} ${row.last_name}`,
              })}
            >
              <EnvelopeIcon className="h-4 w-4" />
            </button>
          )}

          {/* Supprimer (admin uniquement) */}
          {isAdmin && row.status_id !== 5 && (
            <button
              type="button"
              onClick={() => setModal({ type: "delete", user: row })}
              title={t("deleteUser")}
              className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50
                         transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          )}

          {/* Restaurer (admin, compte archivé uniquement) */}
          {isAdmin && row.status_id === 5 && (
            <button
              type="button"
              onClick={() => handleRestore(row)}
              title={t("restoreUser")}
              className="p-1.5 rounded-lg text-gray-500 hover:text-green-600 hover:bg-green-50
                         transition-colors focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              <ArrowPathIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  // ── Validation du formulaire de suppression ───────────────────────────────
  const trimmedDeleteReason = deleteReason.trim();
  const isDeleteReasonValid = trimmedDeleteReason.length >= 5;
  const showDeleteError = deleteReasonTouched && !isDeleteReasonValid;

  // ── Rendu ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ── En-tête ── */}
      <PageHeader
        icon={<UsersIcon className="h-8 w-8 text-blue-600" />}
        title={t("title")}
        description={t("description")}
        actions={headerActions}
      />

      {/* ── Barre de filtres ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Recherche */}
          <div className="flex-1 min-w-0">
            <Input
              type="search"
              placeholder={t("searchPlaceholder")}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              leftIcon={
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
              }
            />
          </div>

          {/* Filtre rôle */}
          <select
            value={filters.role_app}
            onChange={(e) => setFilter("role_app", e.target.value)}
            className="px-3 py-3 border border-gray-300 rounded-lg text-sm bg-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                       transition-colors min-w-[140px]"
          >
            <option value="">{t("allRoles")}</option>
            <option value="admin">{t("roles.admin")}</option>
            <option value="professor">{t("roles.professor")}</option>
            <option value="member">{t("roles.member")}</option>
          </select>

          {/* Filtre statut */}
          <select
            value={filters.status_id}
            onChange={(e) => setFilter("status_id", e.target.value)}
            className="px-3 py-3 border border-gray-300 rounded-lg text-sm bg-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                       transition-colors min-w-[150px]"
          >
            <option value="">{t("allStatuses")}</option>
            <option value="1">{t("statuses.active")}</option>
            <option value="2">{t("statuses.inactive")}</option>
            <option value="3">{t("statuses.suspended")}</option>
            <option value="4">{t("statuses.pending")}</option>
            <option value="5">{t("statuses.archived")}</option>
          </select>
        </div>
      </div>

      {/* ── Table ── */}
      <DataTable
        columns={columns}
        data={users}
        rowKey="id"
        loading={isLoading}
        emptyMessage={t("noUsers")}
      />

      {/* Bouton pour effacer les filtres si aucun résultat */}
      {!isLoading &&
        users.length === 0 &&
        (filters.search || filters.role_app || filters.status_id) && (
          <div className="flex justify-center -mt-4 pb-4">
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                setFilter("search", "");
                setFilter("role_app", "");
                setFilter("status_id", "");
              }}
              className="text-sm text-blue-600 hover:underline"
            >
              {t("common:buttons.reset")}
            </button>
          </div>
        )}

      {/* ── Pagination ── */}
      {!isLoading && pagination.totalPages > 1 && (
        <PaginationBar
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
          showResultsCount
          total={pagination.total}
          pageSize={pagination.limit}
        />
      )}

      {/* ── Modals ── */}

      {/* Modal : Modifier le rôle */}
      <Modal isOpen={modal.type === "editRole"} onClose={closeModal} size="sm">
        <Modal.Header
          title={t("modal.editRole.title")}
          showCloseButton
          onClose={closeModal}
        />
        <Modal.Body>
          <SelectField
            id="role-select"
            label={t("modal.editRole.label")}
            options={roleOptions}
            value={selectedRole}
            onChange={(value) => setSelectedRole(String(value))}
            required
          />
        </Modal.Body>
        <Modal.Footer align="right">
          <Button
            variant="outline"
            onClick={closeModal}
            disabled={isSubmitting}
          >
            {t("modal.editRole.cancel")}
          </Button>
          <SubmitButton
            isLoading={isSubmitting}
            loadingText={t("modal.editRole.saving")}
            onClick={handleRoleSubmit}
            type="button"
            disabled={
              isSubmitting ||
              (modal.type === "editRole" &&
                selectedRole === modal.user.role_app)
            }
          >
            {t("modal.editRole.confirm")}
          </SubmitButton>
        </Modal.Footer>
      </Modal>

      {/* Modal : Modifier le statut */}
      <Modal
        isOpen={modal.type === "editStatus"}
        onClose={closeModal}
        size="sm"
      >
        <Modal.Header
          title={t("modal.editStatus.title")}
          showCloseButton
          onClose={closeModal}
        />
        <Modal.Body>
          <SelectField
            id="status-select"
            label={t("modal.editStatus.label")}
            options={statusOptions}
            value={selectedStatusId}
            onChange={(value) => setSelectedStatusId(Number(value))}
            required
          />
        </Modal.Body>
        <Modal.Footer align="right">
          <Button
            variant="outline"
            onClick={closeModal}
            disabled={isSubmitting}
          >
            {t("modal.editStatus.cancel")}
          </Button>
          <SubmitButton
            isLoading={isSubmitting}
            loadingText={t("modal.editStatus.saving")}
            onClick={handleStatusSubmit}
            type="button"
            disabled={
              isSubmitting ||
              (modal.type === "editStatus" &&
                selectedStatusId === modal.user.status_id)
            }
          >
            {t("modal.editStatus.confirm")}
          </SubmitButton>
        </Modal.Footer>
      </Modal>

      {/* Modal : Supprimer l'utilisateur */}
      <Modal isOpen={modal.type === "delete"} onClose={closeModal} size="md">
        <Modal.Header
          title={t("modal.delete.title")}
          showCloseButton
          onClose={closeModal}
        />
        <Modal.Body>
          {/* Avertissement */}
          <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-700 leading-relaxed">
                <p>
                  {t("deleteWarningTitle")}{" "}
                  <span className="font-semibold">
                    {modal.type === "delete" &&
                      `${modal.user.first_name} ${modal.user.last_name}`}
                  </span>
                  .
                </p>
                <p className="mt-1">
                  {t("modal.delete.warningBody")} {t("deleteWarningNoAccess")}
                </p>
              </div>
            </div>
          </div>

          {/* Champ raison */}
          <div>
            <label
              htmlFor="deleteReason"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {t("deleteReason")} *
            </label>
            <textarea
              id="delete-reason"
              rows={3}
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              onBlur={() => setDeleteReasonTouched(true)}
              disabled={isSubmitting}
              placeholder={t("deleteReasonPlaceholder")}
              className={`block w-full px-3 py-3 border rounded-lg shadow-sm text-sm resize-none
                          placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors
                          disabled:bg-gray-50 disabled:cursor-not-allowed
                          ${
                            showDeleteError
                              ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                              : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                          }`}
            />
            {showDeleteError && (
              <p className="mt-1.5 text-xs text-red-600">
                {t("deleteReasonError")}
              </p>
            )}
            {!showDeleteError && (
              <p className="mt-1.5 text-xs text-gray-400">
                {t("deleteReasonMinChars", {
                  count: trimmedDeleteReason.length,
                })}
              </p>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer align="right">
          <Button
            variant="outline"
            onClick={closeModal}
            disabled={isSubmitting}
          >
            {t("modal.delete.cancel")}
          </Button>
          <SubmitButton
            isLoading={isSubmitting}
            loadingText={t("modal.delete.deleting")}
            onClick={handleDeleteSubmit}
            type="button"
            variant="danger"
            disabled={isSubmitting}
          >
            {t("modal.delete.confirm")}
          </SubmitButton>
        </Modal.Footer>
      </Modal>

      {/* Modal : Envoyer un email à un utilisateur */}
      <SendToUserModal
        user={modal.type === "sendEmail" ? modal.user : null}
        isOpen={modal.type === "sendEmail"}
        onClose={closeModal}
      />

      {/* Modal : Notification en masse */}
      <NotifyUsersModal
        isOpen={modal.type === "notifyBulk"}
        onClose={closeModal}
      />
    </div>
  );
}
