/**
 * Domain Types - Family
 * Basé sur les tables `familles` et `famille_membres` de la DB
 */

/**
 * Interface principale Family
 * Correspond à la structure de la table `familles`
 */
export interface Family {
  // Identifiant
  id: number;

  // Informations
  nom?: string;

  // Timestamps
  created_at: Date;
  updated_at: Date;
}

/**
 * Rôle d'un membre dans une famille
 * Définit la relation du membre avec la famille
 */
export type FamilyMemberRole =
  | 'parent'
  | 'tuteur'
  | 'enfant'
  | 'conjoint'
  | 'autre';

/**
 * Interface FamilyMember
 * Correspond à la structure de la table `famille_membres`
 * Représente le lien entre un utilisateur et une famille
 */
export interface FamilyMember {
  // Identifiant
  id: number;

  // Relations (Foreign Keys)
  famille_id: number;
  user_id: number;

  // Rôle et responsabilités
  role: FamilyMemberRole;
  est_responsable: boolean;
  est_tuteur_legal: boolean;

  // Timestamps
  date_ajout: Date;
}

/**
 * FamilyMember avec données utilisateur chargées
 * Inclut les informations de l'utilisateur lié au membre
 */
export interface FamilyMemberWithUser extends FamilyMember {
  user: {
    id: number;
    userId: string; // Format: U-YYYY-XXXX
    first_name: string;
    last_name: string;
    date_of_birth: Date;
    genre_id: number;
    grade_id?: number;
    est_mineur: boolean;
    peut_se_connecter: boolean;
  };
}
