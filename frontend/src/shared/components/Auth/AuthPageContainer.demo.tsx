/**
 * AuthPageContainer Demo
 *
 * Page de démonstration interactive pour visualiser tous les exemples
 * d'utilisation du composant AuthPageContainer.
 *
 * Cette page permet de naviguer entre les différents exemples et de voir
 * le composant en action dans différentes configurations.
 */

import { useState } from 'react';
import { AuthPageContainer } from './AuthPageContainer';

// ─── TYPES ───────────────────────────────────────────────────────────────────

type DemoExample = 'login' | 'register' | 'forgot-password' | 'minimal' | 'custom';

// ─── EXEMPLES ────────────────────────────────────────────────────────────────

function LoginExample() {
  return (
    <AuthPageContainer
      title="Connexion"
      subtitle="Bienvenue sur ClubManager"
      showLogo
      footer={
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          Pas encore de compte ?{' '}
          <a
            href="#"
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            Créer un compte
          </a>
        </div>
      }
    >
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Adresse email
          </label>
          <input
            type="email"
            placeholder="vous@exemple.com"
            className="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Mot de passe
          </label>
          <input
            type="password"
            placeholder="••••••••"
            className="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remember" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Se souvenir de moi
            </label>
          </div>
          <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">
            Mot de passe oublié ?
          </a>
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm"
        >
          Se connecter
        </button>
      </form>
    </AuthPageContainer>
  );
}

function RegisterExample() {
  return (
    <AuthPageContainer
      title="Créer un compte"
      subtitle="Rejoignez votre club en quelques clics"
      footer={
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          Déjà un compte ?{' '}
          <a href="#" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
            Se connecter
          </a>
        </div>
      }
    >
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Nom complet
          </label>
          <input
            type="text"
            placeholder="Jean Dupont"
            className="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Adresse email
          </label>
          <input
            type="email"
            placeholder="vous@exemple.com"
            className="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Mot de passe
          </label>
          <input
            type="password"
            placeholder="••••••••"
            className="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
            Minimum 8 caractères, incluant une majuscule et un chiffre
          </p>
        </div>

        <div className="flex items-start">
          <input
            id="terms"
            type="checkbox"
            className="h-4 w-4 mt-0.5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="terms" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            J'accepte les{' '}
            <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
              conditions d'utilisation
            </a>
          </label>
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm"
        >
          Créer mon compte
        </button>
      </form>
    </AuthPageContainer>
  );
}

function ForgotPasswordExample() {
  return (
    <AuthPageContainer
      title="Mot de passe oublié ?"
      subtitle="Entrez votre email pour recevoir un lien de réinitialisation"
      showLogo={false}
      footer={
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          <a href="#" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
            ← Retour à la connexion
          </a>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Nous vous enverrons un email avec un lien pour réinitialiser votre mot de passe.
              </p>
            </div>
          </div>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Adresse email
            </label>
            <input
              type="email"
              placeholder="vous@exemple.com"
              className="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm"
          >
            Envoyer le lien de réinitialisation
          </button>
        </form>
      </div>
    </AuthPageContainer>
  );
}

function MinimalExample() {
  return (
    <AuthPageContainer title="Authentification simple">
      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
        <p className="mb-4">Exemple minimal sans sous-titre ni footer</p>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Action
        </button>
      </div>
    </AuthPageContainer>
  );
}

function CustomExample() {
  return (
    <AuthPageContainer
      title="Style personnalisé"
      subtitle="Avec background custom"
      className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900"
    >
      <div className="text-center py-8 space-y-4">
        <div className="text-sm text-purple-700 dark:text-purple-300 font-medium">
          🎨 Background personnalisé via className
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Le composant accepte des classes CSS additionnelles pour personnaliser l'apparence.
        </p>
      </div>
    </AuthPageContainer>
  );
}

// ─── COMPOSANT PRINCIPAL ─────────────────────────────────────────────────────

export function AuthPageContainerDemo() {
  const [activeExample, setActiveExample] = useState<DemoExample>('login');

  const examples: Record<DemoExample, { label: string; component: JSX.Element }> = {
    login: {
      label: 'Connexion',
      component: <LoginExample />,
    },
    register: {
      label: 'Inscription',
      component: <RegisterExample />,
    },
    'forgot-password': {
      label: 'Mot de passe oublié',
      component: <ForgotPasswordExample />,
    },
    minimal: {
      label: 'Minimal',
      component: <MinimalExample />,
    },
    custom: {
      label: 'Personnalisé',
      component: <CustomExample />,
    },
  };

  return (
    <div className="relative">
      {/* Navigation des exemples (fixée en haut) */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              AuthPageContainer Demo
            </h2>
            <div className="flex gap-2">
              {(Object.keys(examples) as DemoExample[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveExample(key)}
                  className={`
                    px-3 py-1.5 text-sm font-medium rounded-lg transition-colors
                    ${
                      activeExample === key
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }
                  `}
                >
                  {examples[key].label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Contenu de l'exemple actif */}
      <div className="pt-16">{examples[activeExample].component}</div>

      {/* Info en bas à droite */}
      <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 max-w-xs">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          💡 Info
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Cette page démontre les différentes configurations du composant AuthPageContainer.
          Utilisez les boutons en haut pour naviguer entre les exemples.
        </p>
      </div>
    </div>
  );
}

export default AuthPageContainerDemo;
