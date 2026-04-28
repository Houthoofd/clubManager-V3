/**
 * MySQLCourseRepository
 * Implémentation MySQL du repository courses (Infrastructure Layer)
 * Gère cours récurrents, professeurs, instances de cours et inscriptions
 */

import { pool } from "@/core/database/connection.js";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import type { ICourseRepository } from "../../domain/repositories/ICourseRepository.js";
import type {
  CourseRecurrentResponseDto,
  CourseRecurrentListItemDto,
  CreateCourseRecurrentDto,
  UpdateCourseRecurrentDto,
  CourseResponseDto,
  CourseListItemDto,
  CreateCourseDto,
  SearchCourseDto,
  GenerateCoursesDto,
  ProfessorResponseDto,
  ProfessorListItemDto,
  CreateProfessorDto,
  UpdateProfessorDto,
  CreateInscriptionDto,
  BulkUpdatePresenceDto,
  AttendanceSheetDto,
} from "@clubmanager/types";

// ==================== HELPERS ====================

const DAY_NAMES: Record<number, string> = {
  1: "Lundi",
  2: "Mardi",
  3: "Mercredi",
  4: "Jeudi",
  5: "Vendredi",
  6: "Samedi",
  7: "Dimanche",
};

function getDayName(jour: number): string {
  return DAY_NAMES[jour] ?? "Inconnu";
}

function calcDuration(debut: string, fin: string): number {
  const [dh, dm] = debut.split(":").map(Number);
  const [fh, fm] = fin.split(":").map(Number);
  return fh! * 60 + fm! - (dh! * 60 + dm!);
}

/** Format a Date object or date string to YYYY-MM-DD */
function toDateString(d: Date): string {
  return d.toISOString().split("T")[0]!;
}

/**
 * Convert a JS Date's weekday to DB jour_semaine (1=Mon … 7=Sun)
 * JS getDay(): 0=Sun, 1=Mon … 6=Sat
 */
function getDbDayOfWeek(d: Date): number {
  const jsDay = d.getUTCDay();
  return jsDay === 0 ? 7 : jsDay;
}

// ==================== ROW INTERFACES ====================

interface CourseRecurrentListRow extends RowDataPacket {
  id: number;
  type_cours: string;
  jour_semaine: number;
  heure_debut: string;
  heure_fin: string;
  active: number;
  created_at: Date;
  updated_at: Date | null;
  prof_ids: string | null;
  prof_names: string | null;
}

interface CourseRecurrentDetailRow extends RowDataPacket {
  id: number;
  type_cours: string;
  jour_semaine: number;
  heure_debut: string;
  heure_fin: string;
  active: number;
  created_at: Date;
  updated_at: Date | null;
  prof_id: number | null;
  prof_nom: string | null;
  prof_prenom: string | null;
  prof_email: string | null;
  prof_specialite: string | null;
  prof_photo_url: string | null;
  grade_id: number | null;
  grade_nom: string | null;
  grade_couleur: string | null;
}

interface CourseRecurrentBaseRow extends RowDataPacket {
  id: number;
  type_cours: string;
  jour_semaine: number;
  heure_debut: string;
  heure_fin: string;
  active: number;
  created_at: Date;
  updated_at: Date | null;
}

interface ProfessorListRow extends RowDataPacket {
  id: number;
  nom: string;
  prenom: string;
  email: string | null;
  telephone: string | null;
  specialite: string | null;
  grade_id: number | null;
  photo_url: string | null;
  actif: number;
  created_at: Date;
  updated_at: Date | null;
  grade_nom: string | null;
  grade_couleur: string | null;
  nombre_cours: number;
}

interface ProfessorDetailRow extends RowDataPacket {
  id: number;
  nom: string;
  prenom: string;
  email: string | null;
  telephone: string | null;
  specialite: string | null;
  grade_id: number | null;
  photo_url: string | null;
  actif: number;
  created_at: Date;
  updated_at: Date | null;
  grade_nom: string | null;
  grade_couleur: string | null;
  grade_ordre: number | null;
}

interface ProfessorCourseRecurrentRow extends RowDataPacket {
  id: number;
  type_cours: string;
  jour_semaine: number;
  heure_debut: string;
  heure_fin: string;
  active: number;
}

interface ProchainsCoursRow extends RowDataPacket {
  id: number;
  type_cours: string;
  date_cours: Date;
  heure_debut: string;
  heure_fin: string;
}

interface CourseListRow extends RowDataPacket {
  id: number;
  date_cours: Date;
  type_cours: string;
  heure_debut: string;
  heure_fin: string;
  cours_recurrent_id: number | null;
  created_at: Date;
  jour_semaine: number | null;
  professeurs_noms: string | null;
  nombre_inscriptions: number;
  nombre_reservations: number;
}

interface CourseDetailRow extends RowDataPacket {
  id: number;
  date_cours: Date;
  type_cours: string;
  heure_debut: string;
  heure_fin: string;
  cours_recurrent_id: number | null;
  created_at: Date;
  cr_type_cours: string | null;
  cr_jour_semaine: number | null;
  cr_heure_debut: string | null;
  cr_heure_fin: string | null;
  cr_active: number | null;
  nombre_inscriptions: number;
  nombre_reservations: number;
}

