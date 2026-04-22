/**
 * useLanguage Hook
 * Hook personnalisé pour la gestion du changement de langue
 * avec synchronisation avec l'API backend
 */

import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../shared/hooks/useAuth';
import { apiClient } from '../../shared/api/apiClient';
import { supportedLanguages } from '../index';
import type { User } from '@clubmanager/types';

/**
 * Interface pour les informations de langue
 */
interface LanguageInfo {
  code: string;
  label: string;
  flag: string;
}

/**
 * Interface de retour du hook
 */
interface UseLanguageReturn {
  language: string;
  changeLanguage: (newLang: string) => Promise<void>;
  availableLanguages: readonly LanguageInfo[];
  isChanging: boolean;
}

/**
 * Hook useLanguage
 * Gère le changement de langue avec synchronisation backend
 */
export const useLanguage = (): UseLanguageReturn => {
  const { i18n } = useTranslation();
  const { user, isAuthenticated, setUser } = useAuth();

  /**
   * Change la langue de l'application
   * - Change la langue dans i18next
   * - Sauvegarde dans localStorage
   * - Synchronise avec le backend si l'utilisateur est connecté
   *
   * @param newLang - Code de la nouvelle langue (fr, en, etc.)
   * @throws Error si le changement de langue échoue
   */
  const changeLanguage = useCallback(
    async (newLang: string): Promise<void> => {
      try {
        // Vérifier que la langue est supportée
        const isSupported = supportedLanguages.some(
          (lang) => lang.code === newLang
        );

        if (!isSupported) {
          console.warn(`Language ${newLang} is not supported`);
          throw new Error(`Langue ${newLang} non supportée`);
        }

        // Changer la langue dans i18next
        await i18n.changeLanguage(newLang);

        // Sauvegarder dans localStorage
        localStorage.setItem('user-language', newLang);

        // Si l'utilisateur est authentifié, synchroniser avec le backend
        if (isAuthenticated && user) {
          try {
            // Appel API pour mettre à jour la langue préférée
            const response = await apiClient.patch<{
              success: boolean;
              data: User;
            }>('/users/me', {
              langue_preferee: newLang,
            });

            // Mettre à jour l'utilisateur dans le store avec les nouvelles données
            if (response.data.success && response.data.data) {
              setUser(response.data.data);
            }
          } catch (apiError: any) {
            // Log l'erreur mais ne pas bloquer le changement de langue
            // L'utilisateur peut quand même utiliser l'app dans la nouvelle langue
            console.error(
              'Failed to update language preference on backend:',
              apiError.response?.data?.message || apiError.message
            );

            // On ne throw pas l'erreur car la langue a été changée localement
            // L'utilisateur peut continuer à utiliser l'application
          }
        }
      } catch (error: any) {
        console.error('Failed to change language:', error);
        throw error;
      }
    },
    [i18n, isAuthenticated, user, setUser]
  );

  return {
    // Langue courante
    language: i18n.language || 'fr',

    // Fonction de changement de langue
    changeLanguage,

    // Langues disponibles
    availableLanguages: supportedLanguages,

    // État de chargement (pour l'instant toujours false, mais extensible)
    isChanging: false,
  };
};

export default useLanguage;
