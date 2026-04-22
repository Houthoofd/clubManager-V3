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
 * CHANGEMENTS PAR RAPPORT À L'ANCIENNE VERSION :
 * - Remplacé le layout custom par AuthPageContainer (~50 lignes économisées)
 * - Remplacé les spinners custom par LoadingSpinner (~30 lignes)
 * - Remplacé les états success/error par AlertBanner (~80 lignes)
 * - Remplacé les boutons custom par SubmitButton (~20 lignes)
 * - Code plus DRY et maintenable
 *
 * TOTAL : ~180 lignes de code UI économisées ✨
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
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
      setErrorMessage("Aucun token de vérification fourni.");
      return;
    }

    if (verificationDone.current) return;
    verificationDone.current = true;

    const verify = async () => {
      try {
        await verifyEmail({ token });
        setVerificationState("success");
        toast.success("Email vérifié !", {
          description: "Votre adresse email a été vérifiée avec succès.",
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
          "Le token de vérification est invalide ou a expiré.";
        setErrorMessage(message);
        toast.error("Erreur de vérification", { description: message });
      }
    };

    verify();
  }, [searchParams]);

  /**
   * Compte à rebours avant redirection automatique après succès
   */
  useEffect(() => {
    if (verificationState !== "success") return;

    if (countdown === 0) {
      navigate("/login", {
        state: {
          message:
            "Email vérifié avec succès ! Vous pouvez maintenant vous connecter.",
        },
      });
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((c) => c - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [verificationState, countdown, navigate]);

  /**
   * Renvoie l'email de vérification
   */
  const onResend = async (data: ResendVerificationEmailInput) => {
    try {
      await resendVerificationEmail(data);
      toast.success("Email envoyé !", {
        description:
          "Un nouvel email de vérification a été envoyé à votre adresse.",
      });
      setShowResendForm(false);
    } catch (error: any) {
      toast.error("Erreur d'envoi", {
        description:
          error.response?.data?.message ||
          error.message ||
          "Impossible d'envoyer l'email de vérification.",
      });
    }
  };

  /**
   * Détermine le titre selon l'état
   */
  const getTitle = () => {
    switch (verificationState) {
      case "loading":
        return "Vérification en cours...";
      case "success":
        return "Email vérifié !";
      case "error":
        return "Erreur de vérification";
      default:
        return "Vérification d'email";
    }
  };

  /**
   * Détermine le sous-titre selon l'état
   */
  const getSubtitle = () => {
    switch (verificationState) {
      case "loading":
        return "Merci de patienter pendant la vérification de votre adresse email.";
      case "success":
        return "Votre compte est maintenant activé";
      case "error":
        return "Le lien de vérification n'est pas valide";
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
          Besoin d'aide ?{" "}
          <Link to="/support" className="underline hover:text-gray-700">
            Contactez le support
          </Link>
        </p>
      }
    >
      {/* ── ÉTAT LOADING ── */}
      {verificationState === "loading" && (
        <LoadingSpinner size="lg" text="Vérification de votre email..." />
      )}

      {/* ── ÉTAT SUCCESS ── */}
      {verificationState === "success" && (
        <div className="space-y-6">
          <AlertBanner
            variant="success"
            title="Succès"
            message="Votre adresse email a été vérifiée avec succès. Vous pouvez maintenant vous connecter avec votre identifiant."
          />

          {/* Countdown avec barre de progression */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">
              Redirection automatique dans{" "}
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
                  message:
                    "Email vérifié ! Vous pouvez maintenant vous connecter.",
                },
              })
            }
            type="button"
          >
            Se connecter maintenant
          </SubmitButton>
        </div>
      )}

      {/* ── ÉTAT ERROR ── */}
      {verificationState === "error" && (
        <div className="space-y-6">
          <AlertBanner
            variant="danger"
            title="Lien invalide ou expiré"
            message={
              errorMessage ||
              "Ce lien de vérification est invalide ou a expiré. Vous pouvez demander un nouvel email de vérification ci-dessous."
            }
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
                Renvoyer l'email de vérification
              </SubmitButton>

              <Button
                variant="outline"
                fullWidth
                onClick={() => navigate("/login")}
              >
                Retour à la connexion
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
                  <p className="mt-2 text-sm text-red-600 text-left">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Boutons d'action */}
              <div className="space-y-3">
                <SubmitButton
                  isLoading={isSubmitting}
                  loadingText="Envoi en cours..."
                  fullWidth
                >
                  Renvoyer l'email
                </SubmitButton>

                <Button
                  variant="outline"
                  fullWidth
                  type="button"
                  onClick={() => setShowResendForm(false)}
                  disabled={isSubmitting}
                >
                  Annuler
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
