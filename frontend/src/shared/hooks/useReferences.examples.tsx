/**
 * useReferences Hook - Exemples d'utilisation
 *
 * Ce fichier contient des exemples pratiques d'utilisation du hook useReferences
 * pour remplacer les valeurs hardcodées par des données dynamiques de la DB.
 */

import React from "react";
import { useForm } from "react-hook-form";
import {
  useReferences,
  useMethodesPaiement,
  useStatutsCommande,
  useTypesCours,
  useTransitionsStatutCommande,
  useRolesFamiliaux,
  useRoles,
  useStatutsPaiement,
  findByCode,
  getActivesSorted,
  type StatutPaiement,
  isTransitionAllowed,
  getAvailableTransitions,
} from "./useReferences";
import { Badge } from "../components/Badge/Badge";

// ═══════════════════════════════════════════════════════════════════════════
// EXEMPLE 1 : Select simple avec méthodes de paiement
// ═══════════════════════════════════════════════════════════════════════════

export function PaymentMethodSelect() {
  const methodes = useMethodesPaiement();
  const { isLoading, isError } = useReferences();

  if (isLoading) return <div>Chargement...</div>;
  if (isError) return <div>Erreur de chargement</div>;

  // Filtrer uniquement les méthodes actives et les trier
  const methodesActives = getActivesSorted(methodes);

  return (
    <select className="form-select">
      <option value="">Sélectionner une méthode</option>
      {methodesActives.map((methode) => (
        <option key={methode.code} value={methode.code}>
          {methode.nom}
        </option>
      ))}
    </select>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXEMPLE 2 : Utilisation avec toutes les références (bulk)
// ═══════════════════════════════════════════════════════════════════════════

export function PaymentFormWithReferences() {
  const { data: refs, isLoading } = useReferences();

  if (isLoading) return <div>Chargement...</div>;

  return (
    <form>
      {/* Méthode de paiement */}
      <div>
        <label>Méthode de paiement</label>
        <select name="methode_paiement">
          {getActivesSorted(refs?.methodes_paiement).map((m) => (
            <option key={m.code} value={m.code}>
              {m.nom}
            </option>
          ))}
        </select>
      </div>

      {/* Statut */}
      <div>
        <label>Statut</label>
        <select name="statut">
          {getActivesSorted(refs?.statuts_paiement).map((s) => (
            <option key={s.code} value={s.code}>
              {s.nom}
            </option>
          ))}
        </select>
      </div>
    </form>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXEMPLE 3 : Badge dynamique avec couleur depuis DB
// ═══════════════════════════════════════════════════════════════════════════

interface OrderStatusBadgeProps {
  statutCode: string;
}

export function DynamicOrderStatusBadge({ statutCode }: OrderStatusBadgeProps) {
  const statuts = useStatutsCommande();

  const statut = findByCode(statuts, statutCode);

  if (!statut) {
    return <Badge variant="neutral">Inconnu</Badge>;
  }

  return (
    <Badge variant={statut.couleur as any} dot>
      {statut.nom}
    </Badge>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXEMPLE 4 : Filtre avec compteurs
// ═══════════════════════════════════════════════════════════════════════════

interface Order {
  id: number;
  statut_code: string;
  total: number;
}

interface OrderFilterProps {
  orders: Order[];
  selectedStatut: string;
  onStatutChange: (statut: string) => void;
}

export function OrderFilter({
  orders,
  selectedStatut,
  onStatutChange,
}: OrderFilterProps) {
  const statuts = useStatutsCommande();

  // Compter les commandes par statut
  const counts = statuts.reduce(
    (acc, statut) => {
      acc[statut.code] = orders.filter(
        (o) => o.statut_code === statut.code,
      ).length;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="flex gap-2">
      <button
        onClick={() => onStatutChange("")}
        className={selectedStatut === "" ? "active" : ""}
      >
        Tous ({orders.length})
      </button>

      {getActivesSorted(statuts).map((statut) => (
        <button
          key={statut.code}
          onClick={() => onStatutChange(statut.code)}
          className={selectedStatut === statut.code ? "active" : ""}
        >
          {statut.nom} ({counts?.[statut.code] || 0})
        </button>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXEMPLE 5 : Gestion des transitions de statut
// ═══════════════════════════════════════════════════════════════════════════

interface OrderActionsProps {
  order: {
    id: number;
    statut_id: number;
    statut_code: string;
  };
  userRole: string;
  onChangeStatut: (newStatutId: number) => void;
}

export function OrderActions({
  order,
  userRole,
  onChangeStatut,
}: OrderActionsProps) {
  const statuts = useStatutsCommande();
  const { data: transitions } = useTransitionsStatutCommande();

  // Récupérer les statuts de destination possibles
  const availableStatuts = getAvailableTransitions(
    transitions,
    statuts,
    order.statut_id,
    userRole,
  );

  if (availableStatuts.length === 0) {
    return <p className="text-gray-500">Aucune action disponible</p>;
  }

  return (
    <div className="flex gap-2">
      {availableStatuts.map((statut) => (
        <button
          key={statut.id}
          onClick={() => onChangeStatut(statut.id)}
          className={`btn btn-${statut.couleur}`}
        >
          Marquer comme {statut.nom}
        </button>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXEMPLE 6 : Vérification de permission pour transition
// ═══════════════════════════════════════════════════════════════════════════

export function useCanChangeOrderStatus(
  currentStatutId: number,
  targetStatutId: number,
  userRole: string,
) {
  const { data: transitions } = useTransitionsStatutCommande();

  return isTransitionAllowed(
    transitions,
    currentStatutId,
    targetStatutId,
    userRole,
  );
}

// Utilisation
export function OrderDetailActions() {
  const order = { id: 1, statut_id: 1, statut_code: "en_attente" };
  const userRole = "admin";

  const canMarkAsPaid = useCanChangeOrderStatus(order.statut_id, 3, userRole); // 3 = payee

  return (
    <div>
      {canMarkAsPaid && (
        <button onClick={() => console.log("Marquer comme payée")}>
          Marquer comme payée
        </button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXEMPLE 7 : Formulaire avec react-hook-form
// ═══════════════════════════════════════════════════════════════════════════

interface CourseFormData {
  type_cours_id: number;
  jour_semaine: number;
  heure_debut: string;
  heure_fin: string;
}

export function CourseForm() {
  const { data: refs, isLoading } = useReferences();
  const { register, handleSubmit } = useForm<CourseFormData>();

  if (isLoading) return <div>Chargement...</div>;

  const onSubmit = (data: CourseFormData) => {
    console.log("Données du formulaire:", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Type de cours */}
      <div>
        <label htmlFor="type_cours_id" className="block text-sm font-medium">
          Type de cours
        </label>
        <select
          id="type_cours_id"
          {...register("type_cours_id", {
            required: true,
            valueAsNumber: true,
          })}
          className="mt-1 block w-full rounded-md border-gray-300"
        >
          <option value="">Sélectionner un type</option>
          {getActivesSorted(refs?.types_cours).map((type) => (
            <option key={type.id} value={type.id}>
              {type.nom}
              {type.duree_defaut_minutes &&
                ` (${type.duree_defaut_minutes} min)`}
            </option>
          ))}
        </select>
      </div>

      {/* Jour de la semaine */}
      <div>
        <label htmlFor="jour_semaine" className="block text-sm font-medium">
          Jour de la semaine
        </label>
        <select
          id="jour_semaine"
          {...register("jour_semaine", { required: true, valueAsNumber: true })}
          className="mt-1 block w-full rounded-md border-gray-300"
        >
          {refs?.jours_semaine?.map((jour) => (
            <option key={jour.id} value={jour.id}>
              {jour.nom_complet}
            </option>
          ))}
        </select>
      </div>

      {/* Heures */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="heure_debut" className="block text-sm font-medium">
            Heure de début
          </label>
          <input
            type="time"
            id="heure_debut"
            {...register("heure_debut", { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300"
          />
        </div>
        <div>
          <label htmlFor="heure_fin" className="block text-sm font-medium">
            Heure de fin
          </label>
          <input
            type="time"
            id="heure_fin"
            {...register("heure_fin", { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300"
          />
        </div>
      </div>

      <button type="submit" className="btn btn-primary">
        Enregistrer
      </button>
    </form>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXEMPLE 8 : Composant de radio buttons avec rôles familiaux
// ═══════════════════════════════════════════════════════════════════════════

interface FamilyRoleRadioProps {
  selectedRole: string;
  onChange: (role: string) => void;
}

export function FamilyRoleRadio({
  selectedRole,
  onChange,
}: FamilyRoleRadioProps) {
  const { data: roles } = useRolesFamiliaux();

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Rôle dans la famille
      </label>
      <div className="space-y-2">
        {getActivesSorted(roles ?? []).map((role) => (
          <label
            key={role.code}
            className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
          >
            <input
              type="radio"
              name="role"
              value={role.code}
              checked={selectedRole === role.code}
              onChange={(e) => onChange(e.target.value)}
              className="h-4 w-4 text-blue-600"
            />
            <div className="flex items-center gap-2">
              <span
                className={`inline-block h-3 w-3 rounded-full ${role.couleur_avatar}`}
              />
              <span className="font-medium">{role.nom}</span>
              {role.description && (
                <span className="text-sm text-gray-500">
                  — {role.description}
                </span>
              )}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXEMPLE 9 : Liste déroulante avec recherche
// ═══════════════════════════════════════════════════════════════════════════

export function CourseTypeSelectWithSearch() {
  const typesCours = useTypesCours();
  const { isLoading } = useReferences();
  const [search, setSearch] = React.useState("");

  if (isLoading) return <div>Chargement...</div>;

  const filtered = getActivesSorted(typesCours).filter((type) =>
    type.nom.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <input
        type="text"
        placeholder="Rechercher un type de cours..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-2 w-full px-3 py-2 border rounded-lg"
      />
      <select className="w-full px-3 py-2 border rounded-lg">
        <option value="">Sélectionner</option>
        {filtered.map((type) => (
          <option key={type.code} value={type.code}>
            {type.nom}
          </option>
        ))}
      </select>
      {filtered.length === 0 && (
        <p className="mt-2 text-sm text-gray-500">Aucun résultat</p>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXEMPLE 10 : Affichage conditionnel selon les permissions
// ═══════════════════════════════════════════════════════════════════════════

interface UserActionsProps {
  user: {
    id: number;
    role_code: string;
  };
  currentUserRole: string;
}

export function UserActions({ user, currentUserRole }: UserActionsProps) {
  const { data: roles } = useRoles();

  const userRole = findByCode(roles ?? [], user.role_code);
  const currentRole = findByCode(roles ?? [], currentUserRole);

  // Vérifier si l'utilisateur actuel a un niveau d'accès supérieur
  const canModify =
    currentRole && userRole && currentRole.niveau_acces > userRole.niveau_acces;

  return (
    <div>
      {canModify ? (
        <button className="btn btn-primary">Modifier l'utilisateur</button>
      ) : (
        <p className="text-gray-500">
          Vous n'avez pas les permissions nécessaires
        </p>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXEMPLE 11 : Statistiques avec filtrage par statut
// ═══════════════════════════════════════════════════════════════════════════

interface Payment {
  id: number;
  montant: number;
  statut_code: string;
}

interface PaymentStatsProps {
  payments: Payment[];
}

export function PaymentStats({ payments }: PaymentStatsProps) {
  const statuts = useStatutsPaiement();

  const stats = statuts.map((statut) => {
    const paymentsForStatut = payments.filter(
      (p) => p.statut_code === statut.code,
    );
    const total = paymentsForStatut.reduce((sum, p) => sum + p.montant, 0);

    return {
      statut,
      count: paymentsForStatut.length,
      total,
    };
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map(
        ({
          statut,
          count,
          total,
        }: {
          statut: StatutPaiement;
          count: number;
          total: number;
        }) => (
          <div key={statut.code} className="p-4 border rounded-lg">
            <DynamicOrderStatusBadge statutCode={statut.code} />
            <p className="mt-2 text-2xl font-bold">{count}</p>
            <p className="text-sm text-gray-600">
              {total.toFixed(2)} €{" "}
              {statut.compte_dans_revenus && "(comptabilisé)"}
            </p>
          </div>
        ),
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXEMPLE 12 : Hook personnalisé pour logique métier
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook personnalisé qui combine plusieurs références
 * et ajoute de la logique métier
 */
export function useOrderWorkflow(currentStatutCode: string) {
  const statuts = useStatutsCommande();
  const { data: transitions } = useTransitionsStatutCommande();

  const currentStatut = findByCode(statuts, currentStatutCode);

  const canModify = currentStatut?.peut_modifier ?? false;
  const canCancel = currentStatut?.peut_annuler ?? false;
  const isFinal = currentStatut?.est_final ?? false;

  return {
    currentStatut,
    canModify,
    canCancel,
    isFinal,
    transitions,
  };
}

// Utilisation
export function OrderWorkflowExample() {
  const order = { id: 1, statut_code: "payee" };
  const { canModify, canCancel, isFinal } = useOrderWorkflow(order.statut_code);

  return (
    <div>
      {canModify && <button>Modifier la commande</button>}
      {canCancel && <button>Annuler la commande</button>}
      {isFinal && <p>Cette commande ne peut plus être modifiée</p>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXEMPLE 13 : Composant de badge avec icône dynamique
// ═══════════════════════════════════════════════════════════════════════════

interface PaymentMethodBadgeProps {
  methodeCode: string;
}

export function DynamicPaymentMethodBadge({
  methodeCode,
}: PaymentMethodBadgeProps) {
  const methodes = useMethodesPaiement();

  const methode = findByCode(methodes, methodeCode);

  if (!methode) {
    return <Badge variant="neutral">Inconnu</Badge>;
  }

  // L'icône devrait être chargée dynamiquement selon le nom
  // Pour l'exemple, on utilise juste le variant de couleur
  return <Badge variant={methode.couleur as any}>{methode.nom}</Badge>;
}

// ═══════════════════════════════════════════════════════════════════════════
// RÉSUMÉ DES BONNES PRATIQUES
// ═══════════════════════════════════════════════════════════════════════════

/*
 * BONNES PRATIQUES:
 *
 * 1. Toujours gérer le cas de chargement (isLoading)
 * 2. Toujours gérer les erreurs
 * 3. Utiliser getActivesSorted() pour filtrer et trier automatiquement
 * 4. Utiliser findByCode() pour rechercher par code plutôt que par ID
 * 5. Mettre en cache avec staleTime approprié (1h par défaut)
 * 6. Utiliser le hook spécifique si un seul type de ref est nécessaire
 * 7. Utiliser useReferences() pour charger toutes les refs en une fois
 * 8. Créer des hooks personnalisés pour la logique métier complexe
 * 9. Utiliser les helpers (isTransitionAllowed, getAvailableTransitions)
 * 10. Préférer le code (string) à l'ID (number) pour la flexibilité
 */
