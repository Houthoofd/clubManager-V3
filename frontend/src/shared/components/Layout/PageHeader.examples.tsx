/**
 * PageHeader Component - Exemples
 *
 * Galerie complète de tous les variants et cas d'usage du composant PageHeader.
 * Ce fichier sert de documentation vivante et de référence pour l'utilisation du composant.
 */

import { useState } from 'react';
import { PageHeader } from './PageHeader';
import { Button } from '../Button';
import {
  CalendarIcon,
  UsersIcon,
  ShoppingCartIcon,
  CreditCardIcon,
  ChartLineIcon,
  EnvelopeIcon,
  PlusIcon,
  ChevronRightIcon,
  FilterIcon,
  DownloadIcon,
  CogIcon,
} from '@patternfly/react-icons';

// ─── EXEMPLE 1 : TITRE SIMPLE ────────────────────────────────────────────────

export function Example1_BasicPageHeader() {
  return (
    <div className="space-y-4 p-6 bg-gray-50">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          1. Titre Simple
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Usage le plus basique : juste un titre de page.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <PageHeader title="Tableau de bord" />
      </div>

      <div className="mt-4">
        <p className="text-xs text-gray-500">
          <strong>Cas d'usage :</strong> Pages simples sans actions ni description.
        </p>
      </div>
    </div>
  );
}

// ─── EXEMPLE 2 : AVEC ICÔNE ──────────────────────────────────────────────────

