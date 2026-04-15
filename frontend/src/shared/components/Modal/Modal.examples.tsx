/**
 * Modal.examples.tsx
 * Exemples d'utilisation du composant Modal
 *
 * Ce fichier contient des exemples pratiques pour tous les cas d'usage
 * du composant Modal. Utilisez-le comme référence pour votre implémentation.
 */

import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from '../Button';
import { Badge } from '../Badge';
import { useForm } from 'react-hook-form';

// ─── EXEMPLE 1: Modal Simple (Confirmation) ──────────────────────────────────

/**
 * Exemple 1: Modal de confirmation simple
 * Cas d'usage: Confirmation de suppression, validation d'action
 */
export function Example1_SimpleConfirmation() {
  const [isOpen, setIsOpen] = useState(false);

  const handleConfirm = () => {
    console.log('Action confirmée');
    setIsOpen(false);
  };

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>
        Ouvrir modal de confirmation
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="sm">
        <Modal.Header
          title="Confirmer la suppression"
          subtitle="Cette action est irréversible."
          onClose={() => setIsOpen(false)}
        />
        <Modal.Body>
          <p className="text-sm text-gray-700">
            Êtes-vous sûr de vouloir supprimer cet élément ? Toutes les données
            associées seront également supprimées.
          </p>
        </Modal.Body>
        <Modal.Footer align="right">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleConfirm}>
            Supprimer
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

// ─── EXEMPLE 2: Modal avec Formulaire ────────────────────────────────────────

/**
 * Exemple 2: Modal avec formulaire de création
 * Cas d'usage: Ajout d'utilisateur, création d'entité
 */
export function Example2_FormModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulation d'une requête API
    await new Promise(resolve => setTimeout(resolve, 1500));

    console.log('Formulaire soumis');
    setIsSubmitting(false);
    setIsOpen(false);
  };

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>
        Ajouter un utilisateur
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        size="md"
        closeOnOverlayClick={!isSubmitting}
        closeOnEscape={!isSubmitting}
      >
        <Modal.Header
          title="Ajouter un utilisateur"
          subtitle="Remplissez les informations ci-dessous"
          onClose={!isSubmitting ? () => setIsOpen(false) : undefined}
        />
        <Modal.Body>
          <form id="add-user-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                Nom complet <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                required
                disabled={isSubmitting}
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder="Marie Dupont"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                required
                disabled={isSubmitting}
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder="marie.dupont@example.com"
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1.5">
                Rôle
              </label>
              <select
                id="role"
                disabled={isSubmitting}
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           disabled:bg-gray-50 disabled:cursor-not-allowed"
              >
                <option>Membre</option>
                <option>Admin</option>
                <option>Gestionnaire</option>
              </select>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer align="right">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            form="add-user-form"
            loading={isSubmitting}
          >
            Ajouter l'utilisateur
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

// ─── EXEMPLE 3: Modal avec Contenu Scrollable ────────────────────────────────

/**
 * Exemple 3: Modal avec beaucoup de contenu (scrollable)
 * Cas d'usage: CGU, politique de confidentialité, documentation
 */
