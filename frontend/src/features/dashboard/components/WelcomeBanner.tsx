/**
 * @fileoverview WelcomeBanner Component
 * @module features/dashboard/components
 *
 * Affiche un bandeau de bienvenue personnalisé avec la date courante
 * et un badge indiquant le rôle de l'utilisateur connecté.
 */

import React from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { useAuthStore } from "../../../shared/stores/authStore";

// ─── Types ────────────────────────────────────────────────────────────────────

type RoleKey = "admin" | "professor" | "member" | "parent";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Retourne les classes Tailwind du badge selon le rôle.
 */
function getRoleBadgeClasses(role: string | undefined): string {
  switch (role as RoleKey) {
    case "admin":
      return "bg-blue-100 text-blue-800 ring-1 ring-blue-200";
    case "professor":
      return "bg-purple-100 text-purple-800 ring-1 ring-purple-200";
    case "member":
      return "bg-green-100 text-green-800 ring-1 ring-green-200";
    case "parent":
      return "bg-orange-100 text-orange-800 ring-1 ring-orange-200";
    default:
      return "bg-gray-100 text-gray-800 ring-1 ring-gray-200";
  }
}

// ─── Icône ────────────────────────────────────────────────────────────────────

/**
 * Icône SVG « soleil » en style heroicons outline.
 */
const SunIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
    />
  </svg>
);

// ─── Composant ────────────────────────────────────────────────────────────────

/**
 * WelcomeBanner
 *
 * Affiche :
 * - Un message de bienvenue personnalisé avec le prénom de l'utilisateur.
 * - La date du jour dans la langue courante (fr / en).
 * - Un badge coloré indiquant le rôle de l'utilisateur.
 *
 * @example
 * ```tsx
 * <WelcomeBanner />
 * ```
 */
export function WelcomeBanner() {
  const { t, i18n } = useTranslation("dashboard");
  const user = useAuthStore((state) => state.user);

  // Sélection de la locale date-fns selon la langue i18n active
  const dateLocale = i18n.language.startsWith("fr") ? fr : enUS;

  const todayFormatted = format(new Date(), "EEEE d MMMM yyyy", {
    locale: dateLocale,
  });

  const roleBadgeClasses = getRoleBadgeClasses(user?.role_app);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      {/* Partie gauche — salutation + date */}
      <div className="flex items-center gap-4">
        {/* Icône décorative */}
        <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-yellow-50 text-yellow-500">
          <SunIcon className="w-7 h-7" />
        </div>

        {/* Texte */}
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {t("welcome.greeting", { name: user?.first_name ?? "" })}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5 capitalize">
            {t("welcome.today", { date: todayFormatted })}
          </p>
        </div>
      </div>

      {/* Partie droite — badge rôle */}
      {user?.role_app && (
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${roleBadgeClasses}`}
        >
          {t(`roles.${user.role_app}`)}
        </span>
      )}
    </div>
  );
}

export default WelcomeBanner;