export function Example2_WithIcon() {
  return (
    <div className="space-y-4 p-6 bg-gray-50">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          2. Avec Icône
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Ajouter une icône pour renforcer l'identité visuelle de la page.
        </p>
      </div>

      <div className="space-y-4">
        {/* Exemple avec CalendarIcon */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <PageHeader
            icon={<CalendarIcon className="h-8 w-8 text-blue-600" />}
            title="Planning des cours"
          />
        </div>

        {/* Exemple avec UsersIcon */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <PageHeader
            icon={<UsersIcon className="h-8 w-8 text-green-600" />}
            title="Gestion des membres"
          />
        </div>

        {/* Exemple avec ChartLineIcon */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <PageHeader
            icon={<ChartLineIcon className="h-8 w-8 text-purple-600" />}
            title="Statistiques"
          />
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs text-gray-500">
          <strong>Recommandations :</strong> Taille d'icône h-8 w-8 • Couleurs : text-blue-600, text-green-600, text-purple-600
        </p>
      </div>
    </div>
  );
}

// ─── EXEMPLE 3 : AVEC DESCRIPTION ────────────────────────────────────────────

export function Example3_WithDescription() {
  return (
    <div className="space-y-4 p-6 bg-gray-50">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          3. Avec Description
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Ajouter une description pour fournir du contexte supplémentaire.
        </p>
      </div>

      <div className="space-y-4">
        {/* Description simple */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <PageHeader
            title="Membres"
            description="Gérez les adhérents, suivez les abonnements et consultez l'historique"
          />
        </div>

        {/* Description avec métriques */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <PageHeader
            icon={<UsersIcon className="h-8 w-8 text-green-600" />}
            title="Membres actifs"
            description="256 adhérents actifs • 12 nouveaux ce mois"
          />
        </div>

        {/* Description contextuelle */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <PageHeader
            icon={<CalendarIcon className="h-8 w-8 text-blue-600" />}
            title="Planning"
            description="Semaine du 6 au 12 janvier 2025"
          />
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs text-gray-500">
          <strong>Cas d'usage :</strong> Fournir un contexte, afficher des métriques, ou préciser une période.
        </p>
      </div>
    </div>
  );
}

// ─── EXEMPLE 4 : AVEC ACTIONS ────────────────────────────────────────────────

export function Example4_WithActions() {
  const handleAdd = () => {
    console.log('Ajouter un élément');
  };

  return (
    <div className="space-y-4 p-6 bg-gray-50">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          4. Avec Actions
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Ajouter des boutons d'action à droite du header.
        </p>
      </div>

      <div className="space-y-4">
        {/* Action simple */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <PageHeader
            title="Cours"
            description="Gestion du planning et des séances"
            actions={
              <Button variant="primary" onClick={handleAdd} icon={<PlusIcon />}>
                Ajouter un cours
              </Button>
            }
          />
        </div>

        {/* Actions multiples */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <PageHeader
            title="Transactions"
            description="Historique complet des paiements"
            actions={
              <div className="flex gap-2">
                <Button variant="outline" icon={<FilterIcon />}>
                  Filtrer
                </Button>
                <Button variant="primary" icon={<DownloadIcon />}>
                  Exporter
                </Button>
              </div>
            }
          />
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs text-gray-500">
          <strong>Cas d'usage :</strong> Actions principales (création, export, filtres).
        </p>
      </div>
    </div>
  );
}

// ─── EXEMPLE 5 : HEADER COMPLET ──────────────────────────────────────────────

export function Example5_FullHeader() {
  return (
    <div className="space-y-4 p-6 bg-gray-50">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          5. Header Complet
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Combinaison de tous les éléments : icône, titre, description et actions.
        </p>
      </div>

      <div className="space-y-4">
        {/* Header complet - Membres */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <PageHeader
            icon={<UsersIcon className="h-8 w-8 text-green-600" />}
            title="Membres"
            description="256 adhérents actifs • 12 nouveaux ce mois"
            actions={
              <div className="flex gap-2">
                <Button variant="outline">Exporter CSV</Button>
                <Button variant="primary" icon={<PlusIcon />}>
                  Ajouter un membre
                </Button>
              </div>
            }
          />
        </div>

        {/* Header complet - Boutique */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <PageHeader
            icon={<ShoppingCartIcon className="h-8 w-8 text-purple-600" />}
            title="Boutique"
            description="Gestion des produits et des ventes"
            actions={
              <Button variant="primary" icon={<PlusIcon />}>
                Nouveau produit
              </Button>
            }
          />
        </div>

        {/* Header complet - Transactions */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <PageHeader
            icon={<CreditCardIcon className="h-8 w-8 text-orange-600" />}
            title="Transactions"
            description="Historique complet des paiements"
            actions={
              <div className="flex gap-2">
                <Button variant="outline" icon={<FilterIcon />}>
                  Filtrer
                </Button>
                <Button variant="outline" icon={<DownloadIcon />}>
                  Exporter
                </Button>
              </div>
            }
          />
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs text-gray-500">
          <strong>Cas d'usage :</strong> Pages principales avec toutes les informations et actions nécessaires.
        </p>
      </div>
    </div>
  );
}

// ─── EXEMPLE 6 : AVEC BREADCRUMB ─────────────────────────────────────────────

export function Example6_WithBreadcrumb() {
  return (
    <div className="space-y-4 p-6 bg-gray-50">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          6. Avec Breadcrumb
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Ajouter un fil d'Ariane pour la navigation hiérarchique.
        </p>
      </div>

      <div className="space-y-4">
        {/* Breadcrumb simple */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <PageHeader
            breadcrumb={
              <nav className="flex items-center gap-2" aria-label="Breadcrumb">
                <a href="/" className="hover:text-gray-700 transition-colors">
                  Accueil
                </a>
                <ChevronRightIcon className="h-4 w-4" />
                <span className="text-gray-900 font-medium">Cours</span>
              </nav>
            }
            title="Cours"
            description="Gestion du planning et des séances"
          />
        </div>

        {/* Breadcrumb avec header complet */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <PageHeader
            breadcrumb={
              <nav className="flex items-center gap-2" aria-label="Breadcrumb">
                <a href="/" className="hover:text-gray-700 transition-colors">
                  Accueil
                </a>
                <ChevronRightIcon className="h-4 w-4" />
                <a href="/cours" className="hover:text-gray-700 transition-colors">
                  Cours
                </a>
                <ChevronRightIcon className="h-4 w-4" />
                <span className="text-gray-900 font-medium">Planning</span>
              </nav>
            }
            icon={<CalendarIcon className="h-8 w-8 text-blue-600" />}
            title="Planning des cours"
            description="Semaine du 6 au 12 janvier 2025"
            actions={
              <Button variant="primary" icon={<PlusIcon />}>
                Ajouter un cours
              </Button>
            }
          />
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs text-gray-500">
          <strong>Cas d'usage :</strong> Navigation hiérarchique, pages de détail, sous-sections.
        </p>
      </div>
    </div>
  );
}

// ─── EXEMPLE 7 : PAGE COURS (Cas réel) ──────────────────────────────────────

export function Example7_CoursesPageExample() {
  const [showAddModal, setShowAddModal] = useState(false);

  const handleAddCourse = () => {
    setShowAddModal(true);
    console.log('Ajouter un cours');
  };

  return (
    <div className="space-y-4 p-6 bg-gray-50">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          7. Exemple Réel : Page Cours
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Reproduction fidèle du header de la page Cours.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <PageHeader
          icon={<CalendarIcon className="h-8 w-8 text-blue-600" />}
          title="Cours"
          description="Gestion du planning, des séances et des professeurs"
          actions={
            <Button variant="primary" onClick={handleAddCourse} icon={<PlusIcon />}>
              Ajouter un cours
            </Button>
          }
        />

        {/* Simulation du contenu de la page */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">
            [Contenu de la page : liste des cours, calendrier, etc.]
          </p>
        </div>
      </div>

      {showAddModal && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            ✓ Modal d'ajout de cours déclenchée
          </p>
        </div>
      )}
    </div>
  );
}

// ─── EXEMPLE 8 : PAGE BOUTIQUE (Cas réel) ───────────────────────────────────

export function Example8_StorePageExample() {
  return (
    <div className="space-y-4 p-6 bg-gray-50">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          8. Exemple Réel : Page Boutique
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Reproduction fidèle du header de la page Boutique avec actions multiples.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <PageHeader
          icon={<ShoppingCartIcon className="h-8 w-8 text-purple-600" />}
          title="Boutique"
          description="Gestion des produits et des ventes"
          actions={
            <div className="flex gap-2">
              <Button variant="outline">Inventaire</Button>
              <Button variant="outline">Commandes</Button>
              <Button variant="primary" icon={<PlusIcon />}>
                Nouveau produit
              </Button>
            </div>
          }
        />

        {/* Simulation du contenu de la page */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Produit {item}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── EXEMPLE 9 : RESPONSIVE AVEC ACTIONS MULTIPLES ──────────────────────────

export function Example9_ResponsiveExample() {
  return (
    <div className="space-y-4 p-6 bg-gray-50">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          9. Layout Responsive
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Actions qui s'adaptent automatiquement sur mobile (stack vertical).
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <PageHeader
          icon={<EnvelopeIcon className="h-8 w-8 text-blue-600" />}
          title="Communications"
          description="Envoi de notifications et de courriels"
          actions={
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button variant="outline" size="md" fullWidth className="sm:w-auto">
                Modèles
              </Button>
              <Button variant="outline" size="md" fullWidth className="sm:w-auto">
                Historique
              </Button>
              <Button variant="primary" size="md" fullWidth className="sm:w-auto" icon={<PlusIcon />}>
                Nouveau message
              </Button>
            </div>
          }
        />
      </div>

      <div className="mt-4">
        <p className="text-xs text-gray-500">
          <strong>Note :</strong> Réduisez la largeur de la fenêtre pour voir les actions passer en mode vertical.
        </p>
      </div>
    </div>
  );
}

// ─── EXEMPLE 10 : AVEC CONFIGURATION PERSONNALISÉE ──────────────────────────

export function Example10_CustomConfiguration() {
  return (
    <div className="space-y-4 p-6 bg-gray-50">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          10. Configuration Personnalisée
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Utilisation de className pour personnaliser le style.
        </p>
      </div>

      <div className="space-y-4">
        {/* Header avec background */}
        <div className="bg-white rounded-lg border border-gray-200">
          <PageHeader
            icon={<CogIcon className="h-8 w-8 text-gray-600" />}
            title="Paramètres"
            description="Configuration générale de l'application"
            className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg"
          />
        </div>

        {/* Header avec bordure colorée */}
        <div className="bg-white rounded-lg border border-gray-200">
          <PageHeader
            icon={<ChartLineIcon className="h-8 w-8 text-green-600" />}
            title="Tableau de bord"
            description="Vue d'ensemble de l'activité"
            className="border-l-4 border-green-600 pl-6"
          />
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs text-gray-500">
          <strong>Cas d'usage :</strong> Personnalisation visuelle avec className.
        </p>
      </div>
    </div>
  );
}

// ─── EXEMPLE 11 : TITRE LONG (Truncate) ─────────────────────────────────────

export function Example11_LongTitleExample() {
  return (
    <div className="space-y-4 p-6 bg-gray-50">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          11. Gestion des Titres Longs
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Le titre se tronque automatiquement avec des points de suspension (...).
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 max-w-2xl">
        <PageHeader
          icon={<UsersIcon className="h-8 w-8 text-blue-600" />}
          title="Gestion complète des membres, adhésions, abonnements et historique des paiements"
          description="Description courte"
          actions={
            <Button variant="primary">Action</Button>
          }
        />
      </div>

      <div className="mt-4">
        <p className="text-xs text-gray-500">
          <strong>Note :</strong> Le titre utilise `truncate` pour éviter les débordements.
        </p>
      </div>
    </div>
  );
}

// ─── GALERIE COMPLÈTE ────────────────────────────────────────────────────────

export default function PageHeaderExamples() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 space-y-12">
        <div className="px-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            PageHeader Component - Exemples
          </h1>
          <p className="text-lg text-gray-600">
            Galerie complète de tous les variants et cas d'usage du composant PageHeader.
          </p>
        </div>

        <div className="space-y-8">
          <Example1_BasicPageHeader />
          <Example2_WithIcon />
          <Example3_WithDescription />
          <Example4_WithActions />
          <Example5_FullHeader />
          <Example6_WithBreadcrumb />
          <Example7_CoursesPageExample />
          <Example8_StorePageExample />
          <Example9_ResponsiveExample />
          <Example10_CustomConfiguration />
          <Example11_LongTitleExample />
        </div>

        {/* Guide de référence rapide */}
        <div className="px-6 py-8 bg-white rounded-xl border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            📚 Référence Rapide
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ✅ Bonnes Pratiques
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Utiliser h-8 w-8 pour les icônes</li>
                <li>• Titres courts et concis</li>
                <li>• Descriptions informatives avec métriques</li>
                <li>• Maximum 2-3 actions principales</li>
                <li>• Une seule h1 par page</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                🎨 Couleurs d'Icônes
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <span className="text-blue-600">text-blue-600</span> - Cours, Planning</li>
                <li>• <span className="text-green-600">text-green-600</span> - Membres, Adhésions</li>
                <li>• <span className="text-purple-600">text-purple-600</span> - Boutique, Produits</li>
                <li>• <span className="text-orange-600">text-orange-600</span> - Transactions, Paiements</li>
                <li>• <span className="text-gray-600">text-gray-600</span> - Paramètres, Configuration</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
