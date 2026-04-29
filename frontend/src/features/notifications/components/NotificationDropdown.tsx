/**
 * NotificationDropdown
 * Dropdown de notifications in-app pour le header
 */

import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
} from '../hooks/useNotifications';
import type { NotificationDto } from '../api/notificationsApi';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Retourne un temps relatif simple en français
 * ex: "il y a 5 min", "il y a 2 h", "il y a 3 j"
 */
function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;

  if (diffMs < 0) return 'à l\'instant';

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

/**
 * Config visuelle par type de notification
 */
const TYPE_CONFIG: Record<
  NotificationDto['type'],
  { borderColor: string; icon: string; label: string }
> = {
  info: {
    borderColor: 'border-l-blue-500',
    icon: 'ℹ️',
    label: 'Info',
  },
  warning: {
    borderColor: 'border-l-yellow-500',
    icon: '⚠️',
    label: 'Attention',
  },
  error: {
    borderColor: 'border-l-red-500',
    icon: '❌',
    label: 'Erreur',
  },
  success: {
    borderColor: 'border-l-green-500',
    icon: '✅',
    label: 'Succès',
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SpinnerIcon() {
  return (
    <svg
      className="animate-spin h-6 w-6 text-blue-500"
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
      className="h-10 w-10 text-gray-300"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
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
    <button
      onClick={handleClick}
      disabled={isMarkingRead}
      className={`
        w-full text-left px-4 py-3 border-l-4 transition-colors
        hover:bg-gray-50 focus:outline-none focus:bg-gray-50
        ${config.borderColor}
        ${notification.lu ? 'bg-white' : 'bg-blue-50'}
        ${isMarkingRead ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <div className="flex items-start gap-2">
        {/* Type icon */}
        <span className="text-base leading-none mt-0.5 flex-shrink-0" aria-label={config.label}>
          {config.icon}
        </span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <p className="text-sm font-semibold text-gray-900 truncate">
            {notification.titre}
          </p>

          {/* Body (max 2 lines) */}
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 break-words">
            {notification.contenu}
          </p>

          {/* Relative time */}
          <p className="text-xs text-gray-400 mt-1">
            {relativeTime(notification.created_at)}
          </p>
        </div>

        {/* Unread dot */}
        {!notification.lu && (
          <span className="flex-shrink-0 w-2 h-2 mt-1 rounded-full bg-blue-500" />
        )}
      </div>
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
  const { t } = useTranslation('common');
  const { data: notifications = [], isLoading } = useNotifications();
  const { mutate: markAsRead, isPending: isMarkingOne } = useMarkAsRead();
  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllAsRead();

  if (!isOpen) return null;

  const displayed = notifications.slice(0, 10);
  const unreadCount = notifications.filter((n) => !n.lu).length;
  const hasUnread = unreadCount > 0;

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleMarkAsRead = (id: number) => {
    markAsRead(id);
  };

  return (
    <div
      className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white rounded-lg shadow-xl border border-gray-200 z-50"
      role="dialog"
      aria-label={t('navigation.notifications')}
    >
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900">
            {t('navigation.notifications')}
          </h3>
          {hasUnread && (
            <span className="bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none font-bold">
              {unreadCount}
            </span>
          )}
        </div>

        {hasUnread && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={isMarkingAll}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isMarkingAll ? 'En cours...' : 'Tout marquer comme lu'}
          </button>
        )}
      </div>

      {/* Body */}
      {isLoading ? (
        /* Loading state */
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <SpinnerIcon />
          <p className="text-sm text-gray-400">{t('common.loading')}</p>
        </div>
      ) : displayed.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <EmptyBellIcon />
          <p className="text-sm text-gray-400">Aucune notification</p>
        </div>
      ) : (
        /* Notification list */
        <ul className="divide-y divide-gray-100">
          {displayed.map((notification) => (
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

      {/* Footer */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-2.5">
        <Link
          to="/notifications"
          onClick={onClose}
          className="block text-center text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          Voir toutes les notifications
        </Link>
      </div>
    </div>
  );
}

export default NotificationDropdown;
