/**
 * Messaging Store
 * Store Zustand pour la gestion de la messagerie (inbox, envoyés, compteur non-lus)
 */

import { create } from "zustand";
import { toast } from "sonner";
import * as messagingApi from "../api/messagingApi";
import type {
  MessageWithDetails,
  SendMessagePayload,
} from "../api/messagingApi";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface MessagingStore {
  // ── État ──────────────────────────────────────────────────────────────────
  inbox: MessageWithDetails[];
  inboxPagination: Pagination;

  sent: MessageWithDetails[];
  sentPagination: Pagination;

  selectedMessage: MessageWithDetails | null;
  unreadCount: number;
  activeTab: "inbox" | "sent";

  isLoading: boolean;
  isLoadingMessage: boolean;
  isSending: boolean;
  error: string | null;

  // ── Actions ───────────────────────────────────────────────────────────────
  fetchInbox: (page?: number) => Promise<void>;
  fetchSent: (page?: number) => Promise<void>;
  selectMessage: (id: number) => Promise<void>;
  clearSelectedMessage: () => void;
  sendMessage: (payload: SendMessagePayload) => Promise<void>;
  deleteMessage: (id: number) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  setActiveTab: (tab: "inbox" | "sent") => void;
  decrementUnreadCount: () => void;
  clearError: () => void;
}

// ─── Default Pagination ───────────────────────────────────────────────────────

const defaultPagination: Pagination = {
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 0,
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useMessagingStore = create<MessagingStore>((set, get) => ({
  // ── État initial ──────────────────────────────────────────────────────────
  inbox: [],
  inboxPagination: { ...defaultPagination },

  sent: [],
  sentPagination: { ...defaultPagination },

  selectedMessage: null,
  unreadCount: 0,
  activeTab: "inbox",

  isLoading: false,
  isLoadingMessage: false,
  isSending: false,
  error: null,

  // ── fetchInbox ────────────────────────────────────────────────────────────
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
        "Erreur lors du chargement de la boîte de réception.";
      set({ isLoading: false, error: msg });
    }
  },

  // ── fetchSent ─────────────────────────────────────────────────────────────
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
        "Erreur lors du chargement des messages envoyés.";
      set({ isLoading: false, error: msg });
    }
  },

  // ── selectMessage ─────────────────────────────────────────────────────────
  selectMessage: async (id: number) => {
    set({ isLoadingMessage: true, error: null });
    try {
      const message = await messagingApi.getMessage(id);

      // Marquer comme lu localement dans inbox si nécessaire
      const wasUnread = !message.lu;

      set((state) => ({
        selectedMessage: { ...message, lu: true },
        isLoadingMessage: false,
        // Mettre à jour le message dans inbox
        inbox: state.inbox.map((m) => (m.id === id ? { ...m, lu: true } : m)),
        // Décrémenter le compteur si le message n'était pas lu
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

  // ── clearSelectedMessage ──────────────────────────────────────────────────
  clearSelectedMessage: () => {
    set({ selectedMessage: null });
  },

  // ── sendMessage ───────────────────────────────────────────────────────────
  sendMessage: async (payload: SendMessagePayload) => {
    set({ isSending: true, error: null });
    try {
      await messagingApi.sendMessage(payload);
      set({ isSending: false });
      // Recharger les messages envoyés si on est sur cet onglet
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
      throw error; // Rethrow pour que le composant puisse gérer l'erreur
    }
  },

  // ── deleteMessage ─────────────────────────────────────────────────────────
  deleteMessage: async (id: number) => {
    try {
      await messagingApi.deleteMessage(id);

      set((state) => {
        const deletedFromInbox = state.inbox.find((m) => m.id === id);

        // Si le message supprimé était non lu, ajuster le compteur
        const wasUnread = deletedFromInbox && !deletedFromInbox.lu;

        return {
          inbox: state.inbox.filter((m) => m.id !== id),
          sent: state.sent.filter((m) => m.id !== id),
          selectedMessage:
            state.selectedMessage?.id === id ? null : state.selectedMessage,
          unreadCount: wasUnread
            ? Math.max(0, state.unreadCount - 1)
            : state.unreadCount,
        };
      });

      toast.success("Message supprimé.");
    } catch (error: any) {
      const msg =
        error.response?.data?.message ??
        error.message ??
        "Erreur lors de la suppression.";
      toast.error(msg);
      throw error;
    }
  },

  // ── fetchUnreadCount ──────────────────────────────────────────────────────
  fetchUnreadCount: async () => {
    try {
      const count = await messagingApi.getUnreadCount();
      set({ unreadCount: count });
    } catch {
      // Silencieux — ne pas afficher d'erreur pour le polling
    }
  },

  // ── setActiveTab ──────────────────────────────────────────────────────────
  setActiveTab: (tab: "inbox" | "sent") => {
    set({ activeTab: tab, selectedMessage: null });
    if (tab === "inbox") {
      get().fetchInbox();
    } else {
      get().fetchSent();
    }
  },

  // ── decrementUnreadCount ──────────────────────────────────────────────────
  decrementUnreadCount: () => {
    set((state) => ({
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  // ── clearError ────────────────────────────────────────────────────────────
  clearError: () => set({ error: null }),
}));