interface ProfessorForCourseRow extends RowDataPacket {
  id: number;
  nom: string;
  prenom: string;
  email: string | null;
  specialite: string | null;
  photo_url: string | null;
  grade_id: number | null;
  grade_nom: string | null;
  grade_couleur: string | null;
}

interface ProfBasicRow extends RowDataPacket {
  id: number;
  nom: string;
  prenom: string;
}

interface CourseForAttRow extends RowDataPacket {
  id: number;
  date_cours: Date;
  type_cours: string;
  heure_debut: string;
  heure_fin: string;
  jour_semaine: number | null;
}

interface InscriptionAttRow extends RowDataPacket {
  id: number;
  utilisateur_id: number;
  status_id: number | null;
  commentaire: string | null;
  created_at: Date;
  first_name: string;
  last_name: string;
  grade_nom: string | null;
  grade_couleur: string | null;
  status_nom: string | null;
}

// ==================== REPOSITORY ====================

/**
 * MySQLCourseRepository
 * Implémentation concrète de ICourseRepository utilisant MySQL via le pool de connexions partagé.
 * Toutes les méthodes sont async/await et retournent des DTOs typés.
 */
export class MySQLCourseRepository implements ICourseRepository {
  // ==================== COURS RÉCURRENTS ====================

  /**
   * Récupère tous les cours récurrents avec noms agrégés des professeurs
   */
  async getCourseRecurrents(): Promise<CourseRecurrentListItemDto[]> {
    const [rows] = await pool.query<CourseRecurrentListRow[]>(`
      SELECT cr.*,
        GROUP_CONCAT(DISTINCT p.id ORDER BY p.nom SEPARATOR ',') AS prof_ids,
        GROUP_CONCAT(DISTINCT CONCAT(p.prenom,' ',p.nom) ORDER BY p.nom SEPARATOR '||') AS prof_names
      FROM cours_recurrent cr
      LEFT JOIN cours_recurrent_professeur crp ON crp.cours_recurrent_id = cr.id
      LEFT JOIN professeurs p ON p.id = crp.professeur_id
      GROUP BY cr.id
      ORDER BY cr.jour_semaine, cr.heure_debut
    `);

    return rows.map((row) => {
      const profNames = row.prof_names
        ? row.prof_names.split("||").filter(Boolean)
        : [];
      return {
        id: row.id,
        type_cours: row.type_cours,
        jour_semaine: row.jour_semaine,
        jour_semaine_nom: getDayName(row.jour_semaine),
        heure_debut: row.heure_debut,
        heure_fin: row.heure_fin,
        duree_minutes: calcDuration(row.heure_debut, row.heure_fin),
        active: Boolean(row.active),
        nombre_professeurs: profNames.length,
        professeurs_noms: profNames,
      };
    });
  }

  /**
   * Récupère un cours récurrent avec le détail complet de chaque professeur et son grade
   */
  async getCourseRecurrentById(
    id: number,
  ): Promise<CourseRecurrentResponseDto | null> {
    const [rows] = await pool.query<CourseRecurrentDetailRow[]>(
      `
      SELECT cr.*,
        p.id            AS prof_id,
        p.nom           AS prof_nom,
        p.prenom        AS prof_prenom,
        p.email         AS prof_email,
        p.specialite    AS prof_specialite,
        p.photo_url     AS prof_photo_url,
        g.id            AS grade_id,
        g.nom           AS grade_nom,
        g.couleur       AS grade_couleur
      FROM cours_recurrent cr
      LEFT JOIN cours_recurrent_professeur crp ON crp.cours_recurrent_id = cr.id
      LEFT JOIN professeurs p ON p.id = crp.professeur_id
      LEFT JOIN grades g ON g.id = p.grade_id
      WHERE cr.id = ?
      ORDER BY p.nom
    `,
      [id],
    );

    if (rows.length === 0) return null;

    const base = rows[0]!;

    // Aggregate professor objects (filter out null rows when no professors are assigned)
    const professeurs = rows
      .filter((r) => r.prof_id !== null)
      .map((r) => ({
        id: r.prof_id!,
        nom: r.prof_nom!,
        prenom: r.prof_prenom!,
        nom_complet: `${r.prof_prenom} ${r.prof_nom}`,
        email: r.prof_email ?? undefined,
        specialite: r.prof_specialite ?? undefined,
        photo_url: r.prof_photo_url ?? undefined,
        grade:
          r.grade_id !== null
            ? {
                id: r.grade_id,
                nom: r.grade_nom!,
                couleur: r.grade_couleur ?? undefined,
              }
            : undefined,
      }));

    return {
      id: base.id,
      type_cours: base.type_cours,
      jour_semaine: base.jour_semaine,
      jour_semaine_nom: getDayName(base.jour_semaine),
      heure_debut: base.heure_debut,
      heure_fin: base.heure_fin,
      duree_minutes: calcDuration(base.heure_debut, base.heure_fin),
      active: Boolean(base.active),
      professeurs,
      created_at: new Date(base.created_at).toISOString(),
      updated_at: base.updated_at
        ? new Date(base.updated_at).toISOString()
        : undefined,
    };
  }