export function Example3_ScrollableContent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>
        Voir les conditions d'utilisation
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="lg">
        <Modal.Header
          title="Conditions d'utilisation"
          subtitle="Dernière mise à jour : 15 janvier 2025"
          onClose={() => setIsOpen(false)}
        />
        <Modal.Body>
          <div className="prose prose-sm max-w-none space-y-4">
            <section>
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                1. Acceptation des conditions
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                En accédant et en utilisant ClubManager V3, vous acceptez d'être lié par ces
                conditions d'utilisation et toutes les lois et réglementations applicables.
                Si vous n'acceptez pas l'une de ces conditions, il vous est interdit d'utiliser
                ou d'accéder à ce site.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                2. Utilisation du service
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Vous vous engagez à utiliser le service uniquement à des fins légales et de
                manière à ne pas porter atteinte aux droits de tiers ou restreindre ou empêcher
                quiconque d'utiliser et de profiter du service.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                3. Protection des données
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Nous nous engageons à protéger vos données personnelles conformément au RGPD.
                Vos données ne seront jamais vendues à des tiers et seront uniquement utilisées
                pour améliorer votre expérience sur notre plateforme.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                4. Propriété intellectuelle
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Le contenu, l'organisation, les graphiques, le design, la compilation et autres
                matériels liés au service sont protégés par les lois applicables en matière de
                propriété intellectuelle.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                5. Limitation de responsabilité
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                En aucun cas, ClubManager V3 ne sera responsable des dommages directs, indirects,
                accessoires, spéciaux ou consécutifs résultant de l'utilisation ou de
                l'impossibilité d'utiliser le service.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                6. Modifications des conditions
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Nous nous réservons le droit de modifier ces conditions à tout moment. Les
                modifications entreront en vigueur immédiatement après leur publication sur
                cette page.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                7. Contact
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Pour toute question concernant ces conditions, veuillez nous contacter à
                l'adresse <strong>support@clubmanager.com</strong>
              </p>
            </section>
          </div>
        </Modal.Body>
        <Modal.Footer align="right">
          <Button onClick={() => setIsOpen(false)}>
            J'ai compris
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

// ─── EXEMPLE 4: Modal sans Bouton X (Action Forcée) ──────────────────────────

/**
 * Exemple 4: Modal sans bouton X (l'utilisateur doit choisir une action)
 * Cas d'usage: Actions critiques, choix obligatoire
 */
