/**
 * RegisterPage
 * Page d'inscription avec formulaire de création de compte
 *
 * MIGRÉ v2.0 - Utilise les composants du design system :
 * - AuthPageContainer : Layout auth avec card centrée et logo
 * - FormField : Gestion des labels, erreurs et help text
 * - Input : Champs texte, email, date
 * - SelectField : Champ de sélection pour le genre
 * - PasswordInput : Champ mot de passe avec toggle visibilité et indicateur de force
 * - PasswordRequirements : Affichage détaillé des exigences de validation
 * - SubmitButton : Bouton de soumission avec état loading
 *
 * INTERNATIONALISÉ - Utilise react-i18next pour tous les textes
 */

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import { useAuth } from "../../../shared/hooks/useAuth";
import { useGenres } from "../../../shared/hooks/useReferences";
import type { RegisterDto } from "@clubmanager/types";
import { validateInvitationToken } from "../../invitations/api/invitationApi";

import { AuthPageContainer } from "../../../shared/components/Auth";
import { FormField } from "../../../shared/components/Forms";
import { Input } from "../../../shared/components/Input";
import { SelectField } from "../../../shared/components/Forms/SelectField";
import { PasswordInput } from "../../../shared/components/Input/PasswordInput";
import { PasswordRequirements } from "../../../shared/components/Input/PasswordRequirements";
import { SubmitButton } from "../../../shared/components/Button";

// ─── TYPES ───────────────────────────────────────────────────────────────────

type RegisterFormData = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  date_of_birth: string;
  genre_id: string;
  abonnement_id?: string;
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/**
 * Date maximale : 5 ans minimum (date de naissance maximale)
 */
