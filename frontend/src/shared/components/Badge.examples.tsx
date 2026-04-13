/**
 * Badge Component - Examples
 *
 * Exemples d'utilisation du composant Badge dans différents contextes.
 * Ce fichier sert de documentation vivante et peut être utilisé pour tester
 * visuellement les différents variants.
 */

import { useState } from 'react';
import { Badge } from './Badge';

// ─── ICÔNES INLINE ───────────────────────────────────────────────────────────

function CheckIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function XCircleIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function StarIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}

function BellIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}

// ─── EXEMPLE 1: VARIANTS ─────────────────────────────────────────────────────

export function BadgeVariants() {
  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">Variants de Badges</h2>

      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="success">Success</Badge>
        <Badge variant="warning">Warning</Badge>
        <Badge variant="danger">Danger</Badge>
        <Badge variant="info">Info</Badge>
        <Badge variant="neutral">Neutral</Badge>
        <Badge variant="purple">Purple</Badge>
        <Badge variant="orange">Orange</Badge>
      </div>

      <div className="bg-white p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Usage Sémantique</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li><strong>Success (Vert):</strong> Validé, actif, en stock, payé</li>
          <li><strong>Warning (Jaune):</strong> En attente, stock bas, action requise</li>
          <li><strong>Danger (Rouge):</strong> Erreur, annulé, rupture de stock</li>
          <li><strong>Info (Bleu):</strong> Information, en cours de traitement</li>
          <li><strong>Neutral (Gris):</strong> Défaut, inactif, autre</li>
          <li><strong>Purple (Violet):</strong> Actions spéciales, remboursement</li>
          <li><strong>Orange:</strong> Urgent, critique, attention</li>
        </ul>
      </div>
    </div>
  );
}

// ─── EXEMPLE 2: TAILLES ──────────────────────────────────────────────────────

export function BadgeSizes() {
  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">Tailles de Badges</h2>

      <div className="flex flex-wrap items-center gap-3">
        <Badge size="sm" variant="info">Small</Badge>
        <Badge size="md" variant="info">Medium (Défaut)</Badge>
        <Badge size="lg" variant="info">Large</Badge>
      </div>

      <div className="bg-white p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Dimensions</h3>
        <ul className="text-xs font-mono text-gray-600 space-y-1">
          <li><strong>sm:</strong> px-2 py-0.5 text-xs</li>
          <li><strong>md:</strong> px-2.5 py-0.5 text-xs (défaut)</li>
          <li><strong>lg:</strong> px-3 py-1 text-sm</li>
        </ul>
      </div>
    </div>
  );
}

// ─── EXEMPLE 3: BADGES AVEC DOT ──────────────────────────────────────────────

export function BadgesWithDot() {
  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">Badges avec Dot Indicator</h2>

      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="success" dot>En ligne</Badge>
        <Badge variant="danger" dot>Hors ligne</Badge>
        <Badge variant="warning" dot>Occupé</Badge>
        <Badge variant="neutral" dot>Absent</Badge>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Usage:</strong> Le dot indicator (●) est idéal pour les statuts en temps réel
          comme la présence utilisateur, l'état de connexion, ou les notifications.
        </p>
      </div>
    </div>
  );
}

// ─── EXEMPLE 4: BADGES AVEC ICÔNES ───────────────────────────────────────────

export function BadgesWithIcons() {
  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">Badges avec Icônes</h2>

      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="success" icon={<CheckIcon />}>
          Vérifié
        </Badge>
        <Badge variant="danger" icon={<XCircleIcon />}>
          Erreur
        </Badge>
        <Badge variant="warning" icon={<BellIcon />}>
          3 alertes
        </Badge>
        <Badge variant="info" icon={<StarIcon />}>
          Premium
        </Badge>
      </div>

      <div className="bg-white p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Note</h3>
        <p className="text-sm text-gray-600">
          Les icônes doivent avoir une classe <code className="bg-gray-100 px-1 rounded">h-3.5 w-3.5</code> pour
          s'aligner correctement avec le texte du badge.
        </p>
      </div>
    </div>
  );
}

// ─── EXEMPLE 5: BADGES SUPPRIMABLES ──────────────────────────────────────────

