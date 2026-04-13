/**
 * SubmitButton Examples
 *
 * Exemples d'utilisation du composant SubmitButton
 */

import { useState } from 'react';
import { SubmitButton } from './SubmitButton';
import { Button } from './Button';
import { Input } from './Input';
import { Card } from './Card';

// ─── ICÔNES SIMULÉES ─────────────────────────────────────────────────────────

const TrashIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const SaveIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
  </svg>
);

const CheckIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const SendIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

// ─── UTILITAIRES ─────────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const toast = {
  success: (message: string) => console.log('✅', message),
  error: (message: string) => console.error('❌', message),
};

// ─── EXEMPLE 1 : BOUTON SIMPLE ───────────────────────────────────────────────

export function BasicSubmitButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    await sleep(2000);
    setIsLoading(false);
    toast.success('Action terminée');
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Bouton Simple</h3>
      <p className="text-sm text-gray-600">
        Bouton de base avec état de chargement
      </p>

      <div className="flex items-center gap-4">
        <SubmitButton
          isLoading={isLoading}
          type="button"
          onClick={handleClick}
        >
          Cliquer pour tester
        </SubmitButton>

        <span className="text-sm text-gray-500">
          État: {isLoading ? '⏳ Chargement...' : '✅ Prêt'}
        </span>
      </div>
    </div>
  );
}

// ─── EXEMPLE 2 : TOUS LES VARIANTS ───────────────────────────────────────────

export function AllVariants() {
  const [loadingStates, setLoadingStates] = useState({
    primary: false,
    secondary: false,
    danger: false,
    success: false,
    outline: false,
    ghost: false,
  });

  const handleClick = async (variant: keyof typeof loadingStates) => {
    setLoadingStates(prev => ({ ...prev, [variant]: true }));
    await sleep(2000);
    setLoadingStates(prev => ({ ...prev, [variant]: false }));
    toast.success(`${variant} terminé`);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Tous les Variants</h3>
      <p className="text-sm text-gray-600">
        Les 6 variants disponibles
      </p>

      <div className="grid grid-cols-2 gap-4">
        <SubmitButton
          variant="primary"
          isLoading={loadingStates.primary}
          type="button"
          onClick={() => handleClick('primary')}
        >
          Primary
        </SubmitButton>

        <SubmitButton
          variant="secondary"
          isLoading={loadingStates.secondary}
          type="button"
          onClick={() => handleClick('secondary')}
        >
          Secondary
        </SubmitButton>

        <SubmitButton
          variant="danger"
          isLoading={loadingStates.danger}
          type="button"
          onClick={() => handleClick('danger')}
        >
          Danger
        </SubmitButton>

        <SubmitButton
          variant="success"
          isLoading={loadingStates.success}
          type="button"
          onClick={() => handleClick('success')}
        >
          Success
        </SubmitButton>

        <SubmitButton
          variant="outline"
          isLoading={loadingStates.outline}
          type="button"
          onClick={() => handleClick('outline')}
        >
          Outline
        </SubmitButton>

        <SubmitButton
          variant="ghost"
          isLoading={loadingStates.ghost}
          type="button"
          onClick={() => handleClick('ghost')}
        >
          Ghost
        </SubmitButton>
      </div>
    </div>
  );
}

// ─── EXEMPLE 3 : LARGEUR PLEINE ──────────────────────────────────────────────

export function FullWidthButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await sleep(2000);
    setIsLoading(false);
    toast.success('Formulaire soumis');
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Largeur Pleine</h3>
      <p className="text-sm text-gray-600">
        Recommandé pour les formulaires (meilleure UX mobile)
      </p>

      <Card className="max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="vous@exemple.com"
            required
          />

          <SubmitButton
            isLoading={isLoading}
            loadingText="Envoi en cours..."
            fullWidth
          >
            S'abonner à la newsletter
          </SubmitButton>
        </form>
      </Card>
    </div>
  );
}

// ─── EXEMPLE 4 : TEXTE DE CHARGEMENT PERSONNALISÉ ───────────────────────────

