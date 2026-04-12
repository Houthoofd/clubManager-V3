/**
 * @fileoverview MySQL Statistics Repository Implementation
 * @module statistics/infrastructure/MySQLStatisticsRepository
 *
 * MySQL implementation of the Statistics Repository.
 * Provides real-time analytics queries across all modules.
 */

import type { RowDataPacket } from 'mysql2/promise';
import type {
  AnalyticsDateRange,
  PeriodType,
  MemberAnalyticsResponse,
  MemberStatistics,
  MembersByGrade,
  MembersByGender,
  MembersByAgeGroup,
  CourseAnalyticsResponse,
  CourseAttendanceStatistics,
  CoursesByType,
  PopularCourse,
  AttendanceByDay,
  FinancialAnalyticsResponse,
  FinancialStatistics,
  RevenueByPaymentMethod,
  RevenueByPlan,
  LatePayment,
  StoreAnalyticsResponse,
  StoreStatistics,
  PopularProduct,
  SalesByCategory,
  LowStockAlert,
  TrendAnalyticsResponse,
  TrendDataPoint,
  MemberGrowthTrend,
  AttendanceTrend,
  RevenueTrend,
  DashboardAnalytics,
} from '@clubmanager/types';
import type { IStatisticsRepository } from '../domain/repositories/StatisticsRepository.js';
import { pool } from '../../../core/config/database.js';

/**
 * MySQL Statistics Repository Implementation
 *
 * Implements real-time analytics queries using optimized SQL.
 * All statistics are computed on-demand from the database.
 */
export class MySQLStatisticsRepository implements IStatisticsRepository {
  // ============================================================================
  // MEMBER STATISTICS
  // ============================================================================

  /**
   * Get comprehensive member analytics
   */
  async getMemberAnalytics(dateRange?: AnalyticsDateRange): Promise<MemberAnalyticsResponse> {
    const overview = await this.getMemberStatisticsOverview(dateRange);
    const byGrade = await this.getMembersByGrade(dateRange);
    const byGender = await this.getMembersByGender(dateRange);
    const byAgeGroup = await this.getMembersByAgeGroup(dateRange);

    return {
      overview,
      by_grade: byGrade,
      by_gender: byGender,
      by_age_group: byAgeGroup,
      date_range: dateRange,
    };
  }

  /**
   * Get member statistics overview
   */
  private async getMemberStatisticsOverview(dateRange?: AnalyticsDateRange): Promise<MemberStatistics> {
    const sql = `
      SELECT
        COUNT(*) as total_membres,
        SUM(CASE WHEN status = 'actif' THEN 1 ELSE 0 END) as membres_actifs,
        SUM(CASE WHEN status = 'inactif' THEN 1 ELSE 0 END) as membres_inactifs,
        SUM(CASE WHEN date_inscription >= DATE_SUB(NOW(), INTERVAL 1 MONTH) THEN 1 ELSE 0 END) as nouveaux_membres_mois,
        SUM(CASE WHEN date_inscription >= DATE_SUB(NOW(), INTERVAL 1 WEEK) THEN 1 ELSE 0 END) as nouveaux_membres_semaine
      FROM utilisateurs
      WHERE role_id != 1
      ${dateRange ? 'AND date_inscription BETWEEN ? AND ?' : ''}
    `;

    const params = dateRange ? [dateRange.date_debut, dateRange.date_fin] : [];
    const [rows] = await pool.execute<RowDataPacket[]>(sql, params);
    const row = rows[0];

    // Calculate growth rate
    const growthRate = await this.getMemberGrowthRate(
      dateRange || {
        date_debut: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        date_fin: new Date(),
      }
    );

    return {
      total_membres: Number(row.total_membres) || 0,
      membres_actifs: Number(row.membres_actifs) || 0,
      membres_inactifs: Number(row.membres_inactifs) || 0,
      nouveaux_membres_mois: Number(row.nouveaux_membres_mois) || 0,
      nouveaux_membres_semaine: Number(row.nouveaux_membres_semaine) || 0,
      taux_croissance: growthRate,
      date_calcul: new Date(),
    };
  }

  /**
   * Get members by grade
   */
  private async getMembersByGrade(dateRange?: AnalyticsDateRange): Promise<MembersByGrade[]> {
    const sql = `
      SELECT
        g.grade_id,
        g.nom as grade_nom,
        COUNT(u.utilisateur_id) as count,
        (COUNT(u.utilisateur_id) * 100.0 / (SELECT COUNT(*) FROM utilisateurs WHERE role_id != 1 ${dateRange ? 'AND date_inscription BETWEEN ? AND ?' : ''})) as pourcentage
      FROM grades g
      LEFT JOIN utilisateurs u ON g.grade_id = u.grade_id AND u.role_id != 1
      ${dateRange ? 'AND u.date_inscription BETWEEN ? AND ?' : ''}
      GROUP BY g.grade_id, g.nom
      ORDER BY g.ordre
    `;

    const params = dateRange ? [dateRange.date_debut, dateRange.date_fin, dateRange.date_debut, dateRange.date_fin] : [];
    const [rows] = await pool.execute<RowDataPacket[]>(sql, params);

    return rows.map(row => ({
      grade_id: row.grade_id,
      grade_nom: row.grade_nom,
      count: Number(row.count) || 0,
      pourcentage: Number(row.pourcentage) || 0,
    }));
  }