export function RemovableBadges() {
  const [tags, setTags] = useState(['React', 'TypeScript', 'Tailwind', 'Node.js', 'PostgreSQL']);

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">Badges Supprimables (Tags)</h2>

      <div className="bg-white p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Technologies utilisées:</h3>
        <div className="flex flex-wrap gap-2">
          {tags.length > 0 ? (
            tags.map((tag) => (
              <Badge
                key={tag}
                variant="info"
                removable
                onRemove={() => removeTag(tag)}
              >
                {tag}
              </Badge>
            ))
          ) : (
            <p className="text-sm text-gray-500">Aucun tag sélectionné</p>
          )}
        </div>
        {tags.length > 0 && (
          <button
            onClick={() => setTags(['React', 'TypeScript', 'Tailwind', 'Node.js', 'PostgreSQL'])}
            className="mt-3 text-xs text-blue-600 hover:text-blue-700"
          >
            Réinitialiser
          </button>
        )}
      </div>
    </div>
  );
}

// ─── EXEMPLE 6: BADGE.STATUS ─────────────────────────────────────────────────

export function StatusBadgeExample() {
  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">Badge.Status (Statuts Génériques)</h2>

      <div className="flex flex-wrap items-center gap-3">
        <Badge.Status status="active" />
        <Badge.Status status="inactive" />
        <Badge.Status status="pending" />
        <Badge.Status status="error" />
      </div>

      <div className="bg-white p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Avec labels personnalisés:</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Badge.Status status="active">En ligne</Badge.Status>
          <Badge.Status status="inactive">Hors ligne</Badge.Status>
          <Badge.Status status="pending">En révision</Badge.Status>
          <Badge.Status status="error">Échec</Badge.Status>
        </div>
      </div>
    </div>
  );
}

// ─── EXEMPLE 7: BADGE.STOCK ──────────────────────────────────────────────────

export function StockBadgeExample() {
  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">Badge.Stock (Gestion de Stock)</h2>

      <div className="bg-white p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Produits:</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Piano</span>
            <Badge.Stock quantity={50} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Guitare</span>
            <Badge.Stock quantity={8} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Violon</span>
            <Badge.Stock quantity={0} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Flûte</span>
            <Badge.Stock quantity={15} threshold={20} />
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Automatique:</strong> Le badge change de couleur selon la quantité.
          Vert (&gt;10), Orange (≤10), Rouge (0). Seuil personnalisable avec <code className="bg-blue-100 px-1 rounded">threshold</code>.
        </p>
      </div>
    </div>
  );
}

// ─── EXEMPLE 8: BADGE.ROLE ───────────────────────────────────────────────────

