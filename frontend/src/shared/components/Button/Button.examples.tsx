/**
 * Button Component - Examples
 *
 * Exemples d'utilisation du composant Button dans différents contextes.
 * Ce fichier sert de documentation vivante et peut être utilisé pour tester
 * visuellement les différents variants.
 */

import { useState } from 'react';
import { Button } from '../Button';

// ─── ICÔNES INLINE ───────────────────────────────────────────────────────────

function PlusIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function TrashIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

function CheckIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ArrowRightIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}

function DownloadIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}

function XIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function EditIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

// ─── EXEMPLE 1: VARIANTS ─────────────────────────────────────────────────────

export function ButtonVariants() {
  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">Variants de Boutons</h2>

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="danger">Danger</Button>
        <Button variant="success">Success</Button>
        <Button variant="ghost">Ghost</Button>
      </div>

      <div className="bg-white p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Cas d'usage</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li><strong>Primary:</strong> Action principale (Enregistrer, Confirmer)</li>
          <li><strong>Secondary:</strong> Action secondaire (Annuler, Retour)</li>
          <li><strong>Outline:</strong> Action tertiaire (Voir détails, Options)</li>
          <li><strong>Danger:</strong> Action destructive (Supprimer, Rejeter)</li>
          <li><strong>Success:</strong> Action positive (Valider, Approuver)</li>
          <li><strong>Ghost:</strong> Action discrète (Fermer, Menu)</li>
        </ul>
      </div>
    </div>
  );
}

// ─── EXEMPLE 2: TAILLES ──────────────────────────────────────────────────────

export function ButtonSizes() {
  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">Tailles de Boutons</h2>

      <div className="flex flex-wrap items-center gap-3">
        <Button size="xs">Extra Small</Button>
        <Button size="sm">Small</Button>
        <Button size="md">Medium (Défaut)</Button>
        <Button size="lg">Large</Button>
        <Button size="xl">Extra Large</Button>
      </div>

      <div className="bg-white p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Dimensions</h3>
        <ul className="text-xs font-mono text-gray-600 space-y-1">
          <li><strong>xs:</strong> px-2.5 py-1.5 text-xs</li>
          <li><strong>sm:</strong> px-3 py-1.5 text-xs</li>
          <li><strong>md:</strong> px-4 py-2 text-sm</li>
          <li><strong>lg:</strong> px-5 py-2.5 text-base</li>
          <li><strong>xl:</strong> px-6 py-3 text-base</li>
        </ul>
      </div>
    </div>
  );
}

// ─── EXEMPLE 3: LOADING STATE ────────────────────────────────────────────────

export function ButtonLoading() {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">État de Chargement</h2>

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary" loading>
          Chargement...
        </Button>
        <Button variant="secondary" loading>
          Traitement...
        </Button>
        <Button variant="danger" loading>
          Suppression...
        </Button>
      </div>

      <div className="bg-white p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Bouton Interactif</h3>
        <Button variant="primary" loading={loading} onClick={handleClick}>
          {loading ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
        <p className="text-xs text-gray-500 mt-2">
          Cliquez pour voir l'état de chargement (2 secondes)
        </p>
      </div>
    </div>
  );
}

// ─── EXEMPLE 4: BOUTONS AVEC ICÔNES ──────────────────────────────────────────

export function ButtonWithIcons() {
  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">Boutons avec Icônes</h2>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Icône à Gauche</h3>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" icon={<PlusIcon />}>
              Ajouter un membre
            </Button>
            <Button variant="success" icon={<CheckIcon />}>
              Valider
            </Button>
            <Button variant="danger" icon={<TrashIcon />}>
              Supprimer
            </Button>
            <Button variant="outline" icon={<DownloadIcon />}>
              Télécharger
            </Button>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Icône à Droite</h3>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" icon={<ArrowRightIcon />} iconPosition="right">
              Suivant
            </Button>
            <Button variant="outline" icon={<ArrowRightIcon />} iconPosition="right">
              Continuer
            </Button>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Icône Uniquement</h3>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="ghost" icon={<XIcon />} iconOnly aria-label="Fermer" />
            <Button variant="primary" icon={<EditIcon />} iconOnly aria-label="Modifier" />
            <Button variant="danger" icon={<TrashIcon />} iconOnly aria-label="Supprimer" />
            <Button variant="outline" icon={<PlusIcon />} iconOnly aria-label="Ajouter" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── EXEMPLE 5: ÉTATS DÉSACTIVÉS ─────────────────────────────────────────────

export function ButtonDisabled() {
  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">Boutons Désactivés</h2>

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary" disabled>
          Primary Disabled
        </Button>
        <Button variant="secondary" disabled>
          Secondary Disabled
        </Button>
        <Button variant="outline" disabled>
          Outline Disabled
        </Button>
        <Button variant="danger" disabled>
          Danger Disabled
        </Button>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Les boutons en état loading sont automatiquement désactivés.
          Pas besoin d'ajouter <code className="bg-blue-100 px-1 rounded">disabled</code> manuellement.
        </p>
      </div>
    </div>
  );
}

// ─── EXEMPLE 6: BOUTONS PLEINE LARGEUR ───────────────────────────────────────

export function ButtonFullWidth() {
  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">Boutons Pleine Largeur</h2>

      <div className="max-w-md space-y-3">
        <Button variant="primary" fullWidth>
          Se connecter
        </Button>
        <Button variant="outline" fullWidth>
          Créer un compte
        </Button>
        <Button variant="secondary" fullWidth>
          Mot de passe oublié ?
        </Button>
      </div>

      <div className="bg-white p-4 rounded-lg max-w-md">
        <p className="text-sm text-gray-600">
          Utilisé principalement dans les formulaires de connexion,
          modals mobiles, ou pour les actions principales sur mobile.
        </p>
      </div>
    </div>
  );
}

