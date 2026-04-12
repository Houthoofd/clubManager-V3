/**
 * @fileoverview Statistics Router
 * @module features/statistics
 *
 * Router configuration for the Statistics module.
 * Defines all routes for statistics pages and components.
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardPage } from './pages/DashboardPage';
import { MembersStatsPage } from './pages/MembersStatsPage';
import { CoursesStatsPage } from './pages/CoursesStatsPage';
import { FinanceStatsPage } from './pages/FinanceStatsPage';
import { StoreStatsPage } from './pages/StoreStatsPage';

/**
 * Statistics Router Component
 *
 * Provides routing for all statistics-related pages.
 * All routes are relative to the parent route (/statistics).
 *
 * Routes:
 * - /statistics -> Dashboard (default)
 * - /statistics/dashboard -> Dashboard
 * - /statistics/members -> Members Statistics
 * - /statistics/courses -> Courses Statistics
 * - /statistics/finance -> Finance Statistics
 * - /statistics/store -> Store Statistics
 *
 * @example
 * ```tsx
 * // In main App.tsx or parent router
 * <Route path="/statistics/*" element={<StatisticsRouter />} />
 * ```
 */
export const StatisticsRouter: React.FC = () => {
  return (
    <Routes>
      {/* Default route - redirect to dashboard */}
      <Route index element={<Navigate to="dashboard" replace />} />

      {/* Dashboard - Overview of all statistics */}
      <Route path="dashboard" element={<DashboardPage />} />

      {/* Members Statistics - Detailed member analytics */}
      <Route path="members" element={<MembersStatsPage />} />

      {/* Courses Statistics - Attendance and course analytics */}
      <Route path="courses" element={<CoursesStatsPage />} />

      {/* Finance Statistics - Revenue and payment analytics */}
      <Route path="finance" element={<FinanceStatsPage />} />

      {/* Store Statistics - Sales and inventory analytics */}
      <Route path="store" element={<StoreStatsPage />} />

      {/* Catch-all route - redirect to dashboard */}
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
};

export default StatisticsRouter;
