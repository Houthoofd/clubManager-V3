/**
 * ProtectedRoute Component
 * Composant pour protéger les routes nécessitant une authentification
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireEmailVerified?: boolean;
}

/**
 * Route protégée nécessitant une authentification
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/login',
  requireEmailVerified = false,
}) => {
  const { isAuthenticated, isLoading, user, isEmailVerified } = useAuth();
  const location = useLocation();

  // Afficher un loader pendant la vérification
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

  // Rediriger vers login si non authentifié
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Vérifier si l'email doit être vérifié
  if (requireEmailVerified && !isEmailVerified()) {
    return (
      <Navigate to="/verify-email" state={{ from: location }} replace />
    );
  }

  // Afficher le contenu protégé
  return <>{children}</>;
};

export default ProtectedRoute;
