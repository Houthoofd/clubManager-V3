/**
 * Invitation Domain Types
 * Types métier du module d'invitations
 */

export type InvitationStatus = 'pending' | 'accepted' | 'revoked';

export interface Invitation {
  id: number;
  email: string;
  invited_by: number;
  invited_by_name?: string; // JOIN sur utilisateurs
  status: InvitationStatus;
  expires_at: Date;
  used_at: Date | null;
  created_at: Date;
}

export interface CreateInvitationDto {
  email: string;
  invited_by: number; // ID de l'admin qui invite
}
