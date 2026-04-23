/**
 * ForgotPasswordPage
 * Page de demande de réinitialisation de mot de passe
 *
 * MIGRATION : Utilise désormais les composants réutilisables :
 * - AuthPageContainer : Layout auth avec card et footer
 * - FormField : Champ email avec label et validation
 * - SubmitButton : Bouton de soumission avec état de chargement
 *
 * INTERNATIONALISÉ - Utilise react-i18next pour tous les textes
 */

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { EnvelopeIcon, CheckCircleIcon } from "@patternfly/react-icons";
import { requestPasswordReset } from "@/shared/api/authApi";
import {
  requestPasswordResetSchema,
  type RequestPasswordResetInput,
} from "@clubmanager/types";

// Composants réutilisables
import { AuthPageContainer } from "@/shared/components/Auth/AuthPageContainer";
import { FormField } from "@/shared/components/Forms/FormField";
import { SubmitButton } from "@/shared/components/Button/SubmitButton";

/**
 * ForgotPasswordPage Component
 */
export const ForgotPasswordPage = () => {
  const { t } = useTranslation("auth");
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
      toast.success(t("forgotPassword.emailSentTitle"), {
        description: t("forgotPassword.emailSent"),
      });
    } catch (error: any) {
      // Pour des raisons de sécurité (anti-énumération d'emails),
      // on affiche toujours la page de succès même en cas d'erreur
      setEmailSent(true);
      toast.success(t("forgotPassword.emailSentTitle"), {
        description: t("forgotPassword.emailSentSecurityMessage"),
      });
    }
  };

  return (
    <AuthPageContainer
      title={t("forgotPassword.title")}
      subtitle={t("forgotPassword.description")}
      showLogo={false}
      footer={
        <div className="text-center text-sm text-gray-600">
          {t("forgotPassword.noAccount")}{" "}
          <Link
            to="/register"
            className="text-blue-600 hover:text-blue-500 transition-colors font-medium"
          >
            {t("forgotPassword.createAccount")}
          </Link>
        </div>
      }
    >
      {!emailSent ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email Field */}
          <FormField
            id="email"
            label={t("forgotPassword.email")}
            required
            error={errors.email?.message}
          >
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
                placeholder={t("forgotPassword.emailPlaceholder")}
              />
            </div>
          </FormField>

          {/* Submit Button */}
          <SubmitButton
            isLoading={isSubmitting}
            loadingText={t("forgotPassword.sending")}
            fullWidth
          >
            {t("forgotPassword.submit")}
          </SubmitButton>

          {/* Lien retour connexion */}
          <div className="text-center">
            <Link
              to="/login"
              className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              {t("forgotPassword.backToLogin")}
            </Link>
          </div>
        </form>
      ) : (
        // État de succès (email envoyé)
        <div className="text-center py-8">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t("forgotPassword.checkEmail")}
          </h2>
          <p className="text-gray-600 mb-6">
            {t("forgotPassword.checkEmailDescription")}
          </p>
          <SubmitButton
            isLoading={false}
            fullWidth
            onClick={() => navigate("/login")}
            type="button"
          >
            {t("forgotPassword.backToLogin")}
          </SubmitButton>
        </div>
      )}
    </AuthPageContainer>
  );
};

export default ForgotPasswordPage;
