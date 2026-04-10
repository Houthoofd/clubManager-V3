/**
 * useSettings Hook
 * Bridge entre le store Zustand et les composants.
 * Déclenche automatiquement un fetch au montage du composant.
 */

import { useEffect, useCallback } from 'react';
import { useSettingsStore } from '../stores/settingsStore';

/**
 * useSettings — Hook principal du module paramètres.
 *
 * S'abonne au store Zustand et déclenche un fetch initial au montage.
 * Expose toutes les propriétés du store ainsi qu'un callback
 * `refetch` stable pour les mises à jour manuelles.
 */
export const useSettings = () => {
  const store = useSettingsStore();

  // ── Fetch automatique au montage ──────────────────────────────────────────
  useEffect(() => {
    store.fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Callback stable pour les rafraîchissements manuels ────────────────────
  const refetch = useCallback(() => {
    store.fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ...store, refetch };
};
