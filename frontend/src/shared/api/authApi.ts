/**
 * Auth API Service
 * Service pour gérer les appels API d'authentification
 */

import apiClient, { setAccessToken, setUserData, clearAuthData, type ApiResponse } from './apiClient';
import type {
  RegisterDto,
  LoginDto,
  AuthResponseDto,
  RefreshTokenDto,
  LogoutDto
} from '@clubmanager/types';

/**
 * Inscription d'un nouvel utilisateur
 */
export const register = async (data: RegisterDto): Promise<AuthResponseDto> => {
  const response = await apiClient.post<ApiResponse<{
    user: AuthResponseDto['data']['user'];
    accessToken: string;
    expiresIn: number;
  }>>('/auth/register', data);

  const { user, accessToken } = response.data.data!;

  // Stocker le token et les infos utilisateur
  setAccessToken(accessToken);
  setUserData(user);

  return {
    success: true,
    message: response.data.message,
    data: {
      user,
      tokens: {
        accessToken,
        refreshToken: '', // Stocké dans cookie HTTP-only
        expiresIn: response.data.data!.expiresIn,
      },
    },
  };
};

/**
 * Connexion d'un utilisateur
 */
export const login = async (data: LoginDto): Promise<AuthResponseDto> => {
  const response = await apiClient.post<ApiResponse<{
    user: AuthResponseDto['data']['user'];
    accessToken: string;
    expiresIn: number;
  }>>('/auth/login', data);

  const { user, accessToken } = response.data.data!;

  // Stocker le token et les infos utilisateur
  setAccessToken(accessToken);
  setUserData(user);

  return {
    success: true,
    message: response.data.message,
    data: {
      user,
      tokens: {
        accessToken,
        refreshToken: '', // Stocké dans cookie HTTP-only
        expiresIn: response.data.data!.expiresIn,
      },
    },
  };
};

/**
 * Renouvellement du token d'accès
 */
export const refreshToken = async (): Promise<AuthResponseDto> => {
  const response = await apiClient.post<ApiResponse<{
    user: AuthResponseDto['data']['user'];
    accessToken: string;
    expiresIn: number;
  }>>('/auth/refresh');

  const { user, accessToken } = response.data.data!;

  // Mettre à jour le token et les infos utilisateur
  setAccessToken(accessToken);
  setUserData(user);

  return {
    success: true,
    message: response.data.message,
    data: {
      user,
      tokens: {
        accessToken,
        refreshToken: '', // Stocké dans cookie HTTP-only
        expiresIn: response.data.data!.expiresIn,
      },
    },
  };
};

/**
 * Déconnexion de l'utilisateur
 */
export const logout = async (): Promise<void> => {
  try {
    await apiClient.post('/auth/logout');
  } catch (error) {
    // Même si la requête échoue, on nettoie les données locales
    console.error('Logout error:', error);
  } finally {
    // Nettoyer les données d'authentification
    clearAuthData();
  }
};

/**
 * Déconnexion de tous les appareils
 */
export const logoutAll = async (userId: number): Promise<void> => {
  try {
    await apiClient.post('/auth/logout-all', { userId });
  } catch (error) {
    console.error('Logout all error:', error);
  } finally {
    // Nettoyer les données d'authentification
    clearAuthData();
  }
};

/**
 * Récupère les informations de l'utilisateur connecté
 */
export const getCurrentUser = async (): Promise<{
  userId: number;
  email: string;
  userIdString: string;
}> => {
  const response = await apiClient.get<ApiResponse<{
    userId: number;
    email: string;
    userIdString: string;
  }>>('/auth/me');

  return response.data.data!;
};

/**
 * Vérifie si l'utilisateur est authentifié
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('accessToken');
  const user = localStorage.getItem('user');
  return !!token && !!user;
};

/**
 * Récupère les données utilisateur du localStorage
 */
export const getStoredUser = (): AuthResponseDto['data']['user'] | null => {
  const userData = localStorage.getItem('user');
  return userData ? JSON.parse(userData) : null;
};
