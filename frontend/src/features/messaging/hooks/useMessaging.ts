/**
 * useMessaging Hook
 * Hooks personnalisés pour le module de messagerie
 */

import { useEffect } from 'react';
import { useMessagingStore } from '../stores/messagingStore';

/**
 * Hook principal pour la page Messages
 * Charge la boîte de réception et le compteur non-lus au montage
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
 * Hook léger pour le badge non-lus dans la sidebar
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