  /**
   * Get members by gender
   */
  private async getMembersByGender(dateRange?: AnalyticsDateRange): Promise<MembersByGender[]> {
    const sql = `
      SELECT
        g.genre_id,
        g.nom as genre_nom,
        COUNT(u.utilisateur_id) as count,
        (COUNT(u.utilisateur_id) * 100.0 / (SELECT COUNT(*) FROM utilisateurs WHERE role_id != 1 ${dateRange ? 'AND date_inscription BETWEEN ? AND ?' : ''})) as pourcentage
      FROM genres g
      LEFT JOIN utilisateurs u ON g.genre_id = u.genre_id AND u.role_id != 1
      ${dateRange ? 'AND u.date_inscription BETWEEN ? AND ?' : ''}
      GROUP BY g.genre_id, g.nom
      ORDER BY count DESC
    `;

    const params = dateRange ? [dateRange.date_debut, dateRange.date_fin, dateRange.date_debut, dateRange.date_fin] : [];
    const [rows] = await pool.execute<RowDataPacket[]>(sql, params);

    return rows.map(row => ({
      genre_id: row.genre_id,
      genre_nom: row.genre_nom,
      count: Number(row.count) || 0,
      pourcentage: Number(row.pourcentage) || 0,
    }));
  }

  /**
   * Get members by age group
   */
  private async getMembersByAgeGroup(dateRange?: AnalyticsDateRange): Promise<MembersByAgeGroup[]> {
    const sql = `
      SELECT
        CASE
          WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) < 18 THEN '0-17'
          WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) BETWEEN 18 AND 25 THEN '18-25'
          WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) BETWEEN 26 AND 35 THEN '26-35'
          WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) BETWEEN 36 AND 45 THEN '36-45'
          WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) BETWEEN 46 AND 55 THEN '46-55'
          ELSE '56+'
        END as groupe_age,
        COUNT(*) as count,
        (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM utilisateurs WHERE role_id != 1 AND date_of_birth IS NOT NULL ${dateRange ? 'AND date_inscription BETWEEN ? AND ?' : ''})) as pourcentage
      FROM utilisateurs
      WHERE role_id != 1 AND date_of_birth IS NOT NULL
      ${dateRange ? 'AND date_inscription BETWEEN ? AND ?' : ''}
      GROUP BY groupe_age
      ORDER BY groupe_age
    `;

    const params = dateRange ? [dateRange.date_debut, dateRange.date_fin, dateRange.date_debut, dateRange.date_fin] : [];
    const [rows] = await pool.execute<RowDataPacket[]>(sql, params);

    return rows.map(row => ({
      groupe_age: row.groupe_age,
      count: Number(row.count) || 0,
      pourcentage: Number(row.pourcentage) || 0,
    }));
  }

  /**
   * Get total member count
   */
  async getTotalMembers(activeOnly = false): Promise<number> {
    const sql = `
      SELECT COUNT(*) as total
      FROM utilisateurs
      WHERE role_id != 1
      ${activeOnly ? "AND status = 'actif'" : ''}
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(sql);
    return Number(rows[0].total) || 0;
  }

  /**
   * Get new members count for a given period
   */
  async getNewMembersCount(dateRange: AnalyticsDateRange): Promise<number> {
    const sql = `
      SELECT COUNT(*) as total
      FROM utilisateurs
      WHERE role_id != 1
      AND date_inscription BETWEEN ? AND ?
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(sql, [dateRange.date_debut, dateRange.date_fin]);
    return Number(rows[0].total) || 0;
  }

  /**
   * Get member growth rate
   */
  async getMemberGrowthRate(dateRange: AnalyticsDateRange): Promise<number> {
    // Get members at start of period
    const sqlStart = `
      SELECT COUNT(*) as total
      FROM utilisateurs
      WHERE role_id != 1
      AND date_inscription < ?
    `;

    const [startRows] = await pool.execute<RowDataPacket[]>(sqlStart, [dateRange.date_debut]);
    const startCount = Number(startRows[0].total) || 0;

    if (startCount === 0) return 0;

    // Get new members during period
    const newMembers = await this.getNewMembersCount(dateRange);

    // Calculate growth rate
    return (newMembers / startCount) * 100;
  }

  // ============================================================================
  // COURSE STATISTICS
  // ============================================================================

  /**
   * Get comprehensive course analytics
   */
  async getCourseAnalytics(dateRange?: AnalyticsDateRange): Promise<CourseAnalyticsResponse> {
    const overview = await this.getCourseAttendanceOverview(dateRange);
    const byType = await this.getCoursesByType(dateRange);
    const popularCourses = await this.getPopularCourses(dateRange);
    const byDayOfWeek = await this.getAttendanceByDay(dateRange);

    return {
      overview,
      by_type: byType,
      popular_courses: popularCourses,
      by_day_of_week: byDayOfWeek,
      date_range: dateRange,
    };
  }

  /**
   * Get course attendance overview
   */
  private async getCourseAttendanceOverview(dateRange?: AnalyticsDateRange): Promise<CourseAttendanceStatistics> {
    const sql = `
      SELECT
        COUNT(DISTINCT c.cours_id) as total_cours,
        COUNT(i.inscription_id) as total_inscriptions,
        SUM(CASE WHEN i.presence = 1 THEN 1 ELSE 0 END) as total_presences,
        (SUM(CASE WHEN i.presence = 1 THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(i.inscription_id), 0)) as taux_presence,
        (COUNT(i.inscription_id) * 1.0 / NULLIF(COUNT(DISTINCT c.cours_id), 0)) as moyenne_participants_par_cours
      FROM cours c
      LEFT JOIN inscriptions i ON c.cours_id = i.cours_id
      ${dateRange ? 'WHERE c.date_cours BETWEEN ? AND ?' : ''}
    `;

    const params = dateRange ? [dateRange.date_debut, dateRange.date_fin] : [];
    const [rows] = await pool.execute<RowDataPacket[]>(sql, params);
    const row = rows[0];

    return {
      total_cours: Number(row.total_cours) || 0,
      total_inscriptions: Number(row.total_inscriptions) || 0,
      total_presences: Number(row.total_presences) || 0,
      taux_presence: Number(row.taux_presence) || 0,
      moyenne_participants_par_cours: Number(row.moyenne_participants_par_cours) || 0,
      date_calcul: new Date(),
    };
  }