  /**
   * Insère un cours récurrent et assigne optionnellement des professeurs
   */
  async createCourseRecurrent(
    dto: CreateCourseRecurrentDto,
  ): Promise<CourseRecurrentResponseDto> {
    const active = dto.active !== undefined ? dto.active : true;

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO cours_recurrent (type_cours, jour_semaine, heure_debut, heure_fin, active)
       VALUES (?, ?, ?, ?, ?)`,
      [
        dto.type_cours,
        dto.jour_semaine,
        dto.heure_debut,
        dto.heure_fin,
        active ? 1 : 0,
      ],
    );

    const insertId = result.insertId;

    // Assign professors if provided
    if (dto.professeur_ids && dto.professeur_ids.length > 0) {
      for (const profId of dto.professeur_ids) {
        await pool.query<ResultSetHeader>(
          `INSERT INTO cours_recurrent_professeur (cours_recurrent_id, professeur_id)
           VALUES (?, ?)`,
          [insertId, profId],
        );
      }
    }

    return (await this.getCourseRecurrentById(insertId))!;
  }

  /**
   * Met à jour un cours récurrent. Si `professeur_ids` est fourni, remplace la liste des professeurs.
   * @throws Error si le cours récurrent n'existe pas après la mise à jour
   */
  async updateCourseRecurrent(
    dto: UpdateCourseRecurrentDto,
  ): Promise<CourseRecurrentResponseDto> {
    const updates: string[] = [];
    const params: (string | number)[] = [];

    if (dto.type_cours !== undefined) {
      updates.push("type_cours = ?");
      params.push(dto.type_cours);
    }
    if (dto.jour_semaine !== undefined) {
      updates.push("jour_semaine = ?");
      params.push(dto.jour_semaine);
    }
    if (dto.heure_debut !== undefined) {
      updates.push("heure_debut = ?");
      params.push(dto.heure_debut);
    }
    if (dto.heure_fin !== undefined) {
      updates.push("heure_fin = ?");
      params.push(dto.heure_fin);
    }
    if (dto.active !== undefined) {
      updates.push("active = ?");
      params.push(dto.active ? 1 : 0);
    }

    if (updates.length > 0) {
      updates.push("updated_at = NOW()");
      params.push(dto.id);
      await pool.query<ResultSetHeader>(
        `UPDATE cours_recurrent SET ${updates.join(", ")} WHERE id = ?`,
        params,
      );
    }

    // Replace professors if provided (undefined = do not touch, [] = remove all)
    if (dto.professeur_ids !== undefined) {
      await pool.query<ResultSetHeader>(
        "DELETE FROM cours_recurrent_professeur WHERE cours_recurrent_id = ?",
        [dto.id],
      );
      for (const profId of dto.professeur_ids) {
        await pool.query<ResultSetHeader>(
          "INSERT INTO cours_recurrent_professeur (cours_recurrent_id, professeur_id) VALUES (?, ?)",
          [dto.id, profId],
        );
      }
    }

    const result = await this.getCourseRecurrentById(dto.id);
    if (!result) throw new Error("Cours récurrent introuvable");
    return result;
  }

  /**
   * Supprime un cours récurrent (CASCADE supprime les entrées de la table de liaison)
   */
  async deleteCourseRecurrent(id: number): Promise<void> {
    await pool.query<ResultSetHeader>(
      "DELETE FROM cours_recurrent WHERE id = ?",
      [id],
    );
  }

  /**
   * Vérifie si un créneau est déjà occupé par un autre cours récurrent.
   *
   * Condition de chevauchement (algèbre des intervalles) :
   *   existant.heure_debut < nouveau.heure_fin
   *   AND existant.heure_fin  > nouveau.heure_debut
   *
   * Cela détecte : inclusion totale, chevauchement partiel gauche/droite.
   * Deux cours dos-à-dos (l'un finit à 18:00, l'autre commence à 18:00)
   * ne sont PAS en conflit.
   *
   * @param excludeId  ID à exclure (obligatoire lors d'un update pour ne pas
   *                   détecter le cours lui-même comme conflit)
   */
  async hasTimeConflict(
    jour_semaine: number,
    heure_debut: string,
    heure_fin: string,
    excludeId?: number,
  ): Promise<{
    id: number;
    type_cours: string;
    heure_debut: string;
    heure_fin: string;
  } | null> {
    interface ConflictRow extends RowDataPacket {
      id: number;
      type_cours: string;
      heure_debut: string;
      heure_fin: string;
    }

    const [rows] = await pool.query<ConflictRow[]>(
      `SELECT id, type_cours, heure_debut, heure_fin
       FROM cours_recurrent
       WHERE jour_semaine = ?
         AND heure_debut  < ?
         AND heure_fin    > ?
         AND (? IS NULL OR id != ?)
       LIMIT 1`,
      [
        jour_semaine,
        heure_fin, // existant.heure_debut < nouveau.heure_fin
        heure_debut, // existant.heure_fin   > nouveau.heure_debut
        excludeId ?? null,
        excludeId ?? null,
      ],
    );

    if (rows.length === 0) return null;

    const row = rows[0]!;
    return {
      id: row.id,
      type_cours: row.type_cours,
      heure_debut: row.heure_debut,
      heure_fin: row.heure_fin,
    };
  }

  /**
   * Assigne un professeur à un cours récurrent (INSERT avec contrainte UNIQUE)
   */
  async assignProfessor(
    cours_recurrent_id: number,
    professeur_id: number,
  ): Promise<void> {
    await pool.query<ResultSetHeader>(
      "INSERT INTO cours_recurrent_professeur (cours_recurrent_id, professeur_id) VALUES (?, ?)",
      [cours_recurrent_id, professeur_id],
    );
  }

  /**
   * Désassigne un professeur d'un cours récurrent
   */
  async unassignProfessor(
    cours_recurrent_id: number,
    professeur_id: number,
  ): Promise<void> {
    await pool.query<ResultSetHeader>(
      "DELETE FROM cours_recurrent_professeur WHERE cours_recurrent_id = ? AND professeur_id = ?",
      [cours_recurrent_id, professeur_id],
    );
  }

  // ==================== PROFESSEURS ====================

  /**
   * Récupère la liste complète des professeurs avec grade et nombre de cours assignés
   */
  async getProfessors(): Promise<ProfessorListItemDto[]> {
    const [rows] = await pool.query<ProfessorListRow[]>(`
      SELECT p.*,
        g.nom     AS grade_nom,
        g.couleur AS grade_couleur,
        COUNT(crp.id) AS nombre_cours
      FROM professeurs p
      LEFT JOIN grades g ON g.id = p.grade_id
      LEFT JOIN cours_recurrent_professeur crp ON crp.professeur_id = p.id
      GROUP BY p.id
      ORDER BY p.nom, p.prenom
    `);

    return rows.map((row) => ({
      id: row.id,
      nom: row.nom,
      prenom: row.prenom,
      nom_complet: `${row.prenom} ${row.nom}`,
      email: row.email ?? undefined,
      telephone: row.telephone ?? undefined,
      specialite: row.specialite ?? undefined,
      photo_url: row.photo_url ?? undefined,
      actif: Boolean(row.actif),
      grade_nom: row.grade_nom ?? undefined,
      grade_couleur: row.grade_couleur ?? undefined,
      nombre_cours: row.nombre_cours,
    }));
  }

  /**
   * Récupère un professeur avec son grade, ses cours récurrents assignés et ses statistiques
   */
  async getProfessorById(id: number): Promise<ProfessorResponseDto | null> {
    // 1. Professor base info + grade
    const [profRows] = await pool.query<ProfessorDetailRow[]>(
      `
      SELECT p.*,
        g.nom    AS grade_nom,
        g.couleur AS grade_couleur,
        g.ordre  AS grade_ordre
      FROM professeurs p
      LEFT JOIN grades g ON g.id = p.grade_id
      WHERE p.id = ?
      LIMIT 1
    `,
      [id],
    );

    if (profRows.length === 0) return null;
    const prof = profRows[0]!;

    // 2. Assigned cours_recurrents
    const [crRows] = await pool.query<ProfessorCourseRecurrentRow[]>(
      `
      SELECT cr.id, cr.type_cours, cr.jour_semaine, cr.heure_debut, cr.heure_fin, cr.active
      FROM cours_recurrent_professeur crp
      JOIN cours_recurrent cr ON cr.id = crp.cours_recurrent_id
      WHERE crp.professeur_id = ?
      ORDER BY cr.jour_semaine, cr.heure_debut
    `,
      [id],
    );

    // 3. Upcoming course instances (next 5)
    const [prochainsRows] = await pool.query<ProchainsCoursRow[]>(
      `
      SELECT c.id, c.type_cours, c.date_cours, c.heure_debut, c.heure_fin
      FROM cours c
      JOIN cours_recurrent cr ON cr.id = c.cours_recurrent_id
      JOIN cours_recurrent_professeur crp ON crp.cours_recurrent_id = cr.id
      WHERE crp.professeur_id = ?
        AND c.date_cours >= CURDATE()
      ORDER BY c.date_cours ASC
      LIMIT 5
    `,
      [id],
    );

    const cours_recurrents = crRows.map((cr) => ({
      id: cr.id,
      type_cours: cr.type_cours,
      jour_semaine: cr.jour_semaine,
      jour_semaine_nom: getDayName(cr.jour_semaine),
      heure_debut: cr.heure_debut,
      heure_fin: cr.heure_fin,
      active: Boolean(cr.active),
    }));

    const nombre_cours_actifs = crRows.filter((cr) =>
      Boolean(cr.active),
    ).length;

    const prochains_cours = prochainsRows.map((c) => ({
      id: c.id,
      type_cours: c.type_cours,
      date: toDateString(new Date(c.date_cours)),
      heure_debut: c.heure_debut,
      heure_fin: c.heure_fin,
    }));

    return {
      id: prof.id,
      nom: prof.nom,
      prenom: prof.prenom,
      nom_complet: `${prof.prenom} ${prof.nom}`,
      email: prof.email ?? undefined,
      telephone: prof.telephone ?? undefined,
      specialite: prof.specialite ?? undefined,
      photo_url: prof.photo_url ?? undefined,
      actif: Boolean(prof.actif),
      grade:
        prof.grade_id !== null
          ? {
              id: prof.grade_id,
              nom: prof.grade_nom!,
              niveau: prof.grade_ordre ?? undefined,
              couleur: prof.grade_couleur ?? undefined,
            }
          : undefined,
      cours_recurrents,
      stats: {
        nombre_cours_total: crRows.length,
        nombre_cours_actifs,
        prochains_cours,
      },
      created_at: new Date(prof.created_at).toISOString(),
      updated_at: prof.updated_at
        ? new Date(prof.updated_at).toISOString()
        : undefined,
    };
  }

  /**
   * Insère un nouveau professeur en base de données
   */
  async createProfessor(
    dto: CreateProfessorDto,
  ): Promise<ProfessorResponseDto> {
    const actif = dto.actif !== undefined ? dto.actif : true;

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO professeurs (nom, prenom, email, telephone, specialite, grade_id, photo_url, actif)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        dto.nom,
        dto.prenom,
        dto.email ?? null,
        dto.telephone ?? null,
        dto.specialite ?? null,
        dto.grade_id ?? null,
        dto.photo_url ?? null,
        actif ? 1 : 0,
      ],
    );

    return (await this.getProfessorById(result.insertId))!;
  }

  /**
   * Met à jour un professeur existant de façon partielle (patch sémantique)
   * @throws Error si le professeur n'existe pas après la mise à jour
   */
  async updateProfessor(
    dto: UpdateProfessorDto,
  ): Promise<ProfessorResponseDto> {
    const updates: string[] = [];
    const params: (string | number | null)[] = [];

    if (dto.nom !== undefined) {
      updates.push("nom = ?");
      params.push(dto.nom);
    }
    if (dto.prenom !== undefined) {
      updates.push("prenom = ?");
      params.push(dto.prenom);
    }
    if (dto.email !== undefined) {
      updates.push("email = ?");
      params.push(dto.email ?? null);
    }
    if (dto.telephone !== undefined) {
      updates.push("telephone = ?");
      params.push(dto.telephone ?? null);
    }
    if (dto.specialite !== undefined) {
      updates.push("specialite = ?");
      params.push(dto.specialite ?? null);
    }
    if (dto.grade_id !== undefined) {
      updates.push("grade_id = ?");
      params.push(dto.grade_id ?? null);
    }
    if (dto.photo_url !== undefined) {
      updates.push("photo_url = ?");
      params.push(dto.photo_url ?? null);
    }
    if (dto.actif !== undefined) {
      updates.push("actif = ?");
      params.push(dto.actif ? 1 : 0);
    }

    if (updates.length > 0) {
      updates.push("updated_at = NOW()");
      params.push(dto.id);
      await pool.query<ResultSetHeader>(
        `UPDATE professeurs SET ${updates.join(", ")} WHERE id = ?`,
        params,
      );
    }

    const result = await this.getProfessorById(dto.id);
    if (!result) throw new Error("Professeur introuvable");
    return result;
  }

  // ==================== COURS (INSTANCES) ====================

  /**
   * Récupère la liste des cours filtrée dynamiquement
   * Filtres supportés : date_debut, date_fin, type_cours, cours_recurrent_id
   */
  async getCourses(filters: SearchCourseDto): Promise<CourseListItemDto[]> {
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (filters.date_debut) {
      conditions.push("c.date_cours >= ?");
      params.push(filters.date_debut);
    }
    if (filters.date_fin) {
      conditions.push("c.date_cours <= ?");
      params.push(filters.date_fin);
    }
    if (filters.type_cours) {
      conditions.push("c.type_cours LIKE ?");
      params.push(`%${filters.type_cours}%`);
    }
    if (filters.cours_recurrent_id !== undefined) {
      conditions.push("c.cours_recurrent_id = ?");
      params.push(filters.cours_recurrent_id);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const [rows] = await pool.query<CourseListRow[]>(
      `
      SELECT c.*,
        cr.jour_semaine,
        GROUP_CONCAT(DISTINCT CONCAT(p.prenom,' ',p.nom) ORDER BY p.nom SEPARATOR '||') AS professeurs_noms,
        COUNT(DISTINCT i.id) AS nombre_inscriptions,
        (SELECT COUNT(*) FROM reservations r WHERE r.cours_id = c.id AND r.statut != 'annulee') AS nombre_reservations
      FROM cours c
      LEFT JOIN cours_recurrent cr ON cr.id = c.cours_recurrent_id
      LEFT JOIN cours_recurrent_professeur crp ON crp.cours_recurrent_id = cr.id
      LEFT JOIN professeurs p ON p.id = crp.professeur_id
      LEFT JOIN inscriptions i ON i.cours_id = c.id
      ${whereClause}
      GROUP BY c.id
      ORDER BY c.date_cours DESC, c.heure_debut
    `,
      params,
    );

    return rows.map((row) => {
      const profNames = row.professeurs_noms
        ? row.professeurs_noms.split("||").filter(Boolean)
        : [];
      const dateCours = new Date(row.date_cours);
      const dbDay = row.jour_semaine ?? getDbDayOfWeek(dateCours);

      return {
        id: row.id,
        date_cours: toDateString(dateCours),
        type_cours: row.type_cours,
        heure_debut: row.heure_debut,
        heure_fin: row.heure_fin,
        duree_minutes: calcDuration(row.heure_debut, row.heure_fin),
        jour_semaine_nom: getDayName(dbDay),
        annule: false, // no annule column in DB
        nombre_inscriptions: row.nombre_inscriptions,
        nombre_reservations: row.nombre_reservations ?? 0,
        nombre_professeurs: profNames.length,
        professeurs_noms: profNames,
        cours_recurrent_id: row.cours_recurrent_id ?? undefined,
      };
    });
  }

  /**
   * Récupère un cours par son ID avec toutes ses relations
   * (cours_recurrent, professeurs, nombre d'inscriptions)
   */
  async getCourseById(id: number): Promise<CourseResponseDto | null> {
    // Main course query with cours_recurrent and inscription count
    const [rows] = await pool.query<CourseDetailRow[]>(
      `
      SELECT
        c.id, c.date_cours, c.type_cours, c.heure_debut, c.heure_fin,
        c.cours_recurrent_id, c.created_at,
        cr.type_cours   AS cr_type_cours,
        cr.jour_semaine AS cr_jour_semaine,
        cr.heure_debut  AS cr_heure_debut,
        cr.heure_fin    AS cr_heure_fin,
        cr.active       AS cr_active,
        COUNT(DISTINCT i.id) AS nombre_inscriptions,
        (SELECT COUNT(*) FROM reservations r WHERE r.cours_id = c.id AND r.statut != 'annulee') AS nombre_reservations
      FROM cours c
      LEFT JOIN cours_recurrent cr ON cr.id = c.cours_recurrent_id
      LEFT JOIN inscriptions i ON i.cours_id = c.id
      WHERE c.id = ?
      GROUP BY c.id
    `,
      [id],
    );

    if (rows.length === 0) return null;
    const row = rows[0]!;

    // Get individual professor objects with grade details
    const professeurs: ProfessorForCourseRow[] = [];
    if (row.cours_recurrent_id !== null) {
      const [profRows] = await pool.query<ProfessorForCourseRow[]>(
        `
        SELECT p.id, p.nom, p.prenom, p.email, p.specialite, p.photo_url,
          g.id      AS grade_id,
          g.nom     AS grade_nom,
          g.couleur AS grade_couleur
        FROM cours_recurrent_professeur crp
        JOIN professeurs p ON p.id = crp.professeur_id
        LEFT JOIN grades g ON g.id = p.grade_id
        WHERE crp.cours_recurrent_id = ?
        ORDER BY p.nom
      `,
        [row.cours_recurrent_id],
      );
      professeurs.push(...profRows);
    }

    const dateCours = new Date(row.date_cours);
    const dbDay = row.cr_jour_semaine ?? getDbDayOfWeek(dateCours);

    return {
      id: row.id,
      date_cours: toDateString(dateCours),
      type_cours: row.type_cours,
      heure_debut: row.heure_debut,
      heure_fin: row.heure_fin,
      duree_minutes: calcDuration(row.heure_debut, row.heure_fin),
      jour_semaine_nom: getDayName(dbDay),
      annule: false, // no annule column in DB
      cours_recurrent:
        row.cours_recurrent_id !== null
          ? {
              id: row.cours_recurrent_id,
              type_cours: row.cr_type_cours!,
              jour_semaine: row.cr_jour_semaine!,
              jour_semaine_nom: getDayName(row.cr_jour_semaine!),
              heure_debut: row.cr_heure_debut!,
              heure_fin: row.cr_heure_fin!,
              active: Boolean(row.cr_active),
            }
          : undefined,
      professeurs: professeurs.map((p) => ({
        id: p.id,
        nom: p.nom,
        prenom: p.prenom,
        nom_complet: `${p.prenom} ${p.nom}`,
        email: p.email ?? undefined,
        specialite: p.specialite ?? undefined,
        photo_url: p.photo_url ?? undefined,
        grade:
          p.grade_id !== null
            ? {
                id: p.grade_id,
                nom: p.grade_nom!,
                couleur: p.grade_couleur ?? undefined,
              }
            : undefined,
      })),
      nombre_inscriptions: row.nombre_inscriptions,
      nombre_reservations: row.nombre_reservations ?? 0,
      created_at: new Date(row.created_at).toISOString(),
    };
  }

  /**
   * Crée une instance ponctuelle de cours (liée ou non à un cours récurrent)
   */
  async createCourse(dto: CreateCourseDto): Promise<CourseResponseDto> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO cours (cours_recurrent_id, date_cours, type_cours, heure_debut, heure_fin)
       VALUES (?, ?, ?, ?, ?)`,
      [
        dto.cours_recurrent_id ?? null,
        dto.date_cours,
        dto.type_cours,
        dto.heure_debut,
        dto.heure_fin,
      ],
    );

