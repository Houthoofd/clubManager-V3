/**
 * App.tsx
 * Application principale avec routing et layouts
 */

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Toaster } from "sonner";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { useAuthStore } from "./shared/stores/authStore";

// Layouts
import { PublicLayout } from "./layouts/PublicLayout";
import { PrivateLayout } from "./layouts/PrivateLayout";
import { useAuth } from "./shared/hooks/useAuth";

// Route Guards
import { PublicRoute, RoleGuard } from "./shared/components/Auth";
import { UserRole } from "@clubmanager/types";

// Auth Pages
import { LoginPage } from "./features/auth/pages/LoginPage";
import { RegisterPage } from "./features/auth/pages/RegisterPage";
import { EmailVerificationPage } from "./features/auth/pages/EmailVerificationPage";
import { ForgotPasswordPage } from "./features/auth/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./features/auth/pages/ResetPasswordPage";
import { RecoveryRequestPage } from "./features/auth/pages/RecoveryRequestPage";
import { FamilyPage } from "./features/families/pages";
import {
  UsersPage,
  ProfilePage,
  DeletedUsersPage,
} from "./features/users/pages";
import { MessagesPage } from "./features/messaging/pages";
import { SettingsPage } from "./features/settings/pages";
import { PaymentsPage } from "./features/payments/pages";
import { CoursesPage } from "./features/courses/pages";
import { MyCoursesPage } from "./features/courses/pages";
import { StorePage } from "./features/store/pages";
import { StatisticsRouter } from "./features/statistics/StatisticsRouter";
import { NotificationsPage } from "./features/notifications/pages";
import { DashboardPage } from "./features/dashboard/pages/DashboardPage";
import { GroupsPage } from "./features/groups/pages";
import { ReservationsPage } from "./features/reservations/pages";
import { TemplatesPage } from "./features/templates/pages";

/**
 * AuthenticatedLayout Component
 * Combines ProtectedRoute + PrivateLayout to ensure Outlet works correctly
 */
const AuthenticatedLayout = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();
  const { t } = useTranslation("common");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t("loading.auth")}</p>
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
  const { t } = useTranslation("common");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t("loading.app")}</p>
        </div>
      </div>
    );
  }

  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
};

/**
 * NotFoundPage Component
 * Page 404 avec traductions i18n
 */
const NotFoundPage = () => {
  const { t } = useTranslation("common");
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <p className="text-xl text-gray-600 mt-4">{t("notFound.heading")}</p>
        <p className="text-sm text-gray-400 mt-2">{t("notFound.message")}</p>
        <a
          href="/dashboard"
          className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t("notFound.action")}
        </a>
      </div>
    </div>
  );
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
    <I18nextProvider i18n={i18n}>
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
            <Route path="/recovery-request" element={<RecoveryRequestPage />} />
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
              path="/my-courses"
              element={
                <RoleGuard
                  allowedRoles={[
                    UserRole.ADMIN,
                    UserRole.PROFESSOR,
                    UserRole.MEMBER,
                  ]}
                >
                  <MyCoursesPage />
                </RoleGuard>
              }
            />
            <Route
              path="/users/deleted"
              element={
                <RoleGuard allowedRoles={[UserRole.ADMIN]}>
                  <DeletedUsersPage />
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
              path="/statistics/*"
              element={
                <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.PROFESSOR]}>
                  <StatisticsRouter />
                </RoleGuard>
              }
            />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/family" element={<FamilyPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route
              path="/groups"
              element={
                <RoleGuard allowedRoles={[UserRole.ADMIN]}>
                  <GroupsPage />
                </RoleGuard>
              }
            />
            <Route
              path="/reservations"
              element={
                <RoleGuard
                  allowedRoles={[
                    UserRole.ADMIN,
                    UserRole.PROFESSOR,
                    UserRole.MEMBER,
                  ]}
                >
                  <ReservationsPage />
                </RoleGuard>
              }
            />
            <Route
              path="/templates"
              element={
                <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.PROFESSOR]}>
                  <TemplatesPage />
                </RoleGuard>
              }
            />
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
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </I18nextProvider>
  );
}

export default App;
