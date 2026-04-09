/**
 * EmailVerificationPage
 * Page de vérification d'email avec le token reçu par email
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  EnvelopeIcon,
} from "@patternfly/react-icons";
import { verifyEmail, resendVerificationEmail } from "@/shared/api/authApi";
import {
  resendVerificationEmailSchema,
  type ResendVerificationEmailInput,
} from "@clubmanager/types";

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Vérification d'email
          </h1>
          <p className="text-gray-600">
            {verificationState === "loading"
              ? "Vérification de votre adresse email en cours..."
              : verificationState === "success"
                ? "Votre email a été confirmé !"
                : "Une erreur est survenue"}
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white shadow-2xl rounded-2xl p-8">
          {/* ── Loading State ── */}
          {verificationState === "loading" && (
            <div className="text-center py-10">
              {/* Animated rings */}
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
                <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                <div className="absolute inset-2 rounded-full border-4 border-t-indigo-400 border-r-transparent border-b-transparent border-l-transparent animate-spin [animation-duration:1.5s]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <EnvelopeIcon className="h-8 w-8 text-blue-500" />
                </div>
              </div>
              <p className="text-gray-700 text-lg font-medium mb-2">
                Vérification en cours...
              </p>
              <p className="text-gray-500 text-sm">
                Merci de patienter quelques instants.
              </p>
              {/* Animated dots */}
              <div className="flex justify-center space-x-1 mt-4">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}

          {/* ── Success State ── */}
          {verificationState === "success" && (
            <div className="text-center py-8">
              {/* Animated checkmark circle */}
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full bg-green-100 animate-ping opacity-40" />
                <div className="relative w-24 h-24 rounded-full bg-green-50 flex items-center justify-center">
                  <CheckCircleIcon className="h-14 w-14 text-green-500" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Email vérifié !
              </h2>
              <p className="text-gray-600 mb-6">
                Votre adresse email a été vérifiée avec succès. Vous pouvez
                maintenant vous connecter avec votre identifiant.
              </p>

              {/* Countdown bar */}
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-2">
                  Redirection automatique dans{" "}
                  <span className="font-semibold text-blue-600">
                    {countdown}s
                  </span>
                </p>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full bg-blue-500 transition-all duration-1000"
                    style={{ width: `${(countdown / 3) * 100}%` }}
                  />
                </div>
              </div>

              <button
                onClick={() =>
                  navigate("/login", {
                    state: {
                      message:
                        "Email vérifié ! Vous pouvez maintenant vous connecter.",
                    },
                  })
                }
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Se connecter maintenant
              </button>
            </div>
          )}

          {/* ── Error State ── */}
          {verificationState === "error" && (
            <div className="text-center py-8">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center">
                  <ExclamationCircleIcon className="h-14 w-14 text-red-500" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Lien invalide
              </h2>
              <p className="text-gray-600 mb-6">
                {errorMessage ||
                  "Ce lien de vérification est invalide ou a expiré."}
              </p>

              {!showResendForm ? (
                <div className="space-y-3">
                  <button
                    onClick={() => setShowResendForm(true)}
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Renvoyer l'email de vérification
                  </button>
                  <button
                    onClick={() => navigate("/login")}
                    className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Retour à la connexion
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onResend)} className="space-y-4">
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

                  <div className="space-y-3">
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
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Envoi en cours...
                        </>
                      ) : (
                        "Renvoyer l'email"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowResendForm(false)}
                      className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500">
          Besoin d'aide ?{" "}
          <Link to="/support" className="underline hover:text-gray-700">
            Contactez le support
          </Link>
        </p>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
