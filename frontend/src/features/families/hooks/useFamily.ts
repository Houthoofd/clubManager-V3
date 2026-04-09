/**
 * useFamily Hook
 * Hook personnalisé pour accéder facilement au module familles
 */

import { useCallback } from "react";
import {
  useFamilyStore,
  selectFamily,
  selectFamilyIsLoading,
  selectFamilyError,
} from "../stores/familyStore";
import type { AddFamilyMemberDto } from "@clubmanager/types";

/**
 * Hook familles
 * Fournit un accès simplifié au store familles avec gestion d'erreur intégrée
 */
export const useFamily = () => {
  // Sélecteurs
  const family = useFamilyStore(selectFamily);
  const isLoading = useFamilyStore(selectFamilyIsLoading);
  const error = useFamilyStore(selectFamilyError);

  // Actions brutes depuis le store
  const storeFetchMyFamily = useFamilyStore((state) => state.fetchMyFamily);
  const storeAddMember = useFamilyStore((state) => state.addMember);
  const storeRemoveMember = useFamilyStore((state) => state.removeMember);
  const clearError = useFamilyStore((state) => state.clearError);

  // Valeurs dérivées
  const memberCount = family?.membres.length ?? 0;
  const hasFamily = !!family;

  /**
   * Récupère la famille de l'utilisateur connecté
   */
  const fetchMyFamily = useCallback(async (): Promise<void> => {
    await storeFetchMyFamily();
  }, [storeFetchMyFamily]);

  /**
   * Ajoute un membre à la famille avec gestion d'erreur
   */
  const addMember = useCallback(
    async (
      dto: AddFamilyMemberDto,
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        await storeAddMember(dto);
        return { success: true };
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Échec de l'ajout du membre";
        return { success: false, error: message };
      }
    },
    [storeAddMember],
  );

  /**
   * Retire un membre de la famille avec gestion d'erreur
   * @param userId - Identifiant de l'utilisateur au format U-YYYY-XXXX
   */
  const removeMember = useCallback(
    async (userId: string): Promise<{ success: boolean; error?: string }> => {
      try {
        await storeRemoveMember(userId);
        return { success: true };
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Échec de la suppression du membre";
        return { success: false, error: message };
      }
    },
    [storeRemoveMember],
  );

  return {
    // État
    family,
    isLoading,
    error,
    memberCount,
    hasFamily,

    // Actions
    fetchMyFamily,
    addMember,
    removeMember,
    clearError,
  };
};

export default useFamily;
