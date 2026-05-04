/**
 * RecoveryRequestPage
 * Page publique de demande de récupération de compte
 * Permet à un utilisateur bloqué de soumettre une demande manuelle
 *
 * ACCÈS PUBLIC — aucune authentification requise
 * INTERNATIONALISÉ — Utilise react-i18next avec fallbacks français
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { EnvelopeIcon, CheckCircleIcon } from "@patternfly/react-icons";

import apiClient from "@/shared/api/apiClient";

// Composants réutilisables
import { AuthPageContainer } from "@/shared/components/Auth/AuthPageContainer";
import { FormField } from "@/shared/components/Forms/FormField";
import { SubmitButton } from "@/shared/components/Button/SubmitButton";

// ─── SCHEMA DE VALIDATION ────────────────────────────────────────────────────

const recoveryRequestSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  reason: z
    .string()
    .min(10, "La raison doit contenir au moins 10 caractères"),
});

type RecoveryRequestInput = z.infer<typeof recoveryRequestSchema>;

// ─── COMPOSANT ───────────────────────────────────────────────────────────────

/**
 * RecoveryRequestPage Component
 * Formulaire public de demande de récupération de compte
 */
export const RecoveryRequestPage = () => {
  const { t } = useTranslation("auth");
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RecoveryRequestInput>({
    resolver: zodResolver(recoveryRequestSchema),
    mode: "onBlur",
  });

  /**
   * Soumission du formulaire de demande de récupération
   */
  const onSubmit = async (data: RecoveryRequestInput) => {
    try {
      await apiClient.post("/recovery/public", data);
      setSubmitted(true);
      toast.success(
        t("recoveryRequest.successTitle", "Demande envoyée"),
        {
          description: t(
            "recoveryRequest.successMessage",
            "Votre demande a été soumise avec succès.",
          ),
        },
      );
    } catch (error: any) {
      const message =
        error?.response?.data?.message ??
        t(
          "recoveryRequest.errorMessage",
          "Une erreur est survenue. Veuillez réessayer.",
        );
      toast.error(t("recoveryRequest.errorTitle", "Erreur"), {
        description: message,
      });
    }
  };

  return (
    <AuthPageContainer
      title={t(
        "recoveryRequest.title",
        "Demande de récupération de compte",
      )}
      subtitle={t(
        "recoveryRequest.description",
        "Expliquez votre situation pour que l'équipe puisse vous aider à récupérer l'accès à votre compte.",
      )}
      showLogo={false}
      footer={
        <div className="text-center text-sm text-gray-600">
          <Link
            to="/login"
            className="text-blue-600 hover:text-blue-500 transition-colors font-medium"
          >
            {t("recoveryRequest.backToLogin", "Retour à la connexion")}
          </Link>
        </div>
      }
    >
      {!submitted ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Champ Email */}
          <FormField
            id="email"
            label={t("recoveryRequest.email", "Adresse email")}
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
                placeholder={t(
                  "recoveryRequest.emailPlaceholder",
                  "votre@email.com",
                )}
              />
            </div>
          </FormField>

          {/* Champ Raison */}
          <FormField
            id="reason"
            label={t("recoveryRequest.reason", "Raison de la demande")}
            required
            error={errors.reason?.message}
            helpText={
              !errors.reason
                ? t(
                    "recoveryRequest.reasonHelp",
                    "Minimum 10 caractères. Soyez précis pour faciliter le traitement.",
                  )
                : undefined
            }
          >
            <textarea
              id="reason"
              rows={5}
              {...register("reason")}
              className={`block w-full px-3 py-3 border ${
                errors.reason
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors resize-none`}
              placeholder={t(
                "recoveryRequest.reasonPlaceholder",
                "Expliquez pourquoi vous ne pouvez plus accéder à votre compte (minimum 10 caractères)...",
              )}
            />
          </FormField>

          {/* Bouton de soumission */}
          <SubmitButton
            isLoading={isSubmitting}
            loadingText={t("recoveryRequest.sending", "Envoi en cours...")}
            fullWidth
          >
            {t("recoveryRequest.submit", "Envoyer ma demande")}
          </SubmitButton>

          {/* Lien retour connexion */}
          <div className="text-center">
            <Link
              to="/login"
              className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              {t("recoveryRequest.backToLogin", "Retour à la connexion")}
            </Link>
          </div>
        </form>
      ) : (
        // État de succès — demande soumise
        <div className="text-center py-8">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t("recoveryRequest.successTitle", "Demande envoyée !")}
          </h2>
          <p className="text-gray-600 mb-6">
            {t(
              "recoveryRequest.successDescription",
              "Votre demande de récupération a bien été reçue. L'équipe vous contactera prochainement à l'adresse email fournie.",
            )}
          </p>
          <SubmitButton isLoading={false} fullWidth type="button">
            <Link to="/login" className="text-white no-underline">
              {t("recoveryRequest.backToLogin", "Retour à la connexion")}
            </Link>
          </SubmitButton>
        </div>
      )}
    </AuthPageContainer>
  );
};

export default RecoveryRequestPage;
