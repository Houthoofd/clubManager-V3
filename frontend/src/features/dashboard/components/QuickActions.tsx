/**
 * @fileoverview QuickActions Component
 * @module features/dashboard/components
 *
 * Grille de raccourcis de navigation rapide vers les principales sections
 * de l'application. Chaque carte est cliquable et redirige vers la route
 * correspondante.
 */

import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

// ─── Icônes SVG (heroicons outline) ──────────────────────────────────────────

const CalendarDaysIcon: React.FC<{ className?: string }> = ({
  className = "",
}) => (
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
      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z"
    />
  </svg>
);

const UsersIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
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
      d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
    />
  </svg>
);

const CreditCardIcon: React.FC<{ className?: string }> = ({
  className = "",
}) => (
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
      d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
    />
  </svg>
);

const ShoppingBagIcon: React.FC<{ className?: string }> = ({
  className = "",
}) => (
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
      d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
    />
  </svg>
);

const ChatBubbleIcon: React.FC<{ className?: string }> = ({
  className = "",
}) => (
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
      d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
    />
  </svg>
);

const ChartBarIcon: React.FC<{ className?: string }> = ({
  className = "",
}) => (
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
      d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
    />
  </svg>
);

const UserCircleIcon: React.FC<{ className?: string }> = ({
  className = "",
}) => (
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
      d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
    />
  </svg>
);

const BellIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
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
      d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
    />
  </svg>
);

// ─── Config des actions ───────────────────────────────────────────────────────

interface ActionConfig {
  route: string;
  labelKey: string;
  Icon: React.FC<{ className?: string }>;
  /** Couleur du cercle d'icône (classe Tailwind bg-xxx + text-xxx) */
  iconColor: string;
}

const ACTIONS: ActionConfig[] = [
  {
    route: "/courses",
    labelKey: "quickActions.courses",
    Icon: CalendarDaysIcon,
    iconColor: "bg-indigo-100 text-indigo-600",
  },
  {
    route: "/users",
    labelKey: "quickActions.members",
    Icon: UsersIcon,
    iconColor: "bg-blue-100 text-blue-600",
  },
  {
    route: "/payments",
    labelKey: "quickActions.payments",
    Icon: CreditCardIcon,
    iconColor: "bg-green-100 text-green-600",
  },
  {
    route: "/store",
    labelKey: "quickActions.store",
    Icon: ShoppingBagIcon,
    iconColor: "bg-orange-100 text-orange-600",
  },
  {
    route: "/messages",
    labelKey: "quickActions.messages",
    Icon: ChatBubbleIcon,
    iconColor: "bg-teal-100 text-teal-600",
  },
  {
    route: "/statistics",
    labelKey: "quickActions.statistics",
    Icon: ChartBarIcon,
    iconColor: "bg-purple-100 text-purple-600",
  },
  {
    route: "/profile",
    labelKey: "quickActions.profile",
    Icon: UserCircleIcon,
    iconColor: "bg-gray-100 text-gray-600",
  },
  {
    route: "/notifications",
    labelKey: "quickActions.notifications",
    Icon: BellIcon,
    iconColor: "bg-yellow-100 text-yellow-600",
  },
];

// ─── Composant ────────────────────────────────────────────────────────────────

/**
 * QuickActions
 *
 * Affiche une grille de 8 raccourcis de navigation rapide.
 * Chaque carte redirige vers la route correspondante via `useNavigate`.
 *
 * @example
 * ```tsx
 * <QuickActions />
 * ```
 */
export function QuickActions() {
  const { t } = useTranslation("dashboard");
  const navigate = useNavigate();

  return (
    <section aria-labelledby="quick-actions-title">
      <h2
        id="quick-actions-title"
        className="text-base font-semibold text-gray-800 mb-3"
      >
        {t("quickActions.title")}
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {ACTIONS.map(({ route, labelKey, Icon, iconColor }) => (
          <div
            key={route}
            role="button"
            tabIndex={0}
            onClick={() => navigate(route)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate(route);
              }
            }}
            className="bg-white rounded-xl shadow hover:shadow-md transition-shadow cursor-pointer p-5 flex flex-col items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            {/* Cercle coloré avec icône */}
            <div
              className={`flex items-center justify-center w-11 h-11 rounded-full ${iconColor}`}
            >
              <Icon className="w-6 h-6" />
            </div>

            {/* Label */}
            <span className="text-sm font-medium text-gray-700 text-center leading-tight">
              {t(labelKey)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default QuickActions;
