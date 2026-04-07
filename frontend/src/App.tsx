/**
 * App.tsx
 * Application principale avec routing et layouts
 */

import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { useAuthStore } from "./shared/stores/authStore";

// Layouts
import { PublicLayout } from "./layouts/PublicLayout";
import { PrivateLayout } from "./layouts/PrivateLayout";

// Route Guards
import { PublicRoute } from "./shared/components/PublicRoute";
import { ProtectedRoute } from "./shared/components/ProtectedRoute";

// Auth Pages
import { LoginPage } from "./features/auth/pages/LoginPage";
import { RegisterPage } from "./features/auth/pages/RegisterPage";

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

// Other placeholder pages
const CoursesPage = () => (
  <div className="bg-white rounded-lg shadow p-6">
    <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
  </div>
);

const UsersPage = () => (
  <div className="bg-white rounded-lg shadow p-6">
    <h1 className="text-2xl font-bold text-gray-900">Users</h1>
  </div>
);

const PaymentsPage = () => (
  <div className="bg-white rounded-lg shadow p-6">
    <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
  </div>
);

const StorePage = () => (
  <div className="bg-white rounded-lg shadow p-6">
    <h1 className="text-2xl font-bold text-gray-900">Store</h1>
  </div>
);

const MessagesPage = () => (
  <div className="bg-white rounded-lg shadow p-6">
    <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
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

const SettingsPage = () => (
  <div className="bg-white rounded-lg shadow p-6">
    <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
  </div>
);

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
          {/* Redirect root to dashboard or login */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

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
          </Route>

          {/* Private Routes */}
          <Route
            element={
              <ProtectedRoute>
                <PrivateLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/store" element={<StorePage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
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
