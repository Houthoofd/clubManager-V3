/**
 * MessageListItem.tsx
 * Composant d'un élément dans la liste des messages
 */

import { useTranslation } from "react-i18next";
import type { MessageWithDetails } from "../api/messagingApi";
import { EnvelopeIcon } from "@patternfly/react-icons";

// ─── Props ────────────────────────────────────────────────────────────────────

interface MessageListItemProps {
  message: MessageWithDetails;
  isSelected: boolean;
  isInbox: boolean;
  onClick: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Tronque une chaîne à maxLength caractères
 */
const truncate = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "…";
};

/**
 * Calcule les différences temporelles pour le formatage relatif
 */
export const getRelativeDateValues = (dateStr: string) => {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMs = now - date;

  if (isNaN(date)) return null;

  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  return {
    diffSecs,
    diffMins,
    diffHours,
    diffDays,
    diffWeeks,
    diffMonths,
  };
};

// ─── Component ────────────────────────────────────────────────────────────────

export const MessageListItem = ({
  message,
  isSelected,
  isInbox,
  onClick,
}: MessageListItemProps) => {
  const { t } = useTranslation("messages");
  const isUnread = isInbox && !message.lu;
  const displayName = isInbox
    ? message.expediteur_nom
    : message.destinataire_nom;
  const preview = message.sujet ? message.sujet : truncate(message.contenu, 60);

  // Format relative date with i18n
  const values = getRelativeDateValues(message.created_at);
  let relativeDate = "";
  if (values) {
    if (values.diffSecs < 60) {
      relativeDate = t("relative.now");
    } else if (values.diffMins < 60) {
      relativeDate = t("relative.minutesAgo", { count: values.diffMins });
    } else if (values.diffHours < 24) {
      relativeDate = t("relative.hoursAgo", { count: values.diffHours });
    } else if (values.diffDays < 7) {
      relativeDate = t("relative.daysAgo", { count: values.diffDays });
    } else if (values.diffWeeks < 5) {
      relativeDate = t("relative.weeksAgo", { count: values.diffWeeks });
    } else if (values.diffMonths < 12) {
      relativeDate = t("relative.monthsAgo", { count: values.diffMonths });
    } else {
      relativeDate = t("relative.yearsAgo", {
        count: Math.floor(values.diffMonths / 12),
      });
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full text-left px-4 py-3 border-b border-gray-100 transition-colors",
        "hover:bg-gray-50 focus:outline-none focus:bg-gray-50",
        isSelected ? "bg-blue-50" : "bg-white",
      ].join(" ")}
    >
      {/* Ligne 1 : nom + icônes + date */}
      <div className="flex items-center gap-2 min-w-0">
        {/* Point bleu non-lu */}
        <span
          className={[
            "flex-shrink-0 w-2 h-2 rounded-full",
            isUnread ? "bg-blue-500" : "bg-transparent",
          ].join(" ")}
          aria-hidden="true"
        />

        {/* Nom expéditeur / destinataire */}
        <span
          className={[
            "flex-1 truncate text-sm text-gray-900",
            isUnread ? "font-semibold" : "font-normal",
          ].join(" ")}
        >
          {displayName}
        </span>

        {/* Icône email */}
        {message.envoye_par_email && (
          <span
            className="flex-shrink-0 text-blue-400"
            title={t("badges.email")}
          >
            <EnvelopeIcon
              className="inline-block align-middle"
              style={{ fontSize: "12px" }}
            />
          </span>
        )}

        {/* Badge groupé */}
        {message.broadcast_id !== null && (
          <span className="flex-shrink-0 text-xs bg-purple-100 text-purple-700 rounded-full px-1.5 py-0.5 leading-none">
            {t("badges.grouped")}
          </span>
        )}

        {/* Date relative */}
        <span className="flex-shrink-0 text-xs text-gray-400 whitespace-nowrap">
          {relativeDate}
        </span>
      </div>

      {/* Ligne 2 : prévisualisation sujet / contenu */}
      <div className="mt-0.5 pl-4">
        <p
          className={[
            "text-xs truncate",
            isUnread ? "text-gray-700 font-medium" : "text-gray-500",
          ].join(" ")}
        >
          {preview}
        </p>
      </div>
    </button>
  );
};

export default MessageListItem;
