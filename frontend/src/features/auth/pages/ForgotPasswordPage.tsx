/**
 * ForgotPasswordPage
 * Page de demande de réinitialisation de mot de passe
 */

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { EnvelopeIcon, CheckCircleIcon } from "@patternfly/react-icons";
import { requestPasswordReset } from "@/shared/api/authApi";
import {
  requestPasswordResetSchema,
  type RequestPasswordResetInput,
} from "@clubmanager/types";

/**
 * ForgotPasswordPage Component
 */
export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RequestPasswordResetInput>({
    resolver: zodResolver(requestPasswordResetSchema),
    mode: "onBlur",
  });

  /**
   * Soumission du formulaire de demande de réinitialisation
   */
  const onSubmit = async (data: RequestPasswordResetInput) => {
    try {
      await requestPasswordReset(data);
      setEmailSent(true);
      toast.success("Email envoyé !", {
        description:
          "Vérifiez votre boîte de réception pour réinitialiser votre mot de passe.",
      });
    } catch (error: any) {
      // Pour des raisons de sécurité (anti-énumération d'emails),
      // on affiche toujours la page de succès même en cas d'erreur
      setEmailSent(true);
      toast.success("Email envoyé !", {
        description:
          "Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Mot de passe oublié ?
          </h1>
          <p className="text-gray-600">
            Entrez votre adresse email pour recevoir un lien de réinitialisation
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white shadow-2xl rounded-2xl p-8">
          {!emailSent ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Adresse email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    {...register("email")}
                    className={`block w-full pl-10 pr-3 py-3 border ${
                      errors.email
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors`}
                    placeholder="exemple@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.email.message}
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
                    Envoi en cours...
                  </>
                ) : (
                  "Envoyer le lien de réinitialisation"
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
                Email envoyé !
              </h2>
              <p className="text-gray-600 mb-6">
                Vérifiez votre boîte de réception pour le lien de
                réinitialisation. Si vous ne recevez pas d'email dans quelques
                minutes, vérifiez vos spams.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Retour à la connexion
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500">
          Vous n'avez pas de compte ?{" "}
          <Link to="/register" className="underline hover:text-gray-700">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
