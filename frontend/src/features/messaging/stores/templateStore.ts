/**
 * templateStore.ts
 * Store Zustand pour la gestion des templates de messages
 */

import { create } from 'zustand';
import { toast } from 'sonner';
import * as templatesApi from '../api/templatesApi';
import type { Template, TemplateType } from '../api/templatesApi';

// ─── Interface ────────────────────────────────────────────────────────────────

interface TemplateStore {
  // ── État ────────────────────────────────────────────────────────────────────
  types: TemplateType[];
  templates: Template[];
  isLoading: boolean;
  error: string | null;

  // ── Actions — Types ─────────────────────────────────────────────────────────
  fetchTypes: () => Promise<void>;
  createType: (data: { nom: string; description?: string }) => Promise<void>;
  updateType: (
    id: number,
    data: Partial<{ nom: string; description: string; actif: boolean }>,
  ) => Promise<void>;
  deleteType: (id: number) => Promise<void>;

  // ── Actions — Templates ─────────────────────────────────────────────────────
  fetchTemplates: (typeId?: number) => Promise<void>;
  createTemplate: (data: {
    type_id: number;
    titre: string;
    contenu: string;
    actif?: boolean;
  }) => Promise<void>;
  updateTemplate: (
    id: number,
    data: Partial<{ type_id: number; titre: string; contenu: string; actif: boolean }>,
  ) => Promise<void>;
  deleteTemplate: (id: number) => Promise<void>;
  toggleTemplate: (id: number, actif: boolean) => Promise<void>;

  // ── Utilitaires ─────────────────────────────────────────────────────────────
  clearError: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useTemplateStore = create<TemplateStore>((set, get) => ({
  // ── État initial ─────────────────────────────────────────────────────────────
  types: [],
  templates: [],
  isLoading: false,
  error: null,

  // ── fetchTypes ────────────────────────────────────────────────────────────────
  fetchTypes: async () => {
    set({ isLoading: true, error: null });
    try {
      const types = await templatesApi.getTemplateTypes();
      set({ types, isLoading: false });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        'Erreur lors du chargement des catégories.';
      set({ isLoading: false, error: msg });
    }
  },

  // ── createType ────────────────────────────────────────────────────────────────
  createType: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await templatesApi.createTemplateType(data);
      await get().fetchTypes();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        'Erreur lors de la création de la catégorie.';
      set({ isLoading: false, error: msg });
      throw err;
    }
  },

  // ── updateType ────────────────────────────────────────────────────────────────
  updateType: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await templatesApi.updateTemplateType(id, data);
      await get().fetchTypes();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        'Erreur lors de la mise à jour de la catégorie.';
      set({ isLoading: false, error: msg });
      throw err;
    }
  },

  // ── deleteType ────────────────────────────────────────────────────────────────
  deleteType: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await templatesApi.deleteTemplateType(id);
      // Retirer localement + refetch pour être sûr
      set((state) => ({
        types: state.types.filter((t) => t.id !== id),
        // Retirer aussi les templates de ce type
        templates: state.templates.filter((t) => t.type_id !== id),
      }));
      await get().fetchTypes();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        'Erreur lors de la suppression de la catégorie.';
      set({ isLoading: false, error: msg });
      toast.error(msg);
      throw err;
    }
  },

  // ── fetchTemplates ────────────────────────────────────────────────────────────
  fetchTemplates: async (typeId?: number) => {
    set({ isLoading: true, error: null });
    try {
      const templates = await templatesApi.getTemplates(typeId);
      set({ templates, isLoading: false });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        'Erreur lors du chargement des templates.';
      set({ isLoading: false, error: msg });
    }
  },

  // ── createTemplate ────────────────────────────────────────────────────────────
  createTemplate: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await templatesApi.createTemplate(data);
      await get().fetchTemplates();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        'Erreur lors de la création du template.';
      set({ isLoading: false, error: msg });
      throw err;
    }
  },

  // ── updateTemplate ────────────────────────────────────────────────────────────
  updateTemplate: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await templatesApi.updateTemplate(id, data);
      await get().fetchTemplates();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        'Erreur lors de la mise à jour du template.';
      set({ isLoading: false, error: msg });
      throw err;
    }
  },

  // ── deleteTemplate ────────────────────────────────────────────────────────────
  deleteTemplate: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await templatesApi.deleteTemplate(id);
      // Optimistic local removal
      set((state) => ({
        templates: state.templates.filter((t) => t.id !== id),
      }));
      await get().fetchTemplates();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        'Erreur lors de la suppression du template.';
      set({ isLoading: false, error: msg });
      toast.error(msg);
      throw err;
    }
  },

  // ── toggleTemplate ────────────────────────────────────────────────────────────
  toggleTemplate: async (id, actif) => {
    // Optimistic update
    set((state) => ({
      templates: state.templates.map((t) =>
        t.id === id ? { ...t, actif } : t,
      ),
    }));
    try {
      await templatesApi.toggleTemplate(id, actif);
    } catch (err: any) {
      // Rollback on error
      set((state) => ({
        templates: state.templates.map((t) =>
          t.id === id ? { ...t, actif: !actif } : t,
        ),
      }));
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        'Erreur lors du changement de statut.';
      toast.error(msg);
      throw err;
    }
  },

  // ── clearError ─────────────────────────────────────────────────────────────────
  clearError: () => set({ error: null }),
}));
