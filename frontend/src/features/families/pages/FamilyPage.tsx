/**
 * FamilyPage
 * Page principale du module famille. Affiche les membres de la famille
 * et permet d'en ajouter ou retirer.
 */

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { UsersIcon, PlusCircleIcon } from "@patternfly/react-icons";
import { useFamily } from "../hooks/useFamily";
import { useAuth } from "../../../shared/hooks/useAuth";
import { FamilyMemberCard } from "../components/FamilyMemberCard";
import { AddFamilyMemberModal } from "../components/AddFamilyMemberModal";
import { PageHeader } from "../../../shared/components/Layout/PageHeader";
import { LoadingSpinner } from "../../../shared/components/Layout/LoadingSpinner";
import { EmptyState } from "../../../shared/components/Layout/EmptyState";
import { Button } from "../../../shared/components/Button/Button";

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
      {/* ── En-tête de page avec composant réutilisable ── */}
      <PageHeader
        icon={
          <UsersIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
        }
        title={family?.nom ? family.nom : "Ma famille"}
        description={
          hasFamily
            ? `${user?.userId ? `${user.userId} — ` : ""}${memberCount} membre${memberCount > 1 ? "s" : ""}`
            : undefined
        }
        actions={
          <Button
            variant="primary"
            size="md"
            icon={<PlusCircleIcon className="h-4 w-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            Ajouter un membre
          </Button>
        }
      />

      {/* ── États ── */}

      {/* Chargement avec composant réutilisable */}
      {isLoading && (
        <LoadingSpinner size="lg" text="Chargement de la famille…" />
      )}

      {/* État vide avec composant réutilisable */}
      {!isLoading && !hasFamily && (
        <EmptyState
          icon={<UsersIcon className="h-16 w-16" />}
          title="Aucun membre de famille"
          description="Commencez par ajouter votre premier membre."
          action={{
            label: "Ajouter un membre",
            onClick: () => setIsModalOpen(true),
          }}
        />
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

/**
 * ════════════════════════════════════════════════════════════════════════════
 * MIGRATION - COMPOSANTS RÉUTILISABLES
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cette page a été migrée pour utiliser les composants réutilisables :
 *
 * 1. PageHeader (lignes 92-107)
 *    - Remplace l'en-tête personnalisé avec flex/responsive
 *    - Gère automatiquement l'icône, titre, description et actions
 *    - Élimine ~20 lignes de code dupliqué
 *
 * 2. LoadingSpinner (ligne 112)
 *    - Remplace le spinner custom avec InProgressIcon
 *    - API cohérente avec tailles standardisées
 *    - Élimine ~8 lignes de code
 *
 * 3. EmptyState (lignes 116-123)
 *    - Remplace l'état vide personnalisé
 *    - Gère automatiquement l'icône, titre, description et bouton d'action
 *    - Élimine ~17 lignes de code dupliqué
 *
 * 4. Button (lignes 99-105)
 *    - Remplace les boutons <button> personnalisés
 *    - API cohérente avec variants, tailles et états
 *    - Élimine ~5 lignes par bouton (total ~10 lignes)
 *
 * ── BÉNÉFICES ────────────────────────────────────────────────────────────────
 * - Code réduit de ~55 lignes (de ~165 à ~110 lignes effectives)
 * - Cohérence visuelle garantie à travers l'application
 * - Maintenance simplifiée (changements centralisés)
 * - Accessibilité améliorée (aria-labels, roles, sr-only)
 * - Responsive natif sans effort
 *
 * ── LOGIQUE MÉTIER ──────────────────────────────────────────────────────────
 * ✅ Aucune modification de la logique métier
 * ✅ Mêmes hooks (useFamily, useAuth)
 * ✅ Mêmes handlers (handleRemoveMember, handleModalSuccess)
 * ✅ Même gestion d'état (isModalOpen, removingUserId)
 * ✅ Même affichage conditionnel (isLoading, hasFamily)
 * ✅ Même grille de cartes membres
 *
 * ════════════════════════════════════════════════════════════════════════════
 */
