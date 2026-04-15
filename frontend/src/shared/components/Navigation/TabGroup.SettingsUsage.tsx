/**
 * TabGroup - Settings Page Usage Example
 *
 * Exemple d'intégration du TabGroup variant "highlight" dans une page Settings réelle.
 * Démontre l'utilisation complète avec icônes, badges, scroll et boutons chevron.
 *
 * @author Club Manager Team
 */

import { useState } from "react";
import { TabGroup } from "./TabGroup";

// ─── ICÔNES SVG ──────────────────────────────────────────────────────────────

const CogIcon = () => (
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

const ShieldCheckIcon = () => (
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

const BellIcon = () => (
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

const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
  </svg>
);

const CreditCardIcon = () => (
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

const GlobeIcon = () => (
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

const PaintBrushIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path
      fillRule="evenodd"
      d="M10.362 1.093a.75.75 0 00-.724 0L2.523 5.018 10 9.143l7.477-4.125-7.115-3.925zM18 6.443l-7.25 4v8.25l6.862-3.786A.75.75 0 0018 14.25V6.443zm-8.75 12.25v-8.25l-7.25-4v7.807a.75.75 0 00.388.657l6.862 3.786z"
      clipRule="evenodd"
    />
  </svg>
);

const DocumentTextIcon = () => (
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

// ─── COMPOSANT PRINCIPAL ─────────────────────────────────────────────────────

/**
 * Exemple d'une page Settings complète utilisant le TabGroup variant "highlight"
 */
export function SettingsPageExample() {
  const [activeTab, setActiveTab] = useState("general");

  // Définition des onglets de la page Settings
  const settingsTabs = [
    {
      id: "general",
      label: "Général",
      icon: <CogIcon />,
    },
    {
      id: "security",
      label: "Sécurité",
      icon: <ShieldCheckIcon />,
      badge: 2, // 2 actions requises
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: <BellIcon />,
      badge: 5, // 5 notifications non lues
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
      label: "Langue & Région",
      icon: <GlobeIcon />,
    },
    {
      id: "appearance",
      label: "Apparence",
      icon: <PaintBrushIcon />,
    },
    {
      id: "advanced",
      label: "Avancé",
      icon: <DocumentTextIcon />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header de la page */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez les paramètres de votre compte et de l'application
          </p>
        </div>
      </div>

      {/* Tabs avec variant "highlight" + scroll */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <TabGroup
            variant="highlight"
            tabs={settingsTabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            scrollable={true}
          />
        </div>
      </div>

      {/* Contenu de l'onglet actif */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {activeTab === "general" && <GeneralSettings />}
          {activeTab === "security" && <SecuritySettings />}
          {activeTab === "notifications" && <NotificationsSettings />}
          {activeTab === "profile" && <ProfileSettings />}
          {activeTab === "billing" && <BillingSettings />}
          {activeTab === "language" && <LanguageSettings />}
          {activeTab === "appearance" && <AppearanceSettings />}
          {activeTab === "advanced" && <AdvancedSettings />}
        </div>
      </div>
    </div>
  );
}

// ─── COMPOSANTS DE CONTENU ───────────────────────────────────────────────────

function GeneralSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Paramètres généraux
        </h2>
        <p className="text-sm text-gray-600">
          Configuration de base de votre club
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom du club
          </label>
          <input
            type="text"
            defaultValue="Club Sportif Municipal"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email de contact
          </label>
          <input
            type="email"
            defaultValue="contact@clubsportif.fr"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Téléphone
          </label>
          <input
            type="tel"
            defaultValue="+33 1 23 45 67 89"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="pt-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Enregistrer les modifications
          </button>
        </div>
      </div>
    </div>
  );
}

function SecuritySettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Sécurité du compte
        </h2>
        <p className="text-sm text-gray-600">
          Protégez votre compte avec des mesures de sécurité avancées
        </p>
      </div>

      {/* Alertes de sécurité */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-amber-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-amber-800">
              2 actions requises
            </h3>
            <div className="mt-2 text-sm text-amber-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Activer l'authentification à deux facteurs</li>
                <li>Vérifier votre adresse email</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between py-3 border-b border-gray-200">
          <div>
            <p className="text-sm font-medium text-gray-900">
              Authentification à deux facteurs (2FA)
            </p>
            <p className="text-xs text-gray-500">Recommandé pour plus de sécurité</p>
          </div>
          <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Activer
          </button>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-gray-200">
          <div>
            <p className="text-sm font-medium text-gray-900">
              Modifier le mot de passe
            </p>
            <p className="text-xs text-gray-500">
              Dernière modification il y a 3 mois
            </p>
          </div>
          <button className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
            Modifier
          </button>
        </div>

        <div className="flex items-center justify-between py-3">
          <div>
            <p className="text-sm font-medium text-gray-900">
              Sessions actives
            </p>
            <p className="text-xs text-gray-500">2 appareils connectés</p>
          </div>
          <button className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
            Gérer
          </button>
        </div>
      </div>
    </div>
  );
}

function NotificationsSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Notifications
        </h2>
        <p className="text-sm text-gray-600">
          Gérez vos préférences de notifications (5 non lues)
        </p>
      </div>

      <div className="space-y-4">
        {[
          {
            title: "Notifications par email",
            description: "Recevoir des emails pour les événements importants",
            enabled: true,
          },
          {
            title: "Notifications push",
            description: "Recevoir des notifications sur votre appareil",
            enabled: true,
          },
          {
            title: "Résumé hebdomadaire",
            description: "Recevoir un résumé hebdomadaire des activités",
            enabled: false,
          },
          {
            title: "Notifications de paiement",
            description: "Recevoir des alertes pour les paiements",
            enabled: true,
          },
          {
            title: "Notifications de cours",
            description: "Recevoir des alertes pour les nouveaux cours",
            enabled: false,
          },
        ].map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0"
          >
            <div>
              <p className="text-sm font-medium text-gray-900">{item.title}</p>
              <p className="text-xs text-gray-500">{item.description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                defaultChecked={item.enabled}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Profil utilisateur
        </h2>
        <p className="text-sm text-gray-600">
          Informations de votre profil personnel
        </p>
      </div>

      <div className="flex items-center space-x-4">
        <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center">
          <span className="text-2xl font-bold text-blue-600">JD</span>
        </div>
        <button className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
          Changer la photo
        </button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prénom
            </label>
            <input
              type="text"
              defaultValue="Jean"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom
            </label>
            <input
              type="text"
              defaultValue="Dupont"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          <textarea
            rows={4}
            defaultValue="Entraîneur de football depuis 10 ans..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="pt-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

function BillingSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Facturation
        </h2>
        <p className="text-sm text-gray-600">
          Gérez vos moyens de paiement et factures
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-900">
              Plan Premium actif
            </p>
            <p className="text-xs text-blue-700">
              Prochain paiement : 24,99€ le 15 mars 2024
            </p>
          </div>
          <span className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
            Premium
          </span>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">
          Moyens de paiement
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-14 bg-gray-100 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-gray-600">VISA</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  •••• •••• •••• 4242
                </p>
                <p className="text-xs text-gray-500">Expire 12/25</p>
              </div>
            </div>
            <button className="text-sm text-red-600 hover:text-red-700">
              Supprimer
            </button>
          </div>
        </div>
        <button className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium">
          + Ajouter un moyen de paiement
        </button>
      </div>
    </div>
  );
}

function LanguageSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Langue et région
        </h2>
        <p className="text-sm text-gray-600">
          Personnalisez votre langue et vos préférences régionales
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Langue de l'interface
          </label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
            <option>Français</option>
            <option>English</option>
            <option>Español</option>
            <option>Deutsch</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fuseau horaire
          </label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
            <option>Europe/Paris (GMT+1)</option>
            <option>Europe/London (GMT+0)</option>
            <option>America/New_York (GMT-5)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Format de date
          </label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
            <option>JJ/MM/AAAA</option>
            <option>MM/JJ/AAAA</option>
            <option>AAAA-MM-JJ</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function AppearanceSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Apparence</h2>
        <p className="text-sm text-gray-600">
          Personnalisez l'apparence de l'application
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Thème
        </label>
        <div className="grid grid-cols-3 gap-3">
          {["Clair", "Sombre", "Système"].map((theme) => (
            <button
              key={theme}
              className="p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 transition-colors text-center"
            >
              <div className="h-12 w-full bg-gray-100 rounded mb-2"></div>
              <p className="text-sm font-medium text-gray-900">{theme}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Couleur d'accent
        </label>
        <div className="flex space-x-3">
          {["bg-blue-600", "bg-green-600", "bg-purple-600", "bg-red-600"].map(
            (color) => (
              <button
                key={color}
                className={`h-10 w-10 ${color} rounded-full border-2 border-white shadow-md hover:scale-110 transition-transform`}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}

function AdvancedSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Paramètres avancés
        </h2>
        <p className="text-sm text-gray-600">
          Options avancées pour les utilisateurs expérimentés
        </p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg
            className="h-5 w-5 text-yellow-400 mt-0.5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Attention</h3>
            <p className="mt-1 text-xs text-yellow-700">
              Les paramètres ci-dessous peuvent affecter le comportement de
              l'application. Modifiez-les uniquement si vous savez ce que vous
              faites.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between py-3 border-b border-gray-200">
          <div>
            <p className="text-sm font-medium text-gray-900">Mode debug</p>
            <p className="text-xs text-gray-500">
              Afficher les informations de débogage
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-gray-200">
          <div>
            <p className="text-sm font-medium text-gray-900">
              Exporter les données
            </p>
            <p className="text-xs text-gray-500">
              Télécharger toutes vos données
            </p>
          </div>
          <button className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
            Exporter
          </button>
        </div>

        <div className="flex items-center justify-between py-3">
          <div>
            <p className="text-sm font-medium text-red-600">Supprimer le compte</p>
            <p className="text-xs text-gray-500">
              Action irréversible - toutes vos données seront perdues
            </p>
          </div>
          <button className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700">
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsPageExample;
