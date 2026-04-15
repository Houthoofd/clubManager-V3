/**
 * UsersPage
 * Page principale de gestion des utilisateurs.
 * Accessible aux admins et professeurs.
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
} from "@heroicons/react/24/outline";

import { useUsers } from "../hooks/useUsers";
import { useAuth } from "../../../shared/hooks/useAuth";
import { UserRoleBadge } from "../components/UserRoleBadge";
import { UserStatusBadge } from "../components/UserStatusBadge";
import { EditUserRoleModal } from "../components/EditUserRoleModal";
import { EditUserStatusModal } from "../components/EditUserStatusModal";
import { DeleteUserModal } from "../components/DeleteUserModal";
import { SendToUserModal } from "../components/SendToUserModal";
import { NotifyUsersModal } from "../components/NotifyUsersModal";
import { UserRole } from "@clubmanager/types";
import type { UserListItemDto } from "@clubmanager/types";

import { PageHeader } from "@/shared/components/Layout/PageHeader";
import { DataTable } from "@/shared/components/Table/DataTable";
import { PaginationBar } from "@/shared/components/Navigation/PaginationBar";
import { Input } from "@/shared/components/Input";

// ─── Types état modal ─────────────────────────────────────────────────────────

type ModalState =
  | { type: "none" }
  | { type: "editRole"; user: UserListItemDto }
  | { type: "editStatus"; user: UserListItemDto }
  | { type: "delete"; user: UserListItemDto }
  | { type: "sendEmail"; user: UserListItemDto }
  | { type: "notifyBulk" };

// ─── Composant ────────────────────────────────────────────────────────────────

/**
 * UsersPage — Page de gestion des utilisateurs.
 *
 * Fonctionnalités :
 * - Liste paginée avec filtres (recherche, rôle, statut)
 * - Debounce 300 ms sur la recherche textuelle
 * - Modification du rôle et du statut via modals
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

  // ── Handlers modals ───────────────────────────────────────────────────────

  const handleRoleConfirm = async (role: string) => {
    if (modal.type !== "editRole") return;
    try {
      await updateUserRole(modal.user.id, role);
      toast.success("Rôle mis à jour", {
        description: `Le rôle de ${modal.user.first_name} ${modal.user.last_name} a été modifié.`,
      });
    } catch (err: any) {
      toast.error("Erreur", {
        description:
          err.response?.data?.message ??
          err.message ??
          "Impossible de modifier le rôle.",
      });
      throw err;
    }
  };

  const handleStatusConfirm = async (statusId: number) => {
    if (modal.type !== "editStatus") return;
    try {
      await updateUserStatus(modal.user.id, statusId);
      toast.success("Statut mis à jour", {
        description: `Le statut de ${modal.user.first_name} ${modal.user.last_name} a été modifié.`,
      });
    } catch (err: any) {
      toast.error("Erreur", {
        description:
          err.response?.data?.message ??
          err.message ??
          "Impossible de modifier le statut.",
      });
      throw err;
    }
  };

  const handleDeleteConfirm = async (reason: string) => {
    if (modal.type !== "delete") return;
    try {
      await deleteUser(modal.user.id, reason);
      toast.success("Utilisateur supprimé", {
        description: `${modal.user.first_name} ${modal.user.last_name} a été supprimé.`,
      });
    } catch (err: any) {
      toast.error("Erreur", {
        description:
          err.response?.data?.message ??
          err.message ??
          "Impossible de supprimer l'utilisateur.",
      });
      throw err;
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
            className="p-1.5 rounded-md text-gray-500 hover:text-blue-600 hover:bg-blue-50
                       transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <TagIcon className="h-4 w-4" />
          </button>

          {/* Modifier le statut */}
          <button
            type="button"
            onClick={() => setModal({ type: "editStatus", user: row })}
            title="Modifier le statut"
            className="p-1.5 rounded-md text-gray-500 hover:text-indigo-600 hover:bg-indigo-50
                       transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <PencilIcon className="h-4 w-4" />
          </button>

          {/* Envoyer un message — visible aux admins et professeurs */}
          {row.status_id !== 5 && (
            <button
              type="button"
              onClick={() => setModal({ type: "sendEmail", user: row })}
              className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
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
              className="p-1.5 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50
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
              className="p-1.5 rounded-md text-gray-500 hover:text-green-600 hover:bg-green-50
                         transition-colors focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              <ArrowPathIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

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
            className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white
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
            className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white
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

      {/* Modifier le rôle */}
      <EditUserRoleModal
        userId={modal.type === "editRole" ? modal.user.id : 0}
        currentRole={
          modal.type === "editRole"
            ? (modal.user.role_app ?? "member")
            : "member"
        }
        isOpen={modal.type === "editRole"}
        onClose={closeModal}
        onConfirm={handleRoleConfirm}
      />

      {/* Modifier le statut */}
      <EditUserStatusModal
        userId={modal.type === "editStatus" ? modal.user.id : 0}
        currentStatusId={modal.type === "editStatus" ? modal.user.status_id : 1}
        isOpen={modal.type === "editStatus"}
        onClose={closeModal}
        onConfirm={handleStatusConfirm}
      />

      {/* Supprimer */}
      <DeleteUserModal
        userId={modal.type === "delete" ? modal.user.id : 0}
        userName={
          modal.type === "delete"
            ? `${modal.user.first_name} ${modal.user.last_name}`
            : ""
        }
        isOpen={modal.type === "delete"}
        onClose={closeModal}
        onConfirm={handleDeleteConfirm}
      />

      {/* Envoyer un email à un utilisateur */}
      <SendToUserModal
        user={modal.type === "sendEmail" ? modal.user : null}
        isOpen={modal.type === "sendEmail"}
        onClose={closeModal}
      />

      {/* Notification en masse */}
      <NotifyUsersModal
        isOpen={modal.type === "notifyBulk"}
        onClose={closeModal}
      />
    </div>
  );
}
