/**
 * useUsers Hook
 * Bridge entre le store Zustand et les composants.
 * Déclenche automatiquement un fetch lors des changements de filtres ou de page.
 */

import { useEffect, useCallback } from 'react';
import { useUserStore } from '../stores/userStore';

/**
 * useUsers — Hook principal du module utilisateurs.
 *
 * S'abonne aux changements de filtres et de page pour relancer automatiquement
 * la requête API. Expose toutes les propriétés du store ainsi qu'un callback
 * `refetch` stable pour les mises à jour manuelles.
 */
export const useUsers = () => {
  const store = useUserStore();

  // ── Fetch automatique sur changement de filtres ou de page ────────────────
  useEffect(() => {
    store.fetchUsers();
    // On dépend des valeurs primitives pour éviter les re-renders en boucle
    // causés par des nouvelles références d'objet à chaque render du store.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    store.filters.search,
    store.filters.role_app,
    store.filters.status_id,
    store.pagination.page,
  ]);

  // ── Callback stable pour les rafraîchissements manuels ────────────────────
  const refetch = useCallback(() => {
    store.fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ...store, refetch };
};