const getMaxBirthDate = (): string => {
  const today = new Date();
  const maxDate = new Date(
    today.getFullYear() - 5,
    today.getMonth(),
    today.getDate(),
  );
  const year = maxDate.getFullYear();
  const month = String(maxDate.getMonth() + 1).padStart(2, "0");
  const day = String(maxDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Date minimale : 120 ans maximum
 */
const getMinBirthDate = (): string => {
  const today = new Date();
  const minDate = new Date(
    today.getFullYear() - 120,
    today.getMonth(),
    today.getDate(),
  );
  const year = minDate.getFullYear();
  const month = String(minDate.getMonth() + 1).padStart(2, "0");
  const day = String(minDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// ─── COMPOSANT ───────────────────────────────────────────────────────────────

export const RegisterPage = () => {
  const { t, i18n } = useTranslation("auth");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register: registerUser, isLoading, isAuthenticated, logout, user } = useAuth();
  const genres = useGenres();

  // 🔄 État invitation 🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄
  const [invitationToken, setInvitationToken] = useState<string | null>(null);
  const [invitationEmail, setInvitationEmail] = useState<string | null>(null);
  const [invitationError, setInvitationError] = useState<string | null>(null);
  const [validatingToken, setValidatingToken] = useState(true);

  // ─── VALIDATION SCHEMA (dynamique avec traductions) ───────────────────────

  const registerFormSchema = z.object({
    first_name: z
      .string()
      .min(2, t("errors.firstNameTooShort"))
      .max(50, t("errors.firstNameTooLong"))
      .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, t("errors.firstNameInvalidChars")),
    last_name: z
      .string()
      .min(2, t("errors.lastNameTooShort"))
      .max(50, t("errors.lastNameTooLong"))
      .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, t("errors.lastNameInvalidChars")),
    email: z.string().email(t("errors.emailInvalid")),
    password: z
      .string()
      .min(8, t("errors.passwordTooShort"))
      .regex(/[A-Z]/, t("errors.passwordNeedsUppercase"))
      .regex(/[a-z]/, t("errors.passwordNeedsLowercase"))
      .regex(/[0-9]/, t("errors.passwordNeedsNumber"))
      .regex(
        /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
        t("errors.passwordNeedsSpecial"),
      ),
    date_of_birth: z
      .string()
      .refine(
        (dateStr) => {
          if (!dateStr) return false;
          const parts = dateStr.split("-").map(Number);
          if (parts.length !== 3) return false;
          const [year, month, day] = parts;
          if (!year || !month || !day) return false;
          const birthDate = new Date(year, month - 1, day);
          const today = new Date();

          const minAgeDate = new Date(
            today.getFullYear() - 5,
            today.getMonth(),
            today.getDate(),
          );

          return birthDate <= minAgeDate;
        },
        {
          message: t("errors.ageTooYoung"),
        },
      )
      .refine(
        (dateStr) => {
          const parts = dateStr.split("-").map(Number);
          if (parts.length !== 3) return true;
          const [year, month, day] = parts;
          if (!year || !month || !day) return true;
          const birthDate = new Date(year, month - 1, day);
          const today = new Date();
          return birthDate < today;
        },
        {
          message: t("errors.birthDateFuture"),
        },
      )
      .refine(
        (dateStr) => {
          const parts = dateStr.split("-").map(Number);
          if (parts.length !== 3) return true;
          const [year, month, day] = parts;
          if (!year || !month || !day) return true;
          const birthDate = new Date(year, month - 1, day);
          const today = new Date();
          const maxAgeDate = new Date(
            today.getFullYear() - 120,
            today.getMonth(),
            today.getDate(),
          );
          return birthDate >= maxAgeDate;
        },
        {
          message: t("errors.birthDateInvalid"),
        },
      ),
    genre_id: z.string().min(1, t("errors.genderRequired")),
    abonnement_id: z.string().optional(),
  });

  // ─── OPTIONS SELECT ──────────────────────────────────────────────────────────

  const GENRE_OPTIONS =
    genres.length > 0
      ? genres.map((g) => ({
          value: String(g.id),
          label: i18n.language === "en" && g.nom_en ? g.nom_en : g.nom,
        }))
      : [
          { value: "1", label: t("register.genderMale") },
          { value: "2", label: t("register.genderFemale") },
          { value: "3", label: t("register.genderOther") },
        ];

  // React Hook Form avec Zod validation
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    mode: "onChange",
  });

  // ─── Validation du token d invitation ──────────────────────────────────────
  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setInvitationError(t("register.invitationOnly"));
      setValidatingToken(false);
      return;
    }
    validateInvitationToken(token).then((result) => {
      if (result.valid && result.email) {
        setInvitationToken(token);
        setInvitationEmail(result.email);
        setValue("email", result.email);
      } else {
        setInvitationError(result.error ?? t("register.invitationInvalid"));
      }
      setValidatingToken(false);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Soumission du formulaire d'inscription
   */
  const onSubmit = async (data: RegisterFormData) => {
    try {
      console.log("📝 Form data received:", data);

      const registerData: RegisterDto = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        password: data.password,
        date_of_birth: data.date_of_birth,
        genre_id: Number(data.genre_id),
        abonnement_id: data.abonnement_id
          ? Number(data.abonnement_id)
          : undefined,
      };

      if (invitationToken) {
        (registerData as any).invitation_token = invitationToken;
      }

      console.log("🚀 Sending to API:", registerData);

      const result = await registerUser(registerData);

      console.log("✅ API Response:", result);

      if (result.success) {
        toast.success(t("register.accountCreated"), {
          description: t("register.accountCreatedDescription"),
        });

        navigate("/login", {
          replace: true,
          state: {
            message: t("register.accountCreatedMessage"),
          },
        });
      } else {
        toast.error(t("register.errorTitle"), {
          description: result.error || t("register.errorDescription"),
        });
      }
    } catch (error: any) {
      console.error("❌ Register error:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast.error(t("register.errorTitle"), {
        description: error.message || t("register.errorDescription"),
      });
    }
  };

  if (validatingToken) {
    return (
      <AuthPageContainer
      title={t("register.title")}
      subtitle=""
    >
      <div className="flex flex-col items-center justify-center py-12 gap-3">
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
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
        <p className="text-sm text-gray-500">{t("register.validatingInvitation")}</p>
      </div>
    </AuthPageContainer>
    );
  }

  if (invitationError) {
    return (
      <AuthPageContainer
      title={t("register.title")}
      subtitle=""
    >
      <div className="flex flex-col items-center text-center gap-4 py-6" data-testid="register-invitation-error">
        <div className="rounded-full bg-red-100 p-3">
          <svg
            className="h-6 w-6 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>
        <p className="text-sm font-medium text-gray-800">{invitationError}</p>
        <Link
          to="/login"
          className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
        >
          {t("register.backToLogin")}
        </Link>
      </div>
    </AuthPageContainer>
    );
  }

  if (isAuthenticated && invitationToken) {
    return (
      <AuthPageContainer
        title="Vous êtes déjà connecté"
        subtitle=""
      >
        <div className="flex flex-col items-center text-center gap-4 py-6" data-testid="register-already-logged-in">
          <div className="rounded-full bg-blue-100 p-3">
            <svg
              className="h-6 w-6 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Session active
            </h3>
            <p className="mt-2 text-sm text-gray-500 max-w-sm">
              Vous êtes actuellement connecté en tant que <strong>{user?.email}</strong>.
            </p>
            <p className="mt-2 text-sm text-gray-500 max-w-sm">
              Pour accepter cette invitation et créer un nouveau compte pour <strong>{invitationEmail}</strong>, vous devez d'abord vous déconnecter.
            </p>
          </div>
          <div className="mt-4 flex gap-4 w-full">
            <SubmitButton
              onClick={logout}
              variant="primary"
              className="flex-1"
            >
              Se déconnecter
            </SubmitButton>
            <Link
              to="/dashboard"
              className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Ignorer
            </Link>
          </div>
        </div>
      </AuthPageContainer>
    );
  }

  return (
    <AuthPageContainer
      title={t("register.title")}
      subtitle={t("register.subtitle")}
      footer={
        <>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("register.alreadyHaveAccount")}{" "}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                data-testid="register-login-link"
              >
                {t("register.login")}
              </Link>
            </p>
          </div>

          {/* Conditions d'utilisation */}
          <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
            {t("register.termsPrefix")}{" "}
            <Link
              to="/terms"
              className="underline hover:text-gray-700 dark:hover:text-gray-300"
            >
              {t("register.termsLink")}
            </Link>{" "}
            {t("register.termsAnd")}{" "}
            <Link
              to="/privacy"
              className="underline hover:text-gray-700 dark:hover:text-gray-300"
            >
              {t("register.privacyLink")}
            </Link>
          </p>
        </>
      }
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
        data-testid="register-form"
      >
        {/* Prénom et Nom */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            id="first_name"
            label={t("register.firstName")}
            required
            error={errors.first_name?.message}
          >
            <Input
              id="first_name"
              type="text"
              autoComplete="given-name"
              placeholder={t("register.firstNamePlaceholder")}
              data-testid="register-firstname-input"
              {...register("first_name")}
            />
          </FormField>

          <FormField
            id="last_name"
            label={t("register.lastName")}
            required
            error={errors.last_name?.message}
          >
            <Input
              id="last_name"
              type="text"
              autoComplete="family-name"
              placeholder={t("register.lastNamePlaceholder")}
              data-testid="register-lastname-input"
              {...register("last_name")}
            />
          </FormField>
        </div>

        {/* Email */}
        <FormField
          id="email"
          label={t("register.email")}
          required
          error={errors.email?.message}
        >
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder={t("register.emailPlaceholder")}
            data-testid="register-email-input"
            readOnly={!!invitationEmail}
            className={invitationEmail ? "bg-gray-50 cursor-default text-gray-500" : ""}
            {...register("email")}
          />
        </FormField>

        {/* Date de naissance et Genre */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            id="date_of_birth"
            label={t("register.dateOfBirth")}
            required
            error={errors.date_of_birth?.message}
          >
            <Input
              id="date_of_birth"
              type="date"
              min={getMinBirthDate()}
              max={getMaxBirthDate()}
              data-testid="register-dob-input"
              {...register("date_of_birth")}
            />
          </FormField>

          <Controller
            name="genre_id"
            control={control}
            render={({ field }) => (
              <SelectField
                id="genre_id"
                label={t("register.gender")}
                required
                placeholder={t("register.selectGender")}
                options={GENRE_OPTIONS}
                value={field.value}
                onChange={field.onChange}
                error={errors.genre_id?.message}
                data-testid="register-gender-select"
              />
            )}
          />
        </div>

        {/* Mot de passe avec indicateur de force et exigences */}
        <FormField
          id="password"
          label={t("register.password")}
          required
          error={errors.password?.message}
        >
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <div className="space-y-3">
                <PasswordInput
                  id="password"
                  value={field.value || ""}
                  onChange={field.onChange}
                  showStrengthIndicator
                  hasError={!!errors.password}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  data-testid="register-password-input"
                />

                {/* Exigences détaillées du mot de passe */}
                <PasswordRequirements password={field.value || ""} />
              </div>
            )}
          />
        </FormField>

        {/* Bouton de soumission */}
        <SubmitButton
          isLoading={isSubmitting || isLoading}
          fullWidth
          data-testid="register-submit-btn"
        >
          {t("register.submit")}
        </SubmitButton>
      </form>
    </AuthPageContainer>
  );
};

// Export par défaut pour compatibilité avec l'index
export default RegisterPage;
