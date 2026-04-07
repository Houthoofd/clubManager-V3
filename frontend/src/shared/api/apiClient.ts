/**
 * API Client
 * Client Axios configuré avec auto-refresh des tokens
 */

import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosError } from 'axios';

// Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

/**
 * Instance Axios principale
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important pour les cookies HTTP-only
});

/**
 * État du refresh token
 */
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

/**
 * Ajoute un subscriber à la queue de refresh
 */
const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

/**
 * Notifie tous les subscribers avec le nouveau token
 */
const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

/**
 * Récupère le token d'accès du localStorage
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

/**
 * Stocke le token d'accès dans le localStorage
 */
export const setAccessToken = (token: string): void => {
  localStorage.setItem('accessToken', token);
};

/**
 * Supprime le token d'accès du localStorage
 */
export const removeAccessToken = (): void => {
  localStorage.removeItem('accessToken');
};

/**
 * Stocke les informations utilisateur dans le localStorage
 */
export const setUserData = (user: any): void => {
  localStorage.setItem('user', JSON.stringify(user));
};

/**
 * Récupère les informations utilisateur du localStorage
 */
export const getUserData = (): any | null => {
  const userData = localStorage.getItem('user');
  return userData ? JSON.parse(userData) : null;
};

/**
 * Supprime les informations utilisateur du localStorage
 */
export const removeUserData = (): void => {
  localStorage.removeItem('user');
};

/**
 * Nettoie toutes les données d'authentification
 */
export const clearAuthData = (): void => {
  removeAccessToken();
  removeUserData();
};

/**
 * Refresh le token d'accès
 */
const refreshAccessToken = async (): Promise<string> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/auth/refresh`,
      {},
      {
        withCredentials: true, // Envoie le refresh token cookie
      }
    );

    const { accessToken, user } = response.data.data;

    // Stocker le nouveau token et les infos user
    setAccessToken(accessToken);
    setUserData(user);

    return accessToken;
  } catch (error) {
    // Si le refresh échoue, nettoyer les données et rediriger vers login
    clearAuthData();

    // Rediriger vers la page de login
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }

    throw error;
  }
};

/**
 * Intercepteur de requête
 * Ajoute le token d'accès à chaque requête
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Intercepteur de réponse
 * Gère l'auto-refresh du token en cas d'expiration
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Si erreur 401 et pas déjà en retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Vérifier si c'est une erreur de token expiré
      const errorData = error.response.data as any;

      if (errorData?.error === 'TOKEN_EXPIRED') {
        if (isRefreshing) {
          // Si un refresh est déjà en cours, attendre qu'il se termine
          return new Promise((resolve) => {
            subscribeTokenRefresh((token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Refresh le token
          const newToken = await refreshAccessToken();
          isRefreshing = false;

          // Notifier tous les subscribers
          onRefreshed(newToken);

          // Retry la requête originale avec le nouveau token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          isRefreshing = false;
          refreshSubscribers = [];
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Helper pour gérer les erreurs API
 */
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message || error.message;
    return message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
};

/**
 * Type pour les réponses API standardisées
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export default apiClient;
