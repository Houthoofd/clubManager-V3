/**
 * DTOs User pour l'API
 * Utilisés pour les requêtes/réponses API
 */

/**
 * DTO pour créer un utilisateur
 * Utilisé lors de l'inscription
 */
export interface CreateUserDto {
  first_name: string;
  last_name: string;
  nom_utilisateur?: string; // Auto-généré si absent
  email: string;
  password: string; // En clair (sera hashé côté backend)
  date_of_birth: string; // Format: YYYY-MM-DD
  telephone?: string;
  adresse?: string;
  genre_id: number;
  grade_id?: number;
  abonnement_id?: number;
  status_id?: number; // Default: 1 (actif)
}

/**
 * DTO pour mettre à jour un utilisateur
 */
export interface UpdateUserDto {
  id: number;
  first_name?: string;
  last_name?: string;
  nom_utilisateur?: string;
  email?: string;
  password?: string;
  date_of_birth?: string;
  telephone?: string;
  adresse?: string;
  genre_id?: number;
  grade_id?: number;
  abonnement_id?: number;
  status_id?: number;
  langue_preferee?: string; // ISO 639-1: fr, en, nl, de, es
}

/**
 * DTO pour la réponse User (sans données sensibles)
 */
export interface UserResponseDto {
  id: number;
  userId: string;
  first_name: string;
  last_name: string;
  nom_utilisateur: string;
  email: string;
  date_of_birth: string;
  telephone?: string;
  email_verified: boolean;
  active: boolean;
  photo_url?: string;

  // Relations
  genre: {
    id: number;
    nom: string;
  };
  grade?: {
    id: number;
    nom: string;
    couleur?: string;
  };
  abonnement?: {
    id: number;
    nom: string;
    prix: number;
  };
  status: {
    id: number;
    nom: string;
  };
  role_app?: string;
  langue_preferee?: string; // ISO 639-1: fr, en, nl, de, es

  date_inscription: string;
  derniere_connexion?: string;
}

/**
 * DTO pour soft delete (RGPD v4.1)
 */
export interface SoftDeleteUserDto {
  userId: number;
  deletedBy: number; // ID de l'admin
  reason: string; // Raison de la suppression
}

/**
 * DTO pour restaurer un utilisateur supprimé
 */
export interface RestoreUserDto {
  userId: number;
  restoredBy: number; // ID de l'admin
}

/**
 * DTO pour liste d'utilisateurs
 */
export interface UserListItemDto {
  id: number;
  userId: string;
  first_name: string;
  last_name: string;
  nom_utilisateur: string;
  email: string;
  email_verified: boolean;
  active: boolean;
  status_id: number;
  role_app?: string;
  langue_preferee?: string; // ISO 639-1: fr, en, nl, de, es
  date_inscription: string;
}

/** DTO pour changer le rôle d'un utilisateur */
export interface UpdateUserRoleDto {
  role_app: string; // UserRole value
}

/** DTO pour changer le statut d'un utilisateur */
export interface UpdateUserStatusDto {
  status_id: number;
}

/** DTO pour changer la langue préférée d'un utilisateur */
export interface UpdateUserLanguageDto {
  langue_preferee: string; // ISO 639-1: fr, en, nl, de, es
}

/** Filtres pour la liste des utilisateurs */
export interface GetUsersQueryDto {
  search?: string; // recherche sur nom/prénom/email/userId
  role_app?: string; // filtrer par rôle
  status_id?: number; // filtrer par statut
  page?: number; // défaut: 1
  limit?: number; // défaut: 20, max: 100
}

/** Réponse paginée de la liste des utilisateurs */
export interface PaginatedUsersResponseDto {
  users: UserListItemDto[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
