/**
 * LoadingSpinner Component - Examples
 *
 * Exemples d'utilisation du composant LoadingSpinner dans différents contextes.
 * Ce fichier sert de documentation vivante et peut être utilisé pour tester
 * visuellement les différentes configurations.
 */

import { LoadingSpinner } from './LoadingSpinner';
import { Card } from '../Card';

// ─── EXEMPLE 1: SPINNER BASIQUE ──────────────────────────────────────────────

export function BasicSpinner() {
  return (
    <div className="space-y-4 p-6 bg-gray-50">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Spinner Basique
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Usage le plus simple, taille moyenne par défaut, sans texte.
        </p>
      </div>

      <div className="bg-white p-8 rounded-lg border border-gray-200">
        <LoadingSpinner />
      </div>
    </div>
  );
}

// ─── EXEMPLE 2: SPINNER AVEC TEXTE ───────────────────────────────────────────

export function SpinnerWithText() {
  return (
    <div className="space-y-4 p-6 bg-gray-50">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Spinner avec Texte
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Ajoute un texte explicatif à côté du spinner pour plus de clarté.
        </p>
      </div>

      <div className="bg-white p-8 rounded-lg border border-gray-200 space-y-6">
        <LoadingSpinner text="Chargement..." />
        <LoadingSpinner text="Chargement des données..." />
        <LoadingSpinner text="Traitement en cours, veuillez patienter..." />
      </div>
    </div>
  );
}

// ─── EXEMPLE 3: TAILLES DE SPINNER ───────────────────────────────────────────

