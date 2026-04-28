/**
 * NotificationsPage
 * Page complète de gestion des notifications in-app
 */

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
} from '../hooks/useNotifications';
import type { NotificationDto } from '../api/notificationsApi';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Retourne un temps relatif simple en français
 */
function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;

  if (diffMs < 0) return "à l'instant";

  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'il y a quelques secondes';

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `il y a ${diffMin} min`;

  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH} h`;

  const diffD = Math.floor(diffH / 24);
  if (diffD < 30) return `il y a ${diffD} j`;

  const diffM = Math.floor(diffD / 30);
  if (diffM < 12) return `il y a ${diffM} mois`;

  const diffY = Math.floor(diffM / 12);
  return `il y a ${diffY} an${diffY > 1 ? 's' : ''}`;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<
  NotificationDto['type'],
  { borderColor: string; bgColor: string; badgeColor: string; icon: string; label: string }
> = {
  info: {
    borderColor: 'border-l-blue-500',
    bgColor: 'bg-blue-50',
    badgeColor: 'bg-blue-100 text-blue-700',
    icon: 'ℹ️',
    label: 'Info',
  },
  warning: {
    borderColor: 'border-l-yellow-500',
    bgColor: 'bg-yellow-50',
    badgeColor: 'bg-yellow-100 text-yellow-700',
    icon: '⚠️',
    label: 'Attention',
  },
  error: {
    borderColor: 'border-l-red-500',
    bgColor: 'bg-red-50',
    badgeColor: 'bg-red-100 text-red-700',
    icon: '❌',
    label: 'Erreur',
  },
  success: {
    borderColor: 'border-l-green-500',
    bgColor: 'bg-green-50',
    badgeColor: 'bg-green-100 text-green-700',
    icon: '✅',
    label: 'Succès',
  },
};

// ─── Tab definition ───────────────────────────────────────────────────────────

type TabKey = 'all' | 'unread' | NotificationDto['type'];

interface Tab {
  key: TabKey;
  label: string;
}

const TABS: Tab[] = [
  { key: 'all', label: 'Tous' },
  { key: 'unread', label: 'Non lus' },
  { key: 'info', label: 'Info' },
  { key: 'warning', label: 'Attention' },
  { key: 'error', label: 'Erreur' },
  { key: 'success', label: 'Succès' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SpinnerIcon() {
  return (
    <svg
      className="animate-spin h-8 w-8 text-blue-500"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
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

function EmptyBellIcon() {
  return (
    <svg
      className="h-16 w-16 text-gray-300"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
      />
    </svg>
  );
}

interface NotificationItemProps {
  notification: NotificationDto;
  onRead: (id: number) => void;
  isMarkingRead: boolean;
}

function NotificationItem({ notification, onRead, isMarkingRead }: NotificationItemProps) {
  const config = TYPE_CONFIG[notification.type] ?? TYPE_CONFIG.info;

  const handleClick = () => {
    if (!notification.lu) {
      onRead(notification.id);
    }
  };

  return (
    <div
      className={`
        flex items-start gap-4 px-6 py-4 border-l-4 transition-colors
        ${config.borderColor}
        ${notification.lu ? 'bg-white' : config.bgColor}
      `}
    >
      {/* Type icon */}
      <span className="text-xl leading-none mt-0.5 flex-shrink-0" aria-label={config.label}>
        {config.icon}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Title */}
            <p className="text-sm font-semibold text-gray-900">
              {notification.titre}
            </p>
            {/* Body */}
            <p className="text-sm text-gray-600 mt-1 line-clamp-2 break-words">
              {notification.contenu}
            </p>
          </div>

          {/* Right side: badge + time */}
          <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.badgeColor}`}
            >
              {config.label}
            </span>
            <span className="text-xs text-gray-400 whitespace-nowrap">
              {relativeTime(notification.created_at)}
            </span>
          </div>
        </div>
      </div>

      {/* Mark as read button (only for unread) */}
      {!notification.lu && (
        <button
          onClick={handleClick}
          disabled={isMarkingRead}
          className="flex-shrink-0 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-0.5"
          title="Marquer comme lu"
        >
          <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
          <span className="hidden sm:inline">Lu</span>
        </button>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function NotificationsPage() {
  const { t } = useTranslation('common');
  const [activeTab, setActiveTab] = useState<TabKey>('all');

  // Always fetch all 50 most recent; filter client-side for snappy tab switches
  const { data: notifications = [], isLoading, isError, refetch } = useNotifications();
  const { mutate: markAsRead, isPending: isMarkingOne } = useMarkAsRead();
  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllAsRead();

  // Limit to 50 most recent then apply tab filter
  const base = useMemo(() => notifications.slice(0, 50), [notifications]);

  const filtered = useMemo(() => {
    switch (activeTab) {
      case 'all':
        return base;
      case 'unread':
        return base.filter((n) => !n.lu);
      default:
        return base.filter((n) => n.type === activeTab);
    }
  }, [base, activeTab]);

  const unreadCount = useMemo(() => base.filter((n) => !n.lu).length, [base]);
  const hasUnread = unreadCount > 0;

  // Tab badge counts
  const tabCounts = useMemo<Partial<Record<TabKey, number>>>(() => ({
    unread: base.filter((n) => !n.lu).length,
    info: base.filter((n) => n.type === 'info').length,
    warning: base.filter((n) => n.type === 'warning').length,
    error: base.filter((n) => n.type === 'error').length,
    success: base.filter((n) => n.type === 'success').length,
  }), [base]);

  const handleMarkAsRead = (id: number) => {
    markAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes notifications</h1>
          {!isLoading && (
            <p className="text-sm text-gray-500 mt-1">
              {base.length === 0
                ? 'Aucune notification'
                : `${base.length} notification${base.length > 1 ? 's' : ''}${
                    hasUnread ? ` · ${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : ''
                  }`}
            </p>
          )}
        </div>

        {hasUnread && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={isMarkingAll}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isMarkingAll ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                En cours...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                Tout marquer comme lu
              </>
            )}
          </button>
        )}
      </div>

      {/* Main card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Tab bar */}
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="flex" aria-label="Filtres de notifications">
            {TABS.map((tab) => {
              const count = tabCounts[tab.key];
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`
                    relative flex-shrink-0 flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                    ${
                      isActive
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {tab.label}
                  {count !== undefined && count > 0 && (
                    <span
                      className={`
                        text-xs rounded-full px-1.5 py-0.5 leading-none font-semibold
                        ${isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}
                      `}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        {isLoading ? (
          /* Loading state */
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <SpinnerIcon />
            <p className="text-sm text-gray-400">{t('common.loading')}</p>
          </div>
        ) : isError ? (
          /* Error state */
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <span className="text-4xl">⚠️</span>
            <p className="text-sm text-gray-600 font-medium">
              Impossible de charger les notifications
            </p>
            <button
              onClick={() => refetch()}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              Réessayer
            </button>
          </div>
        ) : filtered.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <EmptyBellIcon />
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Aucune notification</p>
              {activeTab !== 'all' && (
                <p className="text-xs text-gray-400 mt-1">
                  Aucune notification dans cette catégorie
                </p>
              )}
            </div>
            {activeTab !== 'all' && (
              <button
                onClick={() => setActiveTab('all')}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Voir toutes les notifications
              </button>
            )}
          </div>
        ) : (
          /* Notification list */
          <ul className="divide-y divide-gray-100">
            {filtered.map((notification) => (
              <li key={notification.id}>
                <NotificationItem
                  notification={notification}
                  onRead={handleMarkAsRead}
                  isMarkingRead={isMarkingOne}
                />
              </li>
            ))}
          </ul>
        )}

        {/* Footer info */}
        {!isLoading && !isError && base.length >= 50 && (
          <div className="border-t border-gray-100 px-6 py-3 bg-gray-50">
            <p className="text-xs text-gray-400 text-center">
              Affichage des 50 notifications les plus récentes
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationsPage;