export function RoleBadgeExample() {
  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">Badge.Role (Rôles Utilisateurs)</h2>

      <div className="flex flex-wrap items-center gap-3">
        <Badge.Role role="admin" />
        <Badge.Role role="professeur" />
        <Badge.Role role="parent" />
        <Badge.Role role="eleve" />
      </div>

      <div className="bg-white p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Liste de membres:</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700 w-40">Jean Dupont</span>
            <Badge.Role role="admin" size="sm" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700 w-40">Marie Martin</span>
            <Badge.Role role="professeur" size="sm" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700 w-40">Paul Durand</span>
            <Badge.Role role="parent" size="sm" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700 w-40">Sophie Petit</span>
            <Badge.Role role="eleve" size="sm" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── EXEMPLE 9: BADGE.PAYMENTSTATUS ──────────────────────────────────────────

export function PaymentStatusBadgeExample() {
  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">Badge.PaymentStatus (Statuts de Paiement)</h2>

      <div className="flex flex-wrap items-center gap-3">
        <Badge.PaymentStatus status="paid" />
        <Badge.PaymentStatus status="pending" />
        <Badge.PaymentStatus status="failed" />
        <Badge.PaymentStatus status="refunded" />
      </div>

      <div className="bg-white p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Transactions récentes:</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Cours de Piano - 50€</span>
            <Badge.PaymentStatus status="paid" size="sm" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Cours de Guitare - 45€</span>
            <Badge.PaymentStatus status="pending" size="sm" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Cours de Violon - 60€</span>
            <Badge.PaymentStatus status="failed" size="sm" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Cours de Batterie - 55€</span>
            <Badge.PaymentStatus status="refunded" size="sm" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── EXEMPLE 10: BADGE.ORDERSTATUS ───────────────────────────────────────────

export function OrderStatusBadgeExample() {
  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">Badge.OrderStatus (Statuts de Commande)</h2>

      <div className="flex flex-wrap items-center gap-3">
        <Badge.OrderStatus status="pending" />
        <Badge.OrderStatus status="processing" />
        <Badge.OrderStatus status="shipped" />
        <Badge.OrderStatus status="delivered" />
        <Badge.OrderStatus status="cancelled" />
      </div>

      <div className="bg-white p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Commandes:</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Commande #1234</span>
            <Badge.OrderStatus status="delivered" size="sm" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Commande #1235</span>
            <Badge.OrderStatus status="shipped" size="sm" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Commande #1236</span>
            <Badge.OrderStatus status="processing" size="sm" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Commande #1237</span>
            <Badge.OrderStatus status="pending" size="sm" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Commande #1238</span>
            <Badge.OrderStatus status="cancelled" size="sm" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── EXEMPLE 11: USAGE PRATIQUE (GRILLE DE PRODUITS) ─────────────────────────

export function ProductGridExample() {
  const products = [
    { id: 1, name: 'Piano Yamaha', price: 2499, quantity: 5, category: 'Clavier' },
    { id: 2, name: 'Guitare Fender', price: 899, quantity: 12, category: 'Cordes' },
    { id: 3, name: 'Violon Stradivarius', price: 1599, quantity: 0, category: 'Cordes' },
    { id: 4, name: 'Batterie Pearl', price: 1299, quantity: 3, category: 'Percussion' },
  ];

  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">Usage Pratique - Grille de Produits</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-base font-semibold text-gray-900">{product.name}</h3>
              <Badge variant="info" size="sm">{product.category}</Badge>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-3">{product.price}€</p>
            <div className="flex items-center justify-between">
              <Badge.Stock quantity={product.quantity} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── EXEMPLE 12: FILTRES ACTIFS ──────────────────────────────────────────────

export function ActiveFiltersExample() {
  const [filters, setFilters] = useState([
    { id: 1, type: 'role', label: 'Professeur' },
    { id: 2, type: 'status', label: 'Actif' },
    { id: 3, type: 'location', label: 'Paris' },
  ]);

  const removeFilter = (id: number) => {
    setFilters(filters.filter(f => f.id !== id));
  };

  const resetFilters = () => {
    setFilters([
      { id: 1, type: 'role', label: 'Professeur' },
      { id: 2, type: 'status', label: 'Actif' },
      { id: 3, type: 'location', label: 'Paris' },
    ]);
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">Filtres Actifs</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">Filtres appliqués:</h3>
          {filters.length > 0 && (
            <button
              onClick={resetFilters}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              Réinitialiser
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.length > 0 ? (
            filters.map((filter) => (
              <Badge
                key={filter.id}
                variant="info"
                size="sm"
                removable
                onRemove={() => removeFilter(filter.id)}
              >
                {filter.label}
              </Badge>
            ))
          ) : (
            <p className="text-sm text-gray-500">Aucun filtre appliqué</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── EXEMPLE 13: TABLEAU AVEC BADGES ─────────────────────────────────────────

export function TableWithBadgesExample() {
  const users = [
    { id: 1, name: 'Jean Dupont', email: 'jean@example.com', role: 'admin', status: 'active' },
    { id: 2, name: 'Marie Martin', email: 'marie@example.com', role: 'professeur', status: 'active' },
    { id: 3, name: 'Paul Durand', email: 'paul@example.com', role: 'parent', status: 'inactive' },
    { id: 4, name: 'Sophie Petit', email: 'sophie@example.com', role: 'eleve', status: 'pending' },
  ];

  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">Tableau avec Badges</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{user.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                <td className="px-4 py-3">
                  <Badge.Role role={user.role as any} size="sm" />
                </td>
                <td className="px-4 py-3">
                  <Badge.Status status={user.status as any} size="sm" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── COMPOSANT DÉMO GLOBAL ───────────────────────────────────────────────────

export default function BadgeExamples() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 space-y-12">
        <div className="px-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Badge Component - Exemples
          </h1>
          <p className="text-lg text-gray-600">
            Galerie complète de tous les variants, tailles et usages du composant Badge
          </p>
        </div>

        <BadgeVariants />
        <BadgeSizes />
        <BadgesWithDot />
        <BadgesWithIcons />
        <RemovableBadges />
        <StatusBadgeExample />
        <StockBadgeExample />
        <RoleBadgeExample />
        <PaymentStatusBadgeExample />
        <OrderStatusBadgeExample />
        <ProductGridExample />
        <ActiveFiltersExample />
        <TableWithBadgesExample />
      </div>
    </div>
  );
}