  /**
   * Get courses by type
   */
  private async getCoursesByType(dateRange?: AnalyticsDateRange): Promise<CoursesByType[]> {
    const sql = `
      SELECT
        c.type_cours,
        COUNT(DISTINCT c.cours_id) as total_cours,
        COUNT(i.inscription_id) as total_inscriptions,
        SUM(CASE WHEN i.presence = 1 THEN 1 ELSE 0 END) as total_presences,
        (SUM(CASE WHEN i.presence = 1 THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(i.inscription_id), 0)) as taux_presence,
        (COUNT(i.inscription_id) * 1.0 / NULLIF(COUNT(DISTINCT c.cours_id), 0)) as moyenne_participants
      FROM cours c
      LEFT JOIN inscriptions i ON c.cours_id = i.cours_id
      ${dateRange ? 'WHERE c.date_cours BETWEEN ? AND ?' : ''}
      GROUP BY c.type_cours
      ORDER BY total_inscriptions DESC
    `;

    const params = dateRange ? [dateRange.date_debut, dateRange.date_fin] : [];
    const [rows] = await pool.execute<RowDataPacket[]>(sql, params);

    return rows.map(row => ({
      type_cours: row.type_cours,
      total_cours: Number(row.total_cours) || 0,
      total_inscriptions: Number(row.total_inscriptions) || 0,
      total_presences: Number(row.total_presences) || 0,
      taux_presence: Number(row.taux_presence) || 0,
      moyenne_participants: Number(row.moyenne_participants) || 0,
    }));
  }

  /**
   * Get popular courses
   */
  private async getPopularCourses(dateRange?: AnalyticsDateRange, limit = 10): Promise<PopularCourse[]> {
    const sql = `
      SELECT
        c.cours_id,
        c.type_cours,
        c.date_cours,
        c.heure_debut,
        c.heure_fin,
        COUNT(i.inscription_id) as total_inscriptions,
        SUM(CASE WHEN i.presence = 1 THEN 1 ELSE 0 END) as total_presences,
        (COUNT(i.inscription_id) * 100.0 / NULLIF(c.capacite_max, 0)) as taux_remplissage
      FROM cours c
      LEFT JOIN inscriptions i ON c.cours_id = i.cours_id
      ${dateRange ? 'WHERE c.date_cours BETWEEN ? AND ?' : ''}
      GROUP BY c.cours_id, c.type_cours, c.date_cours, c.heure_debut, c.heure_fin, c.capacite_max
      ORDER BY total_inscriptions DESC
      LIMIT ?
    `;

    const params = dateRange
      ? [dateRange.date_debut, dateRange.date_fin, limit]
      : [limit];
    const [rows] = await pool.execute<RowDataPacket[]>(sql, params);

    return rows.map(row => ({
      cours_id: row.cours_id,
      type_cours: row.type_cours,
      date_cours: new Date(row.date_cours),
      heure_debut: row.heure_debut,
      heure_fin: row.heure_fin,
      total_inscriptions: Number(row.total_inscriptions) || 0,
      total_presences: Number(row.total_presences) || 0,
      taux_remplissage: Number(row.taux_remplissage) || 0,
    }));
  }

  /**
   * Get attendance by day of week
   */
  private async getAttendanceByDay(dateRange?: AnalyticsDateRange): Promise<AttendanceByDay[]> {
    const sql = `
      SELECT
        DAYOFWEEK(c.date_cours) as jour_semaine,
        DAYNAME(c.date_cours) as jour_nom,
        COUNT(DISTINCT c.cours_id) as total_cours,
        SUM(CASE WHEN i.presence = 1 THEN 1 ELSE 0 END) as total_presences,
        (SUM(CASE WHEN i.presence = 1 THEN 1 ELSE 0 END) * 1.0 / NULLIF(COUNT(DISTINCT c.cours_id), 0)) as moyenne_presences
      FROM cours c
      LEFT JOIN inscriptions i ON c.cours_id = i.cours_id
      ${dateRange ? 'WHERE c.date_cours BETWEEN ? AND ?' : ''}
      GROUP BY jour_semaine, jour_nom
      ORDER BY jour_semaine
    `;

    const params = dateRange ? [dateRange.date_debut, dateRange.date_fin] : [];
    const [rows] = await pool.execute<RowDataPacket[]>(sql, params);

    return rows.map(row => ({
      jour_semaine: row.jour_semaine,
      jour_nom: row.jour_nom,
      total_cours: Number(row.total_cours) || 0,
      total_presences: Number(row.total_presences) || 0,
      moyenne_presences: Number(row.moyenne_presences) || 0,
    }));
  }

