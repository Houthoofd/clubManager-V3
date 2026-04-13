/**
 * TabGroup Component - Examples
 *
 * Exemples d'utilisation du composant TabGroup dans différents contextes.
 * Ce fichier sert de documentation vivante et peut être utilisé pour tester
 * visuellement les différents variants.
 */

import { useState } from 'react';
import { TabGroup } from './TabGroup';

// ─── ICÔNES INLINE ───────────────────────────────────────────────────────────

function ShoppingCartIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

function TagIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  );
}

function TrendingUpIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}

function ChartBarIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function CubeIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

function CashIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

function InboxIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  );
}

function PaperAirplaneIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  );
}

function ClockIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function CheckCircleIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function RefreshIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

function CalendarIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function ArchiveIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    </svg>
  );
}

// ─── EXEMPLE 1: ONGLETS BASIQUES ────────────────────────────────────────────

export function BasicTabs() {
  const [activeTab, setActiveTab] = useState('products');

  const tabs = [
    { id: 'products', label: 'Produits' },
    { id: 'categories', label: 'Catégories' },
    { id: 'promotions', label: 'Promotions' },
  ];

  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">Onglets basiques</h2>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <TabGroup
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="p-6">
          {activeTab === 'products' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Produits</h3>
              <p className="text-sm text-gray-600">Liste de tous les produits disponibles dans votre boutique.</p>
            </div>
          )}
          {activeTab === 'categories' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Catégories</h3>
              <p className="text-sm text-gray-600">Organisez vos produits par catégories pour faciliter la navigation.</p>
            </div>
          )}
          {activeTab === 'promotions' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Promotions</h3>
              <p className="text-sm text-gray-600">Gérez vos offres spéciales et promotions en cours.</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Utilisation</h3>
        <p className="text-sm text-gray-600">
          Onglets simples sans icônes ni badges. Parfait pour une navigation basique entre 2-4 sections.
        </p>
      </div>
    </div>
  );
}

// ─── EXEMPLE 2: AVEC ICÔNES ──────────────────────────────────────────────────

export function WithIcons() {
  const [activeTab, setActiveTab] = useState('products');

  const tabs = [
    {
      id: 'products',
      label: 'Produits',
      icon: <ShoppingCartIcon className="h-4 w-4" />
    },
    {
      id: 'categories',
      label: 'Catégories',
      icon: <TagIcon className="h-4 w-4" />
    },
    {
      id: 'promotions',
      label: 'Promotions',
      icon: <TrendingUpIcon className="h-4 w-4" />
    },
  ];

  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">Onglets avec icônes</h2>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <TabGroup
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="p-6">
          {activeTab === 'products' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Produits</h3>
              <p className="text-sm text-gray-600">
                Les icônes rendent la navigation plus intuitive et visuellement attrayante.
              </p>
            </div>
          )}
          {activeTab === 'categories' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Catégories</h3>
              <p className="text-sm text-gray-600">
                Chaque icône doit être cohérente avec le contenu de l'onglet.
              </p>
            </div>
          )}
          {activeTab === 'promotions' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Promotions</h3>
              <p className="text-sm text-gray-600">
                Les icônes s'adaptent automatiquement à la couleur de l'onglet actif.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Utilisation</h3>
        <p className="text-sm text-gray-600">
          Ajoutez des icônes pour améliorer la reconnaissance visuelle. Les icônes doivent faire 16x16px (h-4 w-4).
        </p>
      </div>
    </div>
  );
}

// ─── EXEMPLE 3: AVEC BADGES ──────────────────────────────────────────────────

export function WithBadges() {
  const [activeTab, setActiveTab] = useState('pending');

  const tabs = [
    { id: 'pending', label: 'En attente', badge: 12 },
    { id: 'paid', label: 'Payés', badge: 45 },
    { id: 'refunded', label: 'Remboursés', badge: 3 },
  ];

  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">Onglets avec badges</h2>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <TabGroup
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="p-6">
          {activeTab === 'pending' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Paiements en attente (12)</h3>
              <p className="text-sm text-gray-600 mb-4">
                Ces paiements sont en cours de traitement et nécessitent votre attention.
              </p>
              <div className="text-xs text-gray-500">
                Les badges affichent le nombre d'éléments dans chaque catégorie.
              </div>
            </div>
          )}
          {activeTab === 'paid' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Paiements payés (45)</h3>
              <p className="text-sm text-gray-600 mb-4">
                Ces paiements ont été confirmés et validés avec succès.
              </p>
              <div className="text-xs text-gray-500">
                Le badge bleu indique l'onglet actif.
              </div>
            </div>
          )}
          {activeTab === 'refunded' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Paiements remboursés (3)</h3>
              <p className="text-sm text-gray-600 mb-4">
                Ces paiements ont été remboursés aux clients.
              </p>
              <div className="text-xs text-gray-500">
                Les badges à 0 ne sont pas affichés.
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Utilisation</h3>
        <p className="text-sm text-gray-600">
          Les badges sont parfaits pour afficher des compteurs (notifications, éléments en attente, etc.).
          Ils ne s'affichent que si la valeur est supérieure à 0.
        </p>
      </div>
    </div>
  );
}

