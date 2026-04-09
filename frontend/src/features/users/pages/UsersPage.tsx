/**
 * UsersPage
 * Page principale de gestion des utilisateurs.
 * Accessible aux admins et professeurs.
 */

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useUsers } from "../hooks/useUsers";
import { useAuth } from "../../../shared/hooks/useAuth";
import { UserRoleBadge } from "../components/UserRoleBadge";
import { UserStatusBadge } from "../components/UserStatusBadge";
import { EditUserRoleModal } from "../components/EditUserRoleModal";
import { EditUserStatusModal } from "../components/EditUserStatusModal";
import { DeleteUserModal } from "../components/DeleteUserModal";
import { UserRole } from "@clubmanager/types";
import type { UserListItemDto } from "@clubmanager/types";

// ─── Icônes inline ────────────────────────────────────────────────────────────

function PencilIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
      />
    </svg>
  );
}

function TagIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 6h.008v.008H6V6Z"
      />
    </svg>
  );
}

function TrashIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
      />
    </svg>
  );
}

function RestoreIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      className="h-4 w-4 text-gray-400"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className="h-3.5 w-3.5 text-green-500 inline-block ml-1"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      aria-label="Email vérifié"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m4.5 12.75 6 6 9-13.5"
      />
    </svg>
  );
}

// ─── Types état modal ─────────────────────────────────────────────────────────

type ModalState =
  | { type: "none" }
  | { type: "editRole"; user: UserListItemDto }
  | { type: "editStatus"; user: UserListItemDto }
  | { type: "delete"; user: UserListItemDto };

// ─── Helpers pagination ───────────────────────────────────────────────────────

/**
 * Génère le tableau de pages à afficher (max 5 visibles + ellipses).
 * Ex: [1, '...', 4, 5, 6, '...', 12]
 */
