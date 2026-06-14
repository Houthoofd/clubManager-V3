/**
 * ReferenceDataService
 * Service pour récupérer les données de référence (méthodes de paiement, statuts)
 * Ces tables sont en lecture seule et cachées en mémoire pour performance
 */

export interface MethodePaiement {
  id: number;
  code: string;
  nom: string;
  nom_en: string | null;
  actif: boolean;
}

export interface StatutPaiement {
  id: number;
  code: string;
  nom: string;
  nom_en: string | null;
  couleur: string;
  compte_dans_revenus: boolean;
  est_final: boolean;
  actif: boolean;
}

export interface StatutEcheance {
  id: number;
  code: string;
  nom: string;
  nom_en: string | null;
  couleur: string;
  est_final: boolean;
  actif: boolean;
}

export interface IReferenceDataService {
  // Méthodes de paiement
  getMethodePaiementByCode(code: string): Promise<MethodePaiement | null>;
  getMethodePaiementById(id: number): Promise<MethodePaiement | null>;
  getAllMethodesPaiement(): Promise<MethodePaiement[]>;

  // Statuts de paiement
  getStatutPaiementByCode(code: string): Promise<StatutPaiement | null>;
  getStatutPaiementById(id: number): Promise<StatutPaiement | null>;
  getAllStatutsPaiement(): Promise<StatutPaiement[]>;

  // Statuts d'échéance
  getStatutEcheanceByCode(code: string): Promise<StatutEcheance | null>;
  getStatutEcheanceById(id: number): Promise<StatutEcheance | null>;
  getAllStatutsEcheance(): Promise<StatutEcheance[]>;

  // Utilitaires
  clearCache(): void;
}
