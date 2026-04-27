/**
 * types.ts
 * Domain types pour le module références
 * Contient les interfaces pour les données de référence de l'application
 */

export interface MethodePaiement {
  id: number;
  code: string;
  nom: string;
  nom_en: string;
  description?: string;
  icone?: string;
  couleur: string;
  ordre: number;
  actif: boolean;
  visible_frontend: boolean;
}

export interface StatutCommande {
  id: number;
  code: string;
  nom: string;
  nom_en: string;
  description?: string;
  couleur: string;
  ordre: number;
  est_final: boolean;
  peut_modifier: boolean;
  peut_annuler: boolean;
  actif: boolean;
}

export interface TypeCours {
  id: number;
  code: string;
  nom: string;
  nom_en: string;
  description?: string;
  couleur: string;
  duree_defaut_minutes: number;
  ordre: number;
  actif: boolean;
}

export interface ReferencesData {
  methodes_paiement: MethodePaiement[];
  statuts_commande: StatutCommande[];
  types_cours: TypeCours[];
}