function buildPageRange(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [1];

  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("...");

  pages.push(total);

  return pages;
}

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
      throw err; // Re-throw pour garder la modal ouverte
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

  // ── Pagination ────────────────────────────────────────────────────────────

  const pageRange = buildPageRange(pagination.page, pagination.totalPages);

  // ── Numéro de ligne absolu ────────────────────────────────────────────────

  const rowOffset = (pagination.page - 1) * pagination.limit;

  // ── Rendu ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ── En-tête ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestion des utilisateurs
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Administration des comptes membres du club
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {pagination.total > 0 && (
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100">
              Total : {pagination.total} utilisateur
              {pagination.total > 1 ? "s" : ""}
            </span>
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
            <svg
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Barre de filtres ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Recherche */}
          <div className="relative flex-1 min-w-0">
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <SearchIcon />
            </span>
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Rechercher par nom, email, identifiant…"
              className="block w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm
                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500
                         focus:border-blue-500 transition-colors"
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* État de chargement */}
        {isLoading && (
          <div className="flex items-center justify-center py-20 gap-3">
            <svg
              className="animate-spin h-6 w-6 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span className="text-sm text-gray-500">
              Chargement des utilisateurs…
            </span>
          </div>
        )}

        {/* État vide */}
        {!isLoading && users.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <svg
              className="h-12 w-12 text-gray-300"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
              />
            </svg>
            <p className="text-sm text-gray-500">Aucun utilisateur trouvé.</p>
            {(filters.search || filters.role_app || filters.status_id) && (
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
            )}
          </div>
        )}

        {/* Table */}
        {!isLoading && users.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead>
                <tr className="bg-gray-50">
                  <th
                    scope="col"
                    className="py-3 pl-4 pr-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-10"
                  >
                    #
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    Nom
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    Rôle
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    Statut
                  </th>
                  <th
                    scope="col"
                    className="py-3 pl-3 pr-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-28"
                  >
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50 bg-white">
                {users.map((user, index) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* # */}
                    <td className="py-3.5 pl-4 pr-3 text-sm text-gray-400 tabular-nums">
                      {rowOffset + index + 1}
                    </td>

                    {/* Nom */}
                    <td className="px-4 py-3.5">
                      <div className="text-sm font-medium text-gray-900">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {user.userId}
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3.5">
                      <div className="text-sm text-gray-700 flex items-center">
                        <span className="truncate max-w-[220px]">
                          {user.email}
                        </span>
                        {user.email_verified && <CheckIcon />}
                      </div>
                    </td>

                    {/* Rôle */}
                    <td className="px-4 py-3.5">
                      <UserRoleBadge role={user.role_app} />
                    </td>

                    {/* Statut */}
                    <td className="px-4 py-3.5">
                      <UserStatusBadge statusId={user.status_id} />
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 pl-3 pr-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Modifier le rôle */}
                        <button
                          type="button"
                          onClick={() => setModal({ type: "editRole", user })}
                          title="Modifier le rôle"
                          className="p-1.5 rounded-md text-gray-500 hover:text-blue-600 hover:bg-blue-50
                                     transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                          <TagIcon />
                        </button>

                        {/* Modifier le statut */}
                        <button
                          type="button"
                          onClick={() => setModal({ type: "editStatus", user })}
                          title="Modifier le statut"
                          className="p-1.5 rounded-md text-gray-500 hover:text-indigo-600 hover:bg-indigo-50
                                     transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        >
                          <PencilIcon />
                        </button>

                        {/* Supprimer (admin uniquement) */}
                        {isAdmin && user.status_id !== 5 && (
                          <button
                            type="button"
                            onClick={() => setModal({ type: "delete", user })}
                            title="Supprimer l'utilisateur"
                            className="p-1.5 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50
                                       transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                          >
                            <TrashIcon />
                          </button>
                        )}

                        {/* Restaurer (admin, compte archivé uniquement) */}
                        {isAdmin && user.status_id === 5 && (
                          <button
                            type="button"
                            onClick={() => handleRestore(user)}
                            title="Restaurer le compte"
                            className="p-1.5 rounded-md text-gray-500 hover:text-green-600 hover:bg-green-50
                                       transition-colors focus:outline-none focus:ring-2 focus:ring-green-400"
                          >
                            <RestoreIcon />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Pagination ── */}
      {!isLoading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          {/* Info résultats */}
          <p className="text-sm text-gray-500">
            Page{" "}
            <span className="font-medium text-gray-700">{pagination.page}</span>{" "}
            sur{" "}
            <span className="font-medium text-gray-700">
              {pagination.totalPages}
            </span>{" "}
            —{" "}
            <span className="font-medium text-gray-700">
              {pagination.total}
            </span>{" "}
            résultat{pagination.total > 1 ? "s" : ""}
          </p>

          {/* Boutons de navigation */}
          <nav className="flex items-center gap-1" aria-label="Pagination">
            {/* Précédent */}
            <button
              type="button"
              onClick={() => setPage(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200
                         text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors
                         disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Page précédente"
            >
              <svg
                className="h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5 8.25 12l7.5-7.5"
                />
              </svg>
            </button>

            {/* Numéros de pages */}
            {pageRange.map((page, idx) =>
              page === "..." ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="flex items-center justify-center w-9 h-9 text-sm text-gray-400"
                >
                  …
                </span>
              ) : (
                <button
                  key={page}
                  type="button"
                  onClick={() => setPage(page)}
                  aria-current={page === pagination.page ? "page" : undefined}
                  className={`flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium
                               transition-colors border
                               ${
                                 page === pagination.page
                                   ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                   : "text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                               }`}
                >
                  {page}
                </button>
              ),
            )}

            {/* Suivant */}
            <button
              type="button"
              onClick={() => setPage(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200
                         text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors
                         disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Page suivante"
            >
              <svg
                className="h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m8.25 4.5 7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
          </nav>
        </div>
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
    </div>
  );
}
