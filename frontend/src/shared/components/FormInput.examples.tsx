/**
 * FormInput Component - Examples
 *
 * Exemples d'utilisation du composant FormInput dans différents contextes.
 * Ce fichier sert de documentation vivante et démontre l'intégration avec react-hook-form.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FormInput } from './FormInput';
import { Button } from './Button';

// ─── ICÔNES INLINE ───────────────────────────────────────────────────────────

function UserIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function EnvelopeIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function LockIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

function EyeIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function EyeSlashIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

function PhoneIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );
}

function BuildingIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

// ─── EXEMPLE 1: BASIC INPUT ──────────────────────────────────────────────────

export function BasicInput() {
  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">Input Simple</h2>

      <div className="bg-white p-6 rounded-lg shadow-sm max-w-md">
        <FormInput
          label="Nom d'utilisateur"
          id="basic-username"
          placeholder="Entrez votre nom"
        />
      </div>

      <div className="bg-white p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
        <p className="text-sm text-gray-600">
          Input de base sans icône ni validation. Utilisation minimale du composant.
        </p>
      </div>
    </div>
  );
}

// ─── EXEMPLE 2: WITH LEFT ICON ───────────────────────────────────────────────

export function WithLeftIcon() {
  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">Avec Icône Gauche</h2>

      <div className="bg-white p-6 rounded-lg shadow-sm max-w-md space-y-4">
        <FormInput
          label="Identifiant"
          id="icon-userid"
          leftIcon={<UserIcon />}
          placeholder="user@example.com"
        />

        <FormInput
          label="Téléphone"
          id="icon-phone"
          type="tel"
          leftIcon={<PhoneIcon />}
          placeholder="+33 6 12 34 56 78"
        />

        <FormInput
          label="Organisation"
          id="icon-org"
          leftIcon={<BuildingIcon />}
          placeholder="Nom de votre club"
        />
      </div>

      <div className="bg-white p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
        <p className="text-sm text-gray-600">
          Les icônes gauches améliorent la reconnaissance visuelle du type de champ.
          Taille recommandée : <code className="bg-gray-100 px-1 rounded">h-5 w-5</code>
        </p>
      </div>
    </div>
  );
}

// ─── EXEMPLE 3: EMAIL INPUT ──────────────────────────────────────────────────

export function EmailInput() {
  const { register, formState: { errors } } = useForm();

  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">Input Email</h2>

      <div className="bg-white p-6 rounded-lg shadow-sm max-w-md">
        <FormInput
          label="Adresse email"
          id="email-input"
          type="email"
          leftIcon={<EnvelopeIcon />}
          register={register("email", {
            required: "L'email est requis",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Format d'email invalide"
            }
          })}
          error={errors.email?.message as string}
          placeholder="exemple@domain.com"
          required
          autoComplete="email"
        />
      </div>

      <div className="bg-white p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
        <p className="text-sm text-gray-600 mb-2">
          Input email avec validation react-hook-form et pattern regex.
        </p>
        <p className="text-xs text-gray-500 font-mono">
          Essayez de taper un email invalide pour voir l'erreur.
        </p>
      </div>
    </div>
  );
}

// ─── EXEMPLE 4: PASSWORD INPUT ───────────────────────────────────────────────

export function PasswordInput() {
  const [showPassword, setShowPassword] = useState(false);
  const { register, formState: { errors } } = useForm();

  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">Input Mot de Passe</h2>

      <div className="bg-white p-6 rounded-lg shadow-sm max-w-md">
        <FormInput
          label="Mot de passe"
          id="password-toggle"
          type={showPassword ? "text" : "password"}
          leftIcon={<LockIcon />}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            >
              {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
            </button>
          }
          register={register("password", {
            required: "Le mot de passe est requis",
            minLength: {
              value: 8,
              message: "Minimum 8 caractères"
            }
          })}
          error={errors.password?.message as string}
          placeholder="••••••••"
          required
          autoComplete="current-password"
        />
      </div>

      <div className="bg-white p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
        <p className="text-sm text-gray-600 mb-2">
          Input password avec toggle de visibilité. Utilise <code className="bg-gray-100 px-1 rounded">rightElement</code> pour le bouton.
        </p>
        <p className="text-xs text-gray-500">
          État actuel : {showPassword ? "Visible" : "Masqué"}
        </p>
      </div>
    </div>
  );
}

// ─── EXEMPLE 5: WITH ERROR ───────────────────────────────────────────────────

export function WithError() {
  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">Avec Message d'Erreur</h2>

      <div className="bg-white p-6 rounded-lg shadow-sm max-w-md space-y-4">
        <FormInput
          label="Code postal"
          id="error-zipcode"
          leftIcon={<BuildingIcon />}
          error="Format invalide. Utilisez 5 chiffres (ex: 75001)"
          defaultValue="ABC123"
        />

        <FormInput
          label="Email invalide"
          id="error-email"
          type="email"
          leftIcon={<EnvelopeIcon />}
          error="Cette adresse email est déjà utilisée"
          defaultValue="user@example"
        />

        <FormInput
          label="Mot de passe trop court"
          id="error-password"
          type="password"
          leftIcon={<LockIcon />}
          error="Le mot de passe doit contenir au moins 8 caractères"
          defaultValue="123"
        />
      </div>

      <div className="bg-white p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
        <p className="text-sm text-gray-600">
          Lorsqu'une erreur est présente, l'input affiche automatiquement :
        </p>
        <ul className="text-sm text-gray-600 list-disc list-inside mt-2 space-y-1">
          <li>Bordure et focus rouge</li>
          <li>Icônes en rouge (au lieu de gris)</li>
          <li>Message d'erreur sous l'input</li>
          <li>Attributs ARIA pour l'accessibilité</li>
        </ul>
      </div>
    </div>
  );
}

// ─── EXEMPLE 6: REQUIRED FIELD ───────────────────────────────────────────────

export function RequiredField() {
  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">Champs Requis</h2>

      <div className="bg-white p-6 rounded-lg shadow-sm max-w-md space-y-4">
        <FormInput
          label="Nom complet"
          id="required-name"
          required
          placeholder="Jean Dupont"
        />

        <FormInput
          label="Email professionnel"
          id="required-email"
          type="email"
          leftIcon={<EnvelopeIcon />}
          required
          placeholder="contact@club.com"
        />

        <FormInput
          label="Numéro de téléphone"
          id="required-phone"
          type="tel"
          leftIcon={<PhoneIcon />}
          required
          placeholder="+33 6 12 34 56 78"
        />
      </div>

      <div className="bg-white p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
        <p className="text-sm text-gray-600">
          La prop <code className="bg-gray-100 px-1 rounded">required</code> affiche
          un astérisque rouge (<span className="text-red-500">*</span>) après le label
          pour indiquer visuellement que le champ est obligatoire.
        </p>
      </div>
    </div>
  );
}

// ─── EXEMPLE 7: LOGIN FORM ───────────────────────────────────────────────────

interface LoginFormData {
  userId: string;
  password: string;
}

export function LoginFormExample() {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    // Simuler un appel API
    console.log("Données de connexion:", data);
    await new Promise(resolve => setTimeout(resolve, 2000));
    alert(`Connexion réussie pour ${data.userId}`);
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">Formulaire de Connexion Complet</h2>

      <div className="bg-white p-8 rounded-lg shadow-md max-w-md mx-auto">
        <div className="mb-6 text-center">
          <h3 className="text-xl font-semibold text-gray-900">Connexion</h3>
          <p className="text-sm text-gray-600 mt-1">Accédez à votre compte</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <FormInput
            label="Identifiant"
            id="login-userId"
            leftIcon={<UserIcon />}
            register={register("userId", {
              required: "L'identifiant est requis"
            })}
            error={errors.userId?.message}
            placeholder="Votre identifiant"
            required
            autoComplete="username"
          />

          <FormInput
            label="Mot de passe"
            id="login-password"
            type={showPassword ? "text" : "password"}
            leftIcon={<LockIcon />}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
              </button>
            }
            register={register("password", {
              required: "Le mot de passe est requis",
              minLength: {
                value: 6,
                message: "Minimum 6 caractères"
              }
            })}
            error={errors.password?.message}
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300 mr-2" />
              <span className="text-gray-600">Se souvenir de moi</span>
            </label>
            <a href="#" className="text-blue-600 hover:text-blue-700">
              Mot de passe oublié ?
            </a>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={isSubmitting}
            size="lg"
          >
            {isSubmitting ? "Connexion..." : "Se connecter"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Pas encore de compte ?{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
              Créer un compte
            </a>
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
        <p className="text-sm text-gray-600">
          Exemple complet d'un formulaire de connexion avec :
        </p>
        <ul className="text-sm text-gray-600 list-disc list-inside mt-2 space-y-1">
          <li>Validation react-hook-form</li>
          <li>Icônes contextuelles</li>
          <li>Toggle de visibilité du mot de passe</li>
          <li>État de chargement (bouton)</li>
          <li>Gestion des erreurs</li>
        </ul>
      </div>
    </div>
  );
}

// ─── EXEMPLE 8: REGISTRATION FORM ────────────────────────────────────────────

interface RegisterFormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export function RegistrationFormExample() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFormData>();

  const password = watch("password");

  const onSubmit = async (data: RegisterFormData) => {
    console.log("Données d'inscription:", data);
    await new Promise(resolve => setTimeout(resolve, 2000));
    alert(`Compte créé pour ${data.email}`);
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">Formulaire d'Inscription</h2>

      <div className="bg-white p-8 rounded-lg shadow-md max-w-md mx-auto">
        <div className="mb-6 text-center">
          <h3 className="text-xl font-semibold text-gray-900">Créer un compte</h3>
          <p className="text-sm text-gray-600 mt-1">Rejoignez notre plateforme</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormInput
            label="Nom complet"
            id="register-fullName"
            leftIcon={<UserIcon />}
            register={register("fullName", {
              required: "Le nom est requis",
              minLength: {
                value: 3,
                message: "Minimum 3 caractères"
              }
            })}
            error={errors.fullName?.message}
            placeholder="Jean Dupont"
            required
            autoComplete="name"
          />

          <FormInput
            label="Email"
            id="register-email"
            type="email"
            leftIcon={<EnvelopeIcon />}
            register={register("email", {
              required: "L'email est requis",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Format d'email invalide"
              }
            })}
            error={errors.email?.message}
            placeholder="contact@example.com"
            required
            autoComplete="email"
          />

          <FormInput
            label="Téléphone"
            id="register-phone"
            type="tel"
            leftIcon={<PhoneIcon />}
            register={register("phone", {
              pattern: {
                value: /^[0-9\s+()-]+$/,
                message: "Format de téléphone invalide"
              }
            })}
            error={errors.phone?.message}
            placeholder="+33 6 12 34 56 78"
            autoComplete="tel"
          />

          <FormInput
            label="Mot de passe"
            id="register-password"
            type={showPassword ? "text" : "password"}
            leftIcon={<LockIcon />}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
              >
                {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
              </button>
            }
            register={register("password", {
              required: "Le mot de passe est requis",
              minLength: {
                value: 8,
                message: "Minimum 8 caractères"
              },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: "Doit contenir majuscule, minuscule et chiffre"
              }
            })}
            error={errors.password?.message}
            placeholder="••••••••"
            required
            autoComplete="new-password"
          />

          <FormInput
            label="Confirmer le mot de passe"
            id="register-confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            leftIcon={<LockIcon />}
            rightElement={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
              >
                {showConfirmPassword ? <EyeSlashIcon /> : <EyeIcon />}
              </button>
            }
            register={register("confirmPassword", {
              required: "Veuillez confirmer le mot de passe",
              validate: (value) =>
                value === password || "Les mots de passe ne correspondent pas"
            })}
            error={errors.confirmPassword?.message}
            placeholder="••••••••"
            required
            autoComplete="new-password"
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={isSubmitting}
              size="lg"
            >
              {isSubmitting ? "Création..." : "Créer mon compte"}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Déjà un compte ?{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
              Se connecter
            </a>
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Validation Avancée</h3>
        <p className="text-sm text-gray-600">
          Ce formulaire démontre :
        </p>
        <ul className="text-sm text-gray-600 list-disc list-inside mt-2 space-y-1">
          <li>Validation de pattern (email, téléphone, password)</li>
          <li>Validation personnalisée (confirmation de mot de passe)</li>
          <li>Longueur minimale</li>
          <li>Champs optionnels vs requis</li>
        </ul>
      </div>
    </div>
  );
}

// ─── EXEMPLE 9: DISABLED STATE ───────────────────────────────────────────────

export function DisabledState() {
  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">État Désactivé</h2>

      <div className="bg-white p-6 rounded-lg shadow-sm max-w-md space-y-4">
        <FormInput
          label="Email (lecture seule)"
          id="disabled-email"
          type="email"
          leftIcon={<EnvelopeIcon />}
          defaultValue="admin@clubmanager.com"
          disabled
        />

        <FormInput
          label="Rôle (non modifiable)"
          id="disabled-role"
          leftIcon={<UserIcon />}
          defaultValue="Administrateur"
          disabled
        />

        <FormInput
          label="Téléphone (désactivé)"
          id="disabled-phone"
          type="tel"
          leftIcon={<PhoneIcon />}
          placeholder="Non renseigné"
          disabled
        />
      </div>

      <div className="bg-white p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
        <p className="text-sm text-gray-600">
          Les champs désactivés affichent un fond gris clair et un curseur interdit.
          Utile pour les données en lecture seule ou les permissions limitées.
        </p>
      </div>
    </div>
  );
}

// ─── COMPOSANT PRINCIPAL ─────────────────────────────────────────────────────

export function FormInputExamples() {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            FormInput Component
          </h1>
          <p className="text-lg text-gray-600">
            Composant réutilisable pour les champs de formulaire avec support react-hook-form
          </p>
        </div>

        <BasicInput />
        <WithLeftIcon />
        <EmailInput />
        <PasswordInput />
        <WithError />
        <RequiredField />
        <LoginFormExample />
        <RegistrationFormExample />
        <DisabledState />
      </div>
    </div>
  );
}

export default FormInputExamples;
