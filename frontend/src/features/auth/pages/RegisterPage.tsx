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
 */

import { useForm, Controller } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { useAuth } from "../../../shared/hooks/useAuth";
import type { RegisterDto } from "@clubmanager/types";

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
  nom_utilisateur?: string;
  email: string;
  password: string;
  date_of_birth: string;
  genre_id: string;
  abonnement_id?: string;
};

// ─── VALIDATION SCHEMA ───────────────────────────────────────────────────────

const registerFormSchema = z.object({
  first_name: z
    .string()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(50, "Le prénom ne peut pas dépasser 50 caractères")
    .regex(
      /^[a-zA-ZÀ-ÿ\s'-]+$/,
      "Le prénom ne peut contenir que des lettres, espaces, apostrophes et tirets",
    ),
  last_name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères")
    .regex(
      /^[a-zA-ZÀ-ÿ\s'-]+$/,
      "Le nom ne peut contenir que des lettres, espaces, apostrophes et tirets",
    ),
  nom_utilisateur: z
    .string()
    .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères")
    .max(30, "Le nom d'utilisateur ne peut pas dépasser 30 caractères")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Le nom d'utilisateur ne peut contenir que des lettres, chiffres, underscores et tirets",
    )
    .optional()
    .or(z.literal("")),
  email: z.string().email("Adresse email invalide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
    .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
    .regex(
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
      "Le mot de passe doit contenir au moins un caractère spécial",
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
        message: "Vous devez avoir au moins 5 ans pour vous inscrire",
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
        message: "La date de naissance ne peut pas être future",
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
        message: "La date de naissance n'est pas valide",
      },
    ),
  genre_id: z.string().min(1, "Veuillez sélectionner un genre"),
  abonnement_id: z.string().optional(),
});

// ─── OPTIONS SELECT ──────────────────────────────────────────────────────────

const GENRE_OPTIONS = [
  { value: "1", label: "Homme" },
  { value: "2", label: "Femme" },
  { value: "3", label: "Autre" },
];

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
  const navigate = useNavigate();
  const { register: registerUser, isLoading } = useAuth();

  // React Hook Form avec Zod validation
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    mode: "onChange",
  });

  /**
   * Soumission du formulaire d'inscription
   */
  const onSubmit = async (data: RegisterFormData) => {
    try {
      console.log("📝 Form data received:", data);

      const registerData: RegisterDto = {
        first_name: data.first_name,
        last_name: data.last_name,
        nom_utilisateur: data.nom_utilisateur || undefined,
        email: data.email,
        password: data.password,
        date_of_birth: data.date_of_birth,
        genre_id: Number(data.genre_id),
        abonnement_id: data.abonnement_id
          ? Number(data.abonnement_id)
          : undefined,
      };

      console.log("🚀 Sending to API:", registerData);

      const result = await registerUser(registerData);

      console.log("✅ API Response:", result);

      if (result.success) {
        toast.success("Compte créé !", {
          description:
            "Un email de vérification vous a été envoyé. Consultez votre boîte mail pour activer votre compte.",
        });

        navigate("/login", {
          replace: true,
          state: {
            message:
              "Compte créé ! Votre identifiant de connexion vous a été envoyé par email. Vérifiez votre boîte mail avant de vous connecter.",
          },
        });
      } else {
        toast.error("Erreur d'inscription", {
          description:
            result.error || "Une erreur est survenue lors de l'inscription.",
        });
      }
    } catch (error: any) {
      console.error("❌ Register error:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast.error("Erreur d'inscription", {
        description:
          error.message || "Une erreur est survenue lors de l'inscription.",
      });
    }
  };

  return (
    <AuthPageContainer
      title="Créer un compte"
      subtitle="Rejoignez ClubManager et gérez votre club facilement"
      footer={
        <>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Vous avez déjà un compte ?{" "}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                Se connecter
              </Link>
            </p>
          </div>

          {/* Conditions d'utilisation */}
          <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
            En créant un compte, vous acceptez nos{" "}
            <Link
              to="/terms"
              className="underline hover:text-gray-700 dark:hover:text-gray-300"
            >
              Conditions d'utilisation
            </Link>{" "}
            et notre{" "}
            <Link
              to="/privacy"
              className="underline hover:text-gray-700 dark:hover:text-gray-300"
            >
              Politique de confidentialité
            </Link>
          </p>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Prénom et Nom */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            id="first_name"
            label="Prénom"
            required
            error={errors.first_name?.message}
          >
            <Input
              id="first_name"
              type="text"
              autoComplete="given-name"
              placeholder="Jean"
              {...register("first_name")}
            />
          </FormField>

          <FormField
            id="last_name"
            label="Nom"
            required
            error={errors.last_name?.message}
          >
            <Input
              id="last_name"
              type="text"
              autoComplete="family-name"
              placeholder="Dupont"
              {...register("last_name")}
            />
          </FormField>
        </div>

        {/* Email */}
        <FormField
          id="email"
          label="Adresse email"
          required
          error={errors.email?.message}
        >
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="exemple@email.com"
            {...register("email")}
          />
        </FormField>

        {/* Date de naissance et Genre */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            id="date_of_birth"
            label="Date de naissance"
            required
            error={errors.date_of_birth?.message}
          >
            <Input
              id="date_of_birth"
              type="date"
              min={getMinBirthDate()}
              max={getMaxBirthDate()}
              {...register("date_of_birth")}
            />
          </FormField>

          <Controller
            name="genre_id"
            control={control}
            render={({ field }) => (
              <SelectField
                id="genre_id"
                label="Genre"
                required
                placeholder="Sélectionnez un genre"
                options={GENRE_OPTIONS}
                value={field.value}
                onChange={field.onChange}
                error={errors.genre_id?.message}
              />
            )}
          />
        </div>

        {/* Nom d'utilisateur (optionnel) */}
        <FormField
          id="nom_utilisateur"
          label="Nom d'utilisateur"
          error={errors.nom_utilisateur?.message}
          helpText="Optionnel - Uniquement des lettres, chiffres, _ et -"
        >
          <Input
            id="nom_utilisateur"
            type="text"
            autoComplete="username"
            placeholder="jeandupont"
            {...register("nom_utilisateur")}
          />
        </FormField>

        {/* Mot de passe avec indicateur de force et exigences */}
        <FormField
          id="password"
          label="Mot de passe"
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
                />

                {/* Exigences détaillées du mot de passe */}
                <PasswordRequirements password={field.value || ""} />
              </div>
            )}
          />
        </FormField>

        {/* Bouton de soumission */}
        <SubmitButton isLoading={isSubmitting || isLoading} fullWidth>
          Créer mon compte
        </SubmitButton>
      </form>
    </AuthPageContainer>
  );
};

// Export par défaut pour compatibilité avec l'index
export default RegisterPage;
