/**
 * IFamilyRepository
 * Interface du repository familles (Domain Layer)
 * Contrat pour les opérations de gestion des familles en base de données
 */

import type {
  User,
  Family,
  FamilyMember,
  FamilyMemberWithUser,
  FamilyMemberRole,
} from '@clubmanager/types'

/**
 * Interface du repository familles
 */
export interface IFamilyRepository {
  // ==================== FAMILLES ====================

  /**
   * Crée une nouvelle famille
   * @param nom - Nom optionnel de la famille
   * @returns Promise<Family> - Famille créée
   */
  createFamille(nom?: string): Promise<Family>

  /**
   * Trouve la famille d'un utilisateur
   * @param userId - ID numérique de l'utilisateur
   * @returns Promise<Family | null> - Famille trouvée ou null
   */
  findFamilleByUserId(userId: number): Promise<Family | null>

  // ==================== MEMBRES ====================

  /**
   * Ajoute un membre à une famille
   * @param params - Paramètres du membre à ajouter
   * @returns Promise<FamilyMember> - Membre créé
   */
  addMembre(params: {
    familleId: number
    userId: number
    role: FamilyMemberRole
    estResponsable: boolean
    estTuteurLegal: boolean
  }): Promise<FamilyMember>

  /**
   * Récupère tous les membres d'une famille avec leurs informations utilisateur
   * @param familleId - ID de la famille
   * @returns Promise<FamilyMemberWithUser[]> - Liste des membres avec données utilisateur
   */
  getMembresByFamilleId(familleId: number): Promise<FamilyMemberWithUser[]>

  /**
   * Retire un membre d'une famille
   * @param familleId - ID de la famille
   * @param userId - ID numérique de l'utilisateur à retirer
   * @returns Promise<void>
   */
  removeMembre(familleId: number, userId: number): Promise<void>

  /**
   * Vérifie si un utilisateur est membre d'une famille
   * @param familleId - ID de la famille
   * @param userId - ID numérique de l'utilisateur
   * @returns Promise<boolean> - true si l'utilisateur est membre
   */
  isMembre(familleId: number, userId: number): Promise<boolean>

  // ==================== COMPTE ENFANT ====================

  /**
   * Crée un compte enfant (sans email ni mot de passe)
   * Le compte enfant ne peut pas se connecter de façon autonome
   * @param data - Données de l'enfant à créer
   * @returns Promise<User> - Utilisateur enfant créé
   */
  createChildUser(data: {
    first_name: string
    last_name: string
    date_of_birth: Date
    genre_id: number
    tuteur_id: number        // ID numérique du parent/tuteur
    est_mineur: boolean      // toujours true pour un enfant
    peut_se_connecter: boolean // toujours false pour un compte enfant
  }): Promise<User>
}
