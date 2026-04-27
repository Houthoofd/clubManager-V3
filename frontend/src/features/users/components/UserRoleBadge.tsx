/**
 * UserRoleBadge
 * Badge coloré affichant le rôle applicatif d'un utilisateur.
 *
 * Résolution en deux passes :
 * 1. Lookup DB via useRoleUtilisateurByCode → badge dynamique coloré
 * 2. Fallback → Badge.Role pour les rôles connus hardcodés
 * 3. Fallback final → Badge neutral "inconnu"
 */

import { useTranslation } from "react-i18next";
import { Badge } from "../../../shared/components";
import { useRoleUtilisateurByCode } from "../../../shared/hooks/useReferences";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserRoleBadgeProps {
  role?: string;
}

// ─── Composant ────────────────────────────────────────────────────────────────

/**
 * UserRoleBadge — Affiche le rôle d'un utilisateur sous forme de badge coloré.
 *
 * Priorité de résolution :
 * 1. Lookup dans les références DB (dynamique, multilingue)
 * 2. Badge.Role pour admin / professor / member / parent
 * 3. Badge neutral gris pour les rôles non reconnus
 *
 * @example
 * ```tsx
 * <UserRoleBadge role="admin" />
 * <UserRoleBadge role="professor" />
 * ```
 */
export const UserRoleBadge: React.FC<UserRoleBadgeProps> = ({ role }) => {
  const { t, i18n } = useTranslation("users");

  const normalizedRole = role?.toLowerCase();

  // ── Passe 1 : lookup DB ──────────────────────────────────────────────────
  const roleInfo = useRoleUtilisateurByCode(normalizedRole);

  if (roleInfo) {
    const label =
      i18n.language === "en" && roleInfo.nom_en
        ? roleInfo.nom_en
        : roleInfo.nom;
    return <Badge variant={roleInfo.couleur as any}>{label}</Badge>;
  }

  // ── Passe 2 : fallback Badge.Role pour les rôles connus ─────────────────
  const knownRoles = ["admin", "professor", "member", "parent"] as const;
  if (
    normalizedRole &&
    (knownRoles as readonly string[]).includes(normalizedRole)
  ) {
    return (
      <Badge.Role
        role={normalizedRole as "admin" | "professor" | "member" | "parent"}
      />
    );
  }

  // ── Passe 3 : fallback générique ─────────────────────────────────────────
  return <Badge variant="neutral">{t("badges.unknown")}</Badge>;
};
