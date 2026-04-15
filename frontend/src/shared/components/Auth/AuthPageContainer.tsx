/**
 * AuthPageContainer Component
 *
 * Wrapper pour toutes les pages d'authentification (login, register, forgot password).
 * Fournit un layout cohérent avec card centrée, logo, titre, et footer optionnel.
 *
 * @example
 * ```tsx
 * // Page de connexion
 * <AuthPageContainer
 *   title="Connexion"
 *   subtitle="Bienvenue sur ClubManager"
 *   showLogo
 *   footer={
 *     <div className="text-center text-sm text-gray-600 dark:text-gray-400">
 *       Pas encore de compte ?{' '}
 *       <Link to="/register" className="text-blue-600 hover:underline">
 *         Créer un compte
 *       </Link>
 *     </div>
 *   }
 * >
 *   <LoginForm />
 * </AuthPageContainer>
 *
 * // Page d'inscription
 * <AuthPageContainer
 *   title="Créer un compte"
 *   subtitle="Rejoignez votre club"
 *   footer={
 *     <div className="text-center text-sm text-gray-600 dark:text-gray-400">
 *       Déjà un compte ?{' '}
 *       <Link to="/login" className="text-blue-600 hover:underline">
 *         Se connecter
 *       </Link>
 *     </div>
 *   }
 * >
 *   <RegisterForm />
 * </AuthPageContainer>
 *
 * // Mot de passe oublié (sans logo)
 * <AuthPageContainer
 *   title="Mot de passe oublié"
 *   subtitle="Entrez votre email pour réinitialiser"
 *   showLogo={false}
 * >
 *   <ForgotPasswordForm />
 * </AuthPageContainer>
 * ```
 */

import { ReactNode } from "react";
import { cn } from "../../styles/designTokens";

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface AuthPageContainerProps {
  /**
   * Titre principal de la page
   * @example "Connexion", "Créer un compte", "Mot de passe oublié"
   */
  title: string;

  /**
   * Sous-titre optionnel affiché sous le titre
   * @example "Accédez à votre espace club"
   */
  subtitle?: string;

  /**
   * Contenu du formulaire (children)
   */
  children: ReactNode;

  /**
   * Footer optionnel affiché en bas de la card
   * Généralement utilisé pour les liens de navigation (ex: "Pas encore de compte ?")
   */
  footer?: ReactNode;

  /**
   * Afficher le logo du club en haut de la page
   * @default true
   */
  showLogo?: boolean;

  /**
   * Classes CSS additionnelles pour le container principal
   */
  className?: string;
}

// ─── COMPOSANT ───────────────────────────────────────────────────────────────

export function AuthPageContainer({
  title,
  subtitle,
  children,
  footer,
  showLogo = true,
  className = "",
}: AuthPageContainerProps) {
  return (
    <div
      className={cn(
        "min-h-screen flex items-center justify-center px-4 py-12",
        "bg-gradient-to-br from-blue-50 to-indigo-50",
        "dark:from-gray-900 dark:to-gray-800",
        className,
      )}
    >
      <div className="w-full max-w-md">
        {/* Logo optionnel */}
        {showLogo && (
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              ClubManager
            </h2>
          </div>
        )}

        {/* Card principale */}
        <div
          className={cn(
            "bg-white dark:bg-gray-800 rounded-2xl shadow-xl",
            "border border-gray-100 dark:border-gray-700",
            "p-6 sm:p-8",
          )}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </div>

          {/* Formulaire */}
          <div className="space-y-6">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthPageContainer;