  /**
   * Get total courses count
   */
  async getTotalCourses(dateRange?: AnalyticsDateRange): Promise<number> {
    const sql = `
      SELECT COUNT(*) as total
      FROM cours
      ${dateRange ? 'WHERE date_cours BETWEEN ? AND ?' : ''}
    `;

    const params = dateRange ? [dateRange.date_debut, dateRange.date_fin] : [];
    const [rows] = await pool.execute<RowDataPacket[]>(sql, params);
    return Number(rows[0].total) || 0;
  }

  /**
   * Get overall attendance rate
   */
  async getAttendanceRate(dateRange?: AnalyticsDateRange): Promise<number> {
    const sql = `
      SELECT
        (SUM(CASE WHEN i.presence = 1 THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(i.inscription_id), 0)) as taux
      FROM inscriptions i
      INNER JOIN cours c ON i.cours_id = c.cours_id
      ${dateRange ? 'WHERE c.date_cours BETWEEN ? AND ?' : ''}
    `;

    const params = dateRange ? [dateRange.date_debut, dateRange.date_fin] : [];
    const [rows] = await pool.execute<RowDataPacket[]>(sql, params);
    return Number(rows[0].taux) || 0;
  }

  /**
   * Get average participants per course
   */
  async getAverageParticipantsPerCourse(dateRange?: AnalyticsDateRange): Promise<number> {
    const sql = `
      SELECT
        (COUNT(i.inscription_id) * 1.0 / NULLIF(COUNT(DISTINCT c.cours_id), 0)) as moyenne
      FROM cours c
      LEFT JOIN inscriptions i ON c.cours_id = i.cours_id
      ${dateRange ? 'WHERE c.date_cours BETWEEN ? AND ?' : ''}
    `;

    const params = dateRange ? [dateRange.date_debut, dateRange.date_fin] : [];
    const [rows] = await pool.execute<RowDataPacket[]>(sql, params);
    return Number(rows[0].moyenne) || 0;
  }

  // ============================================================================
  // FINANCIAL STATISTICS
  // ============================================================================

  /**
   * Get comprehensive financial analytics
   */
  async getFinancialAnalytics(dateRange?: AnalyticsDateRange): Promise<FinancialAnalyticsResponse> {
    const overview = await this.getFinancialOverview(dateRange);
    const byPaymentMethod = await this.getRevenueByPaymentMethod(dateRange);
    const bySubscriptionPlan = await this.getRevenueByPlan(dateRange);
    const latePayments = await this.getLatePaymentDetails();

    return {
      overview,
      by_payment_method: byPaymentMethod,
      by_subscription_plan: bySubscriptionPlan,
      late_payments: latePayments,
      date_range: dateRange,
    };
  }

  /**
   * Get financial overview
   */
  private async getFinancialOverview(dateRange?: AnalyticsDateRange): Promise<FinancialStatistics> {
    const sql = `
      SELECT
        SUM(CASE WHEN statut = 'valide' THEN montant ELSE 0 END) as total_revenus,
        SUM(CASE WHEN statut = 'valide' THEN 1 ELSE 0 END) as total_paiements_valides,
        SUM(CASE WHEN statut = 'en_attente' THEN 1 ELSE 0 END) as total_paiements_en_attente,
        SUM(CASE WHEN statut = 'echoue' THEN 1 ELSE 0 END) as total_paiements_echoues,
        SUM(CASE WHEN statut = 'en_attente' THEN montant ELSE 0 END) as montant_en_attente,
        (SUM(CASE WHEN statut = 'valide' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0)) as taux_paiement
      FROM paiements
      ${dateRange ? 'WHERE date_paiement BETWEEN ? AND ?' : ''}
    `;

    const params = dateRange ? [dateRange.date_debut, dateRange.date_fin] : [];
    const [rows] = await pool.execute<RowDataPacket[]>(sql, params);
    const row = rows[0];

    // Get late payments info
    const latePaymentsAmount = await this.getLatePaymentsAmount();
    const latePaymentsCount = await this.getLatePaymentsCount();

    return {
      total_revenus: Number(row.total_revenus) || 0,
      total_paiements_valides: Number(row.total_paiements_valides) || 0,
      total_paiements_en_attente: Number(row.total_paiements_en_attente) || 0,
      total_paiements_echoues: Number(row.total_paiements_echoues) || 0,
      montant_en_attente: Number(row.montant_en_attente) || 0,
      montant_echeances_retard: latePaymentsAmount,
      nombre_echeances_retard: latePaymentsCount,
      taux_paiement: Number(row.taux_paiement) || 0,
      date_calcul: new Date(),
    };
  }

  /**
   * Get revenue by payment method
   */
  private async getRevenueByPaymentMethod(dateRange?: AnalyticsDateRange): Promise<RevenueByPaymentMethod[]> {
    const sql = `
      SELECT
        methode_paiement,
        COUNT(*) as total_paiements,
        SUM(montant) as montant_total,
        (SUM(montant) * 100.0 / (SELECT SUM(montant) FROM paiements WHERE statut = 'valide' ${dateRange ? 'AND date_paiement BETWEEN ? AND ?' : ''})) as pourcentage
      FROM paiements
      WHERE statut = 'valide'
      ${dateRange ? 'AND date_paiement BETWEEN ? AND ?' : ''}
      GROUP BY methode_paiement
      ORDER BY montant_total DESC
    `;

    const params = dateRange
      ? [dateRange.date_debut, dateRange.date_fin, dateRange.date_debut, dateRange.date_fin]
      : [];
    const [rows] = await pool.execute<RowDataPacket[]>(sql, params);

    return rows.map(row => ({
      methode_paiement: row.methode_paiement,
      total_paiements: Number(row.total_paiements) || 0,
      montant_total: Number(row.montant_total) || 0,
      pourcentage: Number(row.pourcentage) || 0,
    }));
  }