// ─── EXEMPLE 4: AVEC ICÔNES ET BADGES ────────────────────────────────────────

export function WithIconsAndBadges() {
  const [activeTab, setActiveTab] = useState('inbox');

  const tabs = [
    {
      id: 'inbox',
      label: 'Reçus',
      icon: <InboxIcon className="h-4 w-4" />,
      badge: 8
    },
    {
      id: 'sent',
      label: 'Envoyés',
      icon: <PaperAirplaneIcon className="h-4 w-4" />,
      badge: 24
    },
  ];

  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">Onglets avec icônes ET badges</h2>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <TabGroup
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="p-6">
          {activeTab === 'inbox' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Messages reçus</h3>
              <p className="text-sm text-gray-600 mb-4">
                Vous avez 8 nouveaux messages non lus dans votre boîte de réception.
              </p>
              <div className="space-y-2">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">Nouveau message de Jean Dupont</p>
                  <p className="text-xs text-blue-700 mt-1">Il y a 5 minutes</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">Confirmation d'inscription</p>
                  <p className="text-xs text-gray-600 mt-1">Il y a 2 heures</p>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'sent' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Messages envoyés</h3>
              <p className="text-sm text-gray-600 mb-4">
                Vous avez envoyé 24 messages ce mois-ci.
              </p>
              <div className="space-y-2">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">À: Marie Martin</p>
                  <p className="text-xs text-gray-600 mt-1">Envoyé il y a 1 heure</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">À: Équipe de football</p>
                  <p className="text-xs text-gray-600 mt-1">Envoyé hier à 14:30</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Utilisation</h3>
        <p className="text-sm text-gray-600">
          Combinaison d'icônes et de badges pour une interface riche en informations.
          Idéal pour les messageries, notifications ou tableaux de bord.
        </p>
      </div>
    </div>
  );
}

// ─── EXEMPLE 5: ONGLETS SCROLLABLES ──────────────────────────────────────────

export function ScrollableTabs() {
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { id: 'all', label: 'Tous les produits', badge: 156 },
    { id: 'electronics', label: 'Électronique', badge: 23 },
    { id: 'clothing', label: 'Vêtements', badge: 45 },
    { id: 'food', label: 'Alimentation', badge: 34 },
    { id: 'books', label: 'Livres', badge: 18 },
    { id: 'sports', label: 'Sports', badge: 12 },
    { id: 'home', label: 'Maison & Jardin', badge: 28 },
    { id: 'toys', label: 'Jouets', badge: 15 },
    { id: 'beauty', label: 'Beauté & Santé', badge: 22 },
  ];

  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">Onglets avec scroll horizontal</h2>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <TabGroup
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          scrollable
        />

        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Catégorie : {tabs.find(t => t.id === activeTab)?.label}
          </h3>
          <p className="text-sm text-gray-600">
            {tabs.find(t => t.id === activeTab)?.badge} produits disponibles dans cette catégorie.
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Utilisation</h3>
        <p className="text-sm text-gray-600 mb-2">
          Quand vous avez beaucoup d'onglets (6+), utilisez <code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">scrollable=true</code> pour activer le scroll horizontal.
        </p>
        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
          <li>Sur mobile : les utilisateurs peuvent faire défiler horizontalement</li>
          <li>Sur desktop : un scroll subtil s'affiche au survol</li>
          <li>La scrollbar est masquée par défaut pour un design épuré</li>
        </ul>
      </div>
    </div>
  );
}

// ─── EXEMPLE 6: STOREPAGE (6 ONGLETS) ────────────────────────────────────────

