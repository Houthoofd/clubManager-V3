/**
 * Input.examples.tsx
 * Exemples d'utilisation du composant Input
 *
 * Ce fichier contient des exemples pratiques pour tous les cas d'usage
 * des composants Input, Textarea, Select, Checkbox et Radio.
 */

import { useState } from 'react';
import { Input } from './Input';
import { Button } from './Button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// ─── EXEMPLE 1: Input Simple ─────────────────────────────────────────────────

/**
 * Exemple 1: Inputs de base avec différents types
 */
export function Example1_BasicInputs() {
  return (
    <div className="space-y-4">
      <Input
        label="Nom complet"
        type="text"
        placeholder="Marie Dupont"
        required
      />
      <Input
        label="Email"
        type="email"
        placeholder="marie@example.com"
        required
      />
      <Input
        label="Téléphone"
        type="tel"
        placeholder="+33 6 12 34 56 78"
      />
      <Input
        label="Site web"
        type="url"
        placeholder="https://example.com"
      />
      <Input
        label="Date de naissance"
        type="date"
        required
      />
    </div>
  );
}

// ─── EXEMPLE 2: États Error et Success ───────────────────────────────────────

/**
 * Exemple 2: Démonstration des états error et success
 */
export function Example2_States() {
  return (
    <div className="space-y-4">
      <Input
        label="Email (avec erreur)"
        type="email"
        value="invalid-email"
        error="Le format de l'email n'est pas valide"
        required
      />
      <Input
        label="Email (validé)"
        type="email"
        value="marie@example.com"
        success="Email disponible !"
      />
      <Input
        label="Champ désactivé"
        type="text"
        value="Non modifiable"
        disabled
      />
    </div>
  );
}

// ─── EXEMPLE 3: Tailles ──────────────────────────────────────────────────────

/**
 * Exemple 3: Différentes tailles disponibles
 */
export function Example3_Sizes() {
  return (
    <div className="space-y-4">
      <Input
        label="Small"
        size="sm"
        placeholder="Taille small (compact)"
      />
      <Input
        label="Medium (défaut)"
        size="md"
        placeholder="Taille medium (standard)"
      />
      <Input
        label="Large"
        size="lg"
        placeholder="Taille large (auth, landing)"
      />
    </div>
  );
}

// ─── EXEMPLE 4: Icônes ───────────────────────────────────────────────────────

/**
 * Exemple 4: Inputs avec icônes
 */
export function Example4_WithIcons() {
  return (
    <div className="space-y-4">
      <Input
        label="Rechercher"
        type="text"
        placeholder="Rechercher un utilisateur..."
        iconLeft={
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        }
      />
      <Input
        label="Email"
        type="email"
        value="marie@example.com"
        iconRight={
          <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        }
        success="Email vérifié"
      />
    </div>
  );
}

// ─── EXEMPLE 5: Prefix et Suffix ─────────────────────────────────────────────

/**
 * Exemple 5: Inputs avec préfixe et suffixe
 */
export function Example5_PrefixSuffix() {
  return (
    <div className="space-y-4">
      <Input
        label="Site web"
        type="text"
        placeholder="monsite.com"
        prefix="https://"
      />
      <Input
        label="Prix"
        type="number"
        placeholder="0.00"
        suffix="€"
      />
      <Input
        label="Email professionnel"
        type="text"
        placeholder="prenom.nom"
        suffix="@entreprise.com"
      />
      <Input
        label="Poids"
        type="number"
        placeholder="75"
        suffix="kg"
      />
    </div>
  );
}

// ─── EXEMPLE 6: Compteur de Caractères ──────────────────────────────────────

/**
 * Exemple 6: Compteur de caractères
 */
export function Example6_CharacterCount() {
  const [value, setValue] = useState('');

  return (
    <div className="space-y-4">
      <Input
        label="Nom d'utilisateur"
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={20}
        showCharCount
        helperText="Choisissez un nom unique"
      />
      <Input.Textarea
        label="Bio"
        rows={4}
        maxLength={500}
        showCharCount
        placeholder="Parlez-nous de vous..."
      />
    </div>
  );
}

// ─── EXEMPLE 7: Helper Text ──────────────────────────────────────────────────

/**
 * Exemple 7: Textes d'aide
 */
export function Example7_HelperText() {
  return (
    <div className="space-y-4">
      <Input
        label="Mot de passe"
        type="password"
        helperText="Au moins 8 caractères, incluant une majuscule et un chiffre"
        required
      />
      <Input
        label="Code postal"
        type="text"
        pattern="[0-9]{5}"
        helperText="Format : 5 chiffres (ex: 75001)"
        required
      />
      <Input
        label="IBAN"
        type="text"
        helperText="Votre numéro de compte bancaire international"
      />
    </div>
  );
}

