/**
 * ResetPasswordPage
 * Page de réinitialisation de mot de passe avec token
 */

import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  EyeIcon,
  EyeSlashIcon,
  LockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@patternfly/react-icons";
import { resetPassword } from "@/shared/api/authApi";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@clubmanager/types";

/**
 * Calcule la force du mot de passe
 */
const calculatePasswordStrength = (password: string): number => {
  let strength = 0;
  if (password.length >= 8) strength += 25;
  if (password.length >= 12) strength += 15;
  if (/[a-z]/.test(password)) strength += 15;
  if (/[A-Z]/.test(password)) strength += 15;
  if (/[0-9]/.test(password)) strength += 15;
  if (/[^a-zA-Z0-9]/.test(password)) strength += 15;
  return Math.min(strength, 100);
};

/**
 * Obtient la couleur du mot de passe selon sa force
 */
const getPasswordStrengthColor = (strength: number): string => {
  if (strength < 30) return "bg-red-500";
  if (strength < 60) return "bg-orange-500";
  if (strength < 80) return "bg-yellow-500";
  return "bg-green-500";
};

/**
 * Obtient le texte de la force du mot de passe
 */
const getPasswordStrengthText = (strength: number): string => {
  if (strength < 30) return "Faible";
  if (strength < 60) return "Moyen";
  if (strength < 80) return "Fort";
  return "Très fort";
};

/**
 * ResetPasswordPage Component
 */
export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
  const passwordStrength = useMemo(
    () => calculatePasswordStrength(newPassword || ""),
    [newPassword],
  );

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
  }, [searchParams]);

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Réinitialisation de mot de passe
            </h1>
          </div>

          <div className="bg-white shadow-2xl rounded-2xl p-8">
            <div className="text-center py-8">
              <ExclamationCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Lien invalide
              </h2>
              <p className="text-gray-600 mb-6">{tokenError}</p>
              <button
                onClick={() => navigate("/forgot-password")}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Demander un nouveau lien
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Nouveau mot de passe
          </h1>
          <p className="text-gray-600">
            Choisissez un nouveau mot de passe sécurisé
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white shadow-2xl rounded-2xl p-8">
          {!resetSuccess ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Nouveau mot de passe */}
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    {...register("newPassword")}
                    className={`block w-full pl-10 pr-12 py-3 border ${
                      errors.newPassword
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors"
                    aria-label={
                      showPassword
                        ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
                    }
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.newPassword.message}
                  </p>
                )}

                {/* Indicateur de force du mot de passe */}
                {newPassword && newPassword.length > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-700">
                        Force du mot de passe
                      </span>
                      <span className="text-xs font-medium text-gray-700">
                        {getPasswordStrengthText(passwordStrength)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(
                          passwordStrength,
                        )}`}
                        style={{ width: `${passwordStrength}%` }}
                      ></div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Utilisez au moins 8 caractères avec majuscules,
                      minuscules, chiffres et caractères spéciaux
                    </p>
                  </div>
                )}
              </div>

              {/* Confirmation mot de passe */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    {...register("confirmPassword")}
                    className={`block w-full pl-10 pr-12 py-3 border ${
                      errors.confirmPassword
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors"
                    aria-label={
                      showConfirmPassword
                        ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.confirmPassword.message}
                  </p>
                )}
                {!errors.confirmPassword &&
                  confirmPassword &&
                  confirmPassword.length > 0 && (
                    <p
                      className={`mt-2 text-xs font-medium ${
                        newPassword === confirmPassword
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      {newPassword === confirmPassword
                        ? "✓ Les mots de passe correspondent"
                        : "✗ Les mots de passe ne correspondent pas"}
                    </p>
                  )}
              </div>

              {/* Bouton de soumission */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
                  isSubmitting
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                } transition-colors`}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    Réinitialisation en cours...
                  </>
                ) : (
                  "Réinitialiser le mot de passe"
                )}
              </button>

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
            <div className="text-center py-8">
              <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Mot de passe réinitialisé !
              </h2>
              <p className="text-gray-600 mb-6">
                Votre mot de passe a été modifié avec succès. Vous allez être
                redirigé vers la page de connexion...
              </p>
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
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500">
          Vous vous souvenez de votre mot de passe ?{" "}
          <Link to="/login" className="underline hover:text-gray-700">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
