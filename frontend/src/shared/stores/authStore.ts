/**
 * Auth Store
 * Store Zustand pour gérer l'état d'authentification
 */

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { LoginDto, RegisterDto } from "@clubmanager/types";
import * as authApi from "../api/authApi";
import { clearAuthData } from "../api/apiClient";

/**
 * User minimal pour le store
 */
interface User {
  id: number;
  userId: string;
  first_name: string;
  last_name: string;
  nom_utilisateur: string;
  email: string;
  email_verified: boolean;
  status_id: number;
  grade_id?: number;
  abonnement_id?: number;
}

/**
 * État du store d'authentification
 */
interface AuthState {
  // État
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (data: LoginDto) => Promise<void>;
  register: (
    data: RegisterDto,
  ) => Promise<{ userId: string; email: string; firstName: string }>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshToken: () => Promise<void>;
  checkAuth: () => void;
  clearError: () => void;
  setUser: (user: User | null) => void;
}

/**
 * Store d'authentification
 */
export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // État initial
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        /**
         * Connexion
         */
        login: async (data: LoginDto) => {
          set({ isLoading: true, error: null });

          try {
            const response = await authApi.login(data);
            const user = response.data.user;

            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.message || error.message || "Login failed";

            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: errorMessage,
            });

            throw error;
          }
        },

        /**
         * Inscription — ne connecte pas l'utilisateur automatiquement
         * L'utilisateur doit d'abord vérifier son email
         */
        register: async (data: RegisterDto) => {
          set({ isLoading: true, error: null });

          try {
            const response = await authApi.register(data);

            // Ne pas connecter l'utilisateur — vérification email requise
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });

            return {
              userId: response.userId,
              email: response.email,
              firstName: response.firstName,
            };
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.message ||
              error.message ||
              "Registration failed";

            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: errorMessage,
            });

            throw error;
          }
        },

        /**
         * Déconnexion
         */
        logout: async () => {
          set({ isLoading: true, error: null });

          try {
            await authApi.logout();

            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          } catch (error: any) {
            console.error("Logout error:", error);

            // Nettoyer l'état même en cas d'erreur
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          }
        },

        /**
         * Déconnexion de tous les appareils
         */
        logoutAll: async () => {
          const { user } = get();

          if (!user) {
            return;
          }

          set({ isLoading: true, error: null });

          try {
            await authApi.logoutAll(user.id);

            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          } catch (error: any) {
            console.error("Logout all error:", error);

            // Nettoyer l'état même en cas d'erreur
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          }
        },

        /**
         * Renouvelle le token d'accès
         */
        refreshToken: async () => {
          try {
            const response = await authApi.refreshToken();
            const user = response.data.user;

            set({
              user,
              isAuthenticated: true,
              error: null,
            });
          } catch (error: any) {
            console.error("Refresh token error:", error);

            set({
              user: null,
              isAuthenticated: false,
              error: "Session expired",
            });

            throw error;
          }
        },

        /**
         * Vérifie l'état d'authentification au chargement
         */
        checkAuth: () => {
          const isAuth = authApi.isAuthenticated();
          const storedUser = authApi.getStoredUser();

          // Nettoyer tout état incohérent (isAuthenticated:true mais user:null)
          if (isAuth && storedUser) {
            set({
              user: storedUser,
              isAuthenticated: true,
              error: null,
            });
          } else {
            // État invalide ou absent → reset complet + nettoyage localStorage
            clearAuthData();
            set({
              user: null,
              isAuthenticated: false,
              error: null,
            });
          }
        },

        /**
         * Efface l'erreur
         */
        clearError: () => {
          set({ error: null });
        },

        /**
         * Définit l'utilisateur manuellement
         */
        setUser: (user: User | null) => {
          set({
            user,
            isAuthenticated: !!user,
          });
        },
      }),
      {
        name: "auth-storage",
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      },
    ),
    {
      name: "AuthStore",
    },
  ),
);

/**
 * Sélecteurs pour optimiser les re-renders
 */
export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) =>
  state.isAuthenticated;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectError = (state: AuthState) => state.error;
