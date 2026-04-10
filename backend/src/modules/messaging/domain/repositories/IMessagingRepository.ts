/**
 * IMessagingRepository
 * Interface du repository messaging (Domain Layer)
 * Contrat pour les opérations de messagerie en base de données
 */

// ==================== TYPES ====================

export interface MessageWithDetails {
  id: number;
  expediteur_id: number;
  expediteur_nom: string;     // "Prénom Nom"
  expediteur_userId: string;  // "U-2025-0001"
  destinataire_id: number;
  destinataire_nom: string;
  sujet: string | null;
  contenu: string;
  lu: boolean;
  date_lecture: Date | null;
  envoye_par_email: boolean;
  broadcast_id: number | null;
  created_at: Date;
}

export interface PaginatedMessages {
  messages: MessageWithDetails[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SendMessageParams {
  expediteur_id: number;
  destinataire_id: number;
  sujet?: string;
  contenu: string;
  broadcast_id?: number;
  envoye_par_email?: boolean;
}

export interface BroadcastParams {
  expediteur_id: number;
  sujet?: string;
  contenu: string;
  cible: 'tous' | 'admin' | 'professor' | 'member';
  envoye_par_email: boolean;
}

export interface RecipientInfo {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

// ==================== INTERFACE ====================

export interface IMessagingRepository {
  /**
   * Insère un message individuel en base
   * @returns l'id auto-incrémenté du message créé
   */
  sendToUser(params: SendMessageParams): Promise<number>;

  /**
   * Crée un enregistrement de broadcast (envoi groupé)
   * @returns l'id auto-incrémenté du broadcast créé
   */
  createBroadcast(params: BroadcastParams): Promise<number>;

  /**
   * Met à jour le compteur de destinataires d'un broadcast
   */
  updateBroadcastCount(broadcastId: number, count: number): Promise<void>;

  /**
   * Retourne les messages reçus (boîte de réception) d'un utilisateur, paginés
   * @param lu — filtre optionnel non-lu (false) / lu (true)
   */
  getInbox(userId: number, page: number, limit: number, lu?: boolean): Promise<PaginatedMessages>;

  /**
   * Retourne les messages envoyés par un utilisateur, paginés
   */
  getSent(userId: number, page: number, limit: number): Promise<PaginatedMessages>;

  /**
   * Retourne un message par son id, uniquement si l'utilisateur est expéditeur ou destinataire
   */
  getById(messageId: number, userId: number): Promise<MessageWithDetails | null>;

  /**
   * Marque un message comme lu (destinataire uniquement)
   */
  markAsRead(messageId: number, userId: number): Promise<void>;

  /**
   * Supprime définitivement un message pour le destinataire
   */
  deleteForUser(messageId: number, userId: number): Promise<void>;

  /**
   * Compte le nombre de messages non lus d'un utilisateur
   */
  getUnreadCount(userId: number): Promise<number>;

  /**
   * Retourne les destinataires éligibles à un broadcast selon la cible
   * cible = 'tous'  → tous utilisateurs actifs non supprimés
   * cible = 'admin' | 'professor' | 'member' → filtre par role_app
   */
  getRecipientsForBroadcast(cible: string): Promise<RecipientInfo[]>;
}