    return (await this.getCourseById(result.insertId))!;
  }

  /**
   * Génère automatiquement des instances de cours pour un cours récurrent
   * sur une plage de dates en respectant le jour_semaine et en excluant les dates indiquées.
   *
   * Conversion jour_semaine DB → JS getDay():
   *   jsDay = dbDay % 7  (1→1, 2→2, …, 6→6, 7→0)
   *
   * @throws Error si le cours récurrent n'existe pas
   */
  async generateCourses(dto: GenerateCoursesDto): Promise<{
    generated: number;
    cours: CourseListItemDto[];
  }> {
    // Fetch the template cours_recurrent
    const [crRows] = await pool.query<CourseRecurrentBaseRow[]>(
      "SELECT * FROM cours_recurrent WHERE id = ? LIMIT 1",
      [dto.cours_recurrent_id],
    );

    if (crRows.length === 0) {
      throw new Error("Cours récurrent introuvable");
    }
    const cr = crRows[0]!;

    // Convert DB jour_semaine (1-7) to JS getUTCDay() (0-6)
    const jsTargetDay = cr.jour_semaine % 7; // 1→1, 7→0

    const excludeDates = new Set(dto.exclure_dates ?? []);

    // Parse dates as UTC to avoid timezone drift
    const [sy, sm, sd] = dto.date_debut.split("-").map(Number);
    const [ey, em, ed] = dto.date_fin.split("-").map(Number);
    const startUtc = Date.UTC(sy!, sm! - 1, sd!);
    const endUtc = Date.UTC(ey!, em! - 1, ed!);

    // Walk day by day, collecting matching dates
    const insertedIds: number[] = [];
    let currentUtc = startUtc;

    while (currentUtc <= endUtc) {
      const currentDate = new Date(currentUtc);
      if (currentDate.getUTCDay() === jsTargetDay) {
        const dateStr = currentDate.toISOString().split("T")[0]!;
        if (!excludeDates.has(dateStr)) {
          const [res] = await pool.query<ResultSetHeader>(
            `INSERT INTO cours (cours_recurrent_id, date_cours, type_cours, heure_debut, heure_fin)
             VALUES (?, ?, ?, ?, ?)`,
            [cr.id, dateStr, cr.type_cours, cr.heure_debut, cr.heure_fin],
          );
          insertedIds.push(res.insertId);
        }
      }
      currentUtc += 86_400_000; // +1 day in ms
    }

    if (insertedIds.length === 0) {
      return { generated: 0, cours: [] };
    }

    // Fetch generated courses in one query using WHERE id IN (?)
    const [rows] = await pool.query<CourseListRow[]>(
      `
      SELECT c.*,
        cr.jour_semaine,
        GROUP_CONCAT(DISTINCT CONCAT(p.prenom,' ',p.nom) ORDER BY p.nom SEPARATOR '||') AS professeurs_noms,
        COUNT(DISTINCT i.id) AS nombre_inscriptions,
        (SELECT COUNT(*) FROM reservations r WHERE r.cours_id = c.id AND r.statut != 'annulee') AS nombre_reservations
      FROM cours c
      LEFT JOIN cours_recurrent cr ON cr.id = c.cours_recurrent_id
      LEFT JOIN cours_recurrent_professeur crp ON crp.cours_recurrent_id = cr.id
      LEFT JOIN professeurs p ON p.id = crp.professeur_id
      LEFT JOIN inscriptions i ON i.cours_id = c.id
      WHERE c.id IN (?)
      GROUP BY c.id
      ORDER BY c.date_cours ASC, c.heure_debut
    `,
      [insertedIds],
    );

    const cours: CourseListItemDto[] = rows.map((row) => {
      const profNames = row.professeurs_noms
        ? row.professeurs_noms.split("||").filter(Boolean)
        : [];
      const dateCours = new Date(row.date_cours);
      const dbDay = row.jour_semaine ?? getDbDayOfWeek(dateCours);

      return {
        id: row.id,
        date_cours: toDateString(dateCours),
        type_cours: row.type_cours,
        heure_debut: row.heure_debut,
        heure_fin: row.heure_fin,
        duree_minutes: calcDuration(row.heure_debut, row.heure_fin),
        jour_semaine_nom: getDayName(dbDay),
        annule: false,
        nombre_inscriptions: row.nombre_inscriptions,
        nombre_reservations: row.nombre_reservations ?? 0,
        nombre_professeurs: profNames.length,
        professeurs_noms: profNames,
        cours_recurrent_id: row.cours_recurrent_id ?? undefined,
      };
    });

    return { generated: insertedIds.length, cours };
  }

  // ==================== INSCRIPTIONS ====================

  /**
   * Construit la feuille de présence complète d'un cours :
   * - Infos du cours avec nom du jour dérivé du cours_recurrent ou de la date
   * - Liste des professeurs assignés
   * - Liste des inscriptions avec infos utilisateur, grade et statut
   * - Statistiques (présents, absents, taux de présence)
   *
   * @throws Error si le cours est introuvable
   */
  async getCourseInscriptions(cours_id: number): Promise<AttendanceSheetDto> {
    // 1. Course info (+ jour_semaine from cours_recurrent if available)
    const [courseRows] = await pool.query<CourseForAttRow[]>(
      `
      SELECT c.id, c.date_cours, c.type_cours, c.heure_debut, c.heure_fin,
        cr.jour_semaine
      FROM cours c
      LEFT JOIN cours_recurrent cr ON cr.id = c.cours_recurrent_id
      WHERE c.id = ?
      LIMIT 1
    `,
      [cours_id],
    );

    if (courseRows.length === 0) {
      throw new Error("Cours introuvable");
    }
    const courseRow = courseRows[0]!;

    // 2. Professors assigned via cours_recurrent
    const [profRows] = await pool.query<ProfBasicRow[]>(
      `
      SELECT p.id, p.nom, p.prenom
      FROM cours c
      LEFT JOIN cours_recurrent cr     ON cr.id  = c.cours_recurrent_id
      LEFT JOIN cours_recurrent_professeur crp ON crp.cours_recurrent_id = cr.id
      LEFT JOIN professeurs p          ON p.id   = crp.professeur_id
      WHERE c.id = ?
        AND p.id IS NOT NULL
      ORDER BY p.nom
    `,
      [cours_id],
    );

    // 3. Inscriptions with user + grade + status
    const [inscRows] = await pool.query<InscriptionAttRow[]>(
      `
      SELECT
        i.id,
        i.user_id    AS utilisateur_id,
        i.status_id,
        i.commentaire,
        i.created_at,
        u.first_name,
        u.last_name,
        g.nom        AS grade_nom,
        g.couleur    AS grade_couleur,
        s.nom        AS status_nom
      FROM inscriptions i
      JOIN utilisateurs u ON u.id = i.user_id
      LEFT JOIN grades g  ON g.id = u.grade_id
      LEFT JOIN status s  ON s.id = i.status_id
      WHERE i.cours_id = ?
      ORDER BY u.last_name, u.first_name
    `,
      [cours_id],
    );

    // Derive day of week
    const dateCours = new Date(courseRow.date_cours);
    const dbDay = courseRow.jour_semaine ?? getDbDayOfWeek(dateCours);

    // Map inscriptions
    const inscriptions = inscRows.map((row) => ({
      id: row.id,
      utilisateur_id: row.utilisateur_id,
      nom: row.last_name,
      prenom: row.first_name,
      nom_complet: `${row.first_name} ${row.last_name}`,
      grade:
        row.grade_nom !== null
          ? { nom: row.grade_nom, couleur: row.grade_couleur ?? undefined }
          : undefined,
      status_id: row.status_id,
      status_nom: row.status_nom ?? undefined,
      commentaire: row.commentaire ?? undefined,
    }));

    // Compute statistics
    const total_inscrits = inscriptions.length;
    const nombre_presents = inscRows.filter(
      (r) => r.status_id !== null && r.status_id > 0,
    ).length;
    const nombre_absents = total_inscrits - nombre_presents;
    const taux_presence =
      total_inscrits > 0
        ? Math.round((nombre_presents / total_inscrits) * 100)
        : 0;

    return {
      cours: {
        id: courseRow.id,
        date_cours: toDateString(dateCours),
        type_cours: courseRow.type_cours,
        heure_debut: courseRow.heure_debut,
        heure_fin: courseRow.heure_fin,
        jour_semaine_nom: getDayName(dbDay),
      },
      professeurs: profRows.map((p) => ({
        id: p.id,
        nom: p.nom,
        prenom: p.prenom,
        nom_complet: `${p.prenom} ${p.nom}`,
      })),
      inscriptions,
      statistiques: {
        total_inscrits,
        nombre_presents,
        nombre_absents,
        taux_presence,
      },
      generated_at: new Date().toISOString(),
    };
  }

  /**
   * Inscrit un utilisateur à un cours.
   * La contrainte UNIQUE (user_id, cours_id) côté DB empêche les doublons.
   */
  async createInscription(dto: CreateInscriptionDto): Promise<void> {
    await pool.query<ResultSetHeader>(
      `INSERT INTO inscriptions (user_id, cours_id, status_id, commentaire)
       VALUES (?, ?, ?, ?)`,
      [
        dto.utilisateur_id,
        dto.cours_id,
        dto.status_id ?? null,
        dto.commentaire ?? null,
      ],
    );
  }

  /**
   * Met à jour en masse les statuts de présence.
   * Chaque mise à jour est atomique mais l'ensemble n'est pas transactionnel
   * (acceptable pour un usage interactif de feuille de présence).
   */
  async bulkUpdatePresence(dto: BulkUpdatePresenceDto): Promise<void> {
    for (const update of dto.updates) {
      await pool.query<ResultSetHeader>(
        "UPDATE inscriptions SET status_id = ?, updated_at = NOW() WHERE id = ?",
        [update.status_id, update.inscription_id],
      );
    }
  }

  /**
   * Supprime une inscription par son ID primaire
   */
  async deleteInscription(id: number): Promise<void> {
    await pool.query<ResultSetHeader>("DELETE FROM inscriptions WHERE id = ?", [
      id,
    ]);
  }
}