export function Example4_NoCloseButton() {
  const [isOpen, setIsOpen] = useState(false);

  const handleConfirm = () => {
    console.log('Action critique confirmée');
    setIsOpen(false);
  };

  return (
    <div>
      <Button variant="danger" onClick={() => setIsOpen(true)}>
        Action critique
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        size="md"
        closeOnOverlayClick={false}
        closeOnEscape={false}
      >
        <Modal.Header
          title="Action critique requise"
          subtitle="Vous devez explicitement confirmer ou annuler cette action."
          showCloseButton={false}
        />
        <Modal.Body>
          <div className="space-y-3">
            <p className="text-sm text-gray-700">
              Vous êtes sur le point d'effectuer une action irréversible qui modifiera
              définitivement les données du système.
            </p>
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
              <p className="text-sm text-red-800">
                <strong>Attention :</strong> Cette action supprimera toutes les données
                associées et ne pourra pas être annulée.
              </p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer align="right">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleConfirm}>
            Je confirme l'action
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

// ─── EXEMPLE 5: Différentes Tailles ──────────────────────────────────────────

/**
 * Exemple 5: Démonstration de toutes les tailles disponibles
 * Cas d'usage: Choisir la bonne taille selon le contenu
 */
export function Example5_AllSizes() {
  const [openSize, setOpenSize] = useState<'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | null>(null);

  const sizes = [
    { value: 'sm' as const, label: 'Small (384px)', desc: 'Confirmations simples' },
    { value: 'md' as const, label: 'Medium (512px)', desc: 'Défaut, formulaires simples' },
    { value: 'lg' as const, label: 'Large (640px)', desc: 'Formulaires complexes' },
    { value: 'xl' as const, label: 'Extra Large (768px)', desc: 'Édition de contenu' },
    { value: '2xl' as const, label: '2XL (896px)', desc: 'Tableaux, listes' },
    { value: '3xl' as const, label: '3XL (1024px)', desc: 'Dashboards' },
    { value: '4xl' as const, label: '4XL (1280px)', desc: 'Plein écran' },
  ];

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-900 mb-3">
        Cliquez pour voir chaque taille :
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {sizes.map((size) => (
          <Button
            key={size.value}
            variant="outline"
            onClick={() => setOpenSize(size.value)}
            size="sm"
          >
            {size.label}
          </Button>
        ))}
      </div>

      {openSize && (
        <Modal isOpen={true} onClose={() => setOpenSize(null)} size={openSize}>
          <Modal.Header
            title={`Modal ${openSize.toUpperCase()}`}
            subtitle={sizes.find(s => s.value === openSize)?.desc}
            onClose={() => setOpenSize(null)}
          />
          <Modal.Body>
            <p className="text-sm text-gray-700">
              Ceci est une modal de taille <strong>{openSize}</strong>.
              La largeur maximale est de{' '}
              <Badge variant="info">
                {sizes.find(s => s.value === openSize)?.label.match(/\((.+)\)/)?.[1]}
              </Badge>
            </p>
            <p className="text-sm text-gray-500 mt-3">
              {sizes.find(s => s.value === openSize)?.desc}
            </p>
          </Modal.Body>
          <Modal.Footer align="right">
            <Button onClick={() => setOpenSize(null)}>
              Fermer
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}

// ─── EXEMPLE 6: Modal avec Footer Custom ─────────────────────────────────────

/**
 * Exemple 6: Modal avec footer personnalisé (alignement "between")
 * Cas d'usage: Aide à gauche, actions à droite
 */
export function Example6_CustomFooter() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>
        Paramètres avancés
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="lg">
        <Modal.Header
          title="Paramètres avancés"
          subtitle="Configurez les options avancées de votre compte"
          onClose={() => setIsOpen(false)}
        />
        <Modal.Body>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Niveau de log
              </label>
              <select className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg">
                <option>Info</option>
                <option>Warning</option>
                <option>Error</option>
                <option>Debug</option>
              </select>
            </div>
            <div className="flex items-center">
              <input
                id="advanced-mode"
                type="checkbox"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="advanced-mode" className="ml-2 text-sm text-gray-700">
                Activer le mode avancé
              </label>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer align="between">
          <Button variant="ghost" size="sm">
            Besoin d'aide ?
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Annuler
            </Button>
            <Button onClick={() => setIsOpen(false)}>
              Enregistrer
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

// ─── EXEMPLE 7: Modal Très Large (Tableau) ───────────────────────────────────

/**
 * Exemple 7: Modal très large avec tableau
 * Cas d'usage: Afficher une liste complète, tableau de données
 */
export function Example7_LargeTableModal() {
  const [isOpen, setIsOpen] = useState(false);

  const users = [
    { id: 1, name: 'Marie Dupont', email: 'marie@example.com', role: 'Admin', status: 'Actif' },
    { id: 2, name: 'Jean Martin', email: 'jean@example.com', role: 'Membre', status: 'Actif' },
    { id: 3, name: 'Sophie Bernard', email: 'sophie@example.com', role: 'Gestionnaire', status: 'Inactif' },
    { id: 4, name: 'Luc Petit', email: 'luc@example.com', role: 'Membre', status: 'Actif' },
  ];

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>
        Voir tous les utilisateurs
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="4xl">
        <Modal.Header
          title="Tous les utilisateurs"
          subtitle={`${users.length} utilisateurs au total`}
          onClose={() => setIsOpen(false)}
        />
        <Modal.Body padding="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Badge variant="info" size="sm">
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Badge.Status status={user.status === 'Actif' ? 'actif' : 'inactif'} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Button variant="outline" size="xs">
                        Modifier
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal.Body>
        <Modal.Footer align="right">
          <Button onClick={() => setIsOpen(false)}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

// ─── EXEMPLE 8: Modal avec Loading State ─────────────────────────────────────

/**
 * Exemple 8: Modal avec état de chargement
 * Cas d'usage: Traitement async, sauvegarde, envoi
 */
export function Example8_LoadingState() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleProcess = async () => {
    setIsLoading(true);

    // Simulation d'un traitement long
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('Traitement terminé');
    setIsLoading(false);
    setIsOpen(false);
  };

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>
        Démarrer le traitement
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        size="md"
        closeOnOverlayClick={!isLoading}
        closeOnEscape={!isLoading}
      >
        <Modal.Header
          title="Traitement des données"
          subtitle={isLoading ? "Traitement en cours, veuillez patienter..." : "Prêt à démarrer"}
          onClose={!isLoading ? () => setIsOpen(false) : undefined}
        />
        <Modal.Body>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4" />
              <p className="text-sm text-gray-600">
                Traitement en cours...
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-700">
              Cliquez sur "Démarrer" pour lancer le traitement des données.
              Cette opération peut prendre quelques secondes.
            </p>
          )}
        </Modal.Body>
        <Modal.Footer align="right">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button
            onClick={handleProcess}
            loading={isLoading}
          >
            {isLoading ? 'Traitement...' : 'Démarrer'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

// ─── EXEMPLE 9: Modal avec react-hook-form ───────────────────────────────────

/**
 * Exemple 9: Modal avec react-hook-form et validation
 * Cas d'usage: Formulaires complexes avec validation
 */
export function Example9_ReactHookForm() {
  const [isOpen, setIsOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      acceptTerms: false,
    },
  });

  const handleClose = () => {
    reset();
    setIsOpen(false);
  };

  const onSubmit = async (data: any) => {
    console.log('Données du formulaire:', data);

    // Simulation d'une requête API
    await new Promise(resolve => setTimeout(resolve, 1000));

    handleClose();
  };

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>
        Inscription (react-hook-form)
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        size="md"
        closeOnOverlayClick={!isSubmitting}
        closeOnEscape={!isSubmitting}
      >
        <Modal.Header
          title="Créer un compte"
          subtitle="Remplissez le formulaire ci-dessous pour vous inscrire"
          onClose={!isSubmitting ? handleClose : undefined}
        />
        <Modal.Body>
          <form id="signup-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Prénom <span className="text-red-500">*</span>
                </label>
                <input
                  id="firstName"
                  type="text"
                  disabled={isSubmitting}
                  className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                             disabled:bg-gray-50 disabled:cursor-not-allowed
                             ${errors.firstName ? 'border-red-400' : 'border-gray-300'}`}
                  {...register('firstName', {
                    required: 'Le prénom est requis',
                    minLength: { value: 2, message: 'Au moins 2 caractères' },
                  })}
                />
                {errors.firstName && (
                  <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  id="lastName"
                  type="text"
                  disabled={isSubmitting}
                  className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                             disabled:bg-gray-50 disabled:cursor-not-allowed
                             ${errors.lastName ? 'border-red-400' : 'border-gray-300'}`}
                  {...register('lastName', {
                    required: 'Le nom est requis',
                    minLength: { value: 2, message: 'Au moins 2 caractères' },
                  })}
                />
                {errors.lastName && (
                  <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                disabled={isSubmitting}
                className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           disabled:bg-gray-50 disabled:cursor-not-allowed
                           ${errors.email ? 'border-red-400' : 'border-gray-300'}`}
                {...register('email', {
                  required: "L'email est requis",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email invalide',
                  },
                })}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="flex items-center">
              <input
                id="acceptTerms"
                type="checkbox"
                disabled={isSubmitting}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                {...register('acceptTerms', {
                  required: 'Vous devez accepter les conditions',
                })}
              />
              <label htmlFor="acceptTerms" className="ml-2 text-sm text-gray-700">
                J'accepte les conditions d'utilisation
              </label>
            </div>
            {errors.acceptTerms && (
              <p className="text-xs text-red-600">{errors.acceptTerms.message}</p>
            )}
          </form>
        </Modal.Body>
        <Modal.Footer align="right">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            form="signup-form"
            loading={isSubmitting}
          >
            S'inscrire
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

// ─── EXEMPLE 10: Modal avec Badges et Statuts ────────────────────────────────

/**
 * Exemple 10: Modal avec badges et informations riches
 * Cas d'usage: Détails d'une commande, détails d'un utilisateur
 */
export function Example10_WithBadges() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>
        Détails de la commande
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="lg">
        <Modal.Header
          title="Commande #12345"
          subtitle="Passée le 15 janvier 2025 à 14:30"
          onClose={() => setIsOpen(false)}
        />
        <Modal.Body>
          <div className="space-y-6">
            {/* Statut */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Statut</h3>
              <div className="flex gap-2">
                <Badge.OrderStatus status="en_cours" />
                <Badge.PaymentStatus status="paye" />
              </div>
            </div>

            {/* Client */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Client</h3>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">MD</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Marie Dupont</p>
                  <p className="text-xs text-gray-500">marie.dupont@example.com</p>
                </div>
              </div>
            </div>

            {/* Articles */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Articles</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div>
                    <p className="text-sm text-gray-900">T-shirt Club</p>
                    <p className="text-xs text-gray-500">Taille M</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">25,00 €</p>
                    <p className="text-xs text-gray-500">× 2</p>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2">
                  <div>
                    <p className="text-sm text-gray-900">Casquette</p>
                    <p className="text-xs text-gray-500">Taille unique</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">15,00 €</p>
                    <p className="text-xs text-gray-500">× 1</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-base font-semibold text-gray-900">Total</span>
                <span className="text-lg font-bold text-blue-600">65,00 €</span>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer align="right">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Fermer
          </Button>
          <Button onClick={() => console.log('Imprimer')}>
            Imprimer la facture
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

// ─── COMPOSANT PRINCIPAL (Affichage de tous les exemples) ────────────────────

/**
 * ModalExamples - Affiche tous les exemples de Modal
 * Utilisez ce composant dans votre application de développement
 */
export function ModalExamples() {
  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Modal Component - Exemples
        </h1>
        <p className="text-gray-600">
          Exemples pratiques d'utilisation du composant Modal avec différentes configurations.
        </p>
      </div>

      <div className="space-y-6">
        <ExampleSection
          title="1. Modal Simple (Confirmation)"
          description="Modal de confirmation basique avec 2 actions."
        >
          <Example1_SimpleConfirmation />
        </ExampleSection>

        <ExampleSection
          title="2. Modal avec Formulaire"
          description="Formulaire de création avec loading state."
        >
          <Example2_FormModal />
        </ExampleSection>

        <ExampleSection
          title="3. Contenu Scrollable"
          description="Modal avec beaucoup de contenu qui scrolle automatiquement."
        >
          <Example3_ScrollableContent />
        </ExampleSection>

        <ExampleSection
          title="4. Sans Bouton X (Action Forcée)"
          description="L'utilisateur doit explicitement choisir une action."
        >
          <Example4_NoCloseButton />
        </ExampleSection>

        <ExampleSection
          title="5. Toutes les Tailles"
          description="Démonstration des 7 tailles disponibles (sm → 4xl)."
        >
          <Example5_AllSizes />
        </ExampleSection>

        <ExampleSection
          title="6. Footer Personnalisé"
          description="Footer avec alignement 'between' (aide à gauche, actions à droite)."
        >
          <Example6_CustomFooter />
        </ExampleSection>

        <ExampleSection
          title="7. Modal Très Large (Tableau)"
          description="Modal 4xl avec un tableau de données."
        >
          <Example7_LargeTableModal />
        </ExampleSection>

        <ExampleSection
          title="8. État de Chargement"
          description="Modal avec traitement async et loading state."
        >
          <Example8_LoadingState />
        </ExampleSection>

        <ExampleSection
          title="9. react-hook-form"
          description="Intégration avec react-hook-form et validation."
        >
          <Example9_ReactHookForm />
        </ExampleSection>

        <ExampleSection
          title="10. Avec Badges"
          description="Modal riche avec badges, statuts, et informations détaillées."
        >
          <Example10_WithBadges />
        </ExampleSection>
      </div>
    </div>
  );
}

// ─── COMPOSANT HELPER ────────────────────────────────────────────────────────

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
