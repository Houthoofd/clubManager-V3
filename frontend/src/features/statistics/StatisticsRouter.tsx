/**
 * @fileoverview Statistics Router
 * @module features/statistics
 *
 * Router configuration for the Statistics module.
 * Defines all routes for statistics pages and components.
 * GAP-24: Finance route protected for ADMIN only.
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardPage } from './pages/DashboardPage';
import { MembersStatsPage } from './pages/MembersStatsPage';
import { CoursesStatsPage } from './pages/CoursesStatsPage';
import { FinanceStatsPage } from './pages/FinanceStatsPage';
import { StoreStatsPage } from './pages/StoreStatsPage';
import { useAuth } from '../../shared/hooks/useAuth';
import { UserRole } from '@clubmanager/types';

/**
 * Statistics Router Component
 *
 * Provides routing for all statistics-related pages.
 * All routes are relative to the parent route (/statistics).
 *
 * Routes:
 * - /statistics -> Dashboard (default)
 * - /statistics/dashboard -> Dashboard (ADMIN + PROFESSOR)
 * - /statistics/members -> Members Statistics (ADMIN + PROFESSOR)
 * - /statistics/courses -> Courses Statistics (ADMIN + PROFESSOR)
 * - /statistics/finance -> Finance Statistics (ADMIN only)
 * - /statistics/store -> Store Statistics (ADMIN + PROFESSOR)
 */
export const StatisticsRouter: React.FC = () => {
  const { hasRole } = useAuth();
  const isAdmin = hasRole(UserRole.ADMIN);

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

      {/* Finance Statistics - Revenue and payment analytics (ADMIN only) */}
      <Route
        path="finance"
        element={isAdmin ? <FinanceStatsPage /> : <Navigate to="dashboard" replace />}
      />

      {/* Store Statistics - Sales and inventory analytics */}
      <Route path="store" element={<StoreStatsPage />} />

      {/* Catch-all route - redirect to dashboard */}
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
};

export default StatisticsRouter;
