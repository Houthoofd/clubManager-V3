/**
 * Credentials des comptes de test E2E.
 * Utilisés par seed-e2e.ts (création) et globalSetup.ts (login).
 *
 * ⚠️  NOTES DE COMPATIBILITÉ AVEC LE SCHÉMA DB :
 *
 * 1. FORMAT userId : Le schéma `utilisateurs` possède un CHECK constraint
 *    `CHECK (userId REGEXP '^U-[0-9]{4}-[0-9]{4}$')` ET le LoginUseCase
 *    valide ce même format avant toute requête DB.
 *    → Pour les tests E2E, la BD `clubmanager_test` doit soit :
 *      a) Utiliser les userId au format U-9999-XXXX (ex: U-9999-0001)
 *      b) Avoir ce CHECK constraint désactivé/supprimé pour l'env de test
 *    → Les userId ci-dessous sont adaptés en conséquence dans seed-e2e.ts.
 *
 * 2. VALEURS role_app : L'ENUM MySQL réel est ('admin', 'member', 'professor').
 *    Les valeurs 'membre' et 'professeur' sont les libellés FR de l'interface,
 *    pas les valeurs ENUM DB. Le seed-e2e.ts fait le mapping automatiquement.
 */

export const E2E_ADMIN = {
  userId: 'e2e_admin',
  password: 'Admin@E2E2024!',
  email: 'e2e_admin@test.local',
  role_app: 'admin' as const,
};

export const E2E_MEMBER = {
  userId: 'e2e_member',
  password: 'Member@E2E2024!',
  email: 'e2e_member@test.local',
  role_app: 'membre' as const,
};

export const E2E_PROFESSOR = {
  userId: 'e2e_prof',
  password: 'Prof@E2E2024!',
  email: 'e2e_prof@test.local',
  role_app: 'professeur' as const,
};

export const E2E_ACCOUNTS = [E2E_ADMIN, E2E_MEMBER, E2E_PROFESSOR] as const;
export type E2ERole = 'admin' | 'membre' | 'professeur';

/**
 * Mapping des rôles E2E vers les valeurs ENUM MySQL réelles.
 * L'ENUM `role_app` en DB est : ('admin', 'member', 'professor')
 */
export const ROLE_DB_MAP: Record<E2ERole, 'admin' | 'member' | 'professor'> = {
  admin:      'admin',
  membre:     'member',
  professeur: 'professor',
};

/**
 * userId au format U-YYYY-XXXX requis par le CHECK constraint MySQL
 * et la validation du LoginUseCase.
 * Année 9999 = comptes de test E2E facilement identifiables.
 */
export const E2E_DB_USER_IDS = {
  admin:     'U-9999-0001',
  member:    'U-9999-0002',
  professor: 'U-9999-0003',
} as const;