  /**
   * Get revenue by subscription plan
   */
  private async getRevenueByPlan(dateRange?: AnalyticsDateRange): Promise<RevenueByPlan[]> {
    const sql = `
      SELECT
        pa.plan_abonnement_id as plan_id,
        pa.nom as plan_nom,
        COUNT(DISTINCT a.abonnement_id) as total_abonnes,
        SUM(p.montant) as montant_total,
        (SUM(p.montant) * 100.0 / (SELECT SUM(montant) FROM paiements WHERE statut = 'valide' ${dateRange ? 'AND date_paiement BETWEEN ? AND ?' : ''})) as pourcentage
      FROM plans_abonnement pa
      LEFT JOIN abonnements a ON pa.plan_abonnement_id = a.plan_abonnement_id
      LEFT JOIN paiements p ON a.abonnement_id = p.abonnement_id AND p.statut = 'valide'
      ${dateRange ? 'WHERE p.date_paiement BETWEEN ? AND ?' : ''}
      GROUP BY pa.plan_abonnement_id, pa.nom
      ORDER BY montant_total DESC
    `;

    const params = dateRange
      ? [dateRange.date_debut, dateRange.date_fin, dateRange.date_debut, dateRange.date_fin]
      : [];
    const [rows] = await pool.execute<RowDataPacket[]>(sql, params);

    return rows.map(row => ({
      plan_id: row.plan_id,
      plan_nom: row.plan_nom,
      total_abonnes: Number(row.total_abonnes) || 0,
      montant_total: Number(row.montant_total) || 0,
      pourcentage: Number(row.pourcentage) || 0,
    }));
  }

  /**
   * Get late payment details
   */
  private async getLatePaymentDetails(): Promise<LatePayment[]> {
    const sql = `
      SELECT
        u.utilisateur_id,
        u.nom as utilisateur_nom,
        u.prenom as utilisateur_prenom,
        e.echeance_id,
        e.montant,
        e.date_echeance,
        DATEDIFF(CURDATE(), e.date_echeance) as jours_retard
      FROM echeances_paiements e
      INNER JOIN abonnements a ON e.abonnement_id = a.abonnement_id
      INNER JOIN utilisateurs u ON a.utilisateur_id = u.utilisateur_id
      WHERE e.statut = 'en_attente'
      AND e.date_echeance < CURDATE()
      ORDER BY jours_retard DESC
      LIMIT 50
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(sql);

    return rows.map(row => ({
      utilisateur_id: row.utilisateur_id,
      utilisateur_nom: row.utilisateur_nom,
      utilisateur_prenom: row.utilisateur_prenom,
      echeance_id: row.echeance_id,
      montant: Number(row.montant),
      date_echeance: new Date(row.date_echeance),
      jours_retard: row.jours_retard,
    }));
  }

  /**
   * Get total revenue
   */
  async getTotalRevenue(dateRange?: AnalyticsDateRange): Promise<number> {
    const sql = `
      SELECT SUM(montant) as total
      FROM paiements
      WHERE statut = 'valide'
      ${dateRange ? 'AND date_paiement BETWEEN ? AND ?' : ''}
    `;

    const params = dateRange ? [dateRange.date_debut, dateRange.date_fin] : [];
    const [rows] = await pool.execute<RowDataPacket[]>(sql, params);
    return Number(rows[0].total) || 0;
  }

  /**
   * Get payment success rate
   */
  async getPaymentSuccessRate(dateRange?: AnalyticsDateRange): Promise<number> {
    const sql = `
      SELECT
        (SUM(CASE WHEN statut = 'valide' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0)) as taux
      FROM paiements
      ${dateRange ? 'WHERE date_paiement BETWEEN ? AND ?' : ''}
    `;

    const params = dateRange ? [dateRange.date_debut, dateRange.date_fin] : [];
    const [rows] = await pool.execute<RowDataPacket[]>(sql, params);
    return Number(rows[0].taux) || 0;
  }

  /**
   * Get late payments count
   */
  async getLatePaymentsCount(): Promise<number> {
    const sql = `
      SELECT COUNT(*) as total
      FROM echeances_paiements
      WHERE statut = 'en_attente'
      AND date_echeance < CURDATE()
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(sql);
    return Number(rows[0].total) || 0;
  }

