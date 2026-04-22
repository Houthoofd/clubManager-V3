/**
 * LoginPage
 * Page de connexion avec formulaire de login
 *
 * Migré pour utiliser les composants réutilisables :
 * - AuthPageContainer : Layout auth avec card centrée
 * - FormField : Gestion des labels et erreurs
 * - PasswordInput : Champ mot de passe avec toggle visibilité
 * - SubmitButton : Bouton de soumission avec état loading
 * - AlertBanner : Messages de succès/erreur
 */

import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ExclamationTriangleIcon } from "@patternfly/react-icons";
import { UserIcon, LockIcon } from "@patternfly/react-icons";
import { useAuth } from "../../../shared/hooks/useAuth";
import { loginSchema, type LoginDto } from "@clubmanager/types";
import { AuthPageContainer } from "../../../shared/components/Auth/AuthPageContainer";
import { FormField } from "../../../shared/components/Forms/FormField";
import { PasswordInput } from "../../../shared/components/Input/PasswordInput";
import { SubmitButton } from "../../../shared/components/Button/SubmitButton";
import { AlertBanner } from "../../../shared/components/Feedback/AlertBanner";

/**
 * LoginPage Component
 */
export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuth();
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [registerSuccessMessage, setRegisterSuccessMessage] = useState<
    string | null
  >(null);

  // React Hook Form avec Zod validation
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<LoginDto>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  // Afficher le message de succès si on vient de l'inscription
  useEffect(() => {
    const state = location.state as { message?: string } | null;
    if (state?.message) {
      setRegisterSuccessMessage(state.message);
    }
  }, [location.state]);

  /**
   * Soumission du formulaire de connexion
   */
  const onSubmit = async (data: LoginDto) => {
    setEmailNotVerified(false);
    try {
      const result = await login(data);

      if (result.success) {
        toast.success("Connexion réussie !", {
          description: "Vous êtes maintenant connecté.",
        });

        // Redirection vers la page d'origine ou le dashboard
        const from = (location.state as any)?.from?.pathname || "/dashboard";
        navigate(from, { replace: true });
      } else {
        toast.error("Erreur de connexion", {
          description: result.error || "Identifiant ou mot de passe incorrect.",
        });
      }
    } catch (error: any) {
      console.error("Login error:", error);
      const code = error.response?.data?.code;
      if (code === "EMAIL_NOT_VERIFIED") {
        setEmailNotVerified(true);
      } else {
        toast.error("Erreur de connexion", {
          description:
            error.response?.data?.message ||
            error.message ||
            "Une erreur est survenue lors de la connexion.",
        });
      }
    }
  };

  return (
    <AuthPageContainer
      title="Bienvenue"
      subtitle="Connectez-vous à votre compte ClubManager"
      footer={
        <>
          {/* Lien vers inscription */}
          <p className="text-center text-sm text-gray-600">
            Vous n'avez pas de compte ?{" "}
            <Link
              to="/register"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Créer un compte
            </Link>
          </p>

          {/* Footer CGU */}
          <p className="text-center text-xs text-gray-500 mt-4">
            En vous connectant, vous acceptez nos{" "}
            <Link to="/terms" className="underline hover:text-gray-700">
              Conditions d'utilisation
            </Link>{" "}
            et notre{" "}
            <Link to="/privacy" className="underline hover:text-gray-700">
              Politique de confidentialité
            </Link>
          </p>
        </>
      }
    >
      {/* Bandeau succès inscription */}
      {registerSuccessMessage && (
        <AlertBanner
          variant="success"
          title="Inscription réussie !"
          message={registerSuccessMessage}
          dismissible
          onDismiss={() => setRegisterSuccessMessage(null)}
          className="mb-6"
        />
      )}

      {/* Bandeau email non vérifié (custom car contient un lien avec icône) */}
      {emailNotVerified && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-300 rounded-lg">
          <p className="text-sm font-medium text-amber-800 mb-1 flex items-center gap-2">
            <ExclamationTriangleIcon className="h-4 w-4 text-amber-600" />
            Adresse email non vérifiée
          </p>
          <p className="text-sm text-amber-700 mb-3">
            Veuillez vérifier votre adresse email avant de vous connecter.
            Consultez votre boîte de réception.
          </p>
          <Link
            to="/resend-verification"
            className="text-sm font-medium text-amber-800 underline hover:text-amber-900 transition-colors"
          >
            <span className="inline-flex items-center gap-2">
              Renvoyer l'email de vérification
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                />
              </svg>
            </span>
          </Link>
        </div>
      )}

      {/* Formulaire de connexion */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Identifiant membre */}
        <FormField
          id="userId"
          label="Identifiant membre"
          required
          error={errors.userId?.message}
        >
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <UserIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="userId"
              type="text"
              autoComplete="username"
              {...register("userId")}
              className={`block w-full pl-10 pr-3 py-3 border ${
                errors.userId
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors`}
              placeholder="U-2025-0001"
            />
          </div>
        </FormField>

        {/* Mot de passe */}
        <FormField
          id="password"
          label="Mot de passe"
          required
          error={errors.password?.message}
        >
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
              <LockIcon className="h-5 w-5 text-gray-400" />
            </div>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <PasswordInput
                  id="password"
                  value={field.value || ""}
                  onChange={field.onChange}
                  hasError={!!errors.password}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`pl-10 ${
                    errors.password
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  }`}
                />
              )}
            />
          </div>
        </FormField>

        {/* Lien mot de passe oublié et Remember me */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
            />
            <label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-gray-700 cursor-pointer"
            >
              Se souvenir de moi
            </label>
          </div>

          <div className="text-sm">
            <Link
              to="/forgot-password"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Mot de passe oublié ?
            </Link>
          </div>
        </div>

        {/* Bouton de soumission */}
        <SubmitButton
          isLoading={isSubmitting || isLoading}
          loadingText="Connexion en cours..."
          fullWidth
        >
          Se connecter
        </SubmitButton>
      </form>
    </AuthPageContainer>
  );
};

export default LoginPage;
