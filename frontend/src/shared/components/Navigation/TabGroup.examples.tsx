/**
 * TabGroup Examples
 *
 * Exemples d'utilisation du composant TabGroup avec les différents variants :
 * - "default" : Style classique avec border-b-2
 * - "highlight" : Style moderne avec background sur onglet actif + scroll buttons
 *
 * @author Club Manager Team
 */

import { useState } from "react";
import { TabGroup } from "./TabGroup";

// ─── ICÔNES SVG (POUR LES EXEMPLES) ──────────────────────────────────────────

function ShoppingCartIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-5 h-5"
    >
      <path d="M1 1.75A.75.75 0 011.75 1h1.628a1.75 1.75 0 011.734 1.51L5.18 3a65.25 65.25 0 0113.36 1.412.75.75 0 01.58.875 48.645 48.645 0 01-1.618 6.2.75.75 0 01-.712.513H6a2.503 2.503 0 00-2.292 1.5H17.25a.75.75 0 010 1.5H2.76a.75.75 0 01-.748-.807 4.002 4.002 0 012.716-3.486L3.626 2.716a.25.25 0 00-.248-.216H1.75A.75.75 0 011 1.75zM6 17.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15.5 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-5 h-5"
    >
      <path
        fillRule="evenodd"
        d="M5.5 3A2.5 2.5 0 003 5.5v2.879a2.5 2.5 0 00.732 1.767l6.5 6.5a2.5 2.5 0 003.536 0l2.878-2.878a2.5 2.5 0 000-3.536l-6.5-6.5A2.5 2.5 0 008.38 3H5.5zM6 7a1 1 0 100-2 1 1 0 000 2z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function CogIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-5 h-5"
    >
      <path
        fillRule="evenodd"
        d="M7.84 1.804A1 1 0 018.82 1h2.36a1 1 0 01.98.804l.331 1.652a6.993 6.993 0 011.929 1.115l1.598-.54a1 1 0 011.186.447l1.18 2.044a1 1 0 01-.205 1.251l-1.267 1.113a7.047 7.047 0 010 2.228l1.267 1.113a1 1 0 01.206 1.25l-1.18 2.045a1 1 0 01-1.187.447l-1.598-.54a6.993 6.993 0 01-1.929 1.115l-.33 1.652a1 1 0 01-.98.804H8.82a1 1 0 01-.98-.804l-.331-1.652a6.993 6.993 0 01-1.929-1.115l-1.598.54a1 1 0 01-1.186-.447l-1.18-2.044a1 1 0 01.205-1.251l1.267-1.114a7.05 7.05 0 010-2.227L1.821 7.773a1 1 0 01-.206-1.25l1.18-2.045a1 1 0 011.187-.447l1.598.54A6.993 6.993 0 017.51 3.456l.33-1.652zM10 13a3 3 0 100-6 3 3 0 000 6z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-5 h-5"
    >
      <path
        fillRule="evenodd"
        d="M9.661 2.237a.531.531 0 01.678 0 11.947 11.947 0 007.078 2.749.5.5 0 01.479.425c.069.52.104 1.05.104 1.59 0 5.162-3.26 9.563-7.834 11.256a.48.48 0 01-.332 0C5.26 16.564 2 12.163 2 7c0-.538.035-1.069.104-1.589a.5.5 0 01.48-.425 11.947 11.947 0 007.077-2.75zm4.196 5.954a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-5 h-5"
    >
      <path
        fillRule="evenodd"
        d="M10 2a6 6 0 00-6 6c0 1.887-.454 3.665-1.257 5.234a.75.75 0 00.515 1.076 32.91 32.91 0 003.256.508 3.5 3.5 0 006.972 0 32.903 32.903 0 003.256-.508.75.75 0 00.515-1.076A11.448 11.448 0 0116 8a6 6 0 00-6-6zM8.05 14.943a33.54 33.54 0 003.9 0 2 2 0 01-3.9 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-5 h-5"
    >
      <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
    </svg>
  );
}

function CreditCardIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-5 h-5"
    >
      <path
        fillRule="evenodd"
        d="M2.5 4A1.5 1.5 0 001 5.5V6h18v-.5A1.5 1.5 0 0017.5 4h-15zM19 8.5H1v6A1.5 1.5 0 002.5 16h15a1.5 1.5 0 001.5-1.5v-6zM3 13.25a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zm4.75-.75a.75.75 0 000 1.5h3.5a.75.75 0 000-1.5h-3.5z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-5 h-5"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function DocumentTextIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-5 h-5"
    >
      <path
        fillRule="evenodd"
        d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zm2.25 8.5a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 3a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ChartBarIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-5 h-5"
    >
      <path d="M15.5 2A1.5 1.5 0 0014 3.5v13a1.5 1.5 0 001.5 1.5h1a1.5 1.5 0 001.5-1.5v-13A1.5 1.5 0 0016.5 2h-1zM9.5 6A1.5 1.5 0 008 7.5v9A1.5 1.5 0 009.5 18h1a1.5 1.5 0 001.5-1.5v-9A1.5 1.5 0 0010.5 6h-1zM3.5 10A1.5 1.5 0 002 11.5v5A1.5 1.5 0 003.5 18h1A1.5 1.5 0 006 16.5v-5A1.5 1.5 0 004.5 10h-1z" />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VARIANT "DEFAULT" EXAMPLES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Exemple 1 : Onglets basiques (variant default)
 * Style classique avec border-b-2, pas de background
 */
export function BasicDefaultTabs() {
  const [activeTab, setActiveTab] = useState("products");

  const tabs = [
    { id: "products", label: "Produits" },
    { id: "categories", label: "Catégories" },
    { id: "inventory", label: "Inventaire" },
  ];

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Variant "default" - Onglets basiques
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Style classique avec border-b-2, pas de background sur l'onglet actif
        </p>
      </div>

      <TabGroup
        variant="default"
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="p-4 bg-gray-50 rounded">
        <p className="text-sm text-gray-700">
          Contenu de l'onglet : <strong>{activeTab}</strong>
        </p>
      </div>
    </div>
  );
}

/**
 * Exemple 2 : Onglets avec icônes (variant default)
 */
export function DefaultTabsWithIcons() {
  const [activeTab, setActiveTab] = useState("store");

  const tabs = [
    { id: "store", label: "Boutique", icon: <ShoppingCartIcon /> },
    { id: "categories", label: "Catégories", icon: <TagIcon /> },
    { id: "analytics", label: "Statistiques", icon: <ChartBarIcon /> },
  ];

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Variant "default" - Avec icônes
        </h3>
        <p className="text-sm text-gray-600 mb-4">Onglets avec icônes SVG</p>
      </div>

      <TabGroup
        variant="default"
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="p-4 bg-gray-50 rounded">
        <p className="text-sm text-gray-700">
          Contenu de l'onglet : <strong>{activeTab}</strong>
        </p>
      </div>
    </div>
  );
}

/**
 * Exemple 3 : Onglets avec badges (variant default)
 */
export function DefaultTabsWithBadges() {
  const [activeTab, setActiveTab] = useState("products");

  const tabs = [
    { id: "products", label: "Produits", badge: 24 },
    { id: "categories", label: "Catégories", badge: 8 },
    { id: "archived", label: "Archives", badge: 156 },
  ];

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Variant "default" - Avec badges
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Badges numériques pour afficher des compteurs
        </p>
      </div>

      <TabGroup
        variant="default"
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="p-4 bg-gray-50 rounded">
        <p className="text-sm text-gray-700">
          Contenu de l'onglet : <strong>{activeTab}</strong>
        </p>
      </div>
    </div>
  );
}

/**
 * Exemple 4 : Onglets scrollables (variant default)
 */
