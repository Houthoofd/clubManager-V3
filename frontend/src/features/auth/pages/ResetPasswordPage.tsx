/**
 * ResetPasswordPage
 * Page de réinitialisation de mot de passe avec token
 *
 * MIGRATION v2.0 - Utilise les composants réutilisables :
 * - AuthPageContainer : Layout et structure de page
 * - PasswordInput : Champs password avec toggle et indicateur de force
 * - SubmitButton : Bouton de soumission avec état de chargement
 * - ErrorBanner : Messages d'erreur
 */

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CheckCircleIcon } from "@patternfly/react-icons";
import { resetPassword } from "@/shared/api/authApi";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@clubmanager/types";
import { AuthPageContainer } from "@/shared/components/Auth";
import { PasswordInput } from "@/shared/components/Input/PasswordInput";
import { FormField } from "@/shared/components/Forms";
import { SubmitButton } from "@/shared/components/Button";
import { AlertBanner } from "@/shared/components/Feedback";

/**
 * ResetPasswordPage Component
 */
export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [resetSuccess, setResetSuccess] = useState(false);
  const [tokenError, setTokenError] = useState<string>("");

  const token = searchParams.get("token") ?? "";

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const newPassword = watch("newPassword");
  const confirmPassword = watch("confirmPassword");

  // Re-valider confirmPassword à chaque changement de newPassword
  useEffect(() => {
    if (confirmPassword) {
      trigger("confirmPassword");
    }
  }, [newPassword, confirmPassword, trigger]);

  /**
   * Vérifie la présence du token au chargement
   */
  useEffect(() => {
    if (!token) {
      setTokenError("Aucun token de réinitialisation fourni.");
      toast.error("Erreur", {
        description: "Le lien de réinitialisation est invalide.",
      });
    }
  }, [token]);

  /**
   * Soumission du formulaire de réinitialisation
   */
  const onSubmit = async (data: ResetPasswordInput) => {
    // Vérification explicite côté client (filet de sécurité)
    if (data.newPassword !== data.confirmPassword) {
      setError("confirmPassword", {
        message: "Les mots de passe ne correspondent pas",
      });
      return;
    }

    try {
      await resetPassword(data);

      setResetSuccess(true);
      toast.success("Mot de passe réinitialisé !", {
        description: "Votre mot de passe a été modifié avec succès.",
      });

      // Redirection vers la page de connexion après 2 secondes
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Le token est invalide ou a expiré.";

      toast.error("Erreur de réinitialisation", {
        description: message,
      });

      if (message.includes("token") || message.includes("expiré")) {
        setTokenError(message);
      }
    }
  };

  // Si le token est manquant ou invalide dès le départ
  if (tokenError && !searchParams.get("token")) {
    return (
      <AuthPageContainer
        title="Réinitialisation de mot de passe"
        subtitle="Lien invalide ou expiré"
        showLogo={false}
      >
        <div className="space-y-6">
          <AlertBanner
            variant="error"
            title="Lien invalide"
            message={tokenError}
          />

          <SubmitButton
            isLoading={false}
            fullWidth
            variant="primary"
            type="button"
            onClick={() => navigate("/forgot-password")}
          >
            Demander un nouveau lien
          </SubmitButton>

          <div className="text-center">
            <Link
              to="/login"
              className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Retour à la connexion
            </Link>
          </div>
        </div>
      </AuthPageContainer>
    );
  }

  return (
    <AuthPageContainer
      title="Nouveau mot de passe"
      subtitle="Choisissez un nouveau mot de passe sécurisé"
      showLogo={false}
      footer={
        <p className="text-center text-sm text-gray-500">
          Vous vous souvenez de votre mot de passe ?{" "}
          <Link
            to="/login"
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Se connecter
          </Link>
        </p>
      }
    >
      {!resetSuccess ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Nouveau mot de passe avec indicateur de force */}
          <FormField
            id="newPassword"
            label="Nouveau mot de passe"
            required
            error={errors.newPassword?.message}
            helpText="Utilisez au moins 8 caractères avec majuscules, minuscules, chiffres et caractères spéciaux"
          >
            <PasswordInput
              id="newPassword"
              value={newPassword}
              {...register("newPassword")}
              showStrengthIndicator
              hasError={!!errors.newPassword}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </FormField>

          {/* Confirmation mot de passe */}
          <FormField
            id="confirmPassword"
            label="Confirmer le mot de passe"
            required
            error={errors.confirmPassword?.message}
          >
            <div className="space-y-2">
              <PasswordInput
                id="confirmPassword"
                value={confirmPassword}
                {...register("confirmPassword")}
                hasError={!!errors.confirmPassword}
                placeholder="••••••••"
                autoComplete="new-password"
              />

              {/* Indicateur de correspondance des mots de passe */}
              {!errors.confirmPassword &&
                confirmPassword &&
                confirmPassword.length > 0 && (
                  <p
                    className={`text-xs font-medium flex items-center gap-1 ${
                      newPassword === confirmPassword
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {newPassword === confirmPassword ? (
                      <>
                        <svg
                          className="h-3.5 w-3.5 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.5 12.75l6 6 9-13.5"
                          />
                        </svg>
                        Les mots de passe correspondent
                      </>
                    ) : (
                      <>
                        <svg
                          className="h-3.5 w-3.5 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                        Les mots de passe ne correspondent pas
                      </>
                    )}
                  </p>
                )}
            </div>
          </FormField>

          {/* Bouton de soumission */}
          <SubmitButton
            isLoading={isSubmitting}
            loadingText="Réinitialisation en cours..."
            fullWidth
          >
            Réinitialiser le mot de passe
          </SubmitButton>

          {/* Lien retour connexion */}
          <div className="text-center">
            <Link
              to="/login"
              className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Retour à la connexion
            </Link>
          </div>
        </form>
      ) : (
        <div className="text-center py-8 space-y-6">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Mot de passe réinitialisé !
            </h2>
            <p className="text-gray-600">
              Votre mot de passe a été modifié avec succès. Vous allez être
              redirigé vers la page de connexion...
            </p>
          </div>
          <div className="flex justify-center">
            <svg
              className="animate-spin h-8 w-8 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        </div>
      )}
    </AuthPageContainer>
  );
};

// Export par défaut pour compatibilité avec l'index
export default ResetPasswordPage;