// ─── EXEMPLE 8: Textarea ─────────────────────────────────────────────────────

/**
 * Exemple 8: Zone de texte
 */
export function Example8_Textarea() {
  return (
    <div className="space-y-4">
      <Input.Textarea
        label="Description"
        rows={4}
        placeholder="Décrivez votre projet..."
        helperText="Soyez aussi précis que possible"
      />
      <Input.Textarea
        label="Commentaire"
        rows={6}
        maxLength={1000}
        showCharCount
        placeholder="Laissez un commentaire..."
        required
      />
      <Input.Textarea
        label="Avec erreur"
        rows={3}
        value="Texte trop court"
        error="Le commentaire doit contenir au moins 10 caractères"
      />
    </div>
  );
}

// ─── EXEMPLE 9: Select ───────────────────────────────────────────────────────

/**
 * Exemple 9: Listes déroulantes
 */
export function Example9_Select() {
  return (
    <div className="space-y-4">
      <Input.Select
        label="Rôle"
        required
      >
        <option value="">Sélectionner un rôle...</option>
        <option value="admin">Administrateur</option>
        <option value="manager">Gestionnaire</option>
        <option value="member">Membre</option>
      </Input.Select>

      <Input.Select
        label="Pays"
        required
        options={[
          { value: '', label: 'Sélectionner un pays...' },
          { value: 'fr', label: 'France' },
          { value: 'be', label: 'Belgique' },
          { value: 'ch', label: 'Suisse' },
          { value: 'ca', label: 'Canada' },
        ]}
      />

      <Input.Select
        label="Catégorie"
        error="Vous devez sélectionner une catégorie"
        required
      >
        <option value="">Choisir...</option>
        <option value="1">Sport</option>
        <option value="2">Culture</option>
        <option value="3">Loisirs</option>
      </Input.Select>
    </div>
  );
}

// ─── EXEMPLE 10: Checkbox ────────────────────────────────────────────────────

/**
 * Exemple 10: Cases à cocher
 */
export function Example10_Checkbox() {
  return (
    <div className="space-y-3">
      <Input.Checkbox
        id="terms"
        label="J'accepte les conditions d'utilisation"
      />
      <Input.Checkbox
        id="newsletter"
        label="Recevoir la newsletter hebdomadaire"
        helperText="Vous pouvez vous désinscrire à tout moment"
      />
      <Input.Checkbox
        id="required-checkbox"
        label="Ce champ est obligatoire"
        error="Vous devez accepter pour continuer"
      />
      <Input.Checkbox
        id="disabled-checkbox"
        label="Option désactivée"
        disabled
      />
      <Input.Checkbox
        id="checked-disabled"
        label="Option cochée et désactivée"
        checked
        disabled
      />
    </div>
  );
}

// ─── EXEMPLE 11: Radio Buttons ───────────────────────────────────────────────

/**
 * Exemple 11: Boutons radio
 */
