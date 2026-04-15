/**
 * SelectField Examples
 *
 * Exemples visuels du composant SelectField pour tester les différentes
 * variantes et cas d'usage.
 */

import { useState } from 'react';
import { SelectField } from './SelectField';

// ─── ICÔNES MOCK ─────────────────────────────────────────────────────────────

function TagIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-4 h-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 6h.008v.008H6V6z"
      />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-4 h-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
      />
    </svg>
  );
}

function UserGroupIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-4 h-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
      />
    </svg>
  );
}

function CreditCardIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-4 h-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
      />
    </svg>
  );
}

function LanguageIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-4 h-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802"
      />
    </svg>
  );
}

// ─── DONNÉES MOCK ────────────────────────────────────────────────────────────

const roles = [
  { value: 'member', label: 'Membre' },
  { value: 'moderator', label: 'Modérateur' },
  { value: 'admin', label: 'Administrateur' },
];

const countries = [
  { value: 'fr', label: 'France' },
  { value: 'be', label: 'Belgique' },
  { value: 'ch', label: 'Suisse' },
  { value: 'ca', label: 'Canada' },
  { value: 'us', label: 'États-Unis' },
];

const categories = [
  { value: 'sport', label: 'Sport' },
  { value: 'music', label: 'Musique' },
  { value: 'art', label: 'Art' },
  { value: 'tech', label: 'Technologie' },
  { value: 'other', label: 'Autre' },
];

const plans = [
  { value: 'free', label: 'Gratuit' },
  { value: 'basic', label: 'Basic - 9€/mois' },
  { value: 'pro', label: 'Pro - 29€/mois', disabled: true },
  { value: 'enterprise', label: 'Enterprise - Sur mesure', disabled: true },
];

const languages = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'de', label: 'Deutsch' },
  { value: 'it', label: 'Italiano' },
];

const teamSizes = [
  { value: '1-10', label: '1-10 membres' },
  { value: '11-50', label: '11-50 membres' },
  { value: '51-200', label: '51-200 membres' },
  { value: '201+', label: '201+ membres' },
];

// ─── EXEMPLES ────────────────────────────────────────────────────────────────

