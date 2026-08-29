import type { UserRole } from "../../enums/UserRole.enum.js";
export interface LoginDto {
    userId: string;
    password: string;
}
export interface LoginByUserIdDto {
    userId: string;
    password: string;
}
export interface RegisterDto {
    first_name: string;
    last_name: string;
    nom_utilisateur?: string;
    email: string;
    password: string;
    date_of_birth: string;
    genre_id: number;
    abonnement_id?: number;
    invitation_token: string;
}
export interface LoginResponseDto {
    success: true;
    message: string;
    data: {
        id: number;
        userId: string;
        first_name: string;
        last_name: string;
        nom_utilisateur: string;
        email: string;
        status_id: number;
        grade_id?: number;
        abonnement_id?: number;
        token?: string;
    };
}
export interface ValidateEmailTokenDto {
    token: string;
    userId: string;
}
export interface PasswordResetRequestDto {
    email: string;
}
export interface PasswordResetDto {
    token: string;
    newPassword: string;
}
export interface SearchUserByEmailDto {
    email: string;
}
export interface VerifyUserExistsDto {
    nom: string;
    prenom: string;
    date_naissance: string;
}
export interface JwtPayload {
    userId: number;
    email: string;
    userIdString: string;
    role_app: UserRole;
    type: "access" | "refresh";
}
export interface DecodedToken extends JwtPayload {
    iat: number;
    exp: number;
}
export interface TokenPair {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
export interface RefreshTokenDto {
    refreshToken: string;
}
export interface AuthResponseDto {
    success: true;
    message: string;
    data: {
        user: {
            id: number;
            userId: string;
            first_name: string;
            last_name: string;
            nom_utilisateur: string;
            email: string;
            email_verified: boolean;
            status_id: number;
            grade_id?: number;
            abonnement_id?: number;
            role_app: UserRole;
        };
        tokens: TokenPair;
    };
}
export interface LogoutDto {
    refreshToken: string;
}
//# sourceMappingURL=AuthDto.d.ts.map