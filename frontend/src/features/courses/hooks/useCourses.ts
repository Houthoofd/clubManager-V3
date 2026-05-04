/**
 * useCourses Hook
 *
 * Remplace l'ancien store Zustand par React Query pour la gestion des données
 * serveur du module cours :
 *
 *  - useQuery        → lectures (planning, professeurs, séances, feuille d'appel)
 *  - useMutation     → écritures (CRUD + présences)
 *  - invalidateQueries → re-fetch ciblé après chaque mutation (pas de reload)
 *
 * L'état UI pur (filtres de séances) reste dans courseStore (Zustand).
 *
 * Avantages React Query :
 *  - Cache partagé entre tous les composants qui appellent le même queryKey
 *  - Refetch automatique en arrière-plan (refetchInterval + refetchOnWindowFocus)
 *  - Déduplication des requêtes simultanées
 *  - États isPending / isError / data standardisés
 *  - Pas besoin de useEffect "fetch au montage"
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CreateCourseRecurrentDto,
  UpdateCourseRecurrentDto,
  CreateProfessorDto,
  UpdateProfessorDto,
  CreateCourseDto,
  GenerateCoursesDto,
  BulkUpdatePresenceDto,
} from "@clubmanager/types";
import { useCourseStore } from "../stores/courseStore";
import * as coursesApi from "../api/coursesApi";

// ─── Query Keys ───────────────────────────────────────────────────────────────
//
// Regroupés ici pour pouvoir invalider de façon ciblée depuis n'importe où
// dans l'application (ex: invalidateQueries({ queryKey: courseKeys.planning() }))

export const courseKeys = {
  /** Racine de toutes les clés du module — invalide TOUT le module en une fois */
  all: ["courses"] as const,

  /** Planning hebdomadaire (cours_recurrent + professeurs assignés) */
  planning: () => [...courseKeys.all, "planning"] as const,

  /** Liste des professeurs */
  professors: () => [...courseKeys.all, "professors"] as const,

  /**
   * Séances filtrées.
   * Les filtres font partie de la clé → React Query refetch automatiquement
   * quand ils changent, sans useEffect.
   */
  sessions: (filters: object) =>
    [...courseKeys.all, "sessions", filters] as const,

  /**
   * Feuille d'appel d'une séance.
   * staleTime = 0 → toujours refetchée à l'ouverture de la modale.
   */
  attendance: (id: number) => [...courseKeys.all, "attendance", id] as const,

  /** Inscriptions du membre authentifié */
  myEnrollments: () => [...courseKeys.all, "my-enrollments"] as const,
} as const;

// ─── Options ──────────────────────────────────────────────────────────────────

export interface UseCoursesOptions {
  /**
   * ID du cours dont on veut afficher la feuille d'appel.
   * null / undefined  → la query attendance est désactivée (enabled: false).
   * Doit être dérivé de l'état modal dans CoursesPage avant l'appel au hook.
   */
  attendanceCourseId?: number | null;
}

// ─── Hook principal ───────────────────────────────────────────────────────────

