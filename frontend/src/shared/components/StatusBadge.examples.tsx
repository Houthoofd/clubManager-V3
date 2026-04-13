/**
 * StatusBadge - Exemples d'utilisation
 *
 * Exemples pratiques du composant StatusBadge pour afficher
 * des badges de statut colorés avec configurations prédéfinies.
 */

import StatusBadge from "./StatusBadge";
import Card from "./Card";

// ─── EXEMPLE 1 : TOUS LES STATUTS ────────────────────────────────────────────

export function AllStatuses() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Tous les statuts disponibles</h3>
      <div className="flex flex-wrap gap-3">
        <StatusBadge status="active" />
        <StatusBadge status="inactive" />
        <StatusBadge status="pending" />
        <StatusBadge status="success" />
        <StatusBadge status="error" />
        <StatusBadge status="warning" />
        <StatusBadge status="archived" />
      </div>
    </div>
  );
}

// ─── EXEMPLE 2 : AVEC POINTS COLORÉS ─────────────────────────────────────────

export function WithDots() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Statuts avec points colorés</h3>
      <p className="text-sm text-gray-600">
        Le point coloré améliore la distinction visuelle
      </p>
      <div className="flex flex-wrap gap-3">
        <StatusBadge status="active" showDot />
        <StatusBadge status="inactive" showDot />
        <StatusBadge status="pending" showDot />
        <StatusBadge status="success" showDot />
        <StatusBadge status="error" showDot />
        <StatusBadge status="warning" showDot />
        <StatusBadge status="archived" showDot />
      </div>
    </div>
  );
}

// ─── EXEMPLE 3 : TOUTES LES TAILLES ──────────────────────────────────────────

export function AllSizes() {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Tailles disponibles</h3>

      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Small (sm)</p>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status="active" size="sm" showDot />
            <StatusBadge status="pending" size="sm" showDot />
            <StatusBadge status="error" size="sm" showDot />
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            Medium (md) - Défaut
          </p>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status="active" size="md" showDot />
            <StatusBadge status="pending" size="md" showDot />
            <StatusBadge status="error" size="md" showDot />
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Large (lg)</p>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status="active" size="lg" showDot />
            <StatusBadge status="pending" size="lg" showDot />
            <StatusBadge status="error" size="lg" showDot />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── EXEMPLE 4 : LABELS PERSONNALISÉS ────────────────────────────────────────

export function CustomLabels() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Labels personnalisés</h3>
      <p className="text-sm text-gray-600">
        Override des labels par défaut pour des contextes spécifiques
      </p>
      <div className="flex flex-wrap gap-3">
        <StatusBadge status="active" label="En ligne" showDot />
        <StatusBadge status="inactive" label="Hors ligne" showDot />
        <StatusBadge status="pending" label="En cours de traitement" showDot />
        <StatusBadge status="success" label="Terminé avec succès" showDot />
        <StatusBadge status="error" label="Échec critique" showDot />
        <StatusBadge status="warning" label="Nécessite attention" showDot />
        <StatusBadge status="archived" label="Supprimé" showDot />
      </div>
    </div>
  );
}

// ─── EXEMPLE 5 : STATUTS DE PAIEMENT ─────────────────────────────────────────

export function PaymentStatuses() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Statuts de paiement</h3>
      <p className="text-sm text-gray-600">
        Utilisation pour gérer les états de paiement
      </p>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <StatusBadge status="success" label="Payé" showDot />
          <span className="text-sm text-gray-600">
            Paiement validé et encaissé
          </span>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status="pending" label="En attente" showDot />
          <span className="text-sm text-gray-600">
            En cours de traitement bancaire
          </span>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status="error" label="Échoué" showDot />
          <span className="text-sm text-gray-600">
            Paiement refusé ou annulé
          </span>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status="warning" label="Partiel" showDot />
          <span className="text-sm text-gray-600">Paiement incomplet</span>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status="archived" label="Remboursé" showDot />
          <span className="text-sm text-gray-600">
            Montant remboursé au client
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── EXEMPLE 6 : STATUTS DE COURS ────────────────────────────────────────────

