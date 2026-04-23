/**
 * useReferences Hook
 *
 * Hook centralisé pour charger toutes les valeurs de référence depuis la DB.
 * Utilise React Query pour le caching et la synchronisation.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { data: refs, isLoading } = useReferences();
 *
 *   return (
 *     <select>
 *       {refs?.methodes_paiement?.map(m => (
 *         <option key={m.code} value={m.code}>{m.nom}</option>
 *       ))}
 *     </select>
 *   );
 * }
 * ```
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { api } from '../api/client';

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface BaseReference {
  id: number;
  code: string;
  nom: string;
  description?: string;
  couleur?: string;
  ordre: number;
  actif: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MethodePaiement extends BaseReference {
  icone?: string; // Nom du composant icône (CreditCardIcon, BanknotesIcon, etc.)
}

export interface StatutCommande extends BaseReference {
  est_final: boolean;
  peut_modifier: boolean;
  peut_annuler: boolean;
}

export interface TypeCours extends BaseReference {
  duree_defaut_minutes?: number;
  capacite_max?: number;
  niveau?: string;
}

export interface StatutPaiement extends BaseReference {
  compte_dans_revenus: boolean;
  est_final: boolean;
}

export interface Role extends BaseReference {
  niveau_acces: number;
  permissions?: Record<string, boolean>;
}

export interface StatutUtilisateur extends BaseReference {
  peut_se_connecter: boolean;
}

export interface RoleFamilial extends BaseReference {
  couleur_avatar?: string;
  couleur_badge?: string;
}

export interface StatutPresence extends BaseReference {
  compte_comme_present: boolean;
}

export interface Genre {
  id: number;
  code: string;
  nom: string;
  ordre: number;
}

export interface JourSemaine {
  id: number; // 1=Lundi, 7=Dimanche (ISO 8601)
  code: string; // MON, TUE, etc.
  nom_court: string; // Lun, Mar, etc.
  nom_complet: string; // Lundi, Mardi, etc.
  ordre_affichage: number;
}

export interface ReferencesData {
  methodes_paiement: MethodePaiement[];
  statuts_commande: StatutCommande[];
  types_cours: TypeCours[];
  statuts_paiement: StatutPaiement[];
  roles: Role[];
  statuts_utilisateur: StatutUtilisateur[];
  roles_familiaux: RoleFamilial[];
  statuts_presence: StatutPresence[];
  genres: Genre[];
  jours_semaine?: JourSemaine[];
}

export interface TransitionStatutCommande {
  id: number;
  statut_depart_id: number;
  statut_arrivee_id: number;
  role_requis?: string;
  description?: string;
}

// ─── API CALL ────────────────────────────────────────────────────────────────

async function fetchReferences(): Promise<ReferencesData> {
  const response = await api.get<ReferencesData>('/api/references');
  return response.data;
}

async function fetchReferenceType<T extends keyof ReferencesData>(
  type: T
): Promise<ReferencesData[T]> {
  const response = await api.get<ReferencesData[T]>(`/api/references/${type}`);
  return response.data;
}

async function fetchTransitionsStatutCommande(): Promise<TransitionStatutCommande[]> {
  const response = await api.get<TransitionStatutCommande[]>(
    '/api/references/transitions_statut_commande'
  );
  return response.data;
}

// ─── HOOKS ───────────────────────────────────────────────────────────────────

/**
 * Hook principal pour charger toutes les références
 * Cache les données pendant 1 heure
 */
