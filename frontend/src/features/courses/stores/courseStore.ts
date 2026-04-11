/**
 * Course UI Store
 * Store Zustand minimal — uniquement l'état UI du module cours.
 *
 * Toutes les données serveur (planning, professeurs, séances, présences)
 * sont désormais gérées par React Query dans `useCourses.ts`.
 * Ce store ne conserve que les filtres de séances afin que leur valeur
 * survive aux re-renders et aux démontages/remontages de composants.
 */

import { create } from "zustand";

// ─── Helper : bornes de la semaine courante (lundi → dimanche) ────────────────

function getWeekBounds(): { monday: string; sunday: string } {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = dimanche, 1 = lundi, …
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const fmt = (d: Date): string => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  return { monday: fmt(monday), sunday: fmt(sunday) };
}

const { monday: defaultMonday, sunday: defaultSunday } = getWeekBounds();

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SessionFilters {
  date_debut: string;
  date_fin: string;
  type_cours: string;
}

interface CourseUIStore {
  /** Filtres actifs sur l'onglet Séances */
  sessionFilters: SessionFilters;

  /**
   * Met à jour un filtre individuel.
   * @param key   Clé du filtre à modifier
   * @param value Nouvelle valeur
   */
  setSessionFilter: (key: keyof SessionFilters, value: string) => void;

  /** Réinitialise les filtres à la semaine courante */
  resetSessionFilters: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useCourseStore = create<CourseUIStore>((set) => ({
  // ── État initial ──────────────────────────────────────────────────────────
  sessionFilters: {
    date_debut: defaultMonday,
    date_fin: defaultSunday,
    type_cours: "",
  },

  // ── setSessionFilter ──────────────────────────────────────────────────────
  setSessionFilter: (key, value) =>
    set((state) => ({
      sessionFilters: { ...state.sessionFilters, [key]: value },
    })),

  // ── resetSessionFilters ───────────────────────────────────────────────────
  resetSessionFilters: () => {
    const { monday, sunday } = getWeekBounds();
    set({
      sessionFilters: {
        date_debut: monday,
        date_fin: sunday,
        type_cours: "",
      },
    });
  },
}));
