/**
 * ExportSessionAttendanceUseCase
 * Génère un fichier CSV de la feuille d'appel d'une séance
 */

import type { ICourseRepository } from '../../domain/repositories/ICourseRepository.js';

export class ExportSessionAttendanceUseCase {
  constructor(private readonly repo: ICourseRepository) {}

  async execute(sessionId: number): Promise<{ csv: string; filename: string } | null> {
    const data = await this.repo.getAttendanceForExport(sessionId);
    if (!data) return null;

    const { session, professeurs, inscriptions } = data;

    // Build CSV
    const lines: string[] = [];

    // Header lines
    lines.push(`Feuille d'appel - ${session.type_cours}`);
    lines.push(`Date;${session.date_cours}`);
    lines.push(`Horaire;${session.heure_debut} - ${session.heure_fin}`);
    if (professeurs.length > 0) {
      lines.push(`Professeur(s);${professeurs.join(', ')}`);
    }
    lines.push('');

    // Column headers
    lines.push('Nom complet;Grade;Présent;Commentaire');

    // Data rows
    for (const ins of inscriptions) {
      const present =
        ins.present === true ? 'Oui' :
        ins.present === false ? 'Non' : '';
      const comment = ins.commentaire ? ins.commentaire.replace(/;/g, ',') : '';
      lines.push(`${ins.nom_complet};${ins.grade ?? ''};${present};${comment}`);
    }

    // Stats footer
    lines.push('');
    const total = inscriptions.length;
    const presents = inscriptions.filter((i) => i.present === true).length;
    const absents = inscriptions.filter((i) => i.present === false).length;
    lines.push(`Total inscrits;${total}`);
    lines.push(`Présents;${presents}`);
    lines.push(`Absents;${absents}`);

    const csv = lines.join('\r\n');
    const filename = `appel_${session.type_cours.replace(/\s+/g, '_').toLowerCase()}_${session.date_cours}.csv`;

    return { csv, filename };
  }
}
