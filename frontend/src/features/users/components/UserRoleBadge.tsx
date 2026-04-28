/**
 * UserRoleBadge
 * Badge coloré affichant le rôle applicatif d'un utilisateur.
 *
 * Utilise Badge.Role depuis shared/components pour la cohérence visuelle.
 */

import { UserRole } from "@clubmanager/types";
import { Badge } from "../../../shared/components";
import { useTranslation } from "react-i18next";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserRoleBadgeProps {
  role?: string;
}

// ─── Composant ────────────────────────────────────────────────────────────────

/**
 * UserRoleBadge — Affiche le rôle d'un utilisateur sous forme de badge coloré.
 *
 * - admin     → rouge (danger)
 * - professor → violet (purple)
 * - member    → vert (success)
 * - parent    → bleu (info)
 * - inconnu   → gris (neutral)
 *
 * @example
 * ```tsx
 * <UserRoleBadge role={UserRole.ADMIN} />
 * <UserRoleBadge role="professor" />
 * ```
 */
export const UserRoleBadge: React.FC<UserRoleBadgeProps> = ({ role }) => {
  const { t } = useTranslation("users");

  // Mapping des valeurs UserRole vers les valeurs de Badge.Role
  const normalizedRole = role?.toLowerCase();

  // Si le rôle est reconnu, utiliser Badge.Role
  if (
    normalizedRole === UserRole.ADMIN ||
    normalizedRole === UserRole.PROFESSOR ||
    normalizedRole === UserRole.MEMBER ||
    normalizedRole === "parent"
  ) {
    return (
      <Badge.Role
        role={normalizedRole as "admin" | "professor" | "member" | "parent"}
      />
    );
  }

  // Fallback pour les rôles inconnus
  return <Badge variant="neutral">{t("badges.unknown")}</Badge>;
};
