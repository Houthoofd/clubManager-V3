/**
 * Course Store
 * Store Zustand pour la gestion des cours, professeurs, séances et présences
 */

import { create } from 'zustand';
import type {
  CourseRecurrentListItemDto,
  CreateCourseRecurrentDto,
  UpdateCourseRecurrentDto,
  ProfessorListItemDto,
  CreateProfessorDto,
  UpdateProfessorDto,
  CourseListItemDto,
  CreateCourseDto,
  GenerateCoursesDto,
  AttendanceSheetDto,
  BulkUpdatePresenceDto,
} from '@clubmanager/types';
import * as coursesApi from '../api/coursesApi';

// ─── Helper: bornes de la semaine courante (lundi → dimanche) ─────────────────

const getWeekBounds = (): { monday: string; sunday: string } => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = dimanche, 1 = lundi, …
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const fmt = (d: Date): string => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  return { monday: fmt(monday), sunday: fmt(sunday) };
};

const { monday: defaultMonday, sunday: defaultSunday } = getWeekBounds();

// ─── Interface du store ───────────────────────────────────────────────────────

interface CourseStore {
  // ── Planning (cours_recurrent) ────────────────────────────────────────────
  planning: CourseRecurrentListItemDto[];
  planningLoading: boolean;
  planningError: string | null;
  fetchPlanning: () => Promise<void>;
  createCourseRecurrent: (dto: CreateCourseRecurrentDto) => Promise<void>;
  updateCourseRecurrent: (id: number, dto: UpdateCourseRecurrentDto) => Promise<void>;
  deleteCourseRecurrent: (id: number) => Promise<void>;

  // ── Professors ────────────────────────────────────────────────────────────
  professors: ProfessorListItemDto[];
  professorsLoading: boolean;
  fetchProfessors: () => Promise<void>;
  createProfessor: (dto: CreateProfessorDto) => Promise<void>;
  updateProfessor: (id: number, dto: UpdateProfessorDto) => Promise<void>;

  // ── Sessions (cours instances) ────────────────────────────────────────────
  sessions: CourseListItemDto[];
  sessionsLoading: boolean;
  sessionsError: string | null;
  sessionFilters: { date_debut: string; date_fin: string; type_cours: string };
  fetchSessions: () => Promise<void>;
  setSessionFilter: (key: string, value: string) => void;
  createSession: (dto: CreateCourseDto) => Promise<void>;
  generateSessions: (dto: GenerateCoursesDto) => Promise<{ generated: number }>;

  // ── Attendance ────────────────────────────────────────────────────────────
  attendanceSheet: AttendanceSheetDto | null;
  attendanceLoading: boolean;
  fetchAttendance: (cours_id: number) => Promise<void>;
  bulkUpdatePresence: (cours_id: number, dto: BulkUpdatePresenceDto) => Promise<void>;

  // ── Misc ──────────────────────────────────────────────────────────────────
  clearError: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useCourseStore = create<CourseStore>((set, get) => ({
  // ── Planning ──────────────────────────────────────────────────────────────
  planning: [],
  planningLoading: false,
  planningError: null,

  fetchPlanning: async () => {
    set({ planningLoading: true, planningError: null });
    try {
      const planning = await coursesApi.getCourseRecurrents();
      set({ planning, planningLoading: false });
    } catch (error: any) {
      set({
        planningLoading: false,
        planningError:
          error.response?.data?.message ?? error.message ?? 'Une erreur est survenue.',
      });
    }
  },

  createCourseRecurrent: async (dto) => {
    await coursesApi.createCourseRecurrent(dto);
    await get().fetchPlanning();
  },

  updateCourseRecurrent: async (id, dto) => {
    await coursesApi.updateCourseRecurrent(id, dto);
    await get().fetchPlanning();
  },

  deleteCourseRecurrent: async (id) => {
    await coursesApi.deleteCourseRecurrent(id);
    await get().fetchPlanning();
  },

  // ── Professors ────────────────────────────────────────────────────────────
  professors: [],
  professorsLoading: false,

  fetchProfessors: async () => {
    set({ professorsLoading: true });
    try {
      const professors = await coursesApi.getProfessors();
      set({ professors, professorsLoading: false });
    } catch (error: any) {
      // Silently fail — non-blocking for UX; planningError covers critical errors
      set({ professorsLoading: false });
    }
  },

  createProfessor: async (dto) => {
    await coursesApi.createProfessor(dto);
    await get().fetchProfessors();
  },

  updateProfessor: async (id, dto) => {
    await coursesApi.updateProfessor(id, dto);
    await get().fetchProfessors();
  },

  // ── Sessions ──────────────────────────────────────────────────────────────
  sessions: [],
  sessionsLoading: false,
  sessionsError: null,
  sessionFilters: {
    date_debut: defaultMonday,
    date_fin: defaultSunday,
    type_cours: '',
  },

  fetchSessions: async () => {
    set({ sessionsLoading: true, sessionsError: null });
    const { sessionFilters } = get();
    try {
      const sessions = await coursesApi.getCourses({
        date_debut: sessionFilters.date_debut || undefined,
        date_fin: sessionFilters.date_fin || undefined,
        type_cours: sessionFilters.type_cours || undefined,
      });
      set({ sessions, sessionsLoading: false });
    } catch (error: any) {
      set({
        sessionsLoading: false,
        sessionsError:
          error.response?.data?.message ?? error.message ?? 'Une erreur est survenue.',
      });
    }
  },

  setSessionFilter: (key, value) => {
    set((state) => ({
      sessionFilters: { ...state.sessionFilters, [key]: value },
    }));
  },

  createSession: async (dto) => {
    await coursesApi.createSession(dto);
    await get().fetchSessions();
  },

  generateSessions: async (dto) => {
    const result = await coursesApi.generateCourses(dto);
    await get().fetchSessions();
    return { generated: result.generated };
  },

  // ── Attendance ────────────────────────────────────────────────────────────
  attendanceSheet: null,
  attendanceLoading: false,

  fetchAttendance: async (cours_id) => {
    set({ attendanceLoading: true });
    try {
      const attendanceSheet = await coursesApi.getCourseInscriptions(cours_id);
      set({ attendanceSheet, attendanceLoading: false });
    } catch (error: any) {
      set({ attendanceLoading: false });
    }
  },

  bulkUpdatePresence: async (cours_id, dto) => {
    await coursesApi.bulkUpdatePresence(cours_id, dto);
    await get().fetchAttendance(cours_id);
  },

  // ── clearError ────────────────────────────────────────────────────────────
  clearError: () => set({ planningError: null, sessionsError: null }),
}));
