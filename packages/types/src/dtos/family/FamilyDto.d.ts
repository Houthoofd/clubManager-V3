import type { FamilyMemberRole } from "../../domain/family/Family.types.js";
export interface AddFamilyMemberDto {
    first_name: string;
    last_name: string;
    date_of_birth: string;
    genre_id: number;
    role: FamilyMemberRole;
}
export interface FamilyMemberResponseDto {
    id: number;
    userId: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    genre_id: number;
    grade?: {
        id: number;
        nom: string;
        couleur?: string;
    };
    role: FamilyMemberRole;
    est_responsable: boolean;
    est_tuteur_legal: boolean;
    est_mineur: boolean;
    date_ajout: string;
}
export interface FamilyResponseDto {
    famille_id: number;
    nom?: string;
    membres: FamilyMemberResponseDto[];
}
export interface RemoveFamilyMemberDto {
    membre_userId: string;
}
export interface AddFamilyMemberResponse {
    success: boolean;
    message: string;
    data: {
        famille_id: number;
        membre: FamilyMemberResponseDto;
    };
}
//# sourceMappingURL=FamilyDto.d.ts.map