  /**
   * Get total amount of late payments
   */
  async getLatePaymentsAmount(): Promise<number> {
    const sql = `
      SELECT SUM(montant) as total
      FROM echeances_paiements
      WHERE statut = 'en_attente'
      AND date_echeance < CURDATE()
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(sql);
    return Number(rows[0].total) || 0;
  }

  // ============================================================================
  // STORE STATISTICS
  // ============================================================================

  /**
   * Get comprehensive store analytics
   */
  async getStoreAnalytics(dateRange?: AnalyticsDateRange): Promise<StoreAnalyticsResponse> {
    const overview = await this.getStoreOverview(dateRange);
    const popularProducts = await this.getPopularProducts(dateRange);
    const byCategory = await this.getSalesByCategory(dateRange);
    const lowStock = await this.getLowStockAlerts();

    return {
      overview,
      popular_products: popularProducts,
      by_category: byCategory,
      low_stock: lowStock,
      date_range: dateRange,
    };
  }

  /**
   * Get store overview
   */
  private async getStoreOverview(dateRange?: AnalyticsDateRange): Promise<StoreStatistics> {
    const sql = `
      SELECT
        COUNT(*) as total_commandes,
        SUM(CASE WHEN statut_paiement = 'paye' THEN 1 ELSE 0 END) as commandes_payees,
        SUM(CASE WHEN statut_paiement = 'en_attente' THEN 1 ELSE 0 END) as commandes_en_attente,
        SUM(CASE WHEN statut_paiement = 'annule' THEN 1 ELSE 0 END) as commandes_annulees,
        SUM(CASE WHEN statut_paiement = 'paye' THEN montant_total ELSE 0 END) as total_revenus,
        (SUM(CASE WHEN statut_paiement = 'paye' THEN montant_total ELSE 0 END) / NULLIF(SUM(CASE WHEN statut_paiement = 'paye' THEN 1 ELSE 0 END), 0)) as panier_moyen
      FROM commandes
      ${dateRange ? 'WHERE date_commande BETWEEN ? AND ?' : ''}
    `;

    const params = dateRange ? [dateRange.date_debut, dateRange.date_fin] : [];
    const [rows] = await pool.execute<RowDataPacket[]>(sql, params);
    const row = rows[0];

    // Get total articles sold
    const sqlArticles = `
      SELECT SUM(ca.quantite) as total
      FROM commande_articles ca
      INNER JOIN commandes c ON ca.commande_id = c.commande_id
      WHERE c.statut_paiement = 'paye'
      ${dateRange ? 'AND c.date_commande BETWEEN ? AND ?' : ''}
    `;

    const [articlesRows] = await pool.execute<RowDataPacket[]>(sqlArticles, params);
    const totalArticlesVendus = Number(articlesRows[0].total) || 0;

    // Conversion rate (assuming we track visitors)
    const tauxConversion = 0; // TODO: Implement if visitor tracking exists

    return {
      total_commandes: Number(row.total_commandes) || 0,
      commandes_payees: Number(row.commandes_payees) || 0,
      commandes_en_attente: Number(row.commandes_en_attente) || 0,
      commandes_annulees: Number(row.commandes_annulees) || 0,
      total_revenus: Number(row.total_revenus) || 0,
      panier_moyen: Number(row.panier_moyen) || 0,
      total_articles_vendus: totalArticlesVendus,
      taux_conversion: tauxConversion,
      date_calcul: new Date(),
    };
  }

  /**
   * Get popular products
   */
  private async getPopularProducts(dateRange?: AnalyticsDateRange, limit = 10): Promise<PopularProduct[]> {
    const sql = `
      SELECT
        a.article_id,
        a.nom as article_nom,
        cat.nom as categorie,
        SUM(ca.quantite) as quantite_vendue,
        SUM(ca.prix_unitaire * ca.quantite) as revenus_total,
        COUNT(DISTINCT ca.commande_id) as nombre_commandes
      FROM articles a
      INNER JOIN commande_articles ca ON a.article_id = ca.article_id
      INNER JOIN commandes c ON ca.commande_id = c.commande_id
      LEFT JOIN categories_articles cat ON a.categorie_id = cat.categorie_id
      WHERE c.statut_paiement = 'paye'
      ${dateRange ? 'AND c.date_commande BETWEEN ? AND ?' : ''}
      GROUP BY a.article_id, a.nom, cat.nom
      ORDER BY quantite_vendue DESC
      LIMIT ?
    `;

    const params = dateRange
      ? [dateRange.date_debut, dateRange.date_fin, limit]
      : [limit];
    const [rows] = await pool.execute<RowDataPacket[]>(sql, params);

    return rows.map(row => ({
      article_id: row.article_id,
      article_nom: row.article_nom,
      categorie: row.categorie || 'Non catégorisé',
      quantite_vendue: Number(row.quantite_vendue) || 0,
      revenus_total: Number(row.revenus_total) || 0,
      nombre_commandes: Number(row.nombre_commandes) || 0,
    }));
  }

  /**
   * Get sales by category
   */
  private async getSalesByCategory(dateRange?: AnalyticsDateRange): Promise<SalesByCategory[]> {
    const sql = `
      SELECT
        cat.categorie_id,
        cat.nom as categorie_nom,
        SUM(ca.quantite) as total_articles_vendus,
        SUM(ca.prix_unitaire * ca.quantite) as revenus_total,
        COUNT(DISTINCT ca.commande_id) as nombre_commandes,
        (SUM(ca.prix_unitaire * ca.quantite) * 100.0 / (
          SELECT SUM(prix_unitaire * quantite)
          FROM commande_articles ca2
          INNER JOIN commandes c2 ON ca2.commande_id = c2.commande_id
          WHERE c2.statut_paiement = 'paye'
          ${dateRange ? 'AND c2.date_commande BETWEEN ? AND ?' : ''}
        )) as pourcentage_revenus
      FROM categories_articles cat
      LEFT JOIN articles a ON cat.categorie_id = a.categorie_id
      LEFT JOIN commande_articles ca ON a.article_id = ca.article_id
      LEFT JOIN commandes c ON ca.commande_id = c.commande_id AND c.statut_paiement = 'paye'
      ${dateRange ? 'WHERE c.date_commande BETWEEN ? AND ?' : ''}
      GROUP BY cat.categorie_id, cat.nom
      ORDER BY revenus_total DESC
    `;

    const params = dateRange
      ? [dateRange.date_debut, dateRange.date_fin, dateRange.date_debut, dateRange.date_fin]
      : [];
    const [rows] = await pool.execute<RowDataPacket[]>(sql, params);

    return rows.map(row => ({
      categorie_id: row.categorie_id,
      categorie_nom: row.categorie_nom,
      total_articles_vendus: Number(row.total_articles_vendus) || 0,
      revenus_total: Number(row.revenus_total) || 0,
      nombre_commandes: Number(row.nombre_commandes) || 0,
      pourcentage_revenus: Number(row.pourcentage_revenus) || 0,
    }));
  }

  /**
   * Get low stock alerts
   */
  private async getLowStockAlerts(): Promise<LowStockAlert[]> {
    const sql = `
      SELECT
        a.article_id,
        a.nom as article_nom,
        s.taille,
        s.quantite_disponible,
        5 as quantite_minimum,
        CASE
          WHEN s.quantite_disponible = 0 THEN 'rupture'
          WHEN s.quantite_disponible <= 2 THEN 'critique'
          ELSE 'bas'
        END as statut
      FROM articles a
      INNER JOIN stock s ON a.article_id = s.article_id
      WHERE s.quantite_disponible <= 5
      ORDER BY s.quantite_disponible ASC, a.nom ASC
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(sql);

    return rows.map(row => ({
      article_id: row.article_id,
      article_nom: row.article_nom,
      taille: row.taille,
      quantite_disponible: Number(row.quantite_disponible),
      quantite_minimum: Number(row.quantite_minimum),
      statut: row.statut as 'bas' | 'critique' | 'rupture',
    }));
  }

