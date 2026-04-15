/**
 * Card Component - Examples
 *
 * Exemples d'utilisation du composant Card dans différents contextes.
 * Ce fichier sert de documentation vivante et peut être utilisé pour tester
 * visuellement les différents variants.
 */

import { Card } from '../Card';

// ─── EXEMPLE 1: VARIANTS DE PADDING ──────────────────────────────────────────

export function CardPaddingVariants() {
  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">Variants de Padding</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Compact */}
        <Card variant="compact">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Compact (p-4)</h3>
          <p className="text-sm text-gray-600">
            Utilisé dans les grilles d'articles, listes de membres, etc.
          </p>
        </Card>

        {/* Standard */}
        <Card variant="standard">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Standard (p-6)</h3>
          <p className="text-sm text-gray-600">
            Défaut pour les cartes de pages principales.
          </p>
        </Card>

        {/* Emphasis */}
        <Card variant="emphasis">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Emphasis (p-8)</h3>
          <p className="text-sm text-gray-600">
            Pour les pages auth, landing, mise en avant.
          </p>
        </Card>
      </div>
    </div>
  );
}

// ─── EXEMPLE 2: CARTE AVEC HEADER/BODY/FOOTER ────────────────────────────────

export function CardWithStructure() {
  return (
    <div className="p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Structure Complète</h2>

      <Card variant="standard" className="max-w-2xl">
        <Card.Header>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Titre de la carte</h3>
              <p className="text-sm text-gray-500 mt-1">Sous-titre descriptif</p>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </Card.Header>

        <Card.Body>
          <p className="text-sm text-gray-600 mb-4">
            Contenu principal de la carte. Vous pouvez mettre n'importe quel contenu ici :
            formulaires, listes, tableaux, etc.
          </p>
          <div className="space-y-2">
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Information 1</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Information 2</span>
            </div>
          </div>
        </Card.Body>

        <Card.Footer>
          <div className="flex items-center justify-end gap-3">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              Annuler
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
              Confirmer
            </button>
          </div>
        </Card.Footer>
      </Card>
    </div>
  );
}

// ─── EXEMPLE 3: CARTES AVEC HOVER ─────────────────────────────────────────────

