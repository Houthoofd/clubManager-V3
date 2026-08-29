export interface CreateUserDto {
    first_name: string;
    last_name: string;
    nom_utilisateur?: string;
    email: string;
    password: string;
    date_of_birth: string;
    telephone?: string;
    adresse?: string;
    genre_id: number;
    grade_id?: number;
    abonnement_id?: number;
    status_id?: number;
}
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
    langue_preferee?: string;
}
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
    langue_preferee?: string;
    date_inscription: string;
    derniere_connexion?: string;
}
export interface SoftDeleteUserDto {
    userId: number;
    deletedBy: number;
    reason: string;
}
export interface RestoreUserDto {
    userId: number;
    restoredBy: number;
}
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
    langue_preferee?: string;
    date_inscription: string;
}
export interface UpdateUserRoleDto {
    role_app: string;
}
export interface UpdateUserStatusDto {
    status_id: number;
}
export interface UpdateUserLanguageDto {
    langue_preferee: string;
}
export interface GetUsersQueryDto {
    search?: string;
    role_app?: string;
    status_id?: number;
    page?: number;
    limit?: number;
}
export interface PaginatedUsersResponseDto {
    users: UserListItemDto[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
//# sourceMappingURL=UserDto.d.ts.map