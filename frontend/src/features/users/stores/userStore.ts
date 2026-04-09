/**
 * User Store
 * Store Zustand pour la gestion des utilisateurs (liste, filtres, pagination)
 */

import { create } from 'zustand';
import type { UserListItemDto } from '@clubmanager/types';
import * as usersApi from '../api/usersApi';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface Filters {
  search: string;
  role_app: string;
  status_id: string;
}

interface UserStore {
  // ── État ──────────────────────────────────────────────────────────────────
  users: UserListItemDto[];
  pagination: Pagination;
  filters: Filters;
  isLoading: boolean;
  error: string | null;

  // ── Actions ───────────────────────────────────────────────────────────────
  fetchUsers: () => Promise<void>;
  setFilter: (key: keyof Filters, value: string) => void;
  setPage: (page: number) => void;
  updateUserRole: (id: number, role_app: string) => Promise<void>;
  updateUserStatus: (id: number, status_id: number) => Promise<void>;
  deleteUser: (id: number, reason: string) => Promise<void>;
  restoreUser: (id: number) => Promise<void>;
  clearError: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useUserStore = create<UserStore>((set, get) => ({
  // ── État initial ──────────────────────────────────────────────────────────
  users: [],
  pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
  filters: { search: '', role_app: '', status_id: '' },
  isLoading: false,
  error: null,

  // ── fetchUsers ────────────────────────────────────────────────────────────
  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    const { filters, pagination } = get();

    try {
      const result = await usersApi.getUsers({
        search: filters.search || undefined,
        role_app: filters.role_app || undefined,
        status_id: filters.status_id ? Number(filters.status_id) : undefined,
        page: pagination.page,
        limit: pagination.limit,
      });

      set({
        users: result.users,
        pagination: result.pagination,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message ?? error.message ?? 'Une erreur est survenue.',
      });
    }
  },

  // ── setFilter — réinitialise la page à 1 à chaque changement de filtre ───
  setFilter: (key, value) => {
    set((state) => ({
      filters: { ...state.filters, [key]: value },
      pagination: { ...state.pagination, page: 1 },
    }));
  },

  // ── setPage ───────────────────────────────────────────────────────────────
  setPage: (page) => {
    set((state) => ({
      pagination: { ...state.pagination, page },
    }));
  },

  // ── updateUserRole ────────────────────────────────────────────────────────
  updateUserRole: async (id, role_app) => {
    await usersApi.updateUserRole(id, role_app);
    await get().fetchUsers();
  },

  // ── updateUserStatus ──────────────────────────────────────────────────────
  updateUserStatus: async (id, status_id) => {
    await usersApi.updateUserStatus(id, status_id);
    await get().fetchUsers();
  },

  // ── deleteUser ────────────────────────────────────────────────────────────
  deleteUser: async (id, reason) => {
    await usersApi.deleteUser(id, reason);
    await get().fetchUsers();
  },

  // ── restoreUser ───────────────────────────────────────────────────────────
  restoreUser: async (id) => {
    await usersApi.restoreUser(id);
    await get().fetchUsers();
  },

  // ── clearError ────────────────────────────────────────────────────────────
  clearError: () => set({ error: null }),
}));