export function SpinnerSizes() {
  return (
    <div className="space-y-4 p-6 bg-gray-50">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Tailles de Spinner
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Trois tailles disponibles : sm (16px), md (20px), lg (32px).
        </p>
      </div>

      <div className="bg-white p-8 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <p className="text-xs font-semibold text-gray-700 mb-4 uppercase tracking-wide">
              Small (sm)
            </p>
            <LoadingSpinner size="sm" />
            <p className="text-xs text-gray-500 mt-2">16px × 16px</p>
          </div>

          <div className="text-center">
            <p className="text-xs font-semibold text-gray-700 mb-4 uppercase tracking-wide">
              Medium (md) - Défaut
            </p>
            <LoadingSpinner size="md" />
            <p className="text-xs text-gray-500 mt-2">20px × 20px</p>
          </div>

          <div className="text-center">
            <p className="text-xs font-semibold text-gray-700 mb-4 uppercase tracking-wide">
              Large (lg)
            </p>
            <LoadingSpinner size="lg" />
            <p className="text-xs text-gray-500 mt-2">32px × 32px</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── EXEMPLE 4: SPINNER PLEINE PAGE ──────────────────────────────────────────

export function FullPageSpinner() {
  return (
    <div className="space-y-4 p-6 bg-gray-50">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Spinner Pleine Page
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Grand spinner centré verticalement pour les chargements de pages principales.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="min-h-[400px] flex items-center justify-center">
          <LoadingSpinner size="lg" text="Chargement de la page..." />
        </div>
      </div>
    </div>
  );
}

// ─── EXEMPLE 5: SPINNER INLINE ───────────────────────────────────────────────

export function InlineSpinner() {
  return (
    <div className="space-y-4 p-6 bg-gray-50">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Spinner Inline (Sans Padding)
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Spinner sans padding vertical pour utilisation inline dans du texte ou des boutons.
        </p>
      </div>

      <div className="bg-white p-8 rounded-lg border border-gray-200 space-y-6">
        <div className="flex items-center gap-2">
          <LoadingSpinner size="sm" className="py-0" />
          <span className="text-gray-700">Chargement en cours...</span>
        </div>

        <div className="flex items-center gap-3">
          <LoadingSpinner size="sm" className="py-0" />
          <span className="text-gray-700">Traitement de votre demande...</span>
        </div>

        <div className="flex items-center gap-3">
          <LoadingSpinner size="md" className="py-0" />
          <span className="text-gray-700 font-medium">Veuillez patienter</span>
        </div>
      </div>
    </div>
  );
}

// ─── EXEMPLE 6: SPINNER DANS BOUTON ──────────────────────────────────────────

export function SpinnerInButton() {
  return (
    <div className="space-y-4 p-6 bg-gray-50">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Spinner dans un Bouton
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Afficher un spinner dans un bouton pendant une opération asynchrone.
        </p>
      </div>

      <div className="bg-white p-8 rounded-lg border border-gray-200">
        <div className="flex flex-wrap gap-4">
          <button
            disabled
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg opacity-75 cursor-not-allowed"
          >
            <LoadingSpinner size="sm" className="py-0" />
            <span>Enregistrement...</span>
          </button>

          <button
            disabled
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg opacity-75 cursor-not-allowed"
          >
            <LoadingSpinner size="sm" className="py-0" />
            <span>Validation en cours</span>
          </button>

          <button
            disabled
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg opacity-75 cursor-not-allowed"
          >
            <LoadingSpinner size="sm" className="py-0" />
            <span>Suppression...</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── EXEMPLE 7: SPINNER DANS CARD ────────────────────────────────────────────

export function SpinnerInCard() {
  return (
    <div className="space-y-4 p-6 bg-gray-50">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Spinner dans une Card
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Afficher un état de chargement dans une carte pendant le fetch de données.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">
              Liste des Membres
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Tous les membres actifs
            </p>
          </Card.Header>
          <Card.Body>
            <LoadingSpinner text="Chargement des membres..." />
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">
              Statistiques
            </h3>
          </Card.Header>
          <Card.Body>
            <LoadingSpinner size="sm" text="Calcul en cours..." />
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}

// ─── EXEMPLE 8: SPINNER CENTRÉS ──────────────────────────────────────────────

export function CenteredSpinners() {
  return (
    <div className="space-y-4 p-6 bg-gray-50">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Spinners Centrés
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Différentes façons de centrer un spinner dans un conteneur.
        </p>
      </div>

      <div className="space-y-4">
        {/* Centré avec flex */}
        <div className="bg-white rounded-lg border border-gray-200 h-48 flex items-center justify-center">
          <LoadingSpinner text="Centré avec Flexbox" />
        </div>

        {/* Centré avec min-height */}
        <div className="bg-white rounded-lg border border-gray-200 min-h-[200px] flex items-center justify-center">
          <LoadingSpinner size="lg" text="Chargement du contenu..." />
        </div>
      </div>
    </div>
  );
}

// ─── EXEMPLE 9: CONTEXTES VARIÉS ─────────────────────────────────────────────

export function VariedContexts() {
  return (
    <div className="space-y-4 p-6 bg-gray-50">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Contextes d'Utilisation Variés
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Exemples réalistes d'utilisation dans différents contextes.
        </p>
      </div>

      <div className="space-y-4">
        {/* Tableau en chargement */}
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">
              Tableau de Données
            </h3>
          </Card.Header>
          <Card.Body>
            <div className="border border-gray-200 rounded-lg">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <div className="flex gap-4">
                  <div className="font-medium text-sm text-gray-700 flex-1">Nom</div>
                  <div className="font-medium text-sm text-gray-700 flex-1">Email</div>
                  <div className="font-medium text-sm text-gray-700 w-24">Statut</div>
                </div>
              </div>
              <div className="p-4">
                <LoadingSpinner text="Chargement des données du tableau..." />
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Graphique en chargement */}
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">
              Graphique des Ventes
            </h3>
          </Card.Header>
          <Card.Body>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
              <LoadingSpinner size="lg" text="Génération du graphique..." />
            </div>
          </Card.Body>
        </Card>

        {/* Formulaire en soumission */}
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">
              Nouveau Membre
            </h3>
          </Card.Header>
          <Card.Body>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet
                </label>
                <input
                  type="text"
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  value="Jean Dupont"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  value="jean@example.com"
                />
              </div>
            </div>
          </Card.Body>
          <Card.Footer>
            <div className="flex items-center justify-between">
              <LoadingSpinner size="sm" className="py-0" text="Enregistrement..." />
              <div className="flex gap-2">
                <button
                  disabled
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg cursor-not-allowed opacity-50"
                >
                  Annuler
                </button>
                <button
                  disabled
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-not-allowed opacity-50"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </Card.Footer>
        </Card>
      </div>
    </div>
  );
}

// ─── COMPOSANT PRINCIPAL (TOUS LES EXEMPLES) ─────────────────────────────────

export function LoadingSpinnerExamples() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            LoadingSpinner - Exemples
          </h1>
          <p className="text-lg text-gray-600">
            Composant de spinner de chargement réutilisable avec différentes tailles et configurations.
          </p>
        </div>

        <div className="space-y-8">
          <BasicSpinner />
          <SpinnerWithText />
          <SpinnerSizes />
          <FullPageSpinner />
          <InlineSpinner />
          <SpinnerInButton />
          <SpinnerInCard />
          <CenteredSpinners />
          <VariedContexts />
        </div>

        <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            💡 Conseil d'Utilisation
          </h3>
          <p className="text-sm text-blue-800">
            Le composant LoadingSpinner remplace ~250 lignes de code dupliqué dans le projet.
            Utilisez-le pour tous vos besoins de chargement afin de maintenir la cohérence visuelle
            et l'accessibilité.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoadingSpinnerExamples;