  /**
   * Get total orders count
   */
  async getTotalOrders(dateRange?: AnalyticsDateRange): Promise<number> {
    const sql = `
      SELECT COUNT(*) as total
      FROM commandes
      ${dateRange ? 'WHERE date_commande BETWEEN ? AND ?' : ''}
    `;

    const params = dateRange ? [dateRange.date_debut, dateRange.date_fin] : [];
    const [rows] = await pool.execute<RowDataPacket[]>(sql, params);
    return Number(rows[0].total) || 0;
  }

  /**
   * Get total store revenue
   */
  async getStoreRevenue(dateRange?: AnalyticsDateRange): Promise<number> {
    const sql = `
      SELECT SUM(montant_total) as total
      FROM commandes
      WHERE statut_paiement = 'paye'
      ${dateRange ? 'AND date_commande BETWEEN ? AND ?' : ''}
    `;

    const params = dateRange ? [dateRange.date_debut, dateRange.date_fin] : [];
    const [rows] = await pool.execute<RowDataPacket[]>(sql, params);
    return Number(rows[0].total) || 0;
  }

  /**
   * Get average cart value
   */
  async getAverageCartValue(dateRange?: AnalyticsDateRange): Promise<number> {
    const sql = `
      SELECT
        (SUM(montant_total) / NULLIF(COUNT(*), 0)) as moyenne
      FROM commandes
      WHERE statut_paiement = 'paye'
      ${dateRange ? 'AND date_commande BETWEEN ? AND ?' : ''}
    `;

    const params = dateRange ? [dateRange.date_debut, dateRange.date_fin] : [];
    const [rows] = await pool.execute<RowDataPacket[]>(sql, params);
    return Number(rows[0].moyenne) || 0;
  }

  /**
   * Get conversion rate
   */
  async getConversionRate(dateRange?: AnalyticsDateRange): Promise<number> {
    // TODO: Implement if visitor tracking exists
    return 0;
  }

  // ============================================================================
  // TREND STATISTICS
  // ============================================================================

  /**
   * Get trend analytics over time
   */
  async getTrendAnalytics(
    dateRange: AnalyticsDateRange,
    periodType: PeriodType
  ): Promise<TrendAnalyticsResponse> {
    const memberGrowth = await this.getMemberGrowthTrend(dateRange, periodType);
    const attendance = await this.getAttendanceTrend(dateRange, periodType);
    const revenue = await this.getRevenueTrend(dateRange, periodType);

    return {
      member_growth: memberGrowth,
      attendance: attendance,
      revenue: revenue,
      date_range: dateRange,
    };
  }