export function Example11_Radio() {
  const [genre, setGenre] = useState('');
  const [plan, setPlan] = useState('');

  return (
    <div className="space-y-6">
      {/* Groupe 1: Genre */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Genre <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          <Input.Radio
            id="genre-homme"
            name="genre"
            value="homme"
            label="Homme"
            checked={genre === 'homme'}
            onChange={(e) => setGenre(e.target.value)}
          />
          <Input.Radio
            id="genre-femme"
            name="genre"
            value="femme"
            label="Femme"
            checked={genre === 'femme'}
            onChange={(e) => setGenre(e.target.value)}
          />
          <Input.Radio
            id="genre-autre"
            name="genre"
            value="autre"
            label="Autre / Non spécifié"
            checked={genre === 'autre'}
            onChange={(e) => setGenre(e.target.value)}
          />
        </div>
      </div>

      {/* Groupe 2: Plan d'abonnement */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Plan d'abonnement
        </label>
        <div className="space-y-2">
          <Input.Radio
            id="plan-free"
            name="plan"
            value="free"
            label="Gratuit - 0€/mois"
            helperText="Fonctionnalités de base"
            checked={plan === 'free'}
            onChange={(e) => setPlan(e.target.value)}
          />
          <Input.Radio
            id="plan-pro"
            name="plan"
            value="pro"
            label="Pro - 29€/mois"
            helperText="Toutes les fonctionnalités + support prioritaire"
            checked={plan === 'pro'}
            onChange={(e) => setPlan(e.target.value)}
          />
          <Input.Radio
            id="plan-enterprise"
            name="plan"
            value="enterprise"
            label="Enterprise - Sur devis"
            helperText="Solution personnalisée pour grandes équipes"
            checked={plan === 'enterprise'}
            onChange={(e) => setPlan(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

// ─── EXEMPLE 12: Formulaire Complet ──────────────────────────────────────────

/**
 * Exemple 12: Formulaire complet avec validation native
 */
export function Example12_CompleteForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulation d'une requête API
    await new Promise(resolve => setTimeout(resolve, 1500));

    console.log('Formulaire soumis');
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Prénom"
          type="text"
          placeholder="Marie"
          required
          disabled={isSubmitting}
        />
        <Input
          label="Nom"
          type="text"
          placeholder="Dupont"
          required
          disabled={isSubmitting}
        />
      </div>

      <Input
        label="Email"
        type="email"
        placeholder="marie@example.com"
        required
        disabled={isSubmitting}
      />

      <Input
        label="Téléphone"
        type="tel"
        placeholder="+33 6 12 34 56 78"
        disabled={isSubmitting}
      />

      <Input.Select
        label="Département"
        required
        disabled={isSubmitting}
      >
        <option value="">Sélectionner...</option>
        <option value="75">Paris (75)</option>
        <option value="69">Rhône (69)</option>
        <option value="13">Bouches-du-Rhône (13)</option>
      </Input.Select>

      <Input.Textarea
        label="Message"
        rows={4}
        placeholder="Votre message..."
        maxLength={500}
        showCharCount
        disabled={isSubmitting}
      />

      <Input.Checkbox
        id="newsletter-complete"
        label="Je souhaite recevoir la newsletter"
        disabled={isSubmitting}
      />

      <Input.Checkbox
        id="terms-complete"
        label="J'accepte les conditions d'utilisation"
        required
        disabled={isSubmitting}
      />

      <div className="pt-4">
        <Button type="submit" fullWidth loading={isSubmitting}>
          Envoyer
        </Button>
      </div>
    </form>
  );
}

// ─── EXEMPLE 13: react-hook-form ─────────────────────────────────────────────

const schema = z.object({
  firstName: z.string().min(2, 'Au moins 2 caractères').max(50),
  lastName: z.string().min(2, 'Au moins 2 caractères').max(50),
  email: z.string().email('Email invalide'),
  age: z.number().min(18, 'Vous devez avoir au moins 18 ans').max(120),
  bio: z.string().max(500, 'Maximum 500 caractères').optional(),
  role: z.string().min(1, 'Veuillez sélectionner un rôle'),
  genre: z.enum(['homme', 'femme', 'autre'], {
    errorMap: () => ({ message: 'Veuillez sélectionner votre genre' }),
  }),
  newsletter: z.boolean(),
  terms: z.boolean().refine((val) => val === true, {
    message: 'Vous devez accepter les conditions',
  }),
});

type FormData = z.infer<typeof schema>;

/**
 * Exemple 13: Intégration avec react-hook-form + Zod
 */
export function Example13_ReactHookForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      newsletter: false,
      terms: false,
    },
  });

  const onSubmit = async (data: FormData) => {
    console.log('Données validées:', data);
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert('Formulaire soumis avec succès !');
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Prénom"
          error={errors.firstName?.message}
          disabled={isSubmitting}
          required
          {...register('firstName')}
        />
        <Input
          label="Nom"
          error={errors.lastName?.message}
          disabled={isSubmitting}
          required
          {...register('lastName')}
        />
      </div>

      <Input
        label="Email"
        type="email"
        error={errors.email?.message}
        disabled={isSubmitting}
        required
        {...register('email')}
      />

      <Input
        label="Âge"
        type="number"
        error={errors.age?.message}
        disabled={isSubmitting}
        required
        {...register('age', { valueAsNumber: true })}
      />

      <Input.Textarea
        label="Bio"
        rows={4}
        maxLength={500}
        showCharCount
        placeholder="Parlez-nous de vous..."
        error={errors.bio?.message}
        disabled={isSubmitting}
        {...register('bio')}
      />

      <Input.Select
        label="Rôle"
        error={errors.role?.message}
        disabled={isSubmitting}
        required
        {...register('role')}
      >
        <option value="">Sélectionner...</option>
        <option value="admin">Administrateur</option>
        <option value="manager">Gestionnaire</option>
        <option value="member">Membre</option>
      </Input.Select>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Genre <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          <Input.Radio
            id="rhf-homme"
            label="Homme"
            value="homme"
            disabled={isSubmitting}
            {...register('genre')}
          />
          <Input.Radio
            id="rhf-femme"
            label="Femme"
            value="femme"
            disabled={isSubmitting}
            {...register('genre')}
          />
          <Input.Radio
            id="rhf-autre"
            label="Autre"
            value="autre"
            disabled={isSubmitting}
            {...register('genre')}
          />
        </div>
        {errors.genre && (
          <p className="mt-1.5 text-xs text-red-600">{errors.genre.message}</p>
        )}
      </div>

      <Input.Checkbox
        id="rhf-newsletter"
        label="Recevoir la newsletter"
        disabled={isSubmitting}
        {...register('newsletter')}
      />

      <Input.Checkbox
        id="rhf-terms"
        label="J'accepte les conditions d'utilisation"
        error={errors.terms?.message}
        disabled={isSubmitting}
        {...register('terms')}
      />

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => reset()}
          disabled={isSubmitting}
        >
          Réinitialiser
        </Button>
        <Button type="submit" loading={isSubmitting}>
          S'inscrire
        </Button>
      </div>
    </form>
  );
}

