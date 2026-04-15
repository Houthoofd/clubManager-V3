/**
 * RoleGuard Component
 * Protège les routes selon le rôle de l'utilisateur
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '@clubmanager/types';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

/**
 * Composant de garde de route basé sur les rôles
 * À utiliser APRÈS AuthenticatedLayout (l'utilisateur est déjà authentifié)
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  redirectTo = '/dashboard',
}) => {
  const { user } = useAuth();
  const location = useLocation();

  const userRole = (user?.role_app as UserRole | undefined) ?? UserRole.MEMBER;

  if (!allowedRoles.includes(userRole)) {
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location, reason: 'INSUFFICIENT_ROLE' }}
        replace
      />
    );
  }

  return <>{children}</>;
};

export default RoleGuard;
