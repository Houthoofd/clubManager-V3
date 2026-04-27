/**
 * GetReferencesUseCase
 * Use case pour récupérer les données de référence de l'application
 * Pattern Clean Architecture — wrapper autour du repository
 */

import type { ReferencesRepository } from "../infrastructure/referencesRepository.js";
import type {
  ReferencesData,
  MethodePaiement,
  StatutCommande,
  TypeCours,
  StatutPaiement,
  StatutEcheance,
  RoleUtilisateur,
  RoleFamilial,
  Genre,
} from "../domain/types.js";

export class GetReferencesUseCase {
  constructor(private readonly repo: ReferencesRepository) {}

  /**
   * Récupère toutes les données de référence en parallèle
   */
  async execute(): Promise<ReferencesData> {
    try {
      return await this.repo.getAllReferences();
    } catch (error) {
      console.error("[GetReferencesUseCase.execute]", error);
      throw error;
    }
  }

  /**
   * Récupère uniquement les méthodes de paiement actives
   */
  async getMethodesPaiement(): Promise<MethodePaiement[]> {
    try {
      return await this.repo.getMethodesPaiement();
    } catch (error) {
      console.error("[GetReferencesUseCase.getMethodesPaiement]", error);
      throw error;
    }
  }

  /**
   * Récupère uniquement les statuts de commande actifs
   */
  async getStatutsCommande(): Promise<StatutCommande[]> {
    try {
      return await this.repo.getStatutsCommande();
    } catch (error) {
      console.error("[GetReferencesUseCase.getStatutsCommande]", error);
      throw error;
    }
  }

  /**
   * Récupère uniquement les types de cours actifs
   */
  async getTypesCours(): Promise<TypeCours[]> {
    try {
      return await this.repo.getTypesCours();
    } catch (error) {
      console.error("[GetReferencesUseCase.getTypesCours]", error);
      throw error;
    }
  }

  /**
   * Récupère uniquement les statuts de paiement actifs
   */
  async getStatutsPaiement(): Promise<StatutPaiement[]> {
    try {
      return await this.repo.getStatutsPaiement();
    } catch (error) {
      console.error("[GetReferencesUseCase.getStatutsPaiement]", error);
      throw error;
    }
  }

  /**
   * Récupère uniquement les statuts d'échéance actifs
   */
  async getStatutsEcheance(): Promise<StatutEcheance[]> {
    try {
      return await this.repo.getStatutsEcheance();
    } catch (error) {
      console.error("[GetReferencesUseCase.getStatutsEcheance]", error);
      throw error;
    }
  }

  /**
   * Récupère uniquement les rôles utilisateur actifs
   */
  async getRolesUtilisateur(): Promise<RoleUtilisateur[]> {
    try {
      return await this.repo.getRolesUtilisateur();
    } catch (error) {
      console.error("[GetReferencesUseCase.getRolesUtilisateur]", error);
      throw error;
    }
  }

  /**
   * Récupère uniquement les rôles familiaux actifs
   */
  async getRolesFamilial(): Promise<RoleFamilial[]> {
    try {
      return await this.repo.getRolesFamilial();
    } catch (error) {
      console.error("[GetReferencesUseCase.getRolesFamilial]", error);
      throw error;
    }
  }

  /**
   * Récupère uniquement les genres actifs
   */
  async getGenres(): Promise<Genre[]> {
    try {
      return await this.repo.getGenres();
    } catch (error) {
      console.error("[GetReferencesUseCase.getGenres]", error);
      throw error;
    }
  }
}