export function DefaultScrollableTabs() {
  const [activeTab, setActiveTab] = useState("tab1");

  const tabs = [
    { id: "tab1", label: "Onglet 1", badge: 5 },
    { id: "tab2", label: "Onglet 2", badge: 12 },
    { id: "tab3", label: "Onglet 3", badge: 3 },
    { id: "tab4", label: "Onglet 4", badge: 8 },
    { id: "tab5", label: "Onglet 5", badge: 15 },
    { id: "tab6", label: "Onglet 6", badge: 2 },
    { id: "tab7", label: "Onglet 7", badge: 9 },
    { id: "tab8", label: "Onglet 8", badge: 21 },
  ];

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Variant "default" - Scrollable (mobile)
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Scroll horizontal automatique sans boutons chevron
        </p>
      </div>

      <TabGroup
        variant="default"
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        scrollable={true}
      />

      <div className="p-4 bg-gray-50 rounded">
        <p className="text-sm text-gray-700">
          Contenu de l'onglet : <strong>{activeTab}</strong>
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VARIANT "HIGHLIGHT" EXAMPLES (Style Settings)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Exemple 5 : Onglets basiques (variant highlight)
 * Style moderne avec background bg-blue-50 sur l'onglet actif
 */
export function BasicHighlightTabs() {
  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    { id: "general", label: "Général" },
    { id: "security", label: "Sécurité" },
    { id: "notifications", label: "Notifications" },
  ];

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Variant "highlight" - Onglets basiques
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Style moderne avec background bg-blue-50 sur l'onglet actif
        </p>
      </div>

      <TabGroup
        variant="highlight"
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="p-4 bg-gray-50 rounded">
        <p className="text-sm text-gray-700">
          Contenu de l'onglet : <strong>{activeTab}</strong>
        </p>
      </div>
    </div>
  );
}

/**
 * Exemple 6 : Settings Page (variant highlight avec icônes)
 */
export function SettingsHighlightTabs() {
  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    { id: "general", label: "Général", icon: <CogIcon /> },
    { id: "security", label: "Sécurité", icon: <ShieldCheckIcon /> },
    { id: "notifications", label: "Notifications", icon: <BellIcon /> },
    { id: "profile", label: "Profil", icon: <UserIcon /> },
  ];

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Variant "highlight" - Page Settings
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Style Settings avec icônes et background sur l'onglet actif
        </p>
      </div>

      <TabGroup
        variant="highlight"
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="p-4 bg-gray-50 rounded">
        <p className="text-sm text-gray-700">
          Contenu de l'onglet : <strong>{activeTab}</strong>
        </p>
      </div>
    </div>
  );
}

/**
 * Exemple 7 : Variant highlight avec badges
 */
export function HighlightTabsWithBadges() {
  const [activeTab, setActiveTab] = useState("pending");

  const tabs = [
    { id: "pending", label: "En attente", badge: 12 },
    { id: "approved", label: "Approuvés", badge: 45 },
    { id: "rejected", label: "Rejetés", badge: 3 },
  ];

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Variant "highlight" - Avec badges
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Badges numériques avec style highlight
        </p>
      </div>

      <TabGroup
        variant="highlight"
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="p-4 bg-gray-50 rounded">
        <p className="text-sm text-gray-700">
          Contenu de l'onglet : <strong>{activeTab}</strong>
        </p>
      </div>
    </div>
  );
}

/**
 * Exemple 8 : Variant highlight scrollable avec boutons chevron
 * C'est LA FEATURE PRINCIPALE du variant highlight !
 */
