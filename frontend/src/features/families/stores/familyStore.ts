/**
 * Family Store
 * Store Zustand pour gérer l'état du module familles
 */

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type {
  AddFamilyMemberDto,
  AddFamilyMemberResponse,
  FamilyResponseDto,
} from "@clubmanager/types";
import * as familyApi from "../api/familyApi";

/**
 * État du store famille
 */
interface FamilyState {
  // État
  family: FamilyResponseDto | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchMyFamily: () => Promise<void>;
  addMember: (dto: AddFamilyMemberDto) => Promise<AddFamilyMemberResponse>;
  removeMember: (userId: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

/**
 * État initial (réutilisé dans reset)
 */
const initialState = {
  family: null,
  isLoading: false,
  error: null,
};

/**
 * Store famille
 */
export const useFamilyStore = create<FamilyState>()(
  devtools(
    persist(
      (set, get) => ({
        // État initial
        ...initialState,

        /**
         * Récupère la famille de l'utilisateur connecté
         */
        fetchMyFamily: async () => {
          set({ isLoading: true, error: null });

          try {
            const family = await familyApi.getMyFamily();

            set({
              family,
              isLoading: false,
              error: null,
            });
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.message ||
              error.message ||
              "Impossible de récupérer la famille";

            set({
              isLoading: false,
              error: errorMessage,
            });

            throw error;
          }
        },

        /**
         * Ajoute un membre à la famille
         * Rafraîchit la famille après l'ajout
         */
        addMember: async (dto: AddFamilyMemberDto) => {
          set({ isLoading: true, error: null });

          try {
            const response = await familyApi.addFamilyMember(dto);

            // Rafraîchir la famille pour avoir les données à jour
            await get().fetchMyFamily();

            set({ isLoading: false, error: null });

            return response;
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.message ||
              error.message ||
              "Impossible d'ajouter le membre";

            set({
              isLoading: false,
              error: errorMessage,
            });

            throw error;
          }
        },

        /**
         * Retire un membre de la famille
         * Rafraîchit la famille après la suppression
         */
        removeMember: async (userId: string) => {
          set({ isLoading: true, error: null });

          try {
            await familyApi.removeFamilyMember(userId);

            // Rafraîchir la famille pour avoir les données à jour
            await get().fetchMyFamily();

            set({ isLoading: false, error: null });
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.message ||
              error.message ||
              "Impossible de retirer le membre";

            set({
              isLoading: false,
              error: errorMessage,
            });

            throw error;
          }
        },

        /**
         * Efface l'erreur courante
         */
        clearError: () => {
          set({ error: null });
        },

        /**
         * Remet le store à son état initial
         */
        reset: () => {
          set(initialState);
        },
      }),
      {
        name: "family-storage",
        partialize: (state) => ({ family: state.family }),
      },
    ),
    {
      name: "FamilyStore",
    },
  ),
);

/**
 * Sélecteurs pour optimiser les re-renders
 */
export const selectFamily = (state: FamilyState) => state.family;
export const selectFamilyIsLoading = (state: FamilyState) => state.isLoading;
export const selectFamilyError = (state: FamilyState) => state.error;
