/**
 * useNotifications Hooks
 * Hooks React Query pour le module de notifications in-app
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../api/notificationsApi';

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const notificationKeys = {
  all: ['notifications'] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
  list: (unreadOnly?: boolean) => [...notificationKeys.all, 'list', unreadOnly] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

/**
 * Hook léger pour le badge de notifications non-lues dans le header.
 * Polling automatique toutes les 30 secondes.
 */
export function useNotificationCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: notificationsApi.getUnreadCount,
    refetchInterval: 30_000, // poll every 30s
    staleTime: 20_000,
  });
}

/**
 * Hook pour récupérer la liste des notifications.
 * @param unreadOnly - Si true, retourne uniquement les non-lues
 */
export function useNotifications(unreadOnly?: boolean) {
  return useQuery({
    queryKey: notificationKeys.list(unreadOnly),
    queryFn: () => notificationsApi.getNotifications(unreadOnly),
    staleTime: 10_000,
  });
}

/**
 * Mutation pour marquer une notification spécifique comme lue.
 * Invalide toutes les queries de notifications après succès.
 */
export function useMarkAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

/**
 * Mutation pour marquer toutes les notifications comme lues.
 * Invalide toutes les queries de notifications après succès.
 */
export function useMarkAllAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
