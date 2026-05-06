/**
 * FamilyPage
 * Page unifiée du module famille.
 *
 * Pour tous les rôles  : onglet « Ma famille » (voir/gérer ses membres)
 * Pour les ADMIN seuls : onglet « Administration » (liste toutes les familles)
 */

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  UsersIcon,
  UserGroupIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";

import { useFamily } from "../hooks/useFamily";
import { useAuth } from "../../../shared/hooks/useAuth";
import { FamilyMemberCard } from "../components/FamilyMemberCard";
import { AddFamilyMemberModal } from "../components/AddFamilyMemberModal";
import { AdminFamiliesPage } from "./AdminFamiliesPage";

import { PageHeader } from "../../../shared/components/Layout/PageHeader";
import { LoadingSpinner } from "../../../shared/components/Layout/LoadingSpinner";
import { EmptyState } from "../../../shared/components/Layout/EmptyState";
import { Button } from "../../../shared/components/Button/Button";
import { TabGroup } from "../../../shared/components/Navigation/TabGroup";
import type { Tab } from "../../../shared/components/Navigation/TabGroup";
import { UserRole } from "@clubmanager/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type FamilyTabId = "my-family" | "admin";

// ─── Composant ────────────────────────────────────────────────────────────────

export function FamilyPage() {
  const { t } = useTranslation("families");
  const { user, hasRole } = useAuth();
  const isAdmin = hasRole(UserRole.ADMIN);

  // ── Onglet actif ─────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<FamilyTabId>("my-family");

  // ── Définition des onglets ────────────────────────────────────────────────
  const tabs: Tab[] = [
    {
      id: "my-family",
      label: t("page.title"),
      icon: <UsersIcon className="h-4 w-4" />,
    },
    ...(isAdmin
      ? [
          {
            id: "admin" as const,
            label: t("admin.page.title"),
            icon: <UserGroupIcon className="h-4 w-4" />,
          },
        ]
      : []),
  ];

  // ── État du module famille (membre) ──────────────────────────────────────
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);

  // ── Chargement initial ───────────────────────────────────────────────────
  useEffect(() => {
    fetchMyFamily();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Propagation de l'erreur ──────────────────────────────────────────────
  useEffect(() => {
    if (error) {
      toast.error(t("messages.error.familyError"), { description: error });
      clearError();
    }
  }, [error, clearError, t]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleRemoveMember = async (userId: string) => {
    setRemovingUserId(userId);
    const result = await removeMember(userId);
    setRemovingUserId(null);

    if (result.success) {
      toast.success(t("messages.success.memberRemoved"), {
        description: t("messages.success.memberRemovedDescription"),
      });
      await fetchMyFamily();
    } else {
      toast.error(t("messages.error.removeError"), {
        description: result.error ?? t("messages.error.genericError"),
      });
    }
  };

  const handleModalSuccess = async () => {
    setIsModalOpen(false);
    await fetchMyFamily();
  };

  // ── Responsable courant ──────────────────────────────────────────────────
  const currentUserIsResponsable =
    hasFamily &&
    family !== null &&
    family.membres.some((m) => m.userId === user?.userId && m.est_responsable);

  // ── Rendu ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* En-tête de page */}
      <PageHeader
        icon={<UsersIcon className="h-8 w-8 text-blue-600" />}
        title={family?.nom ? family.nom : t("page.title")}
        description={
          hasFamily
            ? t("page.description", {
                userId: user?.userId ?? "",
                count: memberCount,
              })
            : undefined
        }
        actions={
          activeTab === "my-family" ? (
            <Button
              variant="primary"
              size="md"
              icon={<PlusCircleIcon className="h-4 w-4" />}
              onClick={() => setIsModalOpen(true)}
            >
              {t("actions.addMember")}
            </Button>
          ) : undefined
        }
      />

      {/* Conteneur avec onglets */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* TabGroup — visible uniquement pour les admins (2 onglets) */}
        {isAdmin && (
          <TabGroup
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(id) => setActiveTab(id as FamilyTabId)}
          />
        )}

        {/* ── Onglet : Ma famille ───────────────────────────────────────────── */}
        {activeTab === "my-family" && (
          <div className="p-6 space-y-6">
            {/* Chargement */}
            {isLoading && <LoadingSpinner size="lg" text={t("page.loading")} />}

            {/* État vide */}
            {!isLoading && !hasFamily && (
              <EmptyState
                icon={<UsersIcon className="h-16 w-16" />}
                title={t("messages.empty.title")}
                description={t("messages.empty.description")}
                action={{
                  label: t("messages.empty.action"),
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
          </div>
        )}

        {/* ── Onglet : Administration (ADMIN seulement) ─────────────────────── */}
        {activeTab === "admin" && isAdmin && <AdminFamiliesPage flat />}
      </div>

      {/* Modal d'ajout de membre */}
      <AddFamilyMemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
