/**
 * EmailVerificationPage - MIGRÉ VERS COMPOSANTS RÉUTILISABLES
 *
 * Page de vérification d'email avec le token reçu par email.
 * Utilise les composants réutilisables pour une meilleure cohérence et maintenabilité.
 *
 * COMPOSANTS UTILISÉS :
 * - AuthPageContainer : Layout cohérent pour toutes les pages d'auth
 * - AlertBanner : Messages de succès/erreur avec variants visuels
 * - LoadingSpinner : Spinner de chargement réutilisable
 * - SubmitButton : Bouton de soumission avec état loading
 *
 * INTERNATIONALISÉ - Utilise react-i18next pour tous les textes
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { EnvelopeIcon } from "@patternfly/react-icons";
import { verifyEmail, resendVerificationEmail } from "@/shared/api/authApi";
import {
  resendVerificationEmailSchema,
  type ResendVerificationEmailInput,
} from "@clubmanager/types";

// Composants réutilisables
import { AuthPageContainer } from "@/shared/components/Auth/AuthPageContainer";
import { AlertBanner } from "@/shared/components/Feedback/AlertBanner";
import { LoadingSpinner } from "@/shared/components/Layout/LoadingSpinner";
import { SubmitButton } from "@/shared/components/Button/SubmitButton";
import { Button } from "@/shared/components/Button/Button";

type VerificationState = "loading" | "success" | "error";

/**
 * EmailVerificationPage Component
 */
export const EmailVerificationPage = () => {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verificationState, setVerificationState] =
    useState<VerificationState>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showResendForm, setShowResendForm] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // Prevent double-call in React StrictMode (dev)
  const verificationDone = useRef(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResendVerificationEmailInput>({
    resolver: zodResolver(resendVerificationEmailSchema),
    mode: "onBlur",
  });

  /**
   * Vérifie l'email au chargement de la page
   */
  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setVerificationState("error");
      setErrorMessage(t("emailVerification.noTokenError"));
      return;
    }

    if (verificationDone.current) return;
    verificationDone.current = true;

    const verify = async () => {
      try {
        await verifyEmail({ token });
        setVerificationState("success");
        toast.success(t("emailVerification.success"), {
          description: t("emailVerification.successDescription"),
        });
      } catch (error: any) {
        // Ne pas écraser un succès précédent (StrictMode double-call)
        setVerificationState((prev) => {
          if (prev === "success") return "success";
          return "error";
        });
        const message =
          error.response?.data?.message ||
          error.message ||
          t("emailVerification.tokenExpiredError");
        setErrorMessage(message);
        toast.error(t("emailVerification.error"), { description: message });
      }
    };

    verify();
  }, [searchParams, t]);

  /**
   * Compte à rebours avant redirection automatique après succès
   */
  useEffect(() => {
    if (verificationState !== "success") return;

    if (countdown === 0) {
      navigate("/login", {
        state: {
          message: t("emailVerification.successLoginMessage"),
        },
      });
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((c) => c - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [verificationState, countdown, navigate, t]);

  /**
   * Renvoie l'email de vérification
   */
  const onResend = async (data: ResendVerificationEmailInput) => {
    try {
      await resendVerificationEmail(data);
      toast.success(t("emailVerification.resendSuccess"), {
        description: t("emailVerification.resendSuccessDescription"),
      });
      setShowResendForm(false);
    } catch (error: any) {
      toast.error(t("emailVerification.resendError"), {
        description:
          error.response?.data?.message ||
          error.message ||
          t("emailVerification.resendErrorDescription"),
      });
    }
  };

  /**
   * Détermine le titre selon l'état
   */
  const getTitle = () => {
    switch (verificationState) {
      case "loading":
        return t("emailVerification.verifying");
      case "success":
        return t("emailVerification.successTitle");
      case "error":
        return t("emailVerification.error");
      default:
        return t("emailVerification.title");
    }
  };

  /**
   * Détermine le sous-titre selon l'état
   */
  const getSubtitle = () => {
    switch (verificationState) {
      case "loading":
        return t("emailVerification.verifyingDescription");
      case "success":
        return t("emailVerification.accountActivated");
      case "error":
        return t("emailVerification.invalidLinkDescription");
      default:
        return "";
    }
  };

  return (
    <AuthPageContainer
      title={getTitle()}
      subtitle={getSubtitle()}
      showLogo
      footer={
        <p className="text-center text-xs text-gray-500">
          {t("emailVerification.needHelp")}{" "}
          <Link to="/support" className="underline hover:text-gray-700">
            {t("emailVerification.contactSupport")}
          </Link>
        </p>
      }
    >
      {/* ── ÉTAT LOADING ── */}
      {verificationState === "loading" && (
        <LoadingSpinner
          size="lg"
          text={t("emailVerification.verifyingEmail")}
        />
      )}

      {/* ── ÉTAT SUCCESS ── */}
      {verificationState === "success" && (
        <div className="space-y-6">
          <AlertBanner
            variant="success"
            title={t("emailVerification.successAlertTitle")}
            message={t("emailVerification.successAlertMessage")}
          />

          {/* Countdown avec barre de progression */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">
              {t("emailVerification.redirectingIn")}{" "}
              <span className="font-semibold text-blue-600">{countdown}s</span>
            </p>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full bg-blue-500 transition-all duration-1000"
                style={{ width: `${(countdown / 3) * 100}%` }}
              />
            </div>
          </div>

          {/* Bouton de redirection manuelle */}
          <SubmitButton
            isLoading={false}
            fullWidth
            onClick={() =>
              navigate("/login", {
                state: {
                  message: t("emailVerification.successLoginMessage"),
                },
              })
            }
            type="button"
          >
            {t("emailVerification.loginNow")}
          </SubmitButton>
        </div>
      )}

      {/* ── ÉTAT ERROR ── */}
      {verificationState === "error" && (
        <div className="space-y-6">
          <AlertBanner
            variant="danger"
            title={t("emailVerification.invalidLinkTitle")}
            message={errorMessage || t("emailVerification.invalidLinkMessage")}
          />

          {/* Formulaire de renvoi OU boutons d'action */}
          {!showResendForm ? (
            <div className="space-y-3">
              <SubmitButton
                isLoading={false}
                fullWidth
                onClick={() => setShowResendForm(true)}
                type="button"
              >
                {t("emailVerification.resend")}
              </SubmitButton>

              <Button
                variant="outline"
                fullWidth
                onClick={() => navigate("/login")}
              >
                {t("emailVerification.backToLogin")}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onResend)} className="space-y-4">
              {/* Champ email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2 text-left"
                >
                  {t("emailVerification.emailLabel")}
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
                    placeholder={t("emailVerification.emailPlaceholder")}
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 text-left">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Boutons d'action */}
              <div className="space-y-3">
                <SubmitButton
                  isLoading={isSubmitting}
                  loadingText={t("emailVerification.sending")}
                  fullWidth
                >
                  {t("emailVerification.resendEmail")}
                </SubmitButton>

                <Button
                  variant="outline"
                  fullWidth
                  type="button"
                  onClick={() => setShowResendForm(false)}
                  disabled={isSubmitting}
                >
                  {t("emailVerification.cancel")}
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </AuthPageContainer>
  );
};

export default EmailVerificationPage;