// ─── EXEMPLE 7: GROUPES DE BOUTONS ───────────────────────────────────────────

export function ButtonGroups() {
  const [selected, setSelected] = useState('center');

  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">Groupes de Boutons</h2>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Groupe Simple</h3>
          <Button.Group>
            <Button variant="outline" size="sm">Gauche</Button>
            <Button variant="outline" size="sm">Centre</Button>
            <Button variant="outline" size="sm">Droite</Button>
          </Button.Group>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Groupe Interactif</h3>
          <Button.Group>
            <Button
              variant={selected === 'left' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelected('left')}
            >
              Gauche
            </Button>
            <Button
              variant={selected === 'center' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelected('center')}
            >
              Centre
            </Button>
            <Button
              variant={selected === 'right' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelected('right')}
            >
              Droite
            </Button>
          </Button.Group>
          <p className="text-xs text-gray-500 mt-2">Sélectionné: {selected}</p>
        </div>
      </div>
    </div>
  );
}

// ─── EXEMPLE 8: FOOTER DE MODAL ──────────────────────────────────────────────

export function ModalFooterExample() {
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('Enregistré avec succès !');
    }, 1500);
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">Footer de Modal</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-2xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Exemple de Modal
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Contenu du modal avec un formulaire ou des informations...
        </p>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Button variant="secondary">
            Annuler
          </Button>
          <Button variant="primary" loading={saving} onClick={handleSave}>
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── EXEMPLE 9: ACTIONS DE FORMULAIRE ────────────────────────────────────────

export function FormActionsExample() {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      alert('Formulaire soumis !');
    }, 2000);
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">Actions de Formulaire</h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-2xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Nouveau Membre
        </h3>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nom complet
            </label>
            <input
              type="text"
              placeholder="Jean Dupont"
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <input
              type="email"
              placeholder="jean@example.com"
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg"
              required
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button variant="secondary" type="button">
            Annuler
          </Button>
          <Button variant="primary" type="submit" loading={submitting}>
            {submitting ? 'Création...' : 'Créer le membre'}
          </Button>
        </div>
      </form>
    </div>
  );
}

// ─── EXEMPLE 10: ACTIONS DESTRUCTIVES ────────────────────────────────────────

export function DestructiveActionsExample() {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      setDeleting(true);
      setTimeout(() => {
        setDeleting(false);
        alert('Élément supprimé !');
      }, 1500);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">Actions Destructives</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-2xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Membre: Jean Dupont
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          jean.dupont@example.com
        </p>

        <div className="flex items-center gap-3">
          <Button variant="outline" icon={<EditIcon />}>
            Modifier
          </Button>
          <Button
            variant="danger"
            icon={<TrashIcon />}
            loading={deleting}
            onClick={handleDelete}
          >
            {deleting ? 'Suppression...' : 'Supprimer'}
          </Button>
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 p-4 rounded-lg max-w-2xl">
        <p className="text-sm text-red-800">
          <strong>Bonne pratique:</strong> Toujours demander confirmation avant
          une action destructive. Utiliser le variant "danger" pour les rendre
          visuellement distinctes.
        </p>
      </div>
    </div>
  );
}

// ─── EXEMPLE 11: TOOLBAR / ACTIONS DE PAGE ───────────────────────────────────

export function ToolbarExample() {
  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">Toolbar / Actions de Page</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            Liste des Membres
          </h3>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" icon={<DownloadIcon />}>
              Exporter
            </Button>
            <Button variant="primary" size="sm" icon={<PlusIcon />}>
              Ajouter
            </Button>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
          Contenu de la page (tableau, grille, etc.)
        </div>
      </div>
    </div>
  );
}

// ─── EXEMPLE 12: BOUTONS DE NAVIGATION ───────────────────────────────────────

export function NavigationButtonsExample() {
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">Boutons de Navigation</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-2xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Étape {step} sur {totalSteps}
        </h3>

        <div className="bg-gray-50 p-8 rounded-lg text-center mb-6">
          Contenu de l'étape {step}
        </div>

        <div className="flex items-center justify-between">
          <Button
            variant="secondary"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
          >
            Précédent
          </Button>

          {step < totalSteps ? (
            <Button
              variant="primary"
              icon={<ArrowRightIcon />}
              iconPosition="right"
              onClick={() => setStep(step + 1)}
            >
              Suivant
            </Button>
          ) : (
            <Button
              variant="success"
              icon={<CheckIcon />}
              onClick={() => alert('Terminé !')}
            >
              Terminer
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── COMPOSANT DÉMO GLOBAL ───────────────────────────────────────────────────

export default function ButtonExamples() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 space-y-12">
        <div className="px-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Button Component - Exemples
          </h1>
          <p className="text-lg text-gray-600">
            Galerie complète de tous les variants, tailles et états du composant Button
          </p>
        </div>

        <ButtonVariants />
        <ButtonSizes />
        <ButtonLoading />
        <ButtonWithIcons />
        <ButtonDisabled />
        <ButtonFullWidth />
        <ButtonGroups />
        <ModalFooterExample />
        <FormActionsExample />
        <DestructiveActionsExample />
        <ToolbarExample />
        <NavigationButtonsExample />
      </div>
    </div>
  );
}