export function CardWithHover() {
  return (
    <div className="p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Cartes Interactives (Hover)</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['Article 1', 'Article 2', 'Article 3'].map((title, idx) => (
          <Card key={idx} variant="compact" hover className="cursor-pointer">
            <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mb-3" />
            <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-500">Prix: 25.00 €</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ring-1 ring-green-200 mt-2">
              En stock
            </span>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── EXEMPLE 4: GRILLE DE MEMBRES ─────────────────────────────────────────────

export function FamilyMembersGrid() {
  const members = [
    { name: 'Jean Dupont', role: 'Parent', email: 'jean@example.com', status: 'active' },
    { name: 'Marie Dupont', role: 'Parent', email: 'marie@example.com', status: 'active' },
    { name: 'Lucas Dupont', role: 'Enfant', email: 'lucas@example.com', status: 'pending' },
  ];

  return (
    <div className="p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Grille de Membres</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member, idx) => (
          <Card key={idx} variant="compact" hover>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                {member.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 truncate">{member.name}</h3>
                <p className="text-xs text-gray-500">{member.role}</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-2">{member.email}</p>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ${
              member.status === 'active'
                ? 'bg-green-100 text-green-800 ring-green-200'
                : 'bg-yellow-100 text-yellow-800 ring-yellow-200'
            }`}>
              {member.status === 'active' ? 'Actif' : 'En attente'}
            </span>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── EXEMPLE 5: CARTE DE STATISTIQUE ──────────────────────────────────────────

export function StatsCards() {
  const stats = [
    { label: 'Total Membres', value: '254', change: '+12%', trend: 'up' },
    { label: 'Cours Actifs', value: '18', change: '+3', trend: 'up' },
    { label: 'Revenus du mois', value: '12,450 €', change: '-5%', trend: 'down' },
    { label: 'Taux de présence', value: '87%', change: '+2%', trend: 'up' },
  ];

  return (
    <div className="p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Cartes de Statistiques</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <Card key={idx} variant="compact">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <span className={`text-xs font-medium ${
                stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── EXEMPLE 6: CARTE FORMULAIRE ──────────────────────────────────────────────

export function FormCard() {
  return (
    <div className="p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Carte Formulaire</h2>

      <Card variant="standard" className="max-w-2xl mx-auto">
        <Card.Header>
          <h3 className="text-xl font-semibold text-gray-900">Nouveau Membre</h3>
          <p className="text-sm text-gray-500 mt-1">Remplissez les informations ci-dessous</p>
        </Card.Header>

        <Card.Body>
          <form className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nom complet
              </label>
              <input
                type="text"
                placeholder="Jean Dupont"
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                placeholder="jean.dupont@example.com"
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Rôle
              </label>
              <select className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                <option>Parent</option>
                <option>Enfant</option>
                <option>Professeur</option>
              </select>
            </div>
          </form>
        </Card.Body>

        <Card.Footer>
          <div className="flex items-center justify-end gap-3">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              Annuler
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors">
              Créer le membre
            </button>
          </div>
        </Card.Footer>
      </Card>
    </div>
  );
}

// ─── EXEMPLE 7: CARTE SANS PADDING (CUSTOM) ───────────────────────────────────

export function CustomCard() {
  return (
    <div className="p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Carte Sans Padding (Custom)</h2>

      <Card noPadding className="max-w-md overflow-hidden">
        <img
          src="https://via.placeholder.com/400x200"
          alt="Placeholder"
          className="w-full h-48 object-cover"
        />
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Titre de l'Article</h3>
          <p className="text-sm text-gray-600 mb-4">
            Une carte sans padding permet de contrôler précisément l'espacement
            pour des layouts personnalisés comme celui-ci avec une image full-width.
          </p>
          <button className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
            En savoir plus
          </button>
        </div>
      </Card>
    </div>
  );
}

// ─── EXEMPLE 8: DIFFÉRENTS SHADOWS ────────────────────────────────────────────

export function CardShadowVariants() {
  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">Variants de Shadow</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card shadow="sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Shadow SM</h3>
          <p className="text-sm text-gray-600">Shadow par défaut, subtil et léger.</p>
        </Card>

        <Card shadow="lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Shadow LG</h3>
          <p className="text-sm text-gray-600">Shadow plus prononcé pour mise en avant.</p>
        </Card>

        <Card shadow="2xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Shadow 2XL</h3>
          <p className="text-sm text-gray-600">Shadow importante, pour pages auth.</p>
        </Card>
      </div>
    </div>
  );
}

// ─── EXEMPLE 9: LISTE COMPACTE ────────────────────────────────────────────────

export function CompactList() {
  const items = [
    { id: 1, title: 'Cours de Piano', time: '14h00 - 15h00', status: 'confirmed' },
    { id: 2, title: 'Cours de Guitare', time: '15h00 - 16h00', status: 'pending' },
    { id: 3, title: 'Cours de Violon', time: '16h00 - 17h00', status: 'cancelled' },
  ];

  return (
    <div className="p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Liste Compacte</h2>

      <div className="space-y-3 max-w-2xl">
        {items.map((item) => (
          <Card key={item.id} variant="compact" hover className="cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900">{item.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{item.time}</p>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ${
                item.status === 'confirmed'
                  ? 'bg-green-100 text-green-800 ring-green-200'
                  : item.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800 ring-yellow-200'
                  : 'bg-red-100 text-red-800 ring-red-200'
              }`}>
                {item.status === 'confirmed' ? 'Confirmé' : item.status === 'pending' ? 'En attente' : 'Annulé'}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── COMPOSANT DÉMO GLOBAL ────────────────────────────────────────────────────

export default function CardExamples() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 space-y-12">
        <CardPaddingVariants />
        <CardWithStructure />
        <CardWithHover />
        <FamilyMembersGrid />
        <StatsCards />
        <FormCard />
        <CustomCard />
        <CardShadowVariants />
        <CompactList />
      </div>
    </div>
  );
}
