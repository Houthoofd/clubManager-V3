/**
 * RegisterPage
 * Page d'inscription avec formulaire de création de compte
 */

import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
  LockIcon,
  UserIcon,
  CalendarAltIcon,
  CheckCircleIcon,
  TimesCircleIcon,
} from "@patternfly/react-icons";
import { useAuth } from "../../../shared/hooks/useAuth";
import { registerSchema, type RegisterDto } from "@clubmanager/types";
import { z } from "zod";

/**
 * Types pour le formulaire d'inscription
 */
type RegisterFormData = Omit<RegisterDto, "date_of_birth" | "genre_id"> & {
  date_of_birth: string;
  genre_id: string;
};

/**
 * Schema de validation personnalisé pour le formulaire
 * Accepte genre_id en string et le valide
 */
const registerFormSchema = z.object({
  first_name: z
    .string()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(100, "Le prénom ne peut pas dépasser 100 caractères")
    .regex(
      /^[a-zA-ZÀ-ÿ\s'-]+$/,
      "Le prénom ne peut contenir que des lettres, espaces, tirets et apostrophes",
    ),
  last_name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères")
    .regex(
      /^[a-zA-ZÀ-ÿ\s'-]+$/,
      "Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes",
    ),
  nom_utilisateur: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z
      .string()
      .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères")
      .max(100, "Le nom d'utilisateur ne peut pas dépasser 100 caractères")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Le nom d'utilisateur ne peut contenir que des lettres, chiffres et underscores",
      )
      .optional(),
  ),
  email: z
    .string()
    .min(5, "L'email doit contenir au moins 5 caractères")
    .max(255, "L'email ne peut pas dépasser 255 caractères")
    .email("Email invalide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .max(255, "Le mot de passe ne peut pas dépasser 255 caractères")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
    .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
    .regex(
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
      "Le mot de passe doit contenir au moins un caractère spécial",
    ),
  date_of_birth: z
    .string()
    .min(1, "La date de naissance est requise")
    .refine(
      (date) => {
        if (!date) return false;
        const [year, month, day] = date.split("-").map(Number);
        const birthDate = new Date(year, month - 1, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const minAgeDate = new Date(
          today.getFullYear() - 5,
          today.getMonth(),
          today.getDate(),
        );
        return birthDate <= minAgeDate;
      },
      { message: "Vous devez avoir au moins 5 ans" },
    )
    .refine(
      (date) => {
        if (!date) return false;
        const [year, month, day] = date.split("-").map(Number);
        const birthDate = new Date(year, month - 1, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return birthDate < today;
      },
      { message: "La date de naissance ne peut pas être dans le futur" },
    )
    .refine(
      (date) => {
        if (!date) return false;
        const [year, month, day] = date.split("-").map(Number);
        const birthDate = new Date(year, month - 1, day);
        const today = new Date();
        const maxAgeDate = new Date(
          today.getFullYear() - 120,
          today.getMonth(),
          today.getDate(),
        );
        return birthDate >= maxAgeDate;
      },
      { message: "La date de naissance n'est pas valide" },
    ),
  genre_id: z.string().min(1, "Le genre est requis"),
  abonnement_id: z.number().optional(),
});

/**
 * Calcul de la force du mot de passe
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
 * RegisterPage Component
 */
export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");

  // React Hook Form avec Zod validation
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    mode: "onChange", // Changed to onChange for real-time validation
  });

  // Surveillance des champs pour validation dynamique
  const firstName = watch("first_name");
  const lastName = watch("last_name");
  const email = watch("email");
  const dateOfBirth = watch("date_of_birth");
  const genreId = watch("genre_id");
  const nomUtilisateur = watch("nom_utilisateur");
  const password = watch("password");
  const passwordStrength = useMemo(
    () => calculatePasswordStrength(password || ""),
    [password],
  );

  /**
   * Soumission du formulaire d'inscription
   */
  const onSubmit = async (data: RegisterFormData) => {
    try {
      console.log("📝 Form data received:", data);

      const registerData: RegisterDto = {
        ...data,
        date_of_birth: data.date_of_birth, // Already in YYYY-MM-DD format
        genre_id: Number(data.genre_id),
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

  /**
   * Date maximale : 5 ans minimum (date de naissance maximale)
   * Utilise la date locale pour éviter les problèmes de fuseau horaire
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
   * Calcul de l'âge maximum (120 ans)
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Créer un compte
          </h1>
          <p className="text-gray-600">
            Rejoignez ClubManager et gérez votre club facilement
          </p>
        </div>

        {/* Formulaire d'inscription */}
        <div className="bg-white shadow-2xl rounded-2xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Prénom et Nom */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Prénom */}
              <div>
                <label
                  htmlFor="first_name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Prénom <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="first_name"
                    type="text"
                    autoComplete="given-name"
                    {...register("first_name")}
                    className={`block w-full px-3 py-3 pr-10 border ${
                      errors.first_name
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors`}
                    placeholder="Jean"
                  />
                  {!errors.first_name && firstName && firstName.length >= 2 && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    </div>
                  )}
                </div>
                {errors.first_name && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.first_name.message}
                  </p>
                )}
              </div>

              {/* Nom */}
              <div>
                <label
                  htmlFor="last_name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nom <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="last_name"
                    type="text"
                    autoComplete="family-name"
                    {...register("last_name")}
                    className={`block w-full px-3 py-3 pr-10 border ${
                      errors.last_name
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors`}
                    placeholder="Dupont"
                  />
                  {!errors.last_name && lastName && lastName.length >= 2 && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    </div>
                  )}
                </div>
                {errors.last_name && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.last_name.message}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Adresse email <span className="text-red-500">*</span>
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
                  className={`block w-full pl-10 pr-10 py-3 border ${
                    errors.email
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors`}
                  placeholder="exemple@email.com"
                />
                {!errors.email && email && email.includes("@") && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  </div>
                )}
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Date de naissance et Genre */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date de naissance */}
              <div>
                <label
                  htmlFor="date_of_birth"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Date de naissance <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CalendarAltIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="date_of_birth"
                    type="date"
                    {...register("date_of_birth")}
                    min={getMinBirthDate()}
                    max={getMaxBirthDate()}
                    className={`block w-full pl-10 pr-10 py-3 border ${
                      errors.date_of_birth
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    } rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-colors`}
                  />
                  {!errors.date_of_birth &&
                    dateOfBirth &&
                    dateOfBirth.length > 0 && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      </div>
                    )}
                </div>
                {errors.date_of_birth && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.date_of_birth.message}
                  </p>
                )}
              </div>

              {/* Genre */}
              <div>
                <label
                  htmlFor="genre_id"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Genre <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="genre_id"
                    {...register("genre_id")}
                    className={`block w-full px-3 py-3 pr-10 border ${
                      errors.genre_id
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    } rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-colors`}
                  >
                    <option value="">Sélectionnez un genre</option>
                    <option value="1">Homme</option>
                    <option value="2">Femme</option>
                    <option value="3">Autre</option>
                  </select>
                  {!errors.genre_id && genreId && genreId !== "" && (
                    <div className="absolute inset-y-0 right-8 pr-3 flex items-center pointer-events-none">
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    </div>
                  )}
                </div>
                {errors.genre_id && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.genre_id.message}
                  </p>
                )}
              </div>
            </div>

            {/* Nom d'utilisateur (optionnel) */}
            <div>
              <label
                htmlFor="nom_utilisateur"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Nom d'utilisateur{" "}
                <span className="text-gray-500 text-xs">(optionnel)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="nom_utilisateur"
                  type="text"
                  autoComplete="username"
                  {...register("nom_utilisateur")}
                  className={`block w-full pl-10 pr-10 py-3 border ${
                    errors.nom_utilisateur
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors`}
                  placeholder="jeandupont"
                />
                {!errors.nom_utilisateur &&
                  nomUtilisateur &&
                  nomUtilisateur.length >= 3 && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    </div>
                  )}
              </div>
              {errors.nom_utilisateur && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.nom_utilisateur.message}
                </p>
              )}
            </div>

            {/* Mot de passe */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Mot de passe <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  {...register("password")}
                  className={`block w-full pl-10 pr-20 py-3 border ${
                    errors.password
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors`}
                  placeholder="••••••••"
                />
                {!errors.password &&
                  password &&
                  password.length >= 8 &&
                  /[A-Z]/.test(password) &&
                  /[a-z]/.test(password) &&
                  /[0-9]/.test(password) &&
                  /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) && (
                    <div className="absolute inset-y-0 right-12 pr-3 flex items-center pointer-events-none">
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    </div>
                  )}
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

              {/* Password Strength Indicator */}
              {password && password.length > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-600">
                      Force du mot de passe
                    </span>
                    <span
                      className={`text-xs font-semibold ${
                        passwordStrength < 30
                          ? "text-red-600"
                          : passwordStrength < 60
                            ? "text-orange-600"
                            : passwordStrength < 80
                              ? "text-yellow-600"
                              : "text-green-600"
                      }`}
                    >
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

                  {/* Password Requirements */}
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center text-xs">
                      {password.length >= 8 ? (
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                      ) : (
                        <TimesCircleIcon className="h-4 w-4 text-gray-400 mr-2" />
                      )}
                      <span
                        className={
                          password.length >= 8
                            ? "text-green-600"
                            : "text-gray-500"
                        }
                      >
                        Au moins 8 caractères
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      {/[A-Z]/.test(password) && /[a-z]/.test(password) ? (
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                      ) : (
                        <TimesCircleIcon className="h-4 w-4 text-gray-400 mr-2" />
                      )}
                      <span
                        className={
                          /[A-Z]/.test(password) && /[a-z]/.test(password)
                            ? "text-green-600"
                            : "text-gray-500"
                        }
                      >
                        Majuscules et minuscules
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      {/[0-9]/.test(password) ? (
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                      ) : (
                        <TimesCircleIcon className="h-4 w-4 text-gray-400 mr-2" />
                      )}
                      <span
                        className={
                          /[0-9]/.test(password)
                            ? "text-green-600"
                            : "text-gray-500"
                        }
                      >
                        Au moins un chiffre
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      {/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
                        password,
                      ) ? (
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                      ) : (
                        <TimesCircleIcon className="h-4 w-4 text-gray-400 mr-2" />
                      )}
                      <span
                        className={
                          /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
                            ? "text-green-600"
                            : "text-gray-500"
                        }
                      >
                        {`Caractère spécial (!@#$%^&*()_+-=[]{}; etc.)`}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {errors.password && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Bouton de soumission */}
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
                isSubmitting || isLoading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              } transition-colors`}
            >
              {isSubmitting || isLoading ? (
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
                  Inscription en cours...
                </>
              ) : (
                "Créer mon compte"
              )}
            </button>
          </form>

          {/* Lien vers connexion */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Vous avez déjà un compte ?{" "}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500">
          En créant un compte, vous acceptez nos{" "}
          <Link to="/terms" className="underline hover:text-gray-700">
            Conditions d'utilisation
          </Link>{" "}
          et notre{" "}
          <Link to="/privacy" className="underline hover:text-gray-700">
            Politique de confidentialité
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
