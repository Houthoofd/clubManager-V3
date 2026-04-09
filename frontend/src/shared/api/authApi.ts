/**
 * Auth API Service
 * Service pour gérer les appels API d'authentification
 */

import apiClient, {
  setAccessToken,
  setUserData,
  clearAuthData,
  type ApiResponse,
} from "./apiClient";
import type {
  RegisterDto,
  LoginDto,
  AuthResponseDto,
  RefreshTokenDto,
  LogoutDto,
  VerifyEmailInput,
  ResendVerificationEmailInput,
  RequestPasswordResetInput,
  ResetPasswordInput,
  EmailVerificationResponse,
  PasswordResetResponse,
} from "@clubmanager/types";

/**
 * Inscription d'un nouvel utilisateur
 */
export const register = async (
  data: RegisterDto,
): Promise<{ userId: string; email: string; firstName: string }> => {
  const response = await apiClient.post<
    ApiResponse<{
      userId: string;
      email: string;
      firstName: string;
    }>
  >("/auth/register", data);

  return {
    userId: response.data.data!.userId,
    email: response.data.data!.email,
    firstName: response.data.data!.firstName,
  };
};

/**
 * Connexion d'un utilisateur
 */
export const login = async (data: LoginDto): Promise<AuthResponseDto> => {
  const response = await apiClient.post<
    ApiResponse<{
      user: AuthResponseDto["data"]["user"];
      accessToken: string;
      expiresIn: number;
    }>
  >("/auth/login", data);

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
        refreshToken: "", // Stocké dans cookie HTTP-only
        expiresIn: response.data.data!.expiresIn,
      },
    },
  };
};

/**
 * Renouvellement du token d'accès
 */
export const refreshToken = async (): Promise<AuthResponseDto> => {
  const response = await apiClient.post<
    ApiResponse<{
      user: AuthResponseDto["data"]["user"];
      accessToken: string;
      expiresIn: number;
    }>
  >("/auth/refresh");

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
        refreshToken: "", // Stocké dans cookie HTTP-only
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
    await apiClient.post("/auth/logout");
  } catch (error) {
    // Même si la requête échoue, on nettoie les données locales
    console.error("Logout error:", error);
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
    await apiClient.post("/auth/logout-all", { userId });
  } catch (error) {
    console.error("Logout all error:", error);
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
  const response = await apiClient.get<
    ApiResponse<{
      userId: number;
      email: string;
      userIdString: string;
    }>
  >("/auth/me");

  return response.data.data!;
};

/**
 * Vérifie si l'utilisateur est authentifié
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem("accessToken");
  const user = localStorage.getItem("user");
  return !!token && !!user;
};

/**
 * Récupère les données utilisateur du localStorage
 */
export const getStoredUser = (): AuthResponseDto["data"]["user"] | null => {
  const userData = localStorage.getItem("user");
  if (!userData || userData === "undefined" || userData === "null") {
    localStorage.removeItem("user");
    return null;
  }
  try {
    return JSON.parse(userData);
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

/**
 * Vérifie l'email avec le token reçu
 */
export const verifyEmail = async (
  data: VerifyEmailInput,
): Promise<EmailVerificationResponse> => {
  const response = await apiClient.post<ApiResponse<EmailVerificationResponse>>(
    "/auth/verify-email",
    data,
  );
  return response.data.data!;
};

/**
 * Renvoie l'email de vérification
 */
export const resendVerificationEmail = async (
  data: ResendVerificationEmailInput,
): Promise<EmailVerificationResponse> => {
  const response = await apiClient.post<ApiResponse<EmailVerificationResponse>>(
    "/auth/resend-verification",
    data,
  );
  return response.data.data!;
};

/**
 * Demande une réinitialisation de mot de passe
 */
export const requestPasswordReset = async (
  data: RequestPasswordResetInput,
): Promise<PasswordResetResponse> => {
  const response = await apiClient.post<ApiResponse<PasswordResetResponse>>(
    "/auth/forgot-password",
    data,
  );
  return response.data.data!;
};

/**
 * Réinitialise le mot de passe avec le token
 */
export const resetPassword = async (
  data: ResetPasswordInput,
): Promise<PasswordResetResponse> => {
  const response = await apiClient.post<ApiResponse<PasswordResetResponse>>(
    "/auth/reset-password",
    data,
  );
  return response.data.data!;
};
