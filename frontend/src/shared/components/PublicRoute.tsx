/**
 * PublicRoute Component
 * Composant pour les routes publiques (login, register)
 * Redirige vers le dashboard si l'utilisateur est déjà authentifié
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * Route publique accessible uniquement si non authentifié
 * Redirige vers le dashboard si déjà connecté
 */
export const PublicRoute: React.FC<PublicRouteProps> = ({
  children,
  redirectTo = '/dashboard',
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Récupérer la destination de redirection depuis location.state
  const from = (location.state as any)?.from?.pathname || redirectTo;

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

  // Si authentifié, rediriger vers la page privée
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  // Afficher le contenu public
  return <>{children}</>;
};

export default PublicRoute;
