/**
 * App.tsx
 * Application principale avec routing et layouts
 */

import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Toaster } from "sonner";
import { useAuthStore } from "./shared/stores/authStore";

// Layouts
import { PublicLayout } from "./layouts/PublicLayout";
import { PrivateLayout } from "./layouts/PrivateLayout";
import { useAuth } from "./shared/hooks/useAuth";

// Route Guards
import { PublicRoute } from "./shared/components/PublicRoute";
import { RoleGuard } from "./shared/components/RoleGuard";
import { UserRole } from "@clubmanager/types";

// Auth Pages
import { LoginPage } from "./features/auth/pages/LoginPage";
import { RegisterPage } from "./features/auth/pages/RegisterPage";
import { EmailVerificationPage } from "./features/auth/pages/EmailVerificationPage";
import { ForgotPasswordPage } from "./features/auth/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./features/auth/pages/ResetPasswordPage";
import { FamilyPage } from "./features/families/pages";
import { UsersPage } from "./features/users/pages";
import { MessagesPage } from "./features/messaging/pages";
import { SettingsPage } from "./features/settings/pages";
import { PaymentsPage } from "./features/payments/pages";
import { CoursesPage } from "./features/courses/pages";
import { StorePage } from "./features/store/pages";

// Dashboard (placeholder)
const DashboardPage = () => (
  <div className="bg-white rounded-lg shadow p-6">
    <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h1>
    <p className="text-gray-600">
      Bienvenue sur ClubManager V3 - Votre application de gestion de club
      sportif.
    </p>
  </div>
);

const StatisticsPage = () => (
  <div className="bg-white rounded-lg shadow p-6">
    <h1 className="text-2xl font-bold text-gray-900">Statistics</h1>
  </div>
);

const ProfilePage = () => (
  <div className="bg-white rounded-lg shadow p-6">
    <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
  </div>
);

/**
 * AuthenticatedLayout Component
 * Combines ProtectedRoute + PrivateLayout to ensure Outlet works correctly
 */
const AuthenticatedLayout = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    // Nettoyer le localStorage si état incohérent (isAuthenticated:true mais user:null)
    if (isAuthenticated && !user) {
      localStorage.clear();
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <PrivateLayout />;
};

/**
 * RootRedirect Component
 * Redirects to login if not authenticated, otherwise to dashboard
 */
const RootRedirect = () => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
};

/**
 * App Component
 */
function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  // Vérifier l'état d'authentification au chargement
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <>
      {/* Toaster pour les notifications */}
      <Toaster position="top-right" richColors closeButton duration={4000} />

      <BrowserRouter>
        <Routes>
          {/* Redirect root based on auth state */}
          <Route path="/" element={<RootRedirect />} />

          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              }
            />
            <Route path="/verify-email" element={<EmailVerificationPage />} />
            <Route
              path="/forgot-password"
              element={
                <PublicRoute>
                  <ForgotPasswordPage />
                </PublicRoute>
              }
            />
            <Route
              path="/reset-password"
              element={
                <PublicRoute>
                  <ResetPasswordPage />
                </PublicRoute>
              }
            />
          </Route>

          {/* Private Routes */}
          <Route element={<AuthenticatedLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route
              path="/courses"
              element={
                <RoleGuard
                  allowedRoles={[
                    UserRole.ADMIN,
                    UserRole.PROFESSOR,
                    UserRole.MEMBER,
                  ]}
                >
                  <CoursesPage />
                </RoleGuard>
              }
            />
            <Route
              path="/users"
              element={
                <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.PROFESSOR]}>
                  <UsersPage />
                </RoleGuard>
              }
            />
            <Route
              path="/payments"
              element={
                <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.MEMBER]}>
                  <PaymentsPage />
                </RoleGuard>
              }
            />
            <Route path="/store" element={<StorePage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route
              path="/statistics"
              element={
                <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.PROFESSOR]}>
                  <StatisticsPage />
                </RoleGuard>
              }
            />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/family" element={<FamilyPage />} />
            <Route
              path="/settings"
              element={
                <RoleGuard allowedRoles={[UserRole.ADMIN]}>
                  <SettingsPage />
                </RoleGuard>
              }
            />
          </Route>

          {/* 404 Not Found */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-gray-900">404</h1>
                  <p className="text-xl text-gray-600 mt-4">Page not found</p>
                  <a
                    href="/dashboard"
                    className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Go to Dashboard
                  </a>
                </div>
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