export function CourseStatuses() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Statuts de cours</h3>
      <p className="text-sm text-gray-600">
        États des cours dans le système de gestion
      </p>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <StatusBadge status="active" label="En cours" showDot />
          <span className="text-sm text-gray-600">
            Cours actuellement en session
          </span>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status="pending" label="Programmé" showDot />
          <span className="text-sm text-gray-600">
            Cours à venir (non commencé)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status="archived" label="Terminé" showDot />
          <span className="text-sm text-gray-600">
            Cours complété et archivé
          </span>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status="inactive" label="Annulé" showDot />
          <span className="text-sm text-gray-600">
            Cours annulé ou suspendu
          </span>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status="warning" label="Places limitées" showDot />
          <span className="text-sm text-gray-600">Moins de 3 places</span>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status="success" label="Complet" showDot />
          <span className="text-sm text-gray-600">
            Toutes les places réservées
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── EXEMPLE 7 : STATUTS UTILISATEUR ─────────────────────────────────────────

export function UserStatuses() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Statuts utilisateur</h3>
      <p className="text-sm text-gray-600">
        États des comptes membres et professeurs
      </p>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <StatusBadge status="active" showDot />
          <span className="text-sm text-gray-600">
            Compte actif et en règle
          </span>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status="inactive" label="Suspendu" showDot />
          <span className="text-sm text-gray-600">
            Compte temporairement désactivé
          </span>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status="archived" showDot />
          <span className="text-sm text-gray-600">
            Compte archivé définitivement
          </span>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge
            status="pending"
            label="En attente de validation"
            showDot
          />
          <span className="text-sm text-gray-600">Inscription non validée</span>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status="warning" label="Cotisation expirée" showDot />
          <span className="text-sm text-gray-600">Renouvellement requis</span>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status="error" label="Bloqué" showDot />
          <span className="text-sm text-gray-600">
            Accès refusé pour impayé
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── EXEMPLE 8 : DANS UN TABLEAU ─────────────────────────────────────────────

