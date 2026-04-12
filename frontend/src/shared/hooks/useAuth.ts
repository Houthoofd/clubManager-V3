/**
 * useAuth Hook
 * Hook personnalisé pour accéder facilement à l'authentification
 */

import { useCallback } from "react";
import {
  useAuthStore,
  selectUser,
  selectIsAuthenticated,
  selectIsLoading,
  selectError,
} from "../stores/authStore";
import type { LoginDto, RegisterDto } from "@clubmanager/types";

/**
 * Hook d'authentification
 * Fournit un accès simplifié au store d'authentification
 */
export const useAuth = () => {
  // Sélecteurs
  const user = useAuthStore(selectUser);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isLoading = useAuthStore(selectIsLoading);
  const error = useAuthStore(selectError);

  // Actions
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const logout = useAuthStore((state) => state.logout);
  const logoutAll = useAuthStore((state) => state.logoutAll);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const clearError = useAuthStore((state) => state.clearError);
  const setUser = useAuthStore((state) => state.setUser);

  /**
   * Connexion avec gestion d'erreur
   */
  const handleLogin = useCallback(
    async (data: LoginDto) => {
      try {
        await login(data);
        return { success: true };
      } catch (error: any) {
        return {
          success: false,
          error:
            error.response?.data?.message || error.message || "Login failed",
        };
      }
    },
    [login],
  );

  /**
   * Inscription avec gestion d'erreur
   */
  const handleRegister = useCallback(
    async (data: RegisterDto) => {
      try {
        const result = await register(data);
        return { success: true, data: result };
      } catch (error: any) {
        return {
          success: false,
          error:
            error.response?.data?.message ||
            error.message ||
            "Registration failed",
        };
      }
    },
    [register],
  );

  /**
   * Déconnexion avec gestion d'erreur
   */
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Logout failed",
      };
    }
  }, [logout]);

  /**
   * Déconnexion de tous les appareils
   */
  const handleLogoutAll = useCallback(async () => {
    try {
      await logoutAll();
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Logout all failed",
      };
    }
  }, [logoutAll]);

  /**
   * Vérifie si l'utilisateur a un rôle spécifique
   */
  const hasRole = useCallback(
    (role: string): boolean => {
      return user?.role_app === role;
    },
    [user],
  );

  /**
   * Retourne le rôle applicatif de l'utilisateur
   */
  const getRole = useCallback((): string => {
    return user?.role_app ?? "member";
  }, [user]);

  /**
   * Vérifie si l'utilisateur a un statut spécifique
   */
  const hasStatus = useCallback(
    (statusId: number): boolean => {
      return user?.status_id === statusId;
    },
    [user],
  );

  /**
   * Vérifie si l'email de l'utilisateur est vérifié
   */
  const isEmailVerified = useCallback((): boolean => {
    return user?.email_verified ?? false;
  }, [user]);

  /**
   * Obtient le nom complet de l'utilisateur
   */
  const getFullName = useCallback((): string => {
    if (!user) return "";
    return `${user.first_name} ${user.last_name}`;
  }, [user]);

  /**
   * Obtient les initiales de l'utilisateur
   */
  const getInitials = useCallback((): string => {
    if (!user) return "";
    return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
  }, [user]);

  return {
    // État
    user,
    isAuthenticated,
    isLoading,
    error,

    // Actions
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    logoutAll: handleLogoutAll,
    refreshToken,
    checkAuth,
    clearError,
    setUser,

    // Helpers
    hasRole,
    getRole,
    hasStatus,
    isEmailVerified,
    getFullName,
    getInitials,
  };
};

export default useAuth;