export function CustomLoadingText() {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    await sleep(3000);
    setIsLoading(false);
    toast.success('Données synchronisées');
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Texte de Chargement Personnalisé</h3>
      <p className="text-sm text-gray-600">
        Affiche un texte différent pendant le chargement
      </p>

      <div className="space-y-3">
        <SubmitButton
          isLoading={isLoading}
          loadingText="Synchronisation en cours..."
          type="button"
          onClick={handleClick}
          icon={<SaveIcon />}
        >
          Synchroniser les données
        </SubmitButton>

        <p className="text-xs text-gray-500">
          💡 Cliquez pour voir le texte de chargement personnalisé
        </p>
      </div>
    </div>
  );
}

// ─── EXEMPLE 5 : FORMULAIRE DE CONNEXION ────────────────────────────────────

export function LoginFormExample() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulation d'un appel API
      await sleep(2000);

      if (formData.email && formData.password) {
        toast.success('Connexion réussie');
        setFormData({ email: '', password: '' });
      } else {
        toast.error('Veuillez remplir tous les champs');
      }
    } catch (error) {
      toast.error('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.email.includes('@') && formData.password.length >= 6;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Formulaire de Connexion</h3>
      <p className="text-sm text-gray-600">
        Exemple réaliste de formulaire avec validation
      </p>

      <Card className="max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Connexion
            </h4>
          </div>

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="vous@exemple.com"
            required
          />

          <Input
            label="Mot de passe"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Min. 6 caractères"
            required
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input type="checkbox" className="rounded text-blue-600" />
              <span className="ml-2 text-sm text-gray-600">Se souvenir</span>
            </label>
            <a href="#" className="text-sm text-blue-600 hover:text-blue-700">
              Mot de passe oublié ?
            </a>
          </div>

          <SubmitButton
            isLoading={isLoading}
            loadingText="Connexion en cours..."
            disabled={!isFormValid}
            fullWidth
          >
            Se connecter
          </SubmitButton>

          <p className="text-xs text-gray-500 text-center">
            Pas encore de compte ?{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700">
              S'inscrire
            </a>
          </p>
        </form>
      </Card>
    </div>
  );
}

// ─── EXEMPLE 6 : BOUTON DÉSACTIVÉ ────────────────────────────────────────────

export function DisabledButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    await sleep(2000);
    setIsLoading(false);
    toast.success('Conditions acceptées');
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Bouton Désactivé</h3>
      <p className="text-sm text-gray-600">
        Le bouton est désactivé jusqu'à ce que la condition soit remplie
      </p>

      <Card className="max-w-md">
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">
              Conditions d'utilisation
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              En continuant, vous acceptez nos conditions d'utilisation
              et notre politique de confidentialité.
            </p>
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 rounded text-blue-600"
              />
              <span className="text-sm text-gray-700">
                J'ai lu et j'accepte les conditions d'utilisation
              </span>
            </label>
          </div>

          <SubmitButton
            isLoading={isLoading}
            loadingText="Validation..."
            disabled={!agreed}
            type="button"
            onClick={handleSubmit}
            fullWidth
            variant="success"
          >
            Continuer
          </SubmitButton>

          {!agreed && (
            <p className="text-xs text-gray-500 text-center">
              ℹ️ Acceptez les conditions pour continuer
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}

// ─── EXEMPLE 7 : ACTION DANGEREUSE ──────────────────────────────────────────

export function DangerAction() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [memberName] = useState('Jean Dupont');

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer ${memberName} ?\n\nCette action est irréversible.`
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await sleep(2000);
      toast.success('Membre supprimé avec succès');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Action Dangereuse</h3>
      <p className="text-sm text-gray-600">
        Bouton pour les actions destructives avec confirmation
      </p>

      <Card className="max-w-md">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-lg font-semibold text-gray-600">JD</span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900">{memberName}</h4>
              <p className="text-sm text-gray-500">membre@club.com</p>
              <p className="text-xs text-gray-400 mt-1">Membre depuis 2 ans</p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between gap-3">
              <Button variant="outline" size="sm">
                Modifier
              </Button>

              <SubmitButton
                isLoading={isDeleting}
                loadingText="Suppression..."
                variant="danger"
                size="sm"
                type="button"
                onClick={handleDelete}
                icon={<TrashIcon />}
              >
                Supprimer
              </SubmitButton>
            </div>
          </div>

          <p className="text-xs text-gray-500">
            ⚠️ La suppression est irréversible
          </p>
        </div>
      </Card>
    </div>
  );
}

// ─── EXEMPLE 8 : BOUTONS INLINE ──────────────────────────────────────────────

export function InlineButtons() {
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await sleep(1500);
    setIsSaving(false);
    toast.success('Brouillon enregistré');
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    await sleep(2000);
    setIsPublishing(false);
    toast.success('Article publié');
  };

  const handleSend = async () => {
    setIsSending(true);
    await sleep(2000);
    setIsSending(false);
    toast.success('Notifications envoyées');
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Boutons Inline</h3>
      <p className="text-sm text-gray-600">
        Actions multiples avec différents états de chargement
      </p>

      <Card className="max-w-2xl">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-1">
              Éditeur d'article
            </h4>
            <textarea
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Écrivez votre article ici..."
              defaultValue="Ceci est un exemple d'article..."
            />
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                Dernière sauvegarde : Il y a 5 min
              </span>
            </div>

            <div className="flex items-center gap-2">
              <SubmitButton
                isLoading={isSaving}
                loadingText="Sauvegarde..."
                variant="secondary"
                size="sm"
                type="button"
                onClick={handleSave}
                icon={<SaveIcon />}
              >
                Sauvegarder
              </SubmitButton>

              <SubmitButton
                isLoading={isPublishing}
                loadingText="Publication..."
                variant="success"
                size="sm"
                type="button"
                onClick={handlePublish}
                icon={<CheckIcon />}
              >
                Publier
              </SubmitButton>

              <SubmitButton
                isLoading={isSending}
                loadingText="Envoi..."
                variant="primary"
                size="sm"
                type="button"
                onClick={handleSend}
                icon={<SendIcon />}
              >
                Notifier
              </SubmitButton>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── EXEMPLE 9 : FORMULAIRE DE CRÉATION ─────────────────────────────────────

export function CreateMemberForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await sleep(2000);
      toast.success('Membre créé avec succès');
      setFormData({ firstName: '', lastName: '', email: '', phone: '' });
    } catch (error) {
      toast.error('Erreur lors de la création');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.firstName && formData.lastName && formData.email.includes('@');

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Formulaire de Création</h3>
      <p className="text-sm text-gray-600">
        Exemple complet de formulaire avec validation
      </p>

      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Nouveau membre
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Prénom"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              placeholder="Jean"
              required
            />
            <Input
              label="Nom"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              placeholder="Dupont"
              required
            />
          </div>

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="jean.dupont@exemple.com"
            required
          />

          <Input
            label="Téléphone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="06 12 34 56 78"
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="secondary" type="button">
              Annuler
            </Button>
            <SubmitButton
              isLoading={isSubmitting}
              loadingText="Création en cours..."
              disabled={!isFormValid}
            >
              Créer le membre
            </SubmitButton>
          </div>
        </form>
      </Card>
    </div>
  );
}

// ─── EXEMPLE 10 : TAILLES DIFFÉRENTES ───────────────────────────────────────

export function DifferentSizes() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleClick = async (size: string) => {
    setLoading(size);
    await sleep(2000);
    setLoading(null);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Tailles Différentes</h3>
      <p className="text-sm text-gray-600">
        5 tailles disponibles (xs, sm, md, lg, xl)
      </p>

      <div className="flex items-center gap-3 flex-wrap">
        <SubmitButton
          size="xs"
          isLoading={loading === 'xs'}
          type="button"
          onClick={() => handleClick('xs')}
        >
          Extra Small
        </SubmitButton>

        <SubmitButton
          size="sm"
          isLoading={loading === 'sm'}
          type="button"
          onClick={() => handleClick('sm')}
        >
          Small
        </SubmitButton>

        <SubmitButton
          size="md"
          isLoading={loading === 'md'}
          type="button"
          onClick={() => handleClick('md')}
        >
          Medium
        </SubmitButton>

        <SubmitButton
          size="lg"
          isLoading={loading === 'lg'}
          type="button"
          onClick={() => handleClick('lg')}
        >
          Large
        </SubmitButton>

        <SubmitButton
          size="xl"
          isLoading={loading === 'xl'}
          type="button"
          onClick={() => handleClick('xl')}
        >
          Extra Large
        </SubmitButton>
      </div>
    </div>
  );
}

// ─── EXPORTATION GROUPÉE ─────────────────────────────────────────────────────

export default {
  BasicSubmitButton,
  AllVariants,
  FullWidthButton,
  CustomLoadingText,
  LoginFormExample,
  DisabledButton,
  DangerAction,
  InlineButtons,
  CreateMemberForm,
  DifferentSizes,
};
