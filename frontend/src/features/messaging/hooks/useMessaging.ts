/**
 * useMessaging Hook
 * Hooks personnalises pour le module de messagerie
 */

import { useEffect } from 'react';
import { useMessagingStore } from '../stores/messagingStore';

/**
 * Hook principal pour la page Messages
 * Charge la boite de reception et le compteur non-lus au montage
 */
export const useMessaging = () => {
  const store = useMessagingStore();

  useEffect(() => {
    store.fetchInbox();
    store.fetchUnreadCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return store;
};

/**
 * Hook leger pour le badge non-lus dans la sidebar
 * Polling toutes les 30 secondes
 */
export const useUnreadCount = () => {
  const fetchUnreadCount = useMessagingStore((s) => s.fetchUnreadCount);
  const unreadCount = useMessagingStore((s) => s.unreadCount);

  useEffect(() => {
    fetchUnreadCount();

    const interval = setInterval(fetchUnreadCount, 30_000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  return unreadCount;
};

/**
 * Hook pour archiver un message
 * Retourne la fonction d'archivage et l'etat isArchiving du store
 */
export const useArchiveMessage = () => {
  const archiveMessage = useMessagingStore((s) => s.archiveMessage);
  const isArchiving = useMessagingStore((s) => s.isArchiving);

  return { archiveMessage, isArchiving };
};

/**
 * Hook pour les messages archives pagines
 * Charge les archives au montage et retourne les donnees depuis le store
 */
export const useArchivedMessages = (page = 1, limit = 20) => {
  const fetchArchived = useMessagingStore((s) => s.fetchArchived);
  const archived = useMessagingStore((s) => s.archived);
  const archivedPagination = useMessagingStore((s) => s.archivedPagination);
  const isLoading = useMessagingStore((s) => s.isLoading);
  const error = useMessagingStore((s) => s.error);

  useEffect(() => {
    fetchArchived(page, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  return { archived, archivedPagination, isLoading, error };
};
