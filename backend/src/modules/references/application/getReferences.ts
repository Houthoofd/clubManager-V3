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
}
