/**
 * TemplateEngineService
 * Moteur de rendu des templates — extraction et remplacement de variables {{variable}}
 */

// ==================== CONSTANTES ====================

/**
 * Variables auto-remplies depuis le profil du destinataire
 * Ces variables n'ont pas besoin d'être fournies manuellement
 */
export const AUTO_VARIABLES = ['prenom', 'nom', 'nom_complet', 'userId'] as const;
export type AutoVariable = typeof AUTO_VARIABLES[number];

// ==================== INTERFACES ====================

export interface RecipientData {
  first_name: string;
  last_name: string;
  userId: string;
}

export interface RenderResult {
  titre: string;
  contenu: string;
  missingVariables: string[];
}

// ==================== SERVICE ====================

export class TemplateEngineService {
  /**
   * Extrait toutes les {{variables}} présentes dans un texte
   * Retourne un tableau dédupliqué de noms de variables
   *
   * @example
   *   extractVariables("Bonjour {{prenom}} {{nom}}, votre cours {{date_cours}} est annulé.")
   *   // => ['prenom', 'nom', 'date_cours']
   */
  static extractVariables(text: string): string[] {
    const regex = /\{\{(\w+)\}\}/g;
    const vars = new Set<string>();
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      vars.add(match[1]!);
    }

    return Array.from(vars);
  }

  /**
   * Sépare les variables auto (issues du profil destinataire) des variables manuelles
   * (à fournir explicitement lors de l'envoi)
   *
   * @example
   *   classifyVariables(['prenom', 'nom', 'date_cours'])
   *   // => { auto: ['prenom', 'nom'], manual: ['date_cours'] }
   */
  static classifyVariables(variables: string[]): {
    auto: string[];
    manual: string[];
  } {
    const auto = variables.filter((v) =>
      AUTO_VARIABLES.includes(v as AutoVariable),
    );
    const manual = variables.filter(
      (v) => !AUTO_VARIABLES.includes(v as AutoVariable),
    );
    return { auto, manual };
  }

  /**
   * Construit le dictionnaire des variables automatiques
   * depuis les données du destinataire
   *
   * @example
   *   buildAutoVars({ first_name: 'Jean', last_name: 'Dupont', userId: 'U-2025-0001' })
   *   // => { prenom: 'Jean', nom: 'Dupont', nom_complet: 'Jean Dupont', userId: 'U-2025-0001' }
   */
  static buildAutoVars(recipient: RecipientData): Record<string, string> {
    return {
      prenom: recipient.first_name,
      nom: recipient.last_name,
      nom_complet: `${recipient.first_name} ${recipient.last_name}`,
      userId: recipient.userId,
    };
  }

  /**
   * Rend un template en remplaçant toutes les variables connues.
   * Les variables non trouvées sont listées dans `missingVariables`.
   *
   * @param template   — objet contenant titre et contenu bruts du template
   * @param autoVars   — variables issues du profil destinataire (buildAutoVars)
   * @param manualVars — variables fournies manuellement lors de l'envoi
   *
   * @returns { titre, contenu, missingVariables }
   *
   * @example
   *   render(
   *     { titre: 'Bonjour {{prenom}}', contenu: 'Votre cours {{date_cours}} est annulé.' },
   *     { prenom: 'Jean', nom: 'Dupont', nom_complet: 'Jean Dupont', userId: 'U-2025-0001' },
   *     { date_cours: '12/06/2025' }
   *   )
   *   // => { titre: 'Bonjour Jean', contenu: 'Votre cours 12/06/2025 est annulé.', missingVariables: [] }
   */
  static render(
    template: { titre: string; contenu: string },
    autoVars: Record<string, string>,
    manualVars: Record<string, string> = {},
  ): RenderResult {
    // Fusionner toutes les variables (manualVars écrase autoVars en cas de doublon)
    const allVars: Record<string, string> = { ...autoVars, ...manualVars };

    // Extraire toutes les variables présentes dans le titre ET le contenu
    const allVarNames = this.extractVariables(
      `${template.titre} ${template.contenu}`,
    );

    const missing: string[] = [];
    let titre = template.titre;
    let contenu = template.contenu;

    for (const varName of allVarNames) {
      const value = allVars[varName];

      if (value !== undefined) {
        // Remplace toutes les occurrences de {{varName}} par la valeur
        const pattern = new RegExp(`\\{\\{${varName}\\}\\}`, 'g');
        titre = titre.replace(pattern, value);
        contenu = contenu.replace(pattern, value);
      } else {
        // Variable non résolue — on la signale
        missing.push(varName);
      }
    }

    return {
      titre,
      contenu,
      missingVariables: missing,
    };
  }
}
