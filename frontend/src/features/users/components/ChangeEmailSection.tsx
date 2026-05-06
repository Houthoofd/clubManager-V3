/**
 * ChangeEmailSection
 * GAP-15 — Section "Changer d'adresse email" dans ProfilePage
 *
 * Flow :
 * 1. Affiche l'email actuel
 * 2. Formulaire : nouvel email + confirmation
 * 3. POST /api/auth/change-email → email de confirmation envoyé
 * 4. Bannière de succès
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { EnvelopeIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import apiClient from "@/shared/api/apiClient";
import { Card } from "@/shared/components/Card/Card";
import { Button } from "@/shared/components/Button/Button";
import { FormField } from "@/shared/components/Forms/FormField";
import { cn, INPUT } from "@/shared/styles/designTokens";

interface Props {
  currentEmail: string;
  /** flat=true : rendu sans card wrapper, pour intégration dans un onglet */
  flat?: boolean;
}

export function ChangeEmailSection({ currentEmail, flat = false }: Props) {
  const { t } = useTranslation("users");

  const [newEmail, setNewEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Validation ────────────────────────────────────────────────────────────

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValidNew = emailRegex.test(newEmail);
  const isMatch = newEmail === confirmEmail;
  const isDifferent =
    newEmail.trim().toLowerCase() !== currentEmail.toLowerCase();

  const formError =
    newEmail && !isValidNew
      ? t("profile.changeEmail.errorInvalidEmail", "Email invalide")
      : confirmEmail && !isMatch
        ? t(
            "profile.changeEmail.errorMismatch",
            "Les emails ne correspondent pas",
          )
        : newEmail && !isDifferent
          ? t(
              "profile.changeEmail.errorSameEmail",
              "Identique à l'adresse actuelle",
            )
          : null;

  const canSubmit = isValidNew && isMatch && isDifferent && !isPending;

  // ─── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setIsPending(true);

    try {
      await apiClient.post("/auth/change-email", {
        newEmail: newEmail.trim().toLowerCase(),
      });
      setSent(true);
      setNewEmail("");
      setConfirmEmail("");
      toast.success(
        t("profile.changeEmail.successToast", "Email de confirmation envoyé !"),
      );
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        t("profile.changeEmail.errorGeneric", "Erreur lors de la demande");
      setError(msg);
      toast.error(msg);
    } finally {
      setIsPending(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  const formBody = (
    <div className="space-y-4">
      {/* Email actuel */}
      <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-4 py-2.5">
        <span className="font-medium text-gray-500">
          {t("profile.changeEmail.current", "Adresse actuelle")} :
        </span>
        <span className="font-mono">{currentEmail}</span>
      </div>

      {/* Bannière succès */}
      {sent && (
        <div className="flex items-start gap-3 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">
              {t(
                "profile.changeEmail.sentTitle",
                "Email de confirmation envoyé",
              )}
            </p>
            <p className="text-green-700 mt-0.5">
              {t(
                "profile.changeEmail.sentBody",
                "Cliquez sur le lien dans l'email reçu pour finaliser le changement. Le lien est valable 24h.",
              )}
            </p>
          </div>
        </div>
      )}

      {/* Erreur API */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          id="new-email"
          label={t("profile.changeEmail.newEmail", "Nouvel email")}
          required
          error={newEmail && !isValidNew ? (formError ?? undefined) : undefined}
        >
          <input
            id="new-email"
            type="email"
            value={newEmail}
            onChange={(e) => {
              setNewEmail(e.target.value);
              setSent(false);
            }}
            className={cn(INPUT.base)}
            placeholder="nouvelle@adresse.com"
            autoComplete="email"
            disabled={isPending}
          />
        </FormField>

        <FormField
          id="confirm-email"
          label={t(
            "profile.changeEmail.confirmEmail",
            "Confirmer le nouvel email",
          )}
          required
          error={
            confirmEmail && !isMatch ? (formError ?? undefined) : undefined
          }
        >
          <input
            id="confirm-email"
            type="email"
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            className={cn(INPUT.base)}
            placeholder="nouvelle@adresse.com"
            autoComplete="off"
            disabled={isPending}
          />
        </FormField>

        {formError && newEmail && confirmEmail && (
          <p className="text-sm text-red-600">{formError}</p>
        )}

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            loading={isPending}
            disabled={!canSubmit}
          >
            {isPending
              ? t("profile.changeEmail.sending", "Envoi en cours…")
              : t("profile.changeEmail.submit", "Envoyer la confirmation")}
          </Button>
        </div>
      </form>
    </div>
  );

  // Mode flat : rendu inline sans card (usage dans onglet Sécurité)
  if (flat) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-4">
          <EnvelopeIcon className="h-5 w-5 text-blue-600" />
          <h3 className="text-base font-semibold text-gray-900">
            {t("profile.changeEmail.title", "Changer d'adresse email")}
          </h3>
        </div>
        {formBody}
      </div>
    );
  }

  // Mode standalone : rendu avec card wrapper
  return (
    <Card>
      <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
        <EnvelopeIcon className="h-5 w-5 text-blue-600" />
        <h2 className="text-base font-semibold text-gray-900">
          {t("profile.changeEmail.title", "Changer d'adresse email")}
        </h2>
      </div>
      <div className="px-6 py-5">{formBody}</div>
    </Card>
  );
}