export const useCourses = (options: UseCoursesOptions = {}) => {
  const { attendanceCourseId = null } = options;

  const queryClient = useQueryClient();

  // État UI pur (filtres) — Zustand, pas React Query
  const { sessionFilters, setSessionFilter } = useCourseStore();

  // ════════════════════════════════════════════════════════════════════════════
  // QUERIES (lecture)
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Planning — cours récurrents avec leurs professeurs assignés.
   * Rafraîchi toutes les 60 s en arrière-plan + à chaque focus de fenêtre.
   */
  const planningQuery = useQuery({
    queryKey: courseKeys.planning(),
    queryFn: coursesApi.getCourseRecurrents,
    staleTime: 30_000, // considéré "frais" pendant 30 s
    refetchInterval: 60_000, // refetch silencieux toutes les 60 s
    refetchOnWindowFocus: true,
  });

  /**
   * Professeurs — liste complète avec grade et nombre de cours.
   * Moins volatile que le planning, donc staleTime plus long.
   */
  const professorsQuery = useQuery({
    queryKey: courseKeys.professors(),
    queryFn: coursesApi.getProfessors,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });

  /**
   * Séances — instances de cours filtrées par date / type.
   * La clé inclut les filtres : React Query refetch automatiquement
   * quand sessionFilters change (pas besoin de useEffect dans la page).
   */
  const sessionsQuery = useQuery({
    queryKey: courseKeys.sessions(sessionFilters),
    queryFn: () =>
      coursesApi.getCourses({
        date_debut: sessionFilters.date_debut || undefined,
        date_fin: sessionFilters.date_fin || undefined,
        type_cours: sessionFilters.type_cours || undefined,
      }),
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });

  /**
   * Inscriptions du membre connecté.
   * Rafraîchi toutes les 30 s — les présences peuvent changer après le cours.
   */
  const myEnrollmentsQuery = useQuery({
    queryKey: courseKeys.myEnrollments(),
    queryFn: coursesApi.getMyEnrollments,
    staleTime: 30_000,
  });

  /**
   * Feuille d'appel — activée uniquement quand une séance est sélectionnée.
   * staleTime = 0  → toujours refetchée (la présence peut changer en temps réel).
   * gcTime    = 0  → pas de cache résiduel entre deux ouvertures de modale.
   */
  const attendanceQuery = useQuery({
    queryKey: courseKeys.attendance(attendanceCourseId ?? 0),
    queryFn: () => coursesApi.getCourseInscriptions(attendanceCourseId!),
    enabled: attendanceCourseId !== null && attendanceCourseId > 0,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: false,
  });

  // ════════════════════════════════════════════════════════════════════════════
  // MUTATIONS (écriture)
  // Chaque mutation invalide les queries affectées via invalidateQueries,
  // ce qui déclenche un refetch transparent sans aucun rechargement.
  // ════════════════════════════════════════════════════════════════════════════

  // ── Cours récurrents ────────────────────────────────────────────────────────

  // Invalidation groupée planning + professeurs :
  // Ces deux caches sont couplés via cours_recurrent_professeur.
  // Toute modification d'un côté doit rafraîchir les deux pour éviter
  // les données périmées (nombre_cours, professeurs_noms, etc.).
  const invalidatePlanningAndProfessors = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: courseKeys.planning() }),
      queryClient.invalidateQueries({ queryKey: courseKeys.professors() }),
    ]);

  const createCourseRecurrentMutation = useMutation({
    mutationFn: (dto: CreateCourseRecurrentDto) =>
      coursesApi.createCourseRecurrent(dto),
    // Un nouveau cours peut être assigné à des profs → les deux caches
    onSuccess: invalidatePlanningAndProfessors,
  });

  const updateCourseRecurrentMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateCourseRecurrentDto }) =>
      coursesApi.updateCourseRecurrent(id, dto),
    // Les professeurs assignés peuvent avoir changé → les deux caches
    onSuccess: invalidatePlanningAndProfessors,
  });

  const deleteCourseRecurrentMutation = useMutation({
    mutationFn: (id: number) => coursesApi.deleteCourseRecurrent(id),
    // Le cours supprimé n'apparaît plus dans nombre_cours des profs → les deux caches
    onSuccess: invalidatePlanningAndProfessors,
  });

  // ── Professeurs ─────────────────────────────────────────────────────────────

  const createProfessorMutation = useMutation({
    mutationFn: (dto: CreateProfessorDto) => coursesApi.createProfessor(dto),
    // Nouveau prof : n'affecte pas le planning, juste la liste
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: courseKeys.professors() }),
  });

  const updateProfessorMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateProfessorDto }) =>
      coursesApi.updateProfessor(id, dto),
    // Le nom/spécialité affiché dans les cartes du planning peut avoir changé
    onSuccess: invalidatePlanningAndProfessors,
  });

  const deleteProfessorMutation = useMutation({
    mutationFn: (id: number) => coursesApi.deleteProfessor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.professors() });
      queryClient.invalidateQueries({ queryKey: courseKeys.planning() });
    },
  });

  // ── Séances ───────────────────────────────────────────────────────────────────

  const createSessionMutation = useMutation({
    mutationFn: (dto: CreateCourseDto) => coursesApi.createSession(dto),
    // Invalide toutes les sessions (peu importe les filtres courants)
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [...courseKeys.all, "sessions"],
      }),
  });

  const generateSessionsMutation = useMutation({
    mutationFn: (dto: GenerateCoursesDto) => coursesApi.generateCourses(dto),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [...courseKeys.all, "sessions"],
      }),
  });

  // ── Présences ────────────────────────────────────────────────────────────────

  const bulkUpdatePresenceMutation = useMutation({
    mutationFn: ({
      cours_id,
      dto,
    }: {
      cours_id: number;
      dto: BulkUpdatePresenceDto;
    }) => coursesApi.bulkUpdatePresence(cours_id, dto),
    onSuccess: (_data, { cours_id }) => {
      // Rafraîchit la feuille d'appel de la séance concernée uniquement
      queryClient.invalidateQueries({
        queryKey: courseKeys.attendance(cours_id),
      });
      // Met aussi à jour le compteur d'inscrits dans la liste des séances
      queryClient.invalidateQueries({
        queryKey: [...courseKeys.all, "sessions"],
      });
    },
  });

  // ════════════════════════════════════════════════════════════════════════════
  // API publique
  // Surface identique à l'ancien hook Zustand pour limiter les changements
  // dans CoursesPage.tsx. Les mutations sont enveloppées pour correspondre
  // aux signatures attendues (id + dto séparés).
  // ════════════════════════════════════════════════════════════════════════════

  return {
    // ── Planning ──────────────────────────────────────────────────────────────
    planning: planningQuery.data ?? [],
    planningLoading: planningQuery.isPending,
    planningError: planningQuery.isError
      ? ((planningQuery.error as Error)?.message ??
        "Erreur chargement planning")
      : null,

    // ── Professeurs ───────────────────────────────────────────────────────────
    professors: professorsQuery.data ?? [],
    professorsLoading: professorsQuery.isPending,

    // ── Séances ───────────────────────────────────────────────────────────────
    sessions: sessionsQuery.data ?? [],
    sessionsLoading: sessionsQuery.isPending,
    sessionsError: sessionsQuery.isError
      ? ((sessionsQuery.error as Error)?.message ?? "Erreur chargement séances")
      : null,

    // ── Filtres (Zustand UI state) ────────────────────────────────────────────
    sessionFilters,
    setSessionFilter,

    // ── Feuille d'appel ───────────────────────────────────────────────────────
    attendanceSheet: attendanceQuery.data ?? null,
    attendanceLoading: attendanceQuery.isPending,

    // ── Mes inscriptions (vue membre) ─────────────────────────────────────────
    myEnrollments: myEnrollmentsQuery.data ?? [],
    myEnrollmentsLoading: myEnrollmentsQuery.isPending,

    // ── Mutations cours récurrents ────────────────────────────────────────────
    // Retours explicitement void pour correspondre aux props des modales
    createCourseRecurrent: async (
      dto: CreateCourseRecurrentDto,
    ): Promise<void> => {
      await createCourseRecurrentMutation.mutateAsync(dto);
    },

    updateCourseRecurrent: async (
      id: number,
      dto: UpdateCourseRecurrentDto,
    ): Promise<void> => {
      await updateCourseRecurrentMutation.mutateAsync({ id, dto });
    },

    deleteCourseRecurrent: async (id: number): Promise<void> => {
      await deleteCourseRecurrentMutation.mutateAsync(id);
    },

    // ── Mutations professeurs ─────────────────────────────────────────────────
    createProfessor: async (dto: CreateProfessorDto): Promise<void> => {
      await createProfessorMutation.mutateAsync(dto);
    },

    updateProfessor: async (
      id: number,
      dto: UpdateProfessorDto,
    ): Promise<void> => {
      await updateProfessorMutation.mutateAsync({ id, dto });
    },

    deleteProfessor: async (id: number): Promise<void> => {
      await deleteProfessorMutation.mutateAsync(id);
    },
    deleteProfessorLoading: deleteProfessorMutation.isPending,

    // ── Mutations séances ─────────────────────────────────────────────────────
    createSession: async (dto: CreateCourseDto): Promise<void> => {
      await createSessionMutation.mutateAsync(dto);
    },

    generateSessions: async (dto: GenerateCoursesDto) => {
      const result = await generateSessionsMutation.mutateAsync(dto);
      return { generated: result.generated };
    },

    // ── Mutations présences ───────────────────────────────────────────────────
    bulkUpdatePresence: (cours_id: number, dto: BulkUpdatePresenceDto) =>
      bulkUpdatePresenceMutation.mutateAsync({ cours_id, dto }),

    // ── Utilitaires ───────────────────────────────────────────────────────────

    /**
     * Invalide toutes les queries du module (planning + professeurs + séances).
     * Utile pour un "pull-to-refresh" ou un bouton "Actualiser".
     */
    refetch: () => queryClient.invalidateQueries({ queryKey: courseKeys.all }),

    /**
     * No-op conservé pour compatibilité avec CoursesPage.
     * React Query gère le cycle de vie des erreurs (elles disparaissent
     * automatiquement au prochain refetch réussi).
     */
    clearError: () => {},
  };
};
