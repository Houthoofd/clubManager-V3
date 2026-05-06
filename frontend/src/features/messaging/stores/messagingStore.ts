/**
 * Messaging Store
 * Store Zustand pour la gestion de la messagerie (inbox, envoyes, archives, compteur non-lus)
 */

import { create } from "zustand";
import { toast } from "sonner";
import * as messagingApi from "../api/messagingApi";
import type {
  MessageWithDetails,
  SendMessagePayload,
} from "../api/messagingApi";

// -- Types -----------------------------------------------------------------------

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface MessagingStore {
  // -- Etat ------------------------------------------------------------------
  inbox: MessageWithDetails[];
  inboxPagination: Pagination;

  sent: MessageWithDetails[];
  sentPagination: Pagination;

  archived: MessageWithDetails[];
  archivedPagination: Pagination;

  selectedMessage: MessageWithDetails | null;
  unreadCount: number;
  activeTab: "inbox" | "sent" | "templates" | "archived";

  isLoading: boolean;
  isLoadingMessage: boolean;
  isSending: boolean;
  isArchiving: boolean;
  error: string | null;

  // -- Actions ---------------------------------------------------------------
  fetchInbox: (page?: number) => Promise<void>;
  fetchSent: (page?: number) => Promise<void>;
  fetchArchived: (page?: number, limit?: number) => Promise<void>;
  archiveMessage: (id: number) => Promise<void>;
  selectMessage: (id: number) => Promise<void>;
  clearSelectedMessage: () => void;
  sendMessage: (payload: SendMessagePayload) => Promise<void>;
  deleteMessage: (id: number) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  setActiveTab: (tab: "inbox" | "sent" | "templates" | "archived") => void;
  decrementUnreadCount: () => void;
  clearError: () => void;
}

// -- Default Pagination --------------------------------------------------------

const defaultPagination: Pagination = {
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 0,
};

// -- Store ---------------------------------------------------------------------

