/**
 * FamilyPage
 * Page principale du module famille. Affiche les membres de la famille
 * et permet d'en ajouter ou retirer.
 */

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  UsersIcon,
  PlusCircleIcon,
  InProgressIcon,
} from "@patternfly/react-icons";
import { useFamily } from "../hooks/useFamily";
import { useAuth } from "../../../shared/hooks/useAuth";
import { FamilyMemberCard } from "../components/FamilyMemberCard";
import { AddFamilyMemberModal } from "../components/AddFamilyMemberModal";

// ─── Composant ───────────────────────────────────────────────────────────────

/**
 * FamilyPage — Page principale de gestion de la famille.
 *
 * Charge la famille au montage, affiche un état de chargement, un état vide
 * si aucun membre, ou la grille de cartes membres. Permet l'ajout via une
 * modal et le retrait via une confirmation.
 */
export function FamilyPage() {
  const {
    family,
    isLoading,
    error,
    memberCount,
    hasFamily,
    fetchMyFamily,
    removeMember,
    clearError,
  } = useFamily();

  const { user } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  /** userId du membre en cours de suppression (null = aucun) */
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);

  // ── Chargement initial ───────────────────────────────────────────────────
  useEffect(() => {
    fetchMyFamily();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Nettoyage de l'erreur si elle change ─────────────────────────────────
  useEffect(() => {
    if (error) {
      toast.error("Erreur famille", { description: error });
      clearError();
    }
  }, [error, clearError]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleRemoveMember = async (userId: string) => {
    setRemovingUserId(userId);
    const result = await removeMember(userId);
    setRemovingUserId(null);

    if (result.success) {
      toast.success("Membre retiré", {
        description: "Le membre a été retiré de la famille.",
      });
      await fetchMyFamily();
    } else {
      toast.error("Erreur lors du retrait", {
        description: result.error ?? "Une erreur est survenue.",
      });
    }
  };

  const handleModalSuccess = async () => {
    setIsModalOpen(false);
    await fetchMyFamily();
  };

  // ── Détermine si l'utilisateur courant est responsable dans cette famille ─
  const currentUserIsResponsable =
    hasFamily &&
    family !== null &&
    family.membres.some((m) => m.userId === user?.userId && m.est_responsable);

  // ── Rendu ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ── En-tête de page ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UsersIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
            {family?.nom ? family.nom : "Ma famille"}
          </h1>
          {hasFamily && (
            <p className="mt-1 text-sm text-gray-500">
              {user?.userId && (
                <span className="font-medium text-gray-600">{user.userId}</span>
              )}
              {user?.userId && " — "}
              {memberCount} membre{memberCount > 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Bouton d'ajout (toujours visible en haut) */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-sm transition-colors self-start sm:self-auto"
        >
          <PlusCircleIcon className="h-4 w-4" aria-hidden="true" />
          Ajouter un membre
        </button>
      </div>

      {/* ── États ── */}

      {/* Chargement */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <InProgressIcon
            className="animate-spin h-8 w-8 text-blue-600"
            aria-hidden="true"
          />
          <p className="text-sm text-gray-500">Chargement de la famille…</p>
        </div>
      )}

      {/* État vide */}
      {!isLoading && !hasFamily && (
        <div className="flex flex-col items-center justify-center py-24 gap-5 bg-white rounded-2xl shadow-sm border border-gray-100">
          <UsersIcon className="h-16 w-16 text-gray-300" aria-hidden="true" />
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-800">
              Aucun membre de famille
            </h2>
            <p className="mt-1 text-sm text-gray-500 max-w-xs">
              Commencez par ajouter votre premier membre.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-sm transition-colors"
          >
            <PlusCircleIcon className="h-4 w-4" aria-hidden="true" />
            Ajouter un membre
          </button>
        </div>
      )}

      {/* Grille des membres */}
      {!isLoading && hasFamily && family && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {family.membres.map((member) => (
            <FamilyMemberCard
              key={member.userId}
              member={member}
              canRemove={currentUserIsResponsable === true}
              onRemove={handleRemoveMember}
              isRemoving={removingUserId === member.userId}
            />
          ))}
        </div>
      )}

      {/* ── Modal d'ajout ── */}
      <AddFamilyMemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