export function HighlightScrollableTabsWithChevrons() {
  const [activeTab, setActiveTab] = useState("tab1");

  const tabs = [
    { id: "tab1", label: "Configuration générale", icon: <CogIcon /> },
    {
      id: "tab2",
      label: "Sécurité avancée",
      icon: <ShieldCheckIcon />,
      badge: 3,
    },
    { id: "tab3", label: "Notifications", icon: <BellIcon />, badge: 12 },
    { id: "tab4", label: "Profil utilisateur", icon: <UserIcon /> },
    {
      id: "tab5",
      label: "Moyens de paiement",
      icon: <CreditCardIcon />,
      badge: 2,
    },
    { id: "tab6", label: "Langue et région", icon: <GlobeIcon /> },
    { id: "tab7", label: "Documentation", icon: <DocumentTextIcon /> },
    { id: "tab8", label: "Statistiques", icon: <ChartBarIcon />, badge: 5 },
  ];

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Variant "highlight" - Scrollable avec chevrons 🎯
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          <strong>Feature principale :</strong> Boutons de scroll (chevrons
          gauche/droite) + background sur l'onglet actif. Parfait pour les
          Settings !
        </p>
      </div>

      <TabGroup
        variant="highlight"
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        scrollable={true}
      />

      <div className="p-4 bg-gray-50 rounded">
        <p className="text-sm text-gray-700">
          Contenu de l'onglet : <strong>{activeTab}</strong>
        </p>
        <p className="text-xs text-gray-500 mt-2">
          💡 Les boutons chevron apparaissent automatiquement si les onglets
          débordent du conteneur.
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXEMPLES COMPLEXES (Real-world use cases)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Exemple 9 : Page Boutique (variant default avec tout)
 */
export function StorePageExample() {
  const [activeTab, setActiveTab] = useState("all");

  const tabs = [
    {
      id: "all",
      label: "Tous les produits",
      icon: <ShoppingCartIcon />,
      badge: 124,
    },
    {
      id: "categories",
      label: "Catégories",
      icon: <TagIcon />,
      badge: 8,
    },
    {
      id: "analytics",
      label: "Statistiques",
      icon: <ChartBarIcon />,
    },
  ];

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Exemple réel - Page Boutique
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Variant "default" avec icônes + badges
        </p>
      </div>

      <TabGroup
        variant="default"
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="p-4 bg-gray-50 rounded space-y-2">
        <p className="text-sm text-gray-700">
          Contenu de l'onglet : <strong>{activeTab}</strong>
        </p>
        {activeTab === "all" && (
          <div className="text-xs text-gray-600">📦 Liste de 124 produits</div>
        )}
        {activeTab === "categories" && (
          <div className="text-xs text-gray-600">
            🏷️ 8 catégories disponibles
          </div>
        )}
        {activeTab === "analytics" && (
          <div className="text-xs text-gray-600">📊 Statistiques de vente</div>
        )}
      </div>
    </div>
  );
}

/**
 * Exemple 10 : Page Settings complète (variant highlight)
 */
