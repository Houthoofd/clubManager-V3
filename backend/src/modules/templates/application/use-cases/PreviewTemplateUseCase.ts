/**
 * PreviewTemplateUseCase
 * Cas d'utilisation pour la prévisualisation d'un template rendu
 * Remplace les variables avec des données d'exemple et retourne le résultat
 */

import type { ITemplateRepository } from "../../domain/repositories/ITemplateRepository.js";
import {
  TemplateEngineService,
  type RecipientData,
  type RenderResult,
} from "../services/TemplateEngineService.js";

// ==================== DTO ====================

export interface PreviewTemplateDto {
  /** Variables manuelles à injecter (ex: { date_cours: '12/06/2025' }) */
  manual_vars?: Record<string, string>;
  /**
   * Données du destinataire exemple pour pré-remplir les variables auto
   * Si non fourni, des valeurs d'exemple génériques sont utilisées
   */
  recipient_example?: RecipientData;
}

export interface PreviewTemplateResult extends RenderResult {
  /** Variables auto détectées dans le template */
  auto_variables: string[];
  /** Variables manuelles détectées dans le template */
  manual_variables: string[];
}

// ==================== USE CASE ====================

export class PreviewTemplateUseCase {
  constructor(private repo: ITemplateRepository) {}

  async execute(
    templateId: number,
    dto: PreviewTemplateDto = {},
  ): Promise<PreviewTemplateResult> {
    // Récupérer le template
    const template = await this.repo.getById(templateId);

    if (!template) {
      throw new Error("Template introuvable");
    }

    // Destinataire d'exemple par défaut si non fourni
    const recipientExample: RecipientData = dto.recipient_example ?? {
      first_name: "Jean",
      last_name: "Dupont",
      userId: "U-2025-0001",
    };

    // Construire les variables automatiques depuis le profil exemple
    const autoVars = TemplateEngineService.buildAutoVars(recipientExample);

    // Classifier toutes les variables du template
    const allVarNames = TemplateEngineService.extractVariables(
      `${template.titre} ${template.contenu}`,
    );
    const { auto: autoVariables, manual: manualVariables } =
      TemplateEngineService.classifyVariables(allVarNames);

    // Rendre le template
    const rendered = TemplateEngineService.render(
      { titre: template.titre, contenu: template.contenu },
      autoVars,
      dto.manual_vars ?? {},
    );

    return {
      ...rendered,
      auto_variables: autoVariables,
      manual_variables: manualVariables,
    };
  }
}
