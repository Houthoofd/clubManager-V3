/**
 * ITemplateRepository
 * Interface du repository templates (Domain Layer)
 * Contrat pour les opérations de gestion des templates de messages personnalisés
 */

// ==================== TYPES ====================

export interface TemplateType {
  id: number;
  nom: string;
  description: string | null;
  actif: boolean;
  templates_count?: number;
}

export interface Template {
  id: number;
  type_id: number;
  type_nom?: string;
  titre: string;
  contenu: string;
  actif: boolean;
  variables: string[]; // variables détectées dans le contenu : ['prenom', 'nom', 'date_cours']
  created_at: Date;
  updated_at: Date | null;
}

// ==================== INTERFACE ====================

export interface ITemplateRepository {
  // -------------------- Types --------------------

  /**
   * Retourne tous les types de templates (avec compteur de templates associés)
   */
  getTypes(): Promise<TemplateType[]>;

  /**
   * Crée un nouveau type de template
   * @returns le type créé avec son id
   */
  createType(data: { nom: string; description?: string }): Promise<TemplateType>;

  /**
   * Met à jour un type existant
   */
  updateType(
    id: number,
    data: { nom?: string; description?: string; actif?: boolean },
  ): Promise<void>;

  /**
   * Supprime un type de template
   * Doit échouer si des templates actifs y sont rattachés
   */
  deleteType(id: number): Promise<void>;

  // -------------------- Templates --------------------

  /**
   * Retourne tous les templates avec filtres optionnels
   * @param typeId   — filtre par type (optionnel)
   * @param actifOnly — si true, ne retourne que les templates actifs
   */
  getAll(typeId?: number, actifOnly?: boolean): Promise<Template[]>;

  /**
   * Retourne un template par son id, ou null s'il n'existe pas
   */
  getById(id: number): Promise<Template | null>;

  /**
   * Crée un nouveau template
   * @returns le template créé complet
   */
  create(data: {
    type_id: number;
    titre: string;
    contenu: string;
    actif?: boolean;
  }): Promise<Template>;

  /**
   * Met à jour les champs fournis d'un template existant
   */
  update(
    id: number,
    data: {
      type_id?: number;
      titre?: string;
      contenu?: string;
      actif?: boolean;
    },
  ): Promise<void>;

  /**
   * Supprime définitivement un template
   */
  delete(id: number): Promise<void>;

  /**
   * Active ou désactive un template
   */
  toggle(id: number, actif: boolean): Promise<void>;
}
