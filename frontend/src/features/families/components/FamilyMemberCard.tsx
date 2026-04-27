/**
 * FamilyMemberCard
 * Carte affichant les informations d'un membre de famille.
 */

import { useTranslation } from "react-i18next";
import {
  UserIcon,
  ShieldAltIcon,
  TrashIcon as PFTrashIcon,
} from "@patternfly/react-icons";
import type { FamilyMemberResponseDto } from "@clubmanager/types";
import { Card } from "../../../shared/components";

/**
 * Props du composant FamilyMemberCard
 */
interface FamilyMemberCardProps {
  /** Données du membre à afficher */
  member: FamilyMemberResponseDto;
  /** Vrai si l'utilisateur connecté est responsable (peut retirer des membres) */
  canRemove: boolean;
  /** Callback déclenché après confirmation de retrait */
  onRemove: (userId: string) => void;
  /** Affiche un spinner pendant la suppression */
  isRemoving?: boolean;
}

// ─── Helpers visuels par rôle ────────────────────────────────────────────────

const ROLE_AVATAR_COLOR: Record<string, string> = {
  parent: "bg-green-500",
  tuteur: "bg-yellow-500",
  enfant: "bg-blue-500",
  conjoint: "bg-purple-500",
  autre: "bg-gray-400",
};

const ROLE_BADGE_STYLE: Record<string, string> = {
  parent: "bg-green-100 text-green-700",
  tuteur: "bg-yellow-100 text-yellow-700",
  enfant: "bg-blue-100 text-blue-700",
  conjoint: "bg-purple-100 text-purple-700",
  autre: "bg-gray-100 text-gray-600",
};

// ─── Utilitaires ─────────────────────────────────────────────────────────────

/**
 * Calcule l'âge en années à partir d'une date au format YYYY-MM-DD.
 */
function calculateAge(dateOfBirth: string): number {
  const parts = dateOfBirth.split("-").map(Number);
  const year = parts[0] ?? 0;
  const month = parts[1] ?? 1;
  const day = parts[2] ?? 1;
  const today = new Date();
  const birth = new Date(year, month - 1, day);
  let age = today.getFullYear() - birth.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() &&
      today.getDate() >= birth.getDate());
  if (!hasHadBirthdayThisYear) age--;
  return age;
}

/**
 * Retourne les deux initiales majuscules d'un prénom et d'un nom.
 */
function getInitials(firstName: string, lastName: string): string {
  const f = firstName.trim()[0]?.toUpperCase() ?? "";
  const l = lastName.trim()[0]?.toUpperCase() ?? "";
  return `${f}${l}`;
}

// ─── Icônes inline ───────────────────────────────────────────────────────────

function SpinnerIcon() {
  return (
    <svg
      className="animate-spin h-4 w-4 text-red-500"
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
  );
}

// ─── Composant ───────────────────────────────────────────────────────────────

/**
 * FamilyMemberCard — Carte d'un membre de famille.
 *
 * Affiche l'avatar avec initiales colorées selon le rôle, les badges (rôle,
 * mineur, tuteur légal), l'âge calculé, le grade si disponible et un bouton
 * conditionnel de retrait avec confirmation.
 */
export function FamilyMemberCard({
  member,
  canRemove,
  onRemove,
  isRemoving = false,
}: FamilyMemberCardProps) {
  const { t } = useTranslation("families");
  const avatarColor = ROLE_AVATAR_COLOR[member.role] ?? "bg-gray-400";
  const badgeStyle =
    ROLE_BADGE_STYLE[member.role] ?? "bg-gray-100 text-gray-600";
  const roleLabel = t(`roles.${member.role}` as any) || member.role;
  const age = calculateAge(member.date_of_birth);
  const initials = getInitials(member.first_name, member.last_name);

  const handleRemove = () => {
    const confirmed = window.confirm(
      t("messages.confirm.removeMessage", {
        firstName: member.first_name,
        lastName: member.last_name,
      }),
    );
    if (confirmed) {
      onRemove(member.userId);
    }
  };

  return (
    <Card variant="compact" hover className="flex flex-col gap-4">
      {/* ── En-tête : avatar + nom + userId ── */}
      <div className="flex items-center gap-3">
        {/* Cercle avatar avec initiales */}
        <div
          className={`w-12 h-12 rounded-full ${avatarColor} flex-shrink-0 flex items-center justify-center text-white font-semibold text-base select-none`}
          aria-hidden="true"
        >
          {initials}
        </div>

        {/* Nom et identifiant */}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900 text-sm leading-snug truncate">
            {member.first_name} {member.last_name}
          </p>
          <p
            className="text-xs text-gray-400 truncate mt-0.5"
            title={member.userId}
          >
            {member.userId}
          </p>
        </div>
      </div>

      {/* ── Badges ── */}
      <div className="flex flex-wrap gap-2">
        {/* Rôle */}
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeStyle}`}
        >
          {roleLabel}
        </span>

        {/* Mineur */}
        {member.est_mineur && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-700">
            <UserIcon className="h-3 w-3" aria-hidden="true" />
            {t("badges.minor")}
          </span>
        )}

        {/* Tuteur légal */}
        {member.est_tuteur_legal && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            <ShieldAltIcon className="h-3 w-3" aria-hidden="true" />
            {t("badges.legalGuardian")}
          </span>
        )}
      </div>

      {/* ── Informations détaillées ── */}
      <dl className="text-sm text-gray-600 space-y-1">
        <div className="flex gap-2">
          <dt className="font-medium text-gray-500 flex-shrink-0">
            {t("fields.age")}
          </dt>
          <dd>
            {age} {t("age.year", { count: age })}
          </dd>
        </div>

        {member.grade?.nom && (
          <div className="flex gap-2">
            <dt className="font-medium text-gray-500 flex-shrink-0">
              {t("fields.grade")}
            </dt>
            <dd>{member.grade.nom}</dd>
          </div>
        )}
      </dl>

      {/* ── Bouton Retirer ── */}
      {canRemove && (
        <div className="flex justify-end mt-auto pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={handleRemove}
            disabled={isRemoving}
            aria-label={t("aria.removeMember", {
              firstName: member.first_name,
              lastName: member.last_name,
            })}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 active:bg-red-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isRemoving ? (
              <>
                <SpinnerIcon />
                {t("states.removing")}
              </>
            ) : (
              <>
                <PFTrashIcon className="h-4 w-4" aria-hidden="true" />
                {t("actions.removeMember")}
              </>
            )}
          </button>
        </div>
      )}
    </Card>
  );
}
