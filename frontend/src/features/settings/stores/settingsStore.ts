/**
 * Settings Store
 * Store Zustand pour la gestion des paramètres du club (clé-valeur)
 */

import { create } from 'zustand';
import type { Information, CreateInformation } from '@clubmanager/types';
import {
  getSettings,
  upsertSetting,
  bulkUpsertSettings,
  deleteSetting,
} from '../api/settingsApi';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SettingsStore {
  // ── État ──────────────────────────────────────────────────────────────────
  settings: Information[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // ── Actions ───────────────────────────────────────────────────────────────
  fetchSettings: () => Promise<void>;
  upsertSetting: (cle: string, valeur: string, description?: string) => Promise<void>;
  bulkUpsertSettings: (informations: CreateInformation[]) => Promise<void>;
  deleteSetting: (id: number) => Promise<void>;
  getByKey: (cle: string) => Information | undefined;
  clearError: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  // ── État initial ──────────────────────────────────────────────────────────
  settings: [],
  isLoading: false,
  isSaving: false,
  error: null,

  // ── fetchSettings ─────────────────────────────────────────────────────────
  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await getSettings();
      set({ settings: result.data, isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message ?? error.message ?? 'Erreur lors du chargement des paramètres.',
      });
    }
  },

  // ── upsertSetting ─────────────────────────────────────────────────────────
  upsertSetting: async (cle, valeur, description) => {
    set({ isSaving: true, error: null });
    try {
      await upsertSetting(cle, valeur, description);
      await get().fetchSettings();
      set({ isSaving: false });
    } catch (error: any) {
      set({
        isSaving: false,
        error: error.response?.data?.message ?? error.message ?? 'Erreur lors de la sauvegarde.',
      });
      throw error;
    }
  },

  // ── bulkUpsertSettings ────────────────────────────────────────────────────
  bulkUpsertSettings: async (informations) => {
    set({ isSaving: true, error: null });
    try {
      await bulkUpsertSettings(informations);
      await get().fetchSettings();
      set({ isSaving: false });
    } catch (error: any) {
      set({
        isSaving: false,
        error: error.response?.data?.message ?? error.message ?? 'Erreur lors de la sauvegarde groupée.',
      });
      throw error;
    }
  },

  // ── deleteSetting ─────────────────────────────────────────────────────────
  deleteSetting: async (id) => {
    set({ isSaving: true, error: null });
    try {
      await deleteSetting(id);
      set((state) => ({
        settings: state.settings.filter((s) => s.id !== id),
        isSaving: false,
      }));
    } catch (error: any) {
      set({
        isSaving: false,
        error: error.response?.data?.message ?? error.message ?? 'Erreur lors de la suppression.',
      });
      throw error;
    }
  },

  // ── getByKey ──────────────────────────────────────────────────────────────
  getByKey: (cle) => get().settings.find((s) => s.cle === cle),

  // ── clearError ────────────────────────────────────────────────────────────
  clearError: () => set({ error: null }),
}));
