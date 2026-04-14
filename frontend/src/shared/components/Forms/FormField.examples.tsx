/**
 * FormField Examples
 *
 * Exemples visuels du composant FormField pour tester les différentes
 * variantes et cas d'usage.
 */

import { FormField } from './FormField';
import { Input } from '../Input';

// ─── ICÔNES MOCK ─────────────────────────────────────────────────────────────

function MailIcon() {
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
        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
      />
    </svg>
  );
}

function LockIcon() {
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
        d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
      />
    </svg>
  );
}

function UserIcon() {
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
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
      />
    </svg>
  );
}

function PhoneIcon() {
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
        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
      />
    </svg>
  );
}

// ─── INPUT COMPONENT MOCK ────────────────────────────────────────────────────

function DemoInput({
  id,
  type = 'text',
  placeholder,
  hasError = false,
}: {
  id: string;
  type?: string;
  placeholder?: string;
  hasError?: boolean;
}) {
  return (
    <input
      type={type}
      id={id}
      placeholder={placeholder}
      className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
        hasError
          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
      }`}
    />
  );
}

function DemoSelect({ id, hasError = false }: { id: string; hasError?: boolean }) {
  return (
    <select
      id={id}
      className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-colors ${
        hasError
          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
      }`}
    >
      <option>Sélectionner une option</option>
      <option>France</option>
      <option>Belgique</option>
      <option>Suisse</option>
      <option>Canada</option>
    </select>
  );
}

function DemoTextarea({ id, hasError = false }: { id: string; hasError?: boolean }) {
  return (
    <textarea
      id={id}
      rows={3}
      placeholder="Entrez votre message..."
      className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors resize-none ${
        hasError
          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
      }`}
    />
  );
}

// ─── EXEMPLES ────────────────────────────────────────────────────────────────

export function FormFieldExamples() {
  return (
    <div className="max-w-4xl mx-auto p-8 space-y-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">FormField Component</h1>
        <p className="text-gray-600">
          Exemples visuels du composant FormField avec différentes configurations.
        </p>
      </div>

      {/* Exemple 1 : Champ simple */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">1. Champ simple</h2>
          <p className="text-sm text-gray-600">Label basique avec input</p>
        </div>
        <div className="p-6 bg-white rounded-lg border border-gray-200">
          <FormField id="example1" label="Nom complet">
            <DemoInput id="example1" placeholder="Jean Dupont" />
          </FormField>
        </div>
      </section>

      {/* Exemple 2 : Champ requis */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">2. Champ requis</h2>
          <p className="text-sm text-gray-600">Avec astérisque rouge (*)</p>
        </div>
        <div className="p-6 bg-white rounded-lg border border-gray-200">
          <FormField id="example2" label="Adresse email" required>
            <DemoInput id="example2" type="email" placeholder="jean.dupont@example.com" />
          </FormField>
        </div>
      </section>

      {/* Exemple 3 : Avec erreur */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">3. Avec message d'erreur</h2>
          <p className="text-sm text-gray-600">Message d'erreur en rouge sous le champ</p>
        </div>
        <div className="p-6 bg-white rounded-lg border border-gray-200">
          <FormField
            id="example3"
            label="Mot de passe"
            required
            error="Le mot de passe doit contenir au moins 8 caractères"
          >
            <DemoInput id="example3" type="password" placeholder="••••••••" hasError />
          </FormField>
        </div>
      </section>

      {/* Exemple 4 : Avec texte d'aide */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">4. Avec texte d'aide</h2>
          <p className="text-sm text-gray-600">Message informatif en gris</p>
        </div>
        <div className="p-6 bg-white rounded-lg border border-gray-200">
          <FormField
            id="example4"
            label="Nom d'utilisateur"
            helpText="3-20 caractères alphanumériques uniquement"
          >
            <DemoInput id="example4" placeholder="johndoe" />
          </FormField>
        </div>
      </section>

      {/* Exemple 5 : Avec icône */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">5. Avec icône</h2>
          <p className="text-sm text-gray-600">Icône à gauche du label</p>
        </div>
        <div className="p-6 bg-white rounded-lg border border-gray-200 space-y-4">
          <FormField id="example5a" label="Email" icon={<MailIcon />} required>
            <DemoInput id="example5a" type="email" placeholder="votre@email.com" />
          </FormField>

          <FormField id="example5b" label="Mot de passe" icon={<LockIcon />} required>
            <DemoInput id="example5b" type="password" placeholder="••••••••" />
          </FormField>

          <FormField id="example5c" label="Téléphone" icon={<PhoneIcon />}>
            <DemoInput id="example5c" type="tel" placeholder="+33 6 12 34 56 78" />
          </FormField>
        </div>
      </section>

      {/* Exemple 6 : Avec Select */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">6. Avec Select</h2>
          <p className="text-sm text-gray-600">Utilisation avec un menu déroulant</p>
        </div>
        <div className="p-6 bg-white rounded-lg border border-gray-200">
          <FormField
            id="example6"
            label="Pays de résidence"
            required
            helpText="Sélectionnez votre pays dans la liste"
          >
            <DemoSelect id="example6" />
          </FormField>
        </div>
      </section>

      {/* Exemple 7 : Avec Textarea */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">7. Avec Textarea</h2>
          <p className="text-sm text-gray-600">Zone de texte multiligne</p>
        </div>
        <div className="p-6 bg-white rounded-lg border border-gray-200">
          <FormField
            id="example7"
            label="Message"
            helpText="Décrivez votre demande en quelques lignes"
          >
            <DemoTextarea id="example7" />
          </FormField>
        </div>
      </section>

      {/* Exemple 8 : Formulaire complet */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">8. Formulaire complet</h2>
          <p className="text-sm text-gray-600">Exemple d'utilisation dans un formulaire</p>
        </div>
        <div className="p-6 bg-white rounded-lg border border-gray-200 space-y-4">
          <FormField id="form-name" label="Nom complet" icon={<UserIcon />} required>
            <DemoInput id="form-name" placeholder="Jean Dupont" />
          </FormField>

          <FormField
            id="form-email"
            label="Adresse email"
            icon={<MailIcon />}
            required
            error="Cette adresse email est déjà utilisée"
          >
            <DemoInput id="form-email" type="email" placeholder="jean.dupont@example.com" hasError />
          </FormField>

          <FormField
            id="form-password"
            label="Mot de passe"
            icon={<LockIcon />}
            required
            helpText="Au moins 8 caractères avec majuscules, minuscules et chiffres"
          >
            <DemoInput id="form-password" type="password" placeholder="••••••••" />
          </FormField>

          <FormField
            id="form-phone"
            label="Téléphone"
            icon={<PhoneIcon />}
            helpText="Format international recommandé"
          >
            <DemoInput id="form-phone" type="tel" placeholder="+33 6 12 34 56 78" />
          </FormField>

          <FormField
            id="form-country"
            label="Pays"
            required
          >
            <DemoSelect id="form-country" />
          </FormField>

          <FormField
            id="form-message"
            label="Message"
            helpText="Facultatif - Partagez des informations supplémentaires"
          >
            <DemoTextarea id="form-message" />
          </FormField>

          <div className="pt-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Enregistrer
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default FormFieldExamples;