export function StorePageExample() {
  const [activeTab, setActiveTab] = useState('products');

  const tabs = [
    {
      id: 'products',
      label: 'Produits',
      icon: <ShoppingCartIcon className="h-4 w-4" />,
      badge: 48
    },
    {
      id: 'categories',
      label: 'Catégories',
      icon: <TagIcon className="h-4 w-4" />,
      badge: 8
    },
    {
      id: 'stock',
      label: 'Stock',
      icon: <CubeIcon className="h-4 w-4" />,
      badge: 3
    },
    {
      id: 'promotions',
      label: 'Promotions',
      icon: <TrendingUpIcon className="h-4 w-4" />,
      badge: 5
    },
    {
      id: 'sales',
      label: 'Ventes',
      icon: <CashIcon className="h-4 w-4" />,
      badge: 127
    },
    {
      id: 'stats',
      label: 'Statistiques',
      icon: <ChartBarIcon className="h-4 w-4" />
    },
  ];

  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">Store Page - Reproduction complète</h2>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <TabGroup
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="p-6">
          {activeTab === 'products' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Gestion des produits</h3>
              <p className="text-sm text-gray-600 mb-4">
                48 produits disponibles dans votre boutique.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-900">48</p>
                  <p className="text-xs text-blue-700">Produits actifs</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-900">12</p>
                  <p className="text-xs text-green-700">Nouveautés ce mois</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg">
                  <p className="text-2xl font-bold text-amber-900">3</p>
                  <p className="text-xs text-amber-700">En rupture de stock</p>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'categories' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Catégories de produits</h3>
              <p className="text-sm text-gray-600">
                Organisez vos 48 produits en 8 catégories distinctes.
              </p>
            </div>
          )}
          {activeTab === 'stock' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Gestion du stock</h3>
              <p className="text-sm text-gray-600 mb-2">
                3 produits nécessitent votre attention immédiate.
              </p>
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-medium text-red-900">⚠️ Alertes de stock bas</p>
                <p className="text-xs text-red-700 mt-1">3 produits doivent être réapprovisionnés</p>
              </div>
            </div>
          )}
          {activeTab === 'promotions' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Promotions actives</h3>
              <p className="text-sm text-gray-600">
                5 promotions en cours sur différents produits.
              </p>
            </div>
          )}
          {activeTab === 'sales' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Historique des ventes</h3>
              <p className="text-sm text-gray-600">
                127 ventes réalisées ce mois-ci.
              </p>
            </div>
          )}
          {activeTab === 'stats' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Statistiques de la boutique</h3>
              <p className="text-sm text-gray-600">
                Vue d'ensemble des performances de votre boutique.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">À propos</h3>
        <p className="text-sm text-gray-600">
          Cet exemple reproduit la structure de la page StorePage avec ses 6 onglets principaux.
          Chaque onglet combine icônes et badges pour une navigation riche et informative.
        </p>
      </div>
    </div>
  );
}

// ─── EXEMPLE 7: COURSESPAGE (3 ONGLETS) ──────────────────────────────────────

export function CoursesPageExample() {
  const [activeTab, setActiveTab] = useState('active');

  const tabs = [
    {
      id: 'active',
      label: 'Cours actifs',
      icon: <ClockIcon className="h-4 w-4" />,
      badge: 15
    },
    {
      id: 'archived',
      label: 'Cours archivés',
      icon: <ArchiveIcon className="h-4 w-4" />,
      badge: 42
    },
    {
      id: 'planning',
      label: 'Planning',
      icon: <CalendarIcon className="h-4 w-4" />
    },
  ];

  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">Courses Page - 3 onglets</h2>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <TabGroup
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="p-6">
          {activeTab === 'active' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cours en cours</h3>
              <p className="text-sm text-gray-600 mb-4">15 cours actifs cette saison.</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-green-900">Football U12</p>
                    <p className="text-xs text-green-700">Mercredi 16h-18h</p>
                  </div>
                  <span className="px-2 py-1 bg-green-200 text-green-800 rounded text-xs font-medium">Actif</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-green-900">Basketball U15</p>
                    <p className="text-xs text-green-700">Samedi 10h-12h</p>
                  </div>
                  <span className="px-2 py-1 bg-green-200 text-green-800 rounded text-xs font-medium">Actif</span>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'archived' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cours archivés</h3>
              <p className="text-sm text-gray-600">42 cours terminés et archivés.</p>
            </div>
          )}
          {activeTab === 'planning' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Planning des cours</h3>
              <p className="text-sm text-gray-600">Vue d'ensemble de l'emploi du temps des cours.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── EXEMPLE 8: PAYMENTSPAGE (3 ONGLETS) ─────────────────────────────────────

export function PaymentsPageExample() {
  const [activeTab, setActiveTab] = useState('pending');

  const tabs = [
    {
      id: 'pending',
      label: 'En attente',
      icon: <ClockIcon className="h-4 w-4" />,
      badge: 12
    },
    {
      id: 'paid',
      label: 'Payés',
      icon: <CheckCircleIcon className="h-4 w-4" />,
      badge: 156
    },
    {
      id: 'refunded',
      label: 'Remboursés',
      icon: <RefreshIcon className="h-4 w-4" />,
      badge: 3
    },
  ];

  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">Payments Page - 3 onglets</h2>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <TabGroup
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="p-6">
          {activeTab === 'pending' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Paiements en attente</h3>
              <p className="text-sm text-gray-600 mb-4">12 paiements en attente de confirmation.</p>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm font-medium text-amber-900">Action requise</p>
                <p className="text-xs text-amber-700 mt-1">Vérifiez et validez les paiements en attente</p>
              </div>
            </div>
          )}
          {activeTab === 'paid' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Paiements confirmés</h3>
              <p className="text-sm text-gray-600">156 paiements validés et confirmés.</p>
            </div>
          )}
          {activeTab === 'refunded' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Paiements remboursés</h3>
              <p className="text-sm text-gray-600">3 paiements ont été remboursés aux clients.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── COMPOSANT PRINCIPAL ─────────────────────────────────────────────────────

export function TabGroupExamples() {
  return (
    <div className="space-y-12 pb-12">
      <BasicTabs />
      <WithIcons />
      <WithBadges />
      <WithIconsAndBadges />
      <ScrollableTabs />
      <StorePageExample />
      <CoursesPageExample />
      <PaymentsPageExample />
    </div>
  );
}

export default TabGroupExamples;
