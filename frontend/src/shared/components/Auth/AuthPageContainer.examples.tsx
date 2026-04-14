/**
 * AuthPageContainer Examples
 *
 * Exemples d'utilisation du composant AuthPageContainer.
 * Ce fichier montre différentes configurations pour les pages d'authentification.
 */

import { AuthPageContainer } from './AuthPageContainer';

// ─── EXEMPLE 1: PAGE DE CONNEXION ────────────────────────────────────────────

/**
 * Exemple de page de connexion complète avec logo et footer
 */
export function LoginPageExample() {
  return (
    <AuthPageContainer
      title="Connexion"
      subtitle="Bienvenue sur ClubManager"
      showLogo
      footer={
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          Pas encore de compte ?{' '}
          <a
            href="/register"
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Créer un compte
          </a>
        </div>
      }
    >
      {/* Formulaire de connexion */}
      <form className="space-y-4">
        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
          >
            Adresse email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="vous@exemple.com"
            className="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Mot de passe */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
          >
            Mot de passe
          </label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="••••••••"
            className="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Se souvenir + Mot de passe oublié */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember"
              name="remember"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="remember"
              className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
            >
              Se souvenir de moi
            </label>
          </div>

          <a
            href="/forgot-password"
            className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Mot de passe oublié ?
          </a>
        </div>

        {/* Bouton de connexion */}
        <button
          type="submit"
          className="w-full inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
        >
          Se connecter
        </button>
      </form>
    </AuthPageContainer>
  );
}

// ─── EXEMPLE 2: PAGE D'INSCRIPTION ───────────────────────────────────────────

/**
 * Exemple de page d'inscription avec formulaire complet
 */
export function RegisterPageExample() {
  return (
    <AuthPageContainer
      title="Créer un compte"
      subtitle="Rejoignez votre club en quelques clics"
      showLogo
      footer={
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          Déjà un compte ?{' '}
          <a
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Se connecter
          </a>
        </div>
      }
    >
      {/* Formulaire d'inscription */}
      <form className="space-y-4">
        {/* Nom complet */}
        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
          >
            Nom complet
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            placeholder="Jean Dupont"
            className="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
          >
            Adresse email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="vous@exemple.com"
            className="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Mot de passe */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
          >
            Mot de passe
          </label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="••••••••"
            className="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
          <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
            Minimum 8 caractères, incluant une majuscule et un chiffre
          </p>
        </div>

        {/* Confirmation mot de passe */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
          >
            Confirmer le mot de passe
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            placeholder="••••••••"
            className="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Accepter les conditions */}
        <div className="flex items-start">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            className="h-4 w-4 mt-0.5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="terms"
            className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
          >
            J'accepte les{' '}
            <a
              href="/terms"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              conditions d'utilisation
            </a>{' '}
            et la{' '}
            <a
              href="/privacy"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              politique de confidentialité
            </a>
          </label>
        </div>

        {/* Bouton d'inscription */}
        <button
          type="submit"
          className="w-full inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
        >
          Créer mon compte
        </button>
      </form>
    </AuthPageContainer>
  );
}

// ─── EXEMPLE 3: MOT DE PASSE OUBLIÉ ──────────────────────────────────────────

/**
 * Exemple de page de récupération de mot de passe (sans logo)
 */
export function ForgotPasswordPageExample() {
  return (
    <AuthPageContainer
      title="Mot de passe oublié ?"
      subtitle="Entrez votre email pour recevoir un lien de réinitialisation"
      showLogo={false}
      footer={
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          <a
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            ← Retour à la connexion
          </a>
        </div>
      }
    >
      {/* Formulaire de récupération */}
      <form className="space-y-4">
        {/* Message d'information */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Nous vous enverrons un email avec un lien pour réinitialiser votre mot
                de passe.
              </p>
            </div>
          </div>
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
          >
            Adresse email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="vous@exemple.com"
            className="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Bouton d'envoi */}
        <button
          type="submit"
          className="w-full inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
        >
          Envoyer le lien de réinitialisation
        </button>
      </form>
    </AuthPageContainer>
  );
}

// ─── EXEMPLE 4: AVEC CLASSES ADDITIONNELLES ──────────────────────────────────

/**
 * Exemple avec des classes CSS personnalisées
 */
export function CustomStyledExample() {
  return (
    <AuthPageContainer
      title="Connexion personnalisée"
      subtitle="Exemple avec classes CSS additionnelles"
      showLogo
      className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900"
    >
      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
        Contenu du formulaire personnalisé...
      </div>
    </AuthPageContainer>
  );
}

// ─── EXEMPLE 5: SANS FOOTER ──────────────────────────────────────────────────

/**
 * Exemple minimal sans footer ni sous-titre
 */
export function MinimalExample() {
  return (
    <AuthPageContainer title="Connexion simple">
      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
        Formulaire minimal sans footer...
      </div>
    </AuthPageContainer>
  );
}

// ─── EXPORTS ─────────────────────────────────────────────────────────────────

export default {
  LoginPageExample,
  RegisterPageExample,
  ForgotPasswordPageExample,
  CustomStyledExample,
  MinimalExample,
};