  /**
   * Get member growth trend
   */
  async getMemberGrowthTrend(
    dateRange: AnalyticsDateRange,
    periodType: PeriodType
  ): Promise<MemberGrowthTrend> {
    const formatSql = this.getPeriodFormatSql(periodType);

    const sql = `
      SELECT
        ${formatSql} as periode,
        COUNT(*) as valeur,
        MIN(date_inscription) as date_debut,
        MAX(date_inscription) as date_fin
      FROM utilisateurs
      WHERE role_id != 1
      AND date_inscription BETWEEN ? AND ?
      GROUP BY periode
      ORDER BY periode
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(sql, [dateRange.date_debut, dateRange.date_fin]);

    const data: TrendDataPoint[] = rows.map((row, index) => {
      const valeur = Number(row.valeur);
      const previousValue = index > 0 ? Number(rows[index - 1].valeur) : valeur;
      const variation = previousValue !== 0 ? ((valeur - previousValue) / previousValue) * 100 : 0;

      return {
        periode: row.periode,
        date_debut: new Date(row.date_debut),
        date_fin: new Date(row.date_fin),
        valeur,
        variation,
      };
    });

    const total = data.reduce((sum, point) => sum + point.valeur, 0);
    const moyenne = data.length > 0 ? total / data.length : 0;
    const firstValue = data.length > 0 ? data[0].valeur : 0;
    const lastValue = data.length > 0 ? data[data.length - 1].valeur : 0;
    const totalVariation = firstValue !== 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;

    return {
      type: 'member_growth',
      period_type: periodType,
      data,
      total_variation: totalVariation,
      moyenne,
    };
  }

  /**
   * Get attendance trend
   */
  async getAttendanceTrend(
    dateRange: AnalyticsDateRange,
    periodType: PeriodType
  ): Promise<AttendanceTrend> {
    const formatSql = this.getPeriodFormatSql(periodType, 'c.date_cours');

    const sql = `
      SELECT
        ${formatSql} as periode,
        SUM(CASE WHEN i.presence = 1 THEN 1 ELSE 0 END) as valeur,
        MIN(c.date_cours) as date_debut,
        MAX(c.date_cours) as date_fin
      FROM cours c
      LEFT JOIN inscriptions i ON c.cours_id = i.cours_id
      WHERE c.date_cours BETWEEN ? AND ?
      GROUP BY periode
      ORDER BY periode
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(sql, [dateRange.date_debut, dateRange.date_fin]);

    const data: TrendDataPoint[] = rows.map((row, index) => {
      const valeur = Number(row.valeur);
      const previousValue = index > 0 ? Number(rows[index - 1].valeur) : valeur;
      const variation = previousValue !== 0 ? ((valeur - previousValue) / previousValue) * 100 : 0;

      return {
        periode: row.periode,
        date_debut: new Date(row.date_debut),
        date_fin: new Date(row.date_fin),
        valeur,
        variation,
      };
    });

    const total = data.reduce((sum, point) => sum + point.valeur, 0);
    const moyenne = data.length > 0 ? total / data.length : 0;
    const firstValue = data.length > 0 ? data[0].valeur : 0;
    const lastValue = data.length > 0 ? data[data.length - 1].valeur : 0;
    const totalVariation = firstValue !== 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;

    return {
      type: 'attendance',
      period_type: periodType,
      data,
      total_variation: totalVariation,
      moyenne,
    };
  }

  /**
   * Get revenue trend
   */
  async getRevenueTrend(
    dateRange: AnalyticsDateRange,
    periodType: PeriodType
  ): Promise<RevenueTrend> {
    const formatSql = this.getPeriodFormatSql(periodType, 'date_paiement');

    const sql = `
      SELECT
        ${formatSql} as periode,
        SUM(montant) as valeur,
        MIN(date_paiement) as date_debut,
        MAX(date_paiement) as date_fin
      FROM paiements
      WHERE statut = 'valide'
      AND date_paiement BETWEEN ? AND ?
      GROUP BY periode
      ORDER BY periode
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(sql, [dateRange.date_debut, dateRange.date_fin]);

    const data: TrendDataPoint[] = rows.map((row, index) => {
      const valeur = Number(row.valeur);
      const previousValue = index > 0 ? Number(rows[index - 1].valeur) : valeur;
      const variation = previousValue !== 0 ? ((valeur - previousValue) / previousValue) * 100 : 0;

      return {
        periode: row.periode,
        date_debut: new Date(row.date_debut),
        date_fin: new Date(row.date_fin),
        valeur,
        variation,
      };
    });

    const total = data.reduce((sum, point) => sum + point.valeur, 0);
    const moyenne = data.length > 0 ? total / data.length : 0;
    const firstValue = data.length > 0 ? data[0].valeur : 0;
    const lastValue = data.length > 0 ? data[data.length - 1].valeur : 0;
    const totalVariation = firstValue !== 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;

    return {
      type: 'revenue',
      period_type: periodType,
      data,
      total_variation: totalVariation,
      moyenne,
      total,
    };
  }

  /**
   * Get SQL format for period grouping
   */
  private getPeriodFormatSql(periodType: PeriodType, dateColumn = 'date_inscription'): string {
    switch (periodType) {
      case 'day':
        return `DATE_FORMAT(${dateColumn}, '%Y-%m-%d')`;
      case 'week':
        return `DATE_FORMAT(${dateColumn}, '%Y-W%v')`;
      case 'month':
        return `DATE_FORMAT(${dateColumn}, '%Y-%m')`;
      case 'quarter':
        return `CONCAT(YEAR(${dateColumn}), '-Q', QUARTER(${dateColumn}))`;
      case 'year':
        return `YEAR(${dateColumn})`;
      default:
        return `DATE_FORMAT(${dateColumn}, '%Y-%m')`;
    }
  }

  // ============================================================================
  // DASHBOARD STATISTICS
  // ============================================================================

  /**
   * Get complete dashboard analytics
   */
  async getDashboardAnalytics(
    dateRange?: AnalyticsDateRange,
    periodType: PeriodType = 'month'
  ): Promise<DashboardAnalytics> {
    const [members, courses, finance, store, trends] = await Promise.all([
      this.getMemberAnalytics(dateRange),
      this.getCourseAnalytics(dateRange),
      this.getFinancialAnalytics(dateRange),
      this.getStoreAnalytics(dateRange),
      dateRange
        ? this.getTrendAnalytics(dateRange, periodType)
        : this.getTrendAnalytics(
            {
              date_debut: new Date(new Date().setMonth(new Date().getMonth() - 6)),
              date_fin: new Date(),
            },
            periodType
          ),
    ]);

    return {
      members,
      courses,
      finance,
      store,
      trends,
      generated_at: new Date(),
    };
  }

  // ============================================================================
  // HEALTH & UTILITY
  // ============================================================================

  /**
   * Check if repository is healthy and can connect to database
   */
  async healthCheck(): Promise<boolean> {
    try {
      const connection = await pool.getConnection();
      await connection.ping();
      connection.release();
      return true;
    } catch (error) {
      console.error('Statistics Repository health check failed:', error);
      return false;
    }
  }
}
