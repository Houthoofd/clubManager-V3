import { Request, Response, NextFunction } from 'express';
import { tenantContext } from '../../core/context/tenantContext';

/**
 * Middleware qui intercepte la requête HTTP et initialise le contexte multi-tenant
 * (AsyncLocalStorage) pour toute la durée de vie de la requête.
 */
export const tenantMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // 1. Déterminer si la route est spécifiquement destinée à la base master
  // Par exemple : l'inscription d'un nouveau club, le webhook Stripe, 
  // ou une requête super-admin.
  const isMasterRoute = req.path.startsWith('/api/onboarding') || req.path.startsWith('/api/webhooks');

  // 2. Extraire l'identification du tenant
  // L'idéal est de le récupérer depuis le JWT décodé (si l'utilisateur est connecté)
  // req.user est généralement défini par le middleware d'authentification précédent.
  // Sinon, on peut chercher un header spécifique 'x-tenant-id' ou 'x-club-slug'
  let dbName: string | null = null;
  
  const user = (req as any).user;
  if (user && user.tenantDbName) {
    dbName = user.tenantDbName;
  } else if (req.headers['x-tenant-db']) {
    dbName = req.headers['x-tenant-db'] as string;
  }

  // 3. Initialiser le contexte asynchrone
  const contextData = {
    tenantId: null, // À enrichir si besoin avec l'ID numérique
    dbName: dbName,
    isMaster: isMasterRoute || (!dbName && !user), // Fallback sur master si non identifié
  };

  // 4. Exécuter la suite de la requête (next) DANS ce contexte
  tenantContext.run(contextData, () => {
    next();
  });
};
