/**
 * PasswordInput Examples
 *
 * Exemples d'utilisation du composant PasswordInput dans différents contextes.
 */

import { useState } from 'react';
import { PasswordInput } from './PasswordInput';

export default function PasswordInputExamples() {
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const [password3, setPassword3] = useState('');
  const [password4, setPassword4] = useState('Test123!');
  const [password5, setPassword5] = useState('weak');
  const [password6, setPassword6] = useState('Medium123');
  const [password7, setPassword7] = useState('Strong123!@#');
  const [password8, setPassword8] = useState('VeryStrong123!@#$');

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">PasswordInput Component</h1>
        <p className="text-gray-600">
          Champ de saisie pour mot de passe avec toggle visibilité et indicateur de force optionnel.
        </p>
      </div>

      {/* ─── EXEMPLE 1: Usage simple ─────────────────────────────── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">1. Usage simple</h2>
          <p className="text-sm text-gray-600">
            Champ mot de passe de base avec toggle show/hide.
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="max-w-md">
            <label htmlFor="password1" className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <PasswordInput
              id="password1"
              value={password1}
              onChange={(e) => setPassword1(e.target.value)}
              placeholder="Entrez votre mot de passe"
            />
          </div>
        </div>
      </section>

      {/* ─── EXEMPLE 2: Avec indicateur de force ─────────────────── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            2. Avec indicateur de force
          </h2>
          <p className="text-sm text-gray-600">
            Affiche une barre de progression et un label indiquant la force du mot de passe.
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="max-w-md">
            <label htmlFor="password2" className="block text-sm font-medium text-gray-700 mb-2">
              Nouveau mot de passe
            </label>
            <PasswordInput
              id="password2"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              showStrengthIndicator
              autoComplete="new-password"
              placeholder="Créez un mot de passe fort"
            />
            <p className="mt-2 text-xs text-gray-500">
              Votre mot de passe doit contenir au moins 8 caractères, incluant majuscules,
              minuscules, chiffres et caractères spéciaux.
            </p>
          </div>
        </div>
      </section>

      {/* ─── EXEMPLE 3: Avec erreur ─────────────────────────────── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">3. État d'erreur</h2>
          <p className="text-sm text-gray-600">
            Affiche une bordure rouge pour indiquer une erreur de validation.
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="max-w-md">
            <label htmlFor="password3" className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <PasswordInput
              id="password3"
              value={password3}
              onChange={(e) => setPassword3(e.target.value)}
              hasError
              showStrengthIndicator
            />
            <p className="mt-2 text-xs text-red-600">
              Le mot de passe doit contenir au moins 8 caractères.
            </p>
          </div>
        </div>
      </section>

      {/* ─── EXEMPLE 4: Désactivé ─────────────────────────────── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">4. État désactivé</h2>
          <p className="text-sm text-gray-600">
            Champ désactivé avec valeur pré-remplie.
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="max-w-md">
            <label htmlFor="password4" className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe actuel
            </label>
            <PasswordInput
              id="password4"
              value={password4}
              onChange={(e) => setPassword4(e.target.value)}
              disabled
            />
            <p className="mt-2 text-xs text-gray-500">
              Ce champ est désactivé et ne peut pas être modifié.
            </p>
          </div>
        </div>
      </section>

      {/* ─── EXEMPLE 5: Différents niveaux de force ─────────────── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            5. Différents niveaux de force
          </h2>
          <p className="text-sm text-gray-600">
            Exemples de mots de passe avec différents scores de force.
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Faible */}
            <div>
              <label htmlFor="password5" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe faible
              </label>
              <PasswordInput
                id="password5"
                value={password5}
                onChange={(e) => setPassword5(e.target.value)}
                showStrengthIndicator
              />
              <p className="mt-2 text-xs text-gray-500">
                Exemple : moins de 8 caractères
              </p>
            </div>

            {/* Moyen */}
            <div>
              <label htmlFor="password6" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe moyen
              </label>
              <PasswordInput
                id="password6"
                value={password6}
                onChange={(e) => setPassword6(e.target.value)}
                showStrengthIndicator
              />
              <p className="mt-2 text-xs text-gray-500">
                Exemple : 8+ caractères avec lettres + chiffres
              </p>
            </div>

            {/* Fort */}
            <div>
              <label htmlFor="password7" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe fort
              </label>
              <PasswordInput
                id="password7"
                value={password7}
                onChange={(e) => setPassword7(e.target.value)}
                showStrengthIndicator
              />
              <p className="mt-2 text-xs text-gray-500">
                Exemple : lettres + chiffres + caractères spéciaux
              </p>
            </div>

            {/* Très fort */}
            <div>
              <label htmlFor="password8" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe très fort
              </label>
              <PasswordInput
                id="password8"
                value={password8}
                onChange={(e) => setPassword8(e.target.value)}
                showStrengthIndicator
              />
              <p className="mt-2 text-xs text-gray-500">
                Exemple : 12+ caractères + majuscules + minuscules + chiffres + spéciaux
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── EXEMPLE 6: Formulaire complet ─────────────────────── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            6. Formulaire de changement de mot de passe
          </h2>
          <p className="text-sm text-gray-600">
            Exemple d'intégration dans un formulaire réel.
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <form className="max-w-md space-y-4">
            <div>
              <label
                htmlFor="current-password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Mot de passe actuel
              </label>
              <PasswordInput
                id="current-password"
                value=""
                onChange={() => {}}
                autoComplete="current-password"
              />
            </div>

            <div>
              <label
                htmlFor="new-password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Nouveau mot de passe
              </label>
              <PasswordInput
                id="new-password"
                value=""
                onChange={() => {}}
                showStrengthIndicator
                autoComplete="new-password"
              />
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Confirmer le mot de passe
              </label>
              <PasswordInput
                id="confirm-password"
                value=""
                onChange={() => {}}
                autoComplete="new-password"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Changer le mot de passe
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ─── CODE EXAMPLES ─────────────────────────────────────── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Code Examples</h2>
        </div>
        <div className="bg-gray-900 text-gray-100 p-6 rounded-xl overflow-x-auto">
          <pre className="text-sm">
            <code>{`// Usage simple
<PasswordInput
  id="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
/>

// Avec indicateur de force
<PasswordInput
  id="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  showStrengthIndicator
  autoComplete="new-password"
/>

// Avec erreur
<PasswordInput
  id="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  hasError
/>

// Désactivé
<PasswordInput
  id="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  disabled
/>`}</code>
          </pre>
        </div>
      </section>
    </div>
  );
}
