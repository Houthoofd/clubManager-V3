/**
 * MessagesPage.tsx
 * Page principale de messagerie -- layout responsive avec onglets
 *
 * MIGRATION COMPLETEE : Utilise les composants reutilisables :
 * - TabGroup (Navigation) : Remplace la sidebar verticale
 * - Button (Button) : Bouton "Nouveau message"
 * - ErrorBanner (Feedback) : Affichage des erreurs
 * - PaginationBar (Navigation) : Pagination
 * - EmptyState (Layout) : Etats vides
 * - LoadingSpinner (Layout) : Chargement
 *
 * GAP-16 : Onglet "Archives" + bouton Archiver sur les messages inbox
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMessaging } from "../hooks/useMessaging";
import { useAuth } from "../../../shared/hooks/useAuth";
import { UserRole } from "@clubmanager/types";
import { ComposeModal } from "../components/ComposeModal";
import { MessageListItem } from "../components/MessageListItem";
import { MessageDetail } from "../components/MessageDetail";
import { TemplatesTab } from "../components/TemplatesTab";
import {
  EnvelopeIcon,
  InboxIcon,
  PaperPlaneIcon,
  PencilAltIcon,
  PficonTemplateIcon,
  ArchiveIcon,
} from "@patternfly/react-icons";

// Composants reutilisables
import { TabGroup, Tab } from "../../../shared/components/Navigation/TabGroup";
import { Button } from "../../../shared/components/Button/Button";
import { AlertBanner } from "../../../shared/components/Feedback/AlertBanner";
import { PaginationBar } from "../../../shared/components/Navigation/PaginationBar";
import { EmptyState } from "../../../shared/components/Layout/EmptyState";
import { LoadingSpinner } from "../../../shared/components/Layout/LoadingSpinner";

// -- Main Component ---------------------------------------------------------------

export const MessagesPage = () => {
  const { t } = useTranslation("messages");
  const {
    inbox,
    inboxPagination,
    sent,
    sentPagination,
    archived,
    archivedPagination,
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
    archiveMessage,
    fetchInbox,
    fetchSent,
    fetchArchived,
  } = useMessaging();

  const { user } = useAuth();
  const userRole = (user?.role_app ?? UserRole.MEMBER) as UserRole;
  const canSeeTemplates =
    userRole === UserRole.ADMIN || userRole === UserRole.PROFESSOR;

  const [isComposeOpen, setIsComposeOpen] = useState(false);

  // Sur mobile, on affiche soit la liste soit le detail
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");

  // -- Handlers -----------------------------------------------------------------

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

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as "inbox" | "sent" | "templates" | "archived");
    setMobileView("list");
  };

  const handleComposeSent = () => {
    // Recharger les envoyes si on est sur cet onglet
    if (activeTab === "sent") {
      fetchSent();
    }
  };

  const handlePageChange = (page: number) => {
    if (activeTab === "inbox") {
      fetchInbox(page);
    } else if (activeTab === "sent") {
      fetchSent(page);
    } else if (activeTab === "archived") {
      fetchArchived(page);
    }
  };

  const handleArchive = async (id: number) => {
    await archiveMessage(id);
  };

  // Donnees courantes selon l'onglet actif
  const currentMessages =
    activeTab === "sent" ? sent : activeTab === "archived" ? archived : inbox;

  const currentPagination =
    activeTab === "sent"
      ? sentPagination
      : activeTab === "archived"
        ? archivedPagination
        : inboxPagination;

  // -- Configuration des onglets -----------------------------------------------

  const tabs: Tab[] = [
    {
      id: "inbox",
      label: t("tabs.inbox"),
      icon: <InboxIcon style={{ fontSize: "18px" }} />,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      id: "sent",
      label: t("tabs.sent"),
      icon: <PaperPlaneIcon style={{ fontSize: "18px" }} />,
    },
    {
      id: "archived",
      label: t("tabs.archived", { defaultValue: "Archives" }),
      icon: <ArchiveIcon style={{ fontSize: "18px" }} />,
    },
  ];

  // Ajouter l'onglet Templates si l'utilisateur a les permissions
  if (canSeeTemplates) {
    tabs.push({
      id: "templates",
      label: t("tabs.templates"),
      icon: <PficonTemplateIcon style={{ fontSize: "18px" }} />,
    });
  }

  // -- Render ------------------------------------------------------------------

  return (
    <div className="flex flex-col h-[calc(100vh-4rem-3rem)] bg-white rounded-xl shadow overflow-hidden border border-gray-200">
      {/* ================================================================
          Header -- Onglets + Bouton Nouveau message
      ================================================================ */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          {/* Onglets de navigation */}
          <div className="flex-1 min-w-0 -mb-3">
            <TabGroup
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              scrollable
            />
          </div>

          {/* Bouton Nouveau message */}
          <div className="flex-shrink-0">
            <Button
              variant="primary"
              size="md"
              icon={<PencilAltIcon style={{ fontSize: "16px" }} />}
              onClick={() => setIsComposeOpen(true)}
            >
              {t("actions.newMessage")}
            </Button>
          </div>
        </div>

        {/* Compteur de messages */}
        <div className="px-4 pb-2 text-xs text-gray-500">
          {activeTab === "inbox" ? (
            <span>
              {t("inbox.messageCount", { count: inboxPagination.total })}
              {unreadCount > 0 && (
                <span className="ml-1 text-blue-600 font-medium">
                  ({t("inbox.unreadCount", { count: unreadCount })})
                </span>
              )}
            </span>
          ) : activeTab === "sent" ? (
            <span>
              {t("sent.messageCount", { count: sentPagination.total })}
            </span>
          ) : activeTab === "archived" ? (
            <span>
              {t("archived.messageCount", {
                defaultValue: "{{count}} message(s) archive(s)",
                count: archivedPagination.total,
              })}
            </span>
          ) : (
            <span>{t("templates.description")}</span>
          )}
        </div>
      </div>

      {/* ================================================================
          Contenu -- Templates (pleine largeur)
      ================================================================ */}
      {activeTab === "templates" && (
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TemplatesTab />
        </div>
      )}

      {/* ================================================================
          Contenu -- Inbox/Sent/Archived (2 colonnes : liste + detail)
      ================================================================ */}
      {activeTab !== "templates" && (
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* ---------------------------------------------------------------
              Colonne 1 -- Liste des messages (400px fixe)
              Sur mobile : cachee si on est en vue detail
          --------------------------------------------------------------- */}
          <div
            className={[
              "w-96 flex-shrink-0 border-r border-gray-200 flex flex-col bg-white",
              mobileView === "detail" ? "hidden lg:flex" : "flex",
            ].join(" ")}
          >
            {/* Titre de l'onglet */}
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2 flex-shrink-0">
              <h2 className="text-sm font-semibold text-gray-800">
                {activeTab === "inbox"
                  ? t("inbox.title")
                  : activeTab === "archived"
                    ? t("archived.title", { defaultValue: "Archives" })
                    : t("sent.title")}
              </h2>
            </div>

            {/* Erreur */}
            {error && !isLoading && (
              <div className="p-3 flex-shrink-0">
                <AlertBanner variant="error" message={error} />
              </div>
            )}

            {/* Liste scrollable */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                // Spinner de chargement
                <LoadingSpinner
                  size="md"
                  text={t("loading.messages")}
                  className="py-16"
                />
              ) : currentMessages.length === 0 ? (
                // Etat vide
                <EmptyState
                  icon={
                    activeTab === "inbox" ? (
                      <InboxIcon style={{ fontSize: "48px" }} />
                    ) : activeTab === "archived" ? (
                      <span style={{ fontSize: "48px" }}>📦</span>
                    ) : (
                      <PaperPlaneIcon style={{ fontSize: "48px" }} />
                    )
                  }
                  title={
                    activeTab === "inbox"
                      ? t("inbox.empty")
                      : activeTab === "archived"
                        ? t("archived.empty", {
                            defaultValue: "Aucun message archive",
                          })
                        : t("sent.empty")
                  }
                  description={
                    activeTab === "inbox"
                      ? t("inbox.emptyDescription")
                      : activeTab === "archived"
                        ? t("archived.emptyDescription", {
                            defaultValue: "Vous n'avez archive aucun message.",
                          })
                        : t("sent.emptyDescription")
                  }
                  variant="default"
                  className="border-0 bg-transparent"
                />
              ) : (
                currentMessages.map((message) => (
                  <MessageListItem
                    key={message.id}
                    message={message}
                    isSelected={selectedMessage?.id === message.id}
                    isInbox={activeTab === "inbox"}
                    onClick={() => handleSelectMessage(message.id)}
                    onArchive={
                      activeTab === "inbox" ? handleArchive : undefined
                    }
                  />
                ))
              )}
            </div>

            {/* Pagination */}
            {!isLoading && currentMessages.length > 0 && (
              <PaginationBar
                currentPage={currentPagination.page}
                totalPages={currentPagination.totalPages}
                onPageChange={handlePageChange}
                showResultsCount={false}
              />
            )}
          </div>

          {/* ---------------------------------------------------------------
              Colonne 2 -- Detail du message (flex-1)
              Sur mobile : visible uniquement si mobileView === 'detail'
          --------------------------------------------------------------- */}
          <div
            className={[
              "flex-1 flex flex-col min-w-0 bg-white",
              mobileView === "list" ? "hidden lg:flex" : "flex",
            ].join(" ")}
          >
            {isLoadingMessage ? (
              // Spinner pendant le chargement du message
              <LoadingSpinner
                size="lg"
                text={t("loading.message")}
                className="py-24"
              />
            ) : selectedMessage ? (
              <MessageDetail
                message={selectedMessage}
                onDelete={handleDelete}
                onBack={handleBack}
              />
            ) : (
              // Aucun message selectionne
              <EmptyState
                icon={<EnvelopeIcon style={{ fontSize: "48px" }} />}
                title={t("detail.selectMessage")}
                description={t("detail.selectMessageDescription")}
                variant="default"
                className="border-0 bg-transparent h-full flex flex-col justify-center"
              />
            )}
          </div>
        </div>
      )}

      {/* ================================================================
          Modal de composition
      ================================================================ */}
      <ComposeModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        onSent={handleComposeSent}
      />
    </div>
  );
};

export default MessagesPage;