export const useMessagingStore = create<MessagingStore>((set, get) => ({
  // -- Etat initial ------------------------------------------------------------
  inbox: [],
  inboxPagination: { ...defaultPagination },

  sent: [],
  sentPagination: { ...defaultPagination },

  archived: [],
  archivedPagination: { ...defaultPagination },

  selectedMessage: null,
  unreadCount: 0,
  activeTab: "inbox",

  isLoading: false,
  isLoadingMessage: false,
  isSending: false,
  isArchiving: false,
  error: null,

  // -- fetchInbox --------------------------------------------------------------
  fetchInbox: async (page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const result = await messagingApi.getInbox(page);
      set({
        inbox: result.messages,
        inboxPagination: result.pagination,
        isLoading: false,
      });
    } catch (error: any) {
      const msg =
        error.response?.data?.message ??
        error.message ??
        "Erreur lors du chargement de la boite de reception.";
      set({ isLoading: false, error: msg });
    }
  },

  // -- fetchSent ---------------------------------------------------------------
  fetchSent: async (page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const result = await messagingApi.getSent(page);
      set({
        sent: result.messages,
        sentPagination: result.pagination,
        isLoading: false,
      });
    } catch (error: any) {
      const msg =
        error.response?.data?.message ??
        error.message ??
        "Erreur lors du chargement des messages envoyes.";
      set({ isLoading: false, error: msg });
    }
  },

  // -- fetchArchived -----------------------------------------------------------
  fetchArchived: async (page = 1, limit = 20) => {
    set({ isLoading: true, error: null });
    try {
      const result = await messagingApi.getArchived(page, limit);
      set({
        archived: result.messages,
        archivedPagination: result.pagination,
        isLoading: false,
      });
    } catch (error: any) {
      const msg =
        error.response?.data?.message ??
        error.message ??
        "Erreur lors du chargement des messages archives.";
      set({ isLoading: false, error: msg });
    }
  },

  // -- archiveMessage ----------------------------------------------------------
  archiveMessage: async (id: number) => {
    set({ isArchiving: true });
    try {
      await messagingApi.archiveMessage(id);

      // Retirer le message de l'inbox localement
      set((state) => {
        const archivedMsg = state.inbox.find((m) => m.id === id);
        const wasUnread = archivedMsg && !archivedMsg.lu;

        return {
          inbox: state.inbox.filter((m) => m.id !== id),
          selectedMessage:
            state.selectedMessage?.id === id ? null : state.selectedMessage,
          unreadCount: wasUnread
            ? Math.max(0, state.unreadCount - 1)
            : state.unreadCount,
          isArchiving: false,
        };
      });

      toast.success("Message archive.");

      // Recharger les archives si on est sur cet onglet
      if (get().activeTab === "archived") {
        await get().fetchArchived();
      }
    } catch (error: any) {
      const msg =
        error.response?.data?.message ??
        error.message ??
        "Erreur lors de l'archivage.";
      set({ isArchiving: false });
      toast.error(msg);
      throw error;
    }
  },

  // -- selectMessage -----------------------------------------------------------
  selectMessage: async (id: number) => {
    set({ isLoadingMessage: true, error: null });
    try {
      const message = await messagingApi.getMessage(id);

      // Marquer comme lu localement dans inbox si necessaire
      const wasUnread = !message.lu;

      set((state) => ({
        selectedMessage: { ...message, lu: true },
        isLoadingMessage: false,
        // Mettre a jour le message dans inbox
        inbox: state.inbox.map((m) => (m.id === id ? { ...m, lu: true } : m)),
        // Decrementer le compteur si le message n'etait pas lu
        unreadCount: wasUnread
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount,
      }));
    } catch (error: any) {
      const msg =
        error.response?.data?.message ??
        error.message ??
        "Erreur lors du chargement du message.";
      set({ isLoadingMessage: false, error: msg });
    }
  },

  // -- clearSelectedMessage ----------------------------------------------------
  clearSelectedMessage: () => {
    set({ selectedMessage: null });
  },

  // -- sendMessage -------------------------------------------------------------
  sendMessage: async (payload: SendMessagePayload) => {
    set({ isSending: true, error: null });
    try {
      await messagingApi.sendMessage(payload);
      set({ isSending: false });
      // Recharger les envoyes si on est sur cet onglet
      const { activeTab } = get();
      if (activeTab === "sent") {
        await get().fetchSent();
      }
    } catch (error: any) {
      const msg =
        error.response?.data?.message ??
        error.message ??
        "Erreur lors de l'envoi du message.";
      set({ isSending: false, error: msg });
      throw error; // Rethrow pour que le composant puisse gerer l'erreur
    }
  },

  // -- deleteMessage -----------------------------------------------------------
  deleteMessage: async (id: number) => {
    try {
      await messagingApi.deleteMessage(id);

      set((state) => {
        const deletedFromInbox = state.inbox.find((m) => m.id === id);

        // Si le message supprime etait non lu, ajuster le compteur
        const wasUnread = deletedFromInbox && !deletedFromInbox.lu;

        return {
          inbox: state.inbox.filter((m) => m.id !== id),
          sent: state.sent.filter((m) => m.id !== id),
          archived: state.archived.filter((m) => m.id !== id),
          selectedMessage:
            state.selectedMessage?.id === id ? null : state.selectedMessage,
          unreadCount: wasUnread
            ? Math.max(0, state.unreadCount - 1)
            : state.unreadCount,
        };
      });

      toast.success("Message supprime.");
    } catch (error: any) {
      const msg =
        error.response?.data?.message ??
        error.message ??
        "Erreur lors de la suppression.";
      toast.error(msg);
      throw error;
    }
  },

  // -- fetchUnreadCount --------------------------------------------------------
  fetchUnreadCount: async () => {
    try {
      const count = await messagingApi.getUnreadCount();
      set({ unreadCount: count });
    } catch {
      // Silencieux -- ne pas afficher d'erreur pour le polling
    }
  },

  // -- setActiveTab ------------------------------------------------------------
  setActiveTab: (tab: "inbox" | "sent" | "templates" | "archived") => {
    set({ activeTab: tab, selectedMessage: null });
    if (tab === "inbox") {
      get().fetchInbox();
    } else if (tab === "sent") {
      get().fetchSent();
    } else if (tab === "archived") {
      get().fetchArchived();
    }
    // "templates" tab: no messaging data to fetch
  },

  // -- decrementUnreadCount ----------------------------------------------------
  decrementUnreadCount: () => {
    set((state) => ({
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  // -- clearError --------------------------------------------------------------
  clearError: () => set({ error: null }),
}));