export function SelectFieldExamples() {
  const [role, setRole] = useState<string | number>('');
  const [country, setCountry] = useState<string | number>('');
  const [category, setCategory] = useState<string | number>('');
  const [plan, setPlan] = useState<string | number>('free');
  const [language, setLanguage] = useState<string | number>('fr');
  const [teamSize, setTeamSize] = useState<string | number>('');
  const [hasError, setHasError] = useState(false);

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">SelectField Component</h1>
        <p className="text-gray-600">
          Exemples visuels du composant SelectField avec différentes configurations.
        </p>
      </div>

      {/* Exemple 1 : Select simple */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">1. Select simple</h2>
          <p className="text-sm text-gray-600">Dropdown basique avec label</p>
        </div>
        <div className="p-6 bg-white rounded-lg border border-gray-200">
          <SelectField
            id="role-simple"
            label="Rôle"
            options={roles}
            value={role}
            onChange={setRole}
          />
          <div className="mt-4 text-sm text-gray-600">
            Valeur sélectionnée : <code className="px-2 py-1 bg-gray-100 rounded">{role || 'aucune'}</code>
          </div>
        </div>
      </section>

      {/* Exemple 2 : Avec placeholder et requis */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">2. Avec placeholder et requis</h2>
          <p className="text-sm text-gray-600">Option vide par défaut + astérisque rouge</p>
        </div>
        <div className="p-6 bg-white rounded-lg border border-gray-200">
          <SelectField
            id="country-required"
            label="Pays"
            placeholder="Sélectionnez un pays"
            options={countries}
            value={country}
            onChange={setCountry}
            required
          />
          <div className="mt-4 text-sm text-gray-600">
            Valeur sélectionnée : <code className="px-2 py-1 bg-gray-100 rounded">{country || 'aucune'}</code>
          </div>
        </div>
      </section>

      {/* Exemple 3 : Avec erreur */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">3. Avec message d'erreur</h2>
          <p className="text-sm text-gray-600">Bordure rouge + message d'erreur</p>
        </div>
        <div className="p-6 bg-white rounded-lg border border-gray-200">
          <SelectField
            id="category-error"
            label="Catégorie"
            placeholder="Choisissez une catégorie"
            options={categories}
            value={category}
            onChange={(val) => {
              setCategory(val);
              setHasError(false);
            }}
            required
            error={hasError ? 'Vous devez sélectionner une catégorie' : undefined}
          />
          <button
            onClick={() => setHasError(true)}
            className="mt-4 px-3 py-1.5 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Déclencher l'erreur
          </button>
        </div>
      </section>

      {/* Exemple 4 : Avec texte d'aide */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">4. Avec texte d'aide</h2>
          <p className="text-sm text-gray-600">Message informatif en gris</p>
        </div>
        <div className="p-6 bg-white rounded-lg border border-gray-200">
          <SelectField
            id="plan-help"
            label="Plan tarifaire"
            options={plans}
            value={plan}
            onChange={setPlan}
            helpText="Les options Pro et Enterprise seront bientôt disponibles"
          />
        </div>
      </section>

      {/* Exemple 5 : Avec options désactivées */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">5. Avec options désactivées</h2>
          <p className="text-sm text-gray-600">Certaines options ne peuvent pas être sélectionnées</p>
        </div>
        <div className="p-6 bg-white rounded-lg border border-gray-200">
          <SelectField
            id="plan-disabled-options"
            label="Plan d'abonnement"
            icon={<CreditCardIcon />}
            options={plans}
            value={plan}
            onChange={setPlan}
            helpText="Seuls les plans Free et Basic sont actuellement disponibles"
          />
        </div>
      </section>

      {/* Exemple 6 : Avec icônes */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">6. Avec icônes</h2>
          <p className="text-sm text-gray-600">Icône à gauche du label</p>
        </div>
        <div className="p-6 bg-white rounded-lg border border-gray-200 space-y-4">
          <SelectField
            id="language-icon"
            label="Langue"
            icon={<LanguageIcon />}
            options={languages}
            value={language}
            onChange={setLanguage}
            helpText="Langue d'affichage de l'interface"
          />

          <SelectField
            id="country-icon"
            label="Pays"
            icon={<GlobeIcon />}
            placeholder="Sélectionnez votre pays"
            options={countries}
            required
          />

          <SelectField
            id="category-icon"
            label="Catégorie"
            icon={<TagIcon />}
            options={categories}
            helpText="Type d'activité principal"
          />
        </div>
      </section>

      {/* Exemple 7 : État désactivé */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">7. État désactivé</h2>
          <p className="text-sm text-gray-600">Champ non modifiable</p>
        </div>
        <div className="p-6 bg-white rounded-lg border border-gray-200">
          <SelectField
            id="role-disabled"
            label="Rôle"
            options={roles}
            value="member"
            disabled
            helpText="Votre rôle est défini par l'administrateur"
          />
        </div>
      </section>

      {/* Exemple 8 : Formulaire complet */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">8. Formulaire complet</h2>
          <p className="text-sm text-gray-600">Plusieurs selects dans un formulaire</p>
        </div>
        <div className="p-6 bg-white rounded-lg border border-gray-200 space-y-4">
          <SelectField
            id="form-country"
            label="Pays"
            icon={<GlobeIcon />}
            placeholder="Sélectionnez un pays"
            options={countries}
            required
          />

          <SelectField
            id="form-language"
            label="Langue préférée"
            icon={<LanguageIcon />}
            options={languages}
            value={language}
            onChange={setLanguage}
            helpText="Langue d'affichage de votre compte"
          />

          <SelectField
            id="form-role"
            label="Rôle dans l'organisation"
            icon={<UserGroupIcon />}
            placeholder="Choisissez un rôle"
            options={roles}
            required
          />

          <SelectField
            id="form-team-size"
            label="Taille de l'équipe"
            icon={<UserGroupIcon />}
            placeholder="Nombre de membres"
            options={teamSizes}
            value={teamSize}
            onChange={setTeamSize}
            required
          />

          <SelectField
            id="form-plan"
            label="Plan tarifaire"
            icon={<CreditCardIcon />}
            options={plans}
            value={plan}
            onChange={setPlan}
            helpText="Vous pourrez changer de plan à tout moment"
          />

          <SelectField
            id="form-category"
            label="Catégorie d'activité"
            icon={<TagIcon />}
            placeholder="Sélectionnez une catégorie"
            options={categories}
          />

          <div className="pt-4 flex gap-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Enregistrer
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              Annuler
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default SelectFieldExamples;