export function CompleteSettingsExample() {
  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    {
      id: "general",
      label: "Général",
      icon: <CogIcon />,
    },
    {
      id: "security",
      label: "Sécurité",
      icon: <ShieldCheckIcon />,
      badge: 2,
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: <BellIcon />,
      badge: 5,
    },
    {
      id: "profile",
      label: "Profil",
      icon: <UserIcon />,
    },
    {
      id: "billing",
      label: "Facturation",
      icon: <CreditCardIcon />,
    },
    {
      id: "language",
      label: "Langue",
      icon: <GlobeIcon />,
    },
  ];

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Exemple réel - Page Settings complète
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Variant "highlight" avec tous les éléments + scroll automatique
        </p>
      </div>

      <TabGroup
        variant="highlight"
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        scrollable={true}
      />

      <div className="p-4 bg-gray-50 rounded space-y-3">
        <p className="text-sm text-gray-700">
          Paramètres : <strong>{activeTab}</strong>
        </p>

        {activeTab === "general" && (
          <div className="space-y-2">
            <p className="text-sm font-medium">⚙️ Paramètres généraux</p>
            <p className="text-xs text-gray-600">
              Configuration de base de l'application
            </p>
          </div>
        )}

        {activeTab === "security" && (
          <div className="space-y-2">
            <p className="text-sm font-medium">🔒 Sécurité</p>
            <p className="text-xs text-gray-600">
              2 actions requises : Activer 2FA, Vérifier email
            </p>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="space-y-2">
            <p className="text-sm font-medium">🔔 Notifications</p>
            <p className="text-xs text-gray-600">5 notifications non lues</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPARAISON CÔTE À CÔTE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Exemple 11 : Comparaison des deux variants
 */
export function VariantsComparison() {
  const [defaultTab, setDefaultTab] = useState("tab1");
  const [highlightTab, setHighlightTab] = useState("tab1");

  const tabs = [
    { id: "tab1", label: "Onglet 1", icon: <CogIcon />, badge: 3 },
    { id: "tab2", label: "Onglet 2", icon: <ShieldCheckIcon />, badge: 5 },
    { id: "tab3", label: "Onglet 3", icon: <BellIcon />, badge: 12 },
  ];

  return (
    <div className="space-y-8 p-6 bg-white rounded-lg shadow">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          🎨 Comparaison des variants
        </h2>
        <p className="text-sm text-gray-600">
          Comparaison visuelle entre "default" et "highlight"
        </p>
      </div>

      {/* Variant DEFAULT */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-mono rounded">
            default
          </span>
          <p className="text-sm text-gray-600">
            Border-b-2 simple, pas de background
          </p>
        </div>
        <TabGroup
          variant="default"
          tabs={tabs}
          activeTab={defaultTab}
          onTabChange={setDefaultTab}
        />
      </div>

      <div className="border-t border-gray-200"></div>

      {/* Variant HIGHLIGHT */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-mono rounded">
            highlight
          </span>
          <p className="text-sm text-gray-600">
            Background bg-blue-50 + hover states
          </p>
        </div>
        <TabGroup
          variant="highlight"
          tabs={tabs}
          activeTab={highlightTab}
          onTabChange={setHighlightTab}
        />
      </div>

      {/* Légende */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">
          📋 Différences clés
        </h4>
        <ul className="space-y-1 text-xs text-blue-800">
          <li>
            ✅ <strong>default</strong> : Style classique, minimal, parfait pour
            les pages de contenu
          </li>
          <li>
            ✅ <strong>highlight</strong> : Style moderne avec background,
            parfait pour Settings
          </li>
          <li>
            💡 Avec{" "}
            <code className="bg-blue-100 px-1 rounded">scrollable=true</code>,
            "highlight" affiche des boutons chevron automatiquement
          </li>
        </ul>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL (tous les exemples)
// ═══════════════════════════════════════════════════════════════════════════

export function TabGroupExamples() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            TabGroup Component - Exemples
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Composant d'onglets réutilisable avec 2 variants :
            <span className="font-semibold text-gray-800"> "default"</span> et
            <span className="font-semibold text-blue-600"> "highlight"</span>
          </p>
        </div>

        {/* Comparaison */}
        <VariantsComparison />

        {/* Variant DEFAULT examples */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-gray-900 border-b pb-2">
            📄 Variant "default"
          </h2>
          <BasicDefaultTabs />
          <DefaultTabsWithIcons />
          <DefaultTabsWithBadges />
          <DefaultScrollableTabs />
          <StorePageExample />
        </div>

        {/* Variant HIGHLIGHT examples */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-gray-900 border-b pb-2">
            ✨ Variant "highlight"
          </h2>
          <BasicHighlightTabs />
          <SettingsHighlightTabs />
          <HighlightTabsWithBadges />
          <HighlightScrollableTabsWithChevrons />
          <CompleteSettingsExample />
        </div>

        {/* Footer */}
        <div className="text-center pt-12 border-t">
          <p className="text-sm text-gray-500">
            🎨 Design System - Club Manager V3
          </p>
        </div>
      </div>
    </div>
  );
}

export default TabGroupExamples;
