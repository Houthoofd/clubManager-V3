export interface Family {
    id: number;
    nom?: string;
    created_at: Date;
    updated_at: Date;
}
export type FamilyMemberRole = 'parent' | 'tuteur' | 'enfant' | 'conjoint' | 'autre';
export interface FamilyMember {
    id: number;
    famille_id: number;
    user_id: number;
    role: FamilyMemberRole;
    est_responsable: boolean;
    est_tuteur_legal: boolean;
    date_ajout: Date;
}
export interface FamilyMemberWithUser extends FamilyMember {
    user: {
        id: number;
        userId: string;
        first_name: string;
        last_name: string;
        date_of_birth: Date;
        genre_id: number;
        grade_id?: number;
        est_mineur: boolean;
        peut_se_connecter: boolean;
    };
}
//# sourceMappingURL=Family.types.d.ts.map