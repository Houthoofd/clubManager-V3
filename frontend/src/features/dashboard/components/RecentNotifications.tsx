/**
 * @fileoverview RecentNotifications Component
 * @module features/dashboard/components
 *
 * Affiche les 5 dernières notifications avec possibilité de toutes les
 * marquer comme lues. Gère les états de chargement (skeleton) et vide.
 */

import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  useNotifications,
  useMarkAllAsRead,
} from "../../notifications/hooks/useNotifications";
import { formatRelativeDate } from "../../../features/statistics/utils/formatting";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NotificationItem {
  id: number;
  user_id: number;
  type: "info" | "warning" | "error" | "success";
  titre: string;
  contenu: string;
  lu: boolean;
  created_at: string;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

/** Classes Tailwind de badge par type de notification */
const TYPE_BADGE_CLASSES: Record<NotificationItem["type"], string> = {
  info:    "bg-blue-100 text-blue-700",
  success: "bg-green-100 text-green-700",
  warning: "bg-orange-100 text-orange-700",
  error:   "bg-red-100 text-red-700",
};

// ─── Icônes SVG (heroicons outline) ──────────────────────────────────────────

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

// ─── Composant ────────────────────────────────────────────────────────────────

/**
 * RecentNotifications
 *
 * Récupère toutes les notifications, affiche les 5 premières et propose
 * un bouton "Tout marquer comme lu" si des notifications non lues existent.
 *
 * @example
 * ```tsx
 * <RecentNotifications />
 * ```
 */
export function RecentNotifications() {
  const { t } = useTranslation("dashboard");
  const navigate = useNavigate();

  const { data: notifications, isLoading } = useNotifications(false);
  const markAllAsRead = useMarkAllAsRead();

  // Les 5 premières notifications
  const recent: NotificationItem[] = (
    notifications as NotificationItem[] | undefined
  )?.slice(0, 5) ?? [];

  const hasUnread = recent.some((n) => !n.lu);

  return (
    <section
      className="bg-white rounded-xl shadow p-6"
      aria-labelledby="recent-notifications-title"
    >
      {/* ── En-tête ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <h2
          id="recent-notifications-title"
          className="text-base font-semibold text-gray-800"
        >
          {t("notifications.title")}
        </h2>

        {hasUnread && !isLoading && (
          <button
            type="button"
            onClick={() => markAllAsRead.mutate()}
            disabled={markAllAsRead.isPending}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 disabled:opacity-50 transition-colors"
          >
            {t("notifications.markAllRead")}
          </button>
        )}
      </div>

      {/* ── Squelettes de chargement ─────────────────────────────────────── */}
      {isLoading && (
        <div className="space-y-3" aria-busy="true" aria-label={t("loading")}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-200 rounded h-12 w-full"
            />
          ))}
        </div>
      )}

      {/* ── État vide ────────────────────────────────────────────────────── */}
      {!isLoading && recent.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <BellIcon className="w-10 h-10 text-gray-300 mb-3" />
          <p className="text-sm font-medium text-gray-600">
            {t("notifications.empty")}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {t("notifications.emptyDesc")}
          </p>
        </div>
      )}

      {/* ── Liste des notifications ──────────────────────────────────────── */}
      {!isLoading && recent.length > 0 && (
        <ul className="divide-y divide-gray-100" role="list">
          {recent.map((n) => (
            <li key={n.id} className="py-3 flex items-start gap-3">
              {/* Point bleu (non lu) — toujours dans le flux pour l'alignement */}
              <span className="mt-2 flex-shrink-0 w-2 h-2" aria-hidden="true">
                {!n.lu && (
                  <span className="block w-2 h-2 rounded-full bg-blue-500" />
                )}
              </span>

              <div className="flex-1 min-w-0">
                {/* Badge type + titre */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${TYPE_BADGE_CLASSES[n.type]}`}
                  >
                    {t(`notifications.types.${n.type}`)}
                  </span>
                  <span className="text-sm font-semibold text-gray-800 truncate">
                    {n.titre}
                  </span>
                </div>

                {/* Contenu tronqué à 80 caractères */}
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                  {n.contenu.length > 80
                    ? `${n.contenu.slice(0, 80)}...`
                    : n.contenu}
                </p>

                {/* Date relative */}
                <p className="text-xs text-gray-400 mt-0.5">
                  {formatRelativeDate(n.created_at)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* ── Lien "Voir toutes les notifications" ─────────────────────────── */}
      {!isLoading && (
        <div className="mt-4 pt-3 border-t border-gray-100 text-center">
          <button
            type="button"
            onClick={() => navigate("/notifications")}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            {t("notifications.viewAll")}
          </button>
        </div>
      )}
    </section>
  );
}

export default RecentNotifications;