// ─── EXEMPLE 14: Formulaire de Connexion ─────────────────────────────────────

/**
 * Exemple 14: Formulaire de connexion
 */
export function Example14_LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4 max-w-md mx-auto">
      <Input
        label="Email"
        type="email"
        placeholder="vous@example.com"
        autoComplete="email"
        size="lg"
        required
        disabled={isLoading}
        iconLeft={
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
          </svg>
        }
      />

      <div className="relative">
        <Input
          label="Mot de passe"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          autoComplete="current-password"
          size="lg"
          required
          disabled={isLoading}
          iconLeft={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          }
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600"
          disabled={isLoading}
        >
          {showPassword ? 'Masquer' : 'Afficher'}
        </button>
      </div>

      <div className="flex items-center justify-between">
        <Input.Checkbox
          id="remember-login"
          label="Se souvenir de moi"
          disabled={isLoading}
        />
        <a href="#" className="text-sm text-blue-600 hover:text-blue-700">
          Mot de passe oublié ?
        </a>
      </div>

      <Button type="submit" fullWidth size="lg" loading={isLoading}>
        Se connecter
      </Button>
    </form>
  );
}

// ─── COMPOSANT PRINCIPAL ─────────────────────────────────────────────────────

/**
 * InputExamples - Affiche tous les exemples d'Input
 */
export function InputExamples() {
  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Input Component - Exemples
        </h1>
        <p className="text-gray-600">
          Exemples pratiques d'utilisation des composants Input, Textarea, Select, Checkbox et Radio.
        </p>
      </div>

      <div className="space-y-6">
        <ExampleSection
          title="1. Inputs de Base"
          description="Différents types d'inputs (text, email, tel, url, date)."
        >
          <Example1_BasicInputs />
        </ExampleSection>

        <ExampleSection
          title="2. États (Error, Success, Disabled)"
          description="Démonstration des différents états visuels."
        >
          <Example2_States />
        </ExampleSection>

        <ExampleSection
          title="3. Tailles"
          description="Trois tailles disponibles : sm, md (défaut), lg."
        >
          <Example3_Sizes />
        </ExampleSection>

        <ExampleSection
          title="4. Avec Icônes"
          description="Ajout d'icônes à gauche ou à droite."
        >
          <Example4_WithIcons />
        </ExampleSection>

        <ExampleSection
          title="5. Prefix et Suffix"
          description="Ajout de texte fixe avant ou après la saisie."
        >
          <Example5_PrefixSuffix />
        </ExampleSection>

        <ExampleSection
          title="6. Compteur de Caractères"
          description="Affichage du nombre de caractères avec limite."
        >
          <Example6_CharacterCount />
        </ExampleSection>

        <ExampleSection
          title="7. Textes d'Aide"
          description="Helper text pour guider l'utilisateur."
        >
          <Example7_HelperText />
        </ExampleSection>

        <ExampleSection
          title="8. Textarea"
          description="Zone de texte multi-lignes."
        >
          <Example8_Textarea />
        </ExampleSection>

        <ExampleSection
          title="9. Select"
          description="Listes déroulantes."
        >
          <Example9_Select />
        </ExampleSection>

        <ExampleSection
          title="10. Checkbox"
          description="Cases à cocher."
        >
          <Example10_Checkbox />
        </ExampleSection>

        <ExampleSection
          title="11. Radio Buttons"
          description="Boutons radio (choix unique)."
        >
          <Example11_Radio />
        </ExampleSection>

        <ExampleSection
          title="12. Formulaire Complet"
          description="Exemple de formulaire complet avec validation native."
        >
          <Example12_CompleteForm />
        </ExampleSection>

        <ExampleSection
          title="13. Avec react-hook-form + Zod"
          description="Intégration complète avec validation Zod."
        >
          <Example13_ReactHookForm />
        </ExampleSection>

        <ExampleSection
          title="14. Formulaire de Connexion"
          description="Pattern de formulaire de connexion."
        >
          <Example14_LoginForm />
        </ExampleSection>
      </div>
    </div>
  );
}

// ─── HELPER COMPONENT ────────────────────────────────────────────────────────

interface ExampleSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

function ExampleSection({ title, description, children }: ExampleSectionProps) {
  return (
    <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">{title}</h2>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <div className="pt-4 border-t border-gray-100">
        {children}
      </div>
    </div>
  );
}
