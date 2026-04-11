/**
 * useCourses Hook
 * Bridge entre le store Zustand et les composants.
 * Déclenche automatiquement les fetches au montage et sur changement de filtres.
 */

import { useEffect, useCallback } from 'react';
import { useCourseStore } from '../stores/courseStore';

/**
 * useCourses — Hook principal du module cours.
 *
 * Au montage : charge le planning récurrent et la liste des professeurs.
 * Sur changement de filtres de séances : relance automatiquement le fetch des séances.
 * Expose toutes les propriétés du store ainsi qu'un callback `refetch` stable.
 */
export const useCourses = () => {
  const store = useCourseStore();

  // ── Fetch planning + professeurs au montage ────────────────────────────────
  useEffect(() => {
    store.fetchPlanning();
    store.fetchProfessors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Fetch séances sur changement de filtres ────────────────────────────────
  useEffect(() => {
    store.fetchSessions();
    // On utilise les valeurs primitives comme dépendances pour éviter les
    // re-renders en boucle causés par de nouvelles références d'objet.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    store.sessionFilters.date_debut,
    store.sessionFilters.date_fin,
    store.sessionFilters.type_cours,
  ]);

  // ── Callback stable pour les rafraîchissements manuels ────────────────────
  const refetch = useCallback(() => {
    store.fetchPlanning();
    store.fetchProfessors();
    store.fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ...store, refetch };
};
