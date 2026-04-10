/**
 * MessagesPage.tsx
 * Page principale de messagerie — layout 3 colonnes (sidebar / liste / détail)
 */

import { useState } from "react";
import { useMessaging } from "../hooks/useMessaging";
import { useAuth } from "../../../shared/hooks/useAuth";
import { UserRole } from "@clubmanager/types";
import { ComposeModal } from "../components/ComposeModal";
import { MessageListItem } from "../components/MessageListItem";
import { MessageDetail } from "../components/MessageDetail";
import { TemplatesTab } from "../components/TemplatesTab";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const MessageSkeleton = () => (
  <div className="animate-pulse px-4 py-3 border-b border-gray-100">
    <div className="flex items-center gap-2 mb-1.5">
      <div className="w-2 h-2 rounded-full bg-gray-200 flex-shrink-0" />
      <div className="h-3.5 bg-gray-200 rounded w-2/5" />
      <div className="ml-auto h-3 bg-gray-200 rounded w-12" />
    </div>
    <div className="pl-4">
      <div className="h-3 bg-gray-100 rounded w-4/5" />
    </div>
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyList = ({ tab }: { tab: "inbox" | "sent" }) => (
  <div className="flex flex-col items-center justify-center h-full py-16 text-gray-400 select-none">
    <span className="text-5xl mb-4">{tab === "inbox" ? "📭" : "📤"}</span>
    <p className="text-sm font-medium">
      {tab === "inbox" ? "Aucun message reçu" : "Aucun message envoyé"}
    </p>
  </div>
);

// ─── No Selection ─────────────────────────────────────────────────────────────

const NoSelection = () => (
  <div className="flex flex-col items-center justify-center h-full text-gray-400 select-none">
    <span className="text-6xl mb-4">✉️</span>
    <p className="text-base font-medium text-gray-500">
      Sélectionnez un message
    </p>
    <p className="text-sm mt-1">
      Cliquez sur un message dans la liste pour le lire.
    </p>
  </div>
);

// ─── Pagination controls ──────────────────────────────────────────────────────

interface PaginationBarProps {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}

const PaginationBar = ({
  page,
  totalPages,
  onPrev,
  onNext,
}: PaginationBarProps) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100 bg-white flex-shrink-0">
      <button
        onClick={onPrev}
        disabled={page <= 1}
        className="text-xs px-3 py-1 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        ◀ Préc.
      </button>
      <span className="text-xs text-gray-500">
        {page} / {totalPages}
      </span>
      <button
        onClick={onNext}
        disabled={page >= totalPages}
        className="text-xs px-3 py-1 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Suiv. ▶
      </button>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const MessagesPage = () => {
  const {
    inbox,
    inboxPagination,
    sent,
    sentPagination,
    selectedMessage,
    unreadCount,
    activeTab,
    isLoading,
    isLoadingMessage,
    error,
    setActiveTab,
    selectMessage,
    clearSelectedMessage,
    deleteMessage,
    fetchInbox,
    fetchSent,
  } = useMessaging();

  const { user } = useAuth();
  const userRole = (user?.role_app ?? UserRole.MEMBER) as UserRole;
  const canSeeTemplates =
    userRole === UserRole.ADMIN || userRole === UserRole.PROFESSOR;

  const [isComposeOpen, setIsComposeOpen] = useState(false);

  // Sur mobile, on affiche soit la liste soit le détail
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleSelectMessage = (id: number) => {
    selectMessage(id);
    setMobileView("detail");
  };

  const handleBack = () => {
    clearSelectedMessage();
    setMobileView("list");
  };

  const handleDelete = async () => {
    if (!selectedMessage) return;
    await deleteMessage(selectedMessage.id);
    setMobileView("list");
  };

  const handleTabChange = (tab: "inbox" | "sent" | "templates") => {
    setActiveTab(tab);
    setMobileView("list");
  };

  const handleComposeSent = () => {
    // Recharger les envoyés si on est sur cet onglet
    if (activeTab === "sent") {
      fetchSent();
    }
  };

  const handlePrevPage = () => {
    if (activeTab === "inbox" && inboxPagination.page > 1) {
      fetchInbox(inboxPagination.page - 1);
    } else if (activeTab === "sent" && sentPagination.page > 1) {
      fetchSent(sentPagination.page - 1);
    }
  };

  const handleNextPage = () => {
    if (
      activeTab === "inbox" &&
      inboxPagination.page < inboxPagination.totalPages
    ) {
      fetchInbox(inboxPagination.page + 1);
    } else if (
      activeTab === "sent" &&
      sentPagination.page < sentPagination.totalPages
    ) {
      fetchSent(sentPagination.page + 1);
    }
  };

  const currentMessages = activeTab === "sent" ? sent : inbox;
  const currentPagination =
    activeTab === "sent" ? sentPagination : inboxPagination;

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-[calc(100vh-4rem-3rem)] bg-white rounded-xl shadow overflow-hidden border border-gray-200">
      {/* ════════════════════════════════════════════════════
          Colonne 1 — Sidebar (200px fixe)
          Cachée sur mobile quand on affiche le détail
      ════════════════════════════════════════════════════ */}
      <aside
        className={[
          "w-52 flex-shrink-0 border-r border-gray-200 flex flex-col bg-gray-50",
          // Mobile : masquer la sidebar quand le détail est visible
          mobileView === "detail" ? "hidden lg:flex" : "flex",
        ].join(" ")}
      >
        {/* Bouton Nouveau message */}
        <div className="p-3">
          <button
            onClick={() => setIsComposeOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1"
          >
            <span className="text-base">✏️</span>
            Nouveau message
          </button>
        </div>

        {/* Navigation onglets */}
        <nav className="flex-1 px-2 pb-3">
          <ul className="space-y-0.5">
            {/* Boîte de réception */}
            <li>
              <button
                onClick={() => handleTabChange("inbox")}
                className={[
                  "w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left",
                  activeTab === "inbox"
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                ].join(" ")}
              >
                <span className="text-base">📥</span>
                <span className="flex-1 truncate">Boîte de réception</span>
                {unreadCount > 0 && (
                  <span className="flex-shrink-0 bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center leading-none">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>
            </li>

            {/* Messages envoyés */}
            <li>
              <button
                onClick={() => handleTabChange("sent")}
                className={[
                  "w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left",
                  activeTab === "sent"
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                ].join(" ")}
              >
                <span className="text-base">📤</span>
                <span className="flex-1 truncate">Messages envoyés</span>
              </button>
            </li>

            {/* Templates — admin / professor uniquement */}
            {canSeeTemplates && (
              <li>
                <button
                  onClick={() => handleTabChange("templates")}
                  className={[
                    "w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left",
                    activeTab === "templates"
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                  ].join(" ")}
                >
                  <span className="text-base">📋</span>
                  <span className="flex-1 truncate">Templates</span>
                </button>
              </li>
            )}
          </ul>
        </nav>

        {/* Statistiques rapides */}
        <div className="px-4 py-3 border-t border-gray-200 text-xs text-gray-400">
          {activeTab === "inbox" ? (
            <span>
              {inboxPagination.total} message
              {inboxPagination.total !== 1 ? "s" : ""} reçu
              {inboxPagination.total !== 1 ? "s" : ""}
            </span>
          ) : activeTab === "sent" ? (
            <span>
              {sentPagination.total} message
              {sentPagination.total !== 1 ? "s" : ""} envoyé
              {sentPagination.total !== 1 ? "s" : ""}
            </span>
          ) : (
            <span>Templates de messages</span>
          )}
        </div>
      </aside>

      {/* ════════════════════════════════════════════════════
          Colonne 2+3 — Templates (pleine largeur si onglet actif)
      ════════════════════════════════════════════════════ */}
      {activeTab === "templates" && (
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TemplatesTab />
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          Colonne 2 — Liste des messages (300px fixe)
          Sur mobile : cachée si on est en vue détail
          Cachée si onglet Templates actif
      ════════════════════════════════════════════════════ */}
      <div
        className={[
          "w-72 flex-shrink-0 border-r border-gray-200 flex flex-col",
          activeTab === "templates"
            ? "hidden"
            : mobileView === "detail"
              ? "hidden lg:flex"
              : "flex",
        ].join(" ")}
      >
        {/* Titre de l'onglet */}
        <div className="px-4 py-3 border-b border-gray-100 bg-white flex items-center gap-2 flex-shrink-0">
          <h2 className="text-sm font-semibold text-gray-800">
            {activeTab === "inbox" ? "Boîte de réception" : "Messages envoyés"}
          </h2>
          {activeTab === "inbox" && unreadCount > 0 && (
            <span className="text-xs text-blue-600 font-medium">
              ({unreadCount} non lu{unreadCount > 1 ? "s" : ""})
            </span>
          )}
        </div>

        {/* Erreur */}
        {error && !isLoading && (
          <div className="mx-3 mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex-shrink-0">
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}

        {/* Liste scrollable */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            // Skeleton loader
            <>
              {Array.from({ length: 8 }).map((_, i) => (
                <MessageSkeleton key={i} />
              ))}
            </>
          ) : currentMessages.length === 0 ? (
            <EmptyList tab={activeTab === "templates" ? "inbox" : activeTab} />
          ) : (
            currentMessages.map((message) => (
              <MessageListItem
                key={message.id}
                message={message}
                isSelected={selectedMessage?.id === message.id}
                isInbox={activeTab === "inbox"}
                onClick={() => handleSelectMessage(message.id)}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        <PaginationBar
          page={currentPagination.page}
          totalPages={currentPagination.totalPages}
          onPrev={handlePrevPage}
          onNext={handleNextPage}
        />
      </div>

      {/* ════════════════════════════════════════════════════
          Colonne 3 — Détail du message (flex-1)
          Sur mobile : visible uniquement si mobileView === 'detail'
          Cachée si onglet Templates actif
      ════════════════════════════════════════════════════ */}
      <div
        className={[
          "flex-1 flex flex-col min-w-0",
          activeTab === "templates"
            ? "hidden"
            : mobileView === "list"
              ? "hidden lg:flex"
              : "flex",
        ].join(" ")}
      >
        {isLoadingMessage ? (
          // Loader pendant le chargement du message
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-3" />
              <p className="text-sm">Chargement du message…</p>
            </div>
          </div>
        ) : selectedMessage ? (
          <MessageDetail
            message={selectedMessage}
            onDelete={handleDelete}
            onBack={handleBack}
          />
        ) : (
          <NoSelection />
        )}
      </div>

      {/* ════════════════════════════════════════════════════
          Modal de composition
      ════════════════════════════════════════════════════ */}
      <ComposeModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        onSent={handleComposeSent}
      />
    </div>
  );
};

export default MessagesPage;
