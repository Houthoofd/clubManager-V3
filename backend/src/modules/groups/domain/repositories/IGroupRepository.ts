/**
 * IGroupRepository
 * Interface du repository groups (Domain Layer)
 * Contrat pour les opérations de gestion des groupes en base de données
 */

import type {
  Group,
  GroupMember,
  CreateGroupDto,
  UpdateGroupDto,
  AddMemberDto,
  RemoveMemberDto,
  GetGroupsQuery,
  PaginatedGroupsResponse,
} from "../types.js";

export interface IGroupRepository {
  /**
   * Retourne la liste paginée des groupes avec leur nombre de membres
   */
  findAll(query: GetGroupsQuery): Promise<PaginatedGroupsResponse>;

  /**
   * Trouve un groupe par son ID (avec membre_count), ou null si inexistant
   */
  findById(id: number): Promise<Group | null>;

  /**
   * Crée un nouveau groupe et retourne l'entité persistée
   */
  create(data: CreateGroupDto): Promise<Group>;

  /**
   * Met à jour partiellement un groupe et retourne l'entité mise à jour
   */
  update(data: UpdateGroupDto): Promise<Group>;

  /**
   * Supprime un groupe par son ID (CASCADE sur groupes_utilisateurs)
   */
  delete(id: number): Promise<void>;

  /**
   * Retourne la liste des membres d'un groupe avec les données utilisateur jointes
   */
  getMembers(groupeId: number): Promise<GroupMember[]>;

  /**
   * Ajoute un utilisateur à un groupe
   * Lance une erreur si la contrainte UNIQUE est violée (déjà membre)
   */
  addMember(data: AddMemberDto): Promise<void>;

  /**
   * Retire un utilisateur d'un groupe
   * Lance une erreur si aucune ligne n'est supprimée (membre introuvable)
   */
  removeMember(data: RemoveMemberDto): Promise<void>;

  /**
   * Vérifie si un utilisateur est déjà membre d'un groupe
   */
  isMember(groupeId: number, userId: number): Promise<boolean>;
}