export function InTable() {
  const members = [
    {
      name: "Jean Dupont",
      status: "active" as const,
      payment: "success" as const,
      paymentLabel: "Payé",
    },
    {
      name: "Marie Martin",
      status: "active" as const,
      payment: "pending" as const,
      paymentLabel: "En attente",
    },
    {
      name: "Paul Durand",
      status: "inactive" as const,
      payment: "error" as const,
      paymentLabel: "Échoué",
    },
    {
      name: "Sophie Bernard",
      status: "pending" as const,
      payment: "pending" as const,
      paymentLabel: "En attente",
    },
    {
      name: "Luc Petit",
      status: "archived" as const,
      payment: "success" as const,
      paymentLabel: "Remboursé",
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Utilisation dans un tableau</h3>
      <p className="text-sm text-gray-600">
        Badges de taille sm pour une meilleure densité
      </p>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nom
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Paiement
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {members.map((member, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {member.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={member.status} size="sm" showDot />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge
                    status={member.payment}
                    label={member.paymentLabel}
                    size="sm"
                    showDot
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── EXEMPLE 9 : DANS UNE CARD ───────────────────────────────────────────────

export function InCard() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Utilisation dans des Cards</h3>
      <p className="text-sm text-gray-600">
        Affichage de statuts dans des cartes d'information
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1 : Cours actif */}
        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Cours de Tennis</h4>
              <StatusBadge status="active" showDot />
            </div>
          </Card.Header>
          <Card.Body>
            <p className="text-sm text-gray-600 mb-3">
              Cours tous les mercredis de 14h à 16h
            </p>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status="success" label="15 inscrits" size="sm" />
              <StatusBadge status="warning" label="3 places" size="sm" />
            </div>
          </Card.Body>
        </Card>

        {/* Card 2 : Cours à venir */}
        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Cours de Natation</h4>
              <StatusBadge status="pending" label="Programmé" showDot />
            </div>
          </Card.Header>
          <Card.Body>
            <p className="text-sm text-gray-600 mb-3">
              Début prévu le 15 mars 2024
            </p>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status="pending" label="8 pré-inscrits" size="sm" />
              <StatusBadge status="success" label="12 places" size="sm" />
            </div>
          </Card.Body>
        </Card>

        {/* Card 3 : Cours terminé */}
        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Cours de Yoga</h4>
              <StatusBadge status="archived" label="Terminé" showDot />
            </div>
          </Card.Header>
          <Card.Body>
            <p className="text-sm text-gray-600 mb-3">
              Session terminée le 30 janvier 2024
            </p>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status="success" label="20 participants" size="sm" />
              <StatusBadge status="archived" label="Archivé" size="sm" />
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}

// ─── EXEMPLE 10 : COMBINAISONS COMPLEXES ─────────────────────────────────────

export function ComplexCombinations() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Combinaisons complexes</h3>
      <p className="text-sm text-gray-600">
        Multiples badges pour représenter différents aspects d'une entité
      </p>

      <div className="space-y-4">
        {/* Utilisateur avec plusieurs statuts */}
        <Card>
          <Card.Body>
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">Marie Durand</h4>
                <p className="text-sm text-gray-600">marie.durand@email.com</p>
              </div>
              <div className="flex flex-wrap gap-2 justify-end">
                <StatusBadge status="active" showDot size="sm" />
                <StatusBadge
                  status="success"
                  label="Membre VIP"
                  showDot
                  size="sm"
                />
                <StatusBadge
                  status="warning"
                  label="Cotisation expire dans 10j"
                  size="sm"
                />
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Commande avec plusieurs informations */}
        <Card>
          <Card.Body>
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">Commande #12345</h4>
                <p className="text-sm text-gray-600">
                  Passée le 15 février 2024
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-end">
                <StatusBadge status="success" label="Payée" showDot size="sm" />
                <StatusBadge
                  status="pending"
                  label="En préparation"
                  showDot
                  size="sm"
                />
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Cours avec indicateurs multiples */}
        <Card>
          <Card.Body>
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">
                  Stage d'été intensif
                </h4>
                <p className="text-sm text-gray-600">Du 1er au 31 juillet</p>
              </div>
              <div className="flex flex-wrap gap-2 justify-end">
                <StatusBadge status="active" showDot size="sm" />
                <StatusBadge status="error" label="Complet" showDot size="sm" />
                <StatusBadge
                  status="success"
                  label="25/25 inscrits"
                  size="sm"
                />
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}

// ─── EXEMPLE 11 : COMPARAISON AVEC/SANS DOT ──────────────────────────────────

export function WithAndWithoutDot() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Comparaison avec/sans point</h3>
      <p className="text-sm text-gray-600">
        Le point améliore la lisibilité et l'accessibilité visuelle
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">Sans point</h4>
          <div className="flex flex-col gap-2">
            <StatusBadge status="active" />
            <StatusBadge status="pending" />
            <StatusBadge status="error" />
            <StatusBadge status="warning" />
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">Avec point</h4>
          <div className="flex flex-col gap-2">
            <StatusBadge status="active" showDot />
            <StatusBadge status="pending" showDot />
            <StatusBadge status="error" showDot />
            <StatusBadge status="warning" showDot />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── EXPORT PAR DÉFAUT ───────────────────────────────────────────────────────

export default function StatusBadgeExamples() {
  return (
    <div className="space-y-12 p-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">StatusBadge - Exemples</h1>
        <p className="text-gray-600">
          Composant spécialisé pour afficher des badges de statut avec
          configurations prédéfinies
        </p>
      </div>

      <AllStatuses />
      <WithDots />
      <AllSizes />
      <CustomLabels />
      <PaymentStatuses />
      <CourseStatuses />
      <UserStatuses />
      <InTable />
      <InCard />
      <ComplexCombinations />
      <WithAndWithoutDot />
    </div>
  );
}
