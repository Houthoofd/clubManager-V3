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

const roleOptions = [
  { value: UserRole.ADMIN, label: "Admin" },
  { value: UserRole.PROFESSOR, label: "Professeur" },
  { value: UserRole.MEMBER, label: "Membre" },
];

const statusOptions = [
  { value: 1, label: "Actif" },
  { value: 2, label: "Inactif" },
  { value: 3, label: "Suspendu" },
  { value: 4, label: "En attente" },
  { value: 5, label: "Archivé" },
];

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
      toast.error("Erreur de chargement", { description: error });
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
      toast.success("Rôle mis à jour", {
        description: `Le rôle de ${modal.user.first_name} ${modal.user.last_name} a été modifié.`,
      });
      closeModal();
    } catch (err: any) {
      toast.error("Erreur", {
        description:
          err.response?.data?.message ??
          err.message ??
          "Impossible de modifier le rôle.",
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
      toast.success("Statut mis à jour", {
        description: `Le statut de ${modal.user.first_name} ${modal.user.last_name} a été modifié.`,
      });
      closeModal();
    } catch (err: any) {
      toast.error("Erreur", {
        description:
          err.response?.data?.message ??
          err.message ??
          "Impossible de modifier le statut.",
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
      toast.success("Utilisateur supprimé", {
        description: `${modal.user.first_name} ${modal.user.last_name} a été supprimé.`,
      });
      closeModal();
    } catch (err: any) {
      toast.error("Erreur", {
        description:
          err.response?.data?.message ??
          err.message ??
          "Impossible de supprimer l'utilisateur.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestore = async (user: UserListItemDto) => {
    try {
      await restoreUser(user.id);
      toast.success("Compte restauré", {
        description: `${user.first_name} ${user.last_name} a été restauré.`,
      });
    } catch (err: any) {
      toast.error("Erreur", {
        description:
          err.response?.data?.message ??
          err.message ??
          "Impossible de restaurer le compte.",
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
          Total : {pagination.total} utilisateur
          {pagination.total > 1 ? "s" : ""}
        </span>
      )}
      {isAdmin && (
        <button
          type="button"
          onClick={() => setModal({ type: "notifyBulk" })}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-orange-200
                     bg-orange-50 text-orange-700 text-sm font-medium
                     hover:bg-orange-100 hover:border-orange-300 transition-colors"
          title="Envoyer une notification aux membres non-conformes"
        >
          <BellAlertIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Notifier</span>
        </button>
      )}
      <button
        type="button"
        onClick={refetch}
        disabled={isLoading}
        title="Rafraîchir la liste"
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
      label: "Nom",
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
      label: "Email",
      render: (_: any, row: UserListItemDto) => (
        <div className="text-sm text-gray-700 flex items-center">
          <span className="truncate max-w-[220px]">{row.email}</span>
          {row.email_verified && (
            <CheckIcon
              className="h-3.5 w-3.5 text-green-500 inline-block ml-1"
              aria-label="Email vérifié"
            />
          )}
        </div>
      ),
    },
    {
      key: "role",
      label: "Rôle",
      render: (_: any, row: UserListItemDto) => (
        <UserRoleBadge role={row.role_app} />
      ),
    },
    {
      key: "status",
      label: "Statut",
      render: (_: any, row: UserListItemDto) => (
        <UserStatusBadge statusId={row.status_id} />
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: UserListItemDto) => (
        <div className="flex items-center justify-end gap-1">
          {/* Modifier le rôle */}
          <button
            type="button"
            onClick={() => setModal({ type: "editRole", user: row })}
            title="Modifier le rôle"
            className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50
                       transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <TagIcon className="h-4 w-4" />
          </button>

          {/* Modifier le statut */}
          <button
            type="button"
            onClick={() => setModal({ type: "editStatus", user: row })}
            title="Modifier le statut"
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
              title={`Envoyer un message à ${row.first_name} ${row.last_name}`}
              aria-label={`Envoyer un message à ${row.first_name} ${row.last_name}`}
            >
              <EnvelopeIcon className="h-4 w-4" />
            </button>
          )}

          {/* Supprimer (admin uniquement) */}
          {isAdmin && row.status_id !== 5 && (
            <button
              type="button"
              onClick={() => setModal({ type: "delete", user: row })}
              title="Supprimer l'utilisateur"
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
              title="Restaurer le compte"
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
        title="Gestion des utilisateurs"
        description="Administration des comptes membres du club"
        actions={headerActions}
      />

      {/* ── Barre de filtres ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Recherche */}
          <div className="flex-1 min-w-0">
            <Input
              type="search"
              placeholder="Rechercher par nom, email, identifiant…"
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
            <option value="">Tous les rôles</option>
            <option value="admin">Admin</option>
            <option value="professor">Professeur</option>
            <option value="member">Membre</option>
          </select>

          {/* Filtre statut */}
          <select
            value={filters.status_id}
            onChange={(e) => setFilter("status_id", e.target.value)}
            className="px-3 py-3 border border-gray-300 rounded-lg text-sm bg-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                       transition-colors min-w-[150px]"
          >
            <option value="">Tous les statuts</option>
            <option value="1">Actif</option>
            <option value="2">Inactif</option>
            <option value="3">Suspendu</option>
            <option value="4">En attente</option>
            <option value="5">Archivé</option>
          </select>
        </div>
      </div>

      {/* ── Table ── */}
      <DataTable
        columns={columns}
        data={users}
        rowKey="id"
        loading={isLoading}
        emptyMessage="Aucun utilisateur trouvé"
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
              Effacer les filtres
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
          title="Modifier le rôle"
          showCloseButton
          onClose={closeModal}
        />
        <Modal.Body>
          <SelectField
            id="role-select"
            label="Rôle applicatif"
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
            Annuler
          </Button>
          <SubmitButton
            isLoading={isSubmitting}
            loadingText="Enregistrement…"
            onClick={handleRoleSubmit}
            type="button"
            disabled={
              isSubmitting ||
              (modal.type === "editRole" &&
                selectedRole === modal.user.role_app)
            }
          >
            Confirmer
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
          title="Modifier le statut"
          showCloseButton
          onClose={closeModal}
        />
        <Modal.Body>
          <SelectField
            id="status-select"
            label="Statut du compte"
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
            Annuler
          </Button>
          <SubmitButton
            isLoading={isSubmitting}
            loadingText="Enregistrement…"
            onClick={handleStatusSubmit}
            type="button"
            disabled={
              isSubmitting ||
              (modal.type === "editStatus" &&
                selectedStatusId === modal.user.status_id)
            }
          >
            Confirmer
          </SubmitButton>
        </Modal.Footer>
      </Modal>

      {/* Modal : Supprimer l'utilisateur */}
      <Modal isOpen={modal.type === "delete"} onClose={closeModal} size="md">
        <Modal.Header
          title="Supprimer l'utilisateur"
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
                  Vous êtes sur le point de supprimer le compte de{" "}
                  <span className="font-semibold">
                    {modal.type === "delete" &&
                      `${modal.user.first_name} ${modal.user.last_name}`}
                  </span>
                  .
                </p>
                <p className="mt-1">
                  Cette action est{" "}
                  <span className="font-semibold">irréversible</span>.
                  L'utilisateur n'aura plus accès à son compte.
                </p>
              </div>
            </div>
          </div>

          {/* Champ raison */}
          <div>
            <label
              htmlFor="delete-reason"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Raison de la suppression <span className="text-red-500">*</span>
            </label>
            <textarea
              id="delete-reason"
              rows={3}
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              onBlur={() => setDeleteReasonTouched(true)}
              disabled={isSubmitting}
              placeholder="Décrivez la raison de cette suppression (min. 5 caractères)…"
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
                La raison doit contenir au moins 5 caractères.
              </p>
            )}
            {!showDeleteError && (
              <p className="mt-1.5 text-xs text-gray-400">
                {trimmedDeleteReason.length} / 5 caractères minimum
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
            Annuler
          </Button>
          <SubmitButton
            isLoading={isSubmitting}
            loadingText="Suppression…"
            onClick={handleDeleteSubmit}
            type="button"
            variant="danger"
            disabled={isSubmitting}
          >
            Supprimer
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
