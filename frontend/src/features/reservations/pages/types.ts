export type ReservationStatut = "confirmee" | "annulee" | "en_attente";

export interface ReservationDto {
  id: number;
  user_id: number;
  cours_id: number;
  statut: ReservationStatut;
  created_at: string;
  updated_at: string;
  user_nom?: string;
  user_prenom?: string;
  user_email?: string;
  cours_date?: string;
  cours_type?: string;
  cours_heure_debut?: string;
  cours_heure_fin?: string;
}

export type ModalState =
  | { type: "none" }
  | { type: "create" }
  | { type: "cancel"; reservation: ReservationDto };