export function useReferences(): UseQueryResult<ReferencesData> {
  return useQuery({
    queryKey: ['references'],
    queryFn: fetchReferences,
    staleTime: 1000 * 60 * 60, // 1 heure
    cacheTime: 1000 * 60 * 60 * 2, // 2 heures
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

/**
 * Hook pour charger un type de référence spécifique
 * Utile si vous n'avez besoin que d'un seul type
 */
export function useReferenceType<T extends keyof ReferencesData>(
  type: T
): UseQueryResult<ReferencesData[T]> {
  return useQuery({
    queryKey: ['references', type],
    queryFn: () => fetchReferenceType(type),
    staleTime: 1000 * 60 * 60,
    cacheTime: 1000 * 60 * 60 * 2,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

// ─── HOOKS SPÉCIFIQUES PAR TYPE ─────────────────────────────────────────────

export function useMethodesPaiement() {
  return useReferenceType('methodes_paiement');
}

export function useStatutsCommande() {
  return useReferenceType('statuts_commande');
}

export function useTypesCours() {
  return useReferenceType('types_cours');
}

export function useStatutsPaiement() {
  return useReferenceType('statuts_paiement');
}

export function useRoles() {
  return useReferenceType('roles');
}

export function useStatutsUtilisateur() {
  return useReferenceType('statuts_utilisateur');
}

export function useRolesFamiliaux() {
  return useReferenceType('roles_familiaux');
}

export function useStatutsPresence() {
  return useReferenceType('statuts_presence');
}

export function useGenres() {
  return useReferenceType('genres');
}

export function useJoursSemaine() {
  return useReferenceType('jours_semaine');
}

/**
 * Hook pour les transitions de statut de commande
 */
export function useTransitionsStatutCommande(): UseQueryResult<TransitionStatutCommande[]> {
  return useQuery({
    queryKey: ['references', 'transitions_statut_commande'],
    queryFn: fetchTransitionsStatutCommande,
    staleTime: 1000 * 60 * 60,
    cacheTime: 1000 * 60 * 60 * 2,
    refetchOnWindowFocus: false,
  });
}

// ─── HELPER FUNCTIONS ────────────────────────────────────────────────────────

/**
 * Trouve une référence par son code
 */
export function findByCode<T extends BaseReference>(
  items: T[] | undefined,
  code: string
): T | undefined {
  return items?.find((item) => item.code === code);
}

/**
 * Filtre les références actives
 */
export function getActives<T extends BaseReference>(items: T[] | undefined): T[] {
  return items?.filter((item) => item.actif) || [];
}

/**
 * Trie les références par ordre
 */
export function sortByOrdre<T extends BaseReference>(items: T[] | undefined): T[] {
  return [...(items || [])].sort((a, b) => a.ordre - b.ordre);
}

/**
 * Récupère les références actives triées par ordre
 */
export function getActivesSorted<T extends BaseReference>(items: T[] | undefined): T[] {
  return sortByOrdre(getActives(items));
}

/**
 * Vérifie si une transition de statut est autorisée
 */
export function isTransitionAllowed(
  transitions: TransitionStatutCommande[] | undefined,
  statutDepartId: number,
  statutArriveeId: number,
  userRole?: string
): boolean {
  if (!transitions) return false;

  const transition = transitions.find(
    (t) =>
      t.statut_depart_id === statutDepartId &&
      t.statut_arrivee_id === statutArriveeId
  );

  if (!transition) return false;

  // Si aucun rôle requis, la transition est autorisée pour tous
  if (!transition.role_requis) return true;

  // Sinon, vérifier que l'utilisateur a le bon rôle
  return userRole === transition.role_requis || userRole === 'admin';
}

/**
 * Récupère les statuts de destination possibles depuis un statut donné
 */
export function getAvailableTransitions(
  transitions: TransitionStatutCommande[] | undefined,
  statuts: StatutCommande[] | undefined,
  currentStatutId: number,
  userRole?: string
): StatutCommande[] {
  if (!transitions || !statuts) return [];

  const availableTransitionIds = transitions
    .filter((t) => {
      if (t.statut_depart_id !== currentStatutId) return false;
      if (!t.role_requis) return true;
      return userRole === t.role_requis || userRole === 'admin';
    })
    .map((t) => t.statut_arrivee_id);

  return statuts
    .filter((s) => availableTransitionIds.includes(s.id))
    .sort((a, b) => a.ordre - b.ordre);
}

/**
 * Récupère le label d'un jour de la semaine par son ID
 */
export function getJourSemaineLabel(
  jours: JourSemaine[] | undefined,
  jourId: number,
  format: 'court' | 'complet' = 'complet'
): string {
  const jour = jours?.find((j) => j.id === jourId);
  if (!jour) return '';
  return format === 'court' ? jour.nom_court : jour.nom_complet;
}

// ─── EXPORTS ─────────────────────────────────────────────────────────────────

export default useReferences;
