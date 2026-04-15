/**
 * ErrorBanner Component - Examples
 *
 * Exemples d'utilisation du composant ErrorBanner dans différents contextes.
 * Ce fichier sert de documentation vivante et peut être utilisé pour tester
 * visuellement les différents variants.
 */

import { useState } from "react";
import { ErrorBanner } from "./ErrorBanner";

// ─── ICÔNES PERSONNALISÉES ───────────────────────────────────────────────────

function ShieldExclamationIcon({
  className = "h-5 w-5",
}: {
  className?: string;
}) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01"
      />
    </svg>
  );
}

function CreditCardIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
      />
    </svg>
  );
}

function ClockIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function SparklesIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
      />
    </svg>
  );
}

// ─── EXEMPLE 1: TOUS LES VARIANTS ────────────────────────────────────────────

export function AllVariants() {
  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">Tous les Variants</h2>

      <div className="space-y-4">
        <ErrorBanner
          variant="error"
          message="Une erreur s'est produite lors du traitement de votre demande."
        />

        <ErrorBanner
          variant="warning"
          message="Votre session expire dans 5 minutes. Veuillez enregistrer votre travail."
        />

        <ErrorBanner
          variant="info"
          message="Une nouvelle version de l'application est disponible. Rechargez la page pour la mettre à jour."
        />

        <ErrorBanner
          variant="success"
          message="Vos modifications ont été enregistrées avec succès."
        />
      </div>

      <div className="bg-white p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Usage Sémantique
        </h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>
            <strong>Error (Rouge):</strong> Erreurs, échecs d'opération,
            validation échouée
          </li>
          <li>
            <strong>Warning (Jaune):</strong> Avertissements, maintenance,
            actions nécessitant attention
          </li>
          <li>
            <strong>Info (Bleu):</strong> Informations générales, nouvelles
            fonctionnalités
          </li>
          <li>
            <strong>Success (Vert):</strong> Confirmation d'action, opération
            réussie
          </li>
        </ul>
      </div>
    </div>
  );
}

// ─── EXEMPLE 2: MESSAGE D'ERREUR ─────────────────────────────────────────────

export function ErrorMessage() {
  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">Messages d'Erreur</h2>

      <div className="space-y-4">
        <ErrorBanner
          variant="error"
          message="Impossible de se connecter au serveur. Veuillez réessayer."
        />

        <ErrorBanner
          variant="error"
          title="Erreur de validation"
          message="Veuillez corriger les erreurs ci-dessous avant de continuer."
        />

        <ErrorBanner
          variant="error"
          title="Échec de la connexion"
          message="Email ou mot de passe incorrect. Veuillez vérifier vos informations."
        />

        <ErrorBanner
          variant="error"
          title="Action refusée"
          message="Vous n'avez pas les permissions nécessaires pour effectuer cette action."
        />
      </div>
    </div>
  );
}

// ─── EXEMPLE 3: AVERTISSEMENTS ───────────────────────────────────────────────

export function WarningMessage() {
  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">Avertissements</h2>

      <div className="space-y-4">
        <ErrorBanner
          variant="warning"
          title="Maintenance programmée"
          message="Une maintenance est prévue le 15 janvier de 2h à 4h. Certaines fonctionnalités seront indisponibles."
        />

        <ErrorBanner
          variant="warning"
          title="Stock bas"
          message="Il ne reste que 3 unités en stock. Pensez à réapprovisionner."
        />

        <ErrorBanner
          variant="warning"
          message="Votre abonnement expire dans 7 jours. Renouvelez-le pour continuer à profiter de tous les services."
        />

        <ErrorBanner
          variant="warning"
          title="Action irréversible"
          message="Cette action ne peut pas être annulée. Assurez-vous de vouloir continuer."
        />
      </div>
    </div>
  );
}

// ─── EXEMPLE 4: INFORMATIONS ─────────────────────────────────────────────────

export function InfoMessage() {
  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">
        Messages d'Information
      </h2>

      <div className="space-y-4">
        <ErrorBanner
          variant="info"
          title="Nouvelle fonctionnalité"
          message="Vous pouvez maintenant exporter vos données en PDF. Consultez la documentation pour plus d'informations."
        />

        <ErrorBanner
          variant="info"
          message="Votre rapport mensuel est prêt à être consulté dans l'onglet Statistiques."
        />

        <ErrorBanner
          variant="info"
          title="Mise à jour disponible"
          message="Une nouvelle version de l'application est disponible. Rechargez la page pour bénéficier des dernières améliorations."
        />

        <ErrorBanner
          variant="info"
          message="Astuce : Utilisez les raccourcis clavier pour naviguer plus rapidement. Appuyez sur '?' pour voir la liste."
        />
      </div>
    </div>
  );
}

// ─── EXEMPLE 5: SUCCÈS ───────────────────────────────────────────────────────

export function SuccessMessage() {
  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">Messages de Succès</h2>

      <div className="space-y-4">
        <ErrorBanner
          variant="success"
          title="Opération réussie"
          message="Vos modifications ont été enregistrées avec succès."
        />

        <ErrorBanner
          variant="success"
          message="Membre ajouté avec succès à votre club."
        />

        <ErrorBanner
          variant="success"
          title="Paiement confirmé"
          message="Votre paiement de 49,99 € a été traité avec succès. Un reçu vous a été envoyé par email."
        />

        <ErrorBanner
          variant="success"
          message="L'export de vos données a été généré. Consultez votre dossier de téléchargements."
        />
      </div>
    </div>
  );
}

// ─── EXEMPLE 6: AVEC TITRE ───────────────────────────────────────────────────

export function WithTitle() {
  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">Messages avec Titre</h2>
      <p className="text-sm text-gray-600">
        Le titre est optionnel mais recommandé pour les messages longs ou
        structurés.
      </p>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Sans titre - Message simple
          </h3>
          <ErrorBanner
            variant="error"
            message="Email ou mot de passe incorrect."
          />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Avec titre - Message structuré
          </h3>
          <ErrorBanner
            variant="error"
            title="Échec de la connexion"
            message="Votre session a expiré. Veuillez vous reconnecter pour continuer."
          />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Avec titre - Contexte important
          </h3>
          <ErrorBanner
            variant="warning"
            title="Données non sauvegardées"
            message="Vous avez des modifications non enregistrées. Si vous quittez cette page, vous perdrez vos changements."
          />
        </div>
      </div>
    </div>
  );
}

// ─── EXEMPLE 7: BANNIÈRES DISMISSIBLES ───────────────────────────────────────

export function DismissibleBanner() {
  const [showError, setShowError] = useState(true);
  const [showWarning, setShowWarning] = useState(true);
  const [showInfo, setShowInfo] = useState(true);
  const [showSuccess, setShowSuccess] = useState(true);

  const resetAll = () => {
    setShowError(true);
    setShowWarning(true);
    setShowInfo(true);
    setShowSuccess(true);
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Bannières Dismissibles
        </h2>
        <button
          onClick={resetAll}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Réafficher tout
        </button>
      </div>

      <p className="text-sm text-gray-600">
        Cliquez sur le bouton ✕ pour fermer chaque bannière.
      </p>

      <div className="space-y-4">
        {showError && (
          <ErrorBanner
            variant="error"
            title="Erreur de connexion"
            message="Impossible de se connecter au serveur."
            dismissible
            onDismiss={() => setShowError(false)}
          />
        )}

        {showWarning && (
          <ErrorBanner
            variant="warning"
            title="Session expirée"
            message="Votre session expire dans 5 minutes."
            dismissible
            onDismiss={() => setShowWarning(false)}
          />
        )}

        {showInfo && (
          <ErrorBanner
            variant="info"
            message="Nouvelle fonctionnalité disponible ! Découvrez l'export PDF."
            dismissible
            onDismiss={() => setShowInfo(false)}
          />
        )}

        {showSuccess && (
          <ErrorBanner
            variant="success"
            title="Opération réussie"
            message="Vos modifications ont été enregistrées."
            dismissible
            onDismiss={() => setShowSuccess(false)}
          />
        )}
      </div>

      {!showError && !showWarning && !showInfo && !showSuccess && (
        <div className="text-center py-8 text-gray-500">
          Toutes les bannières ont été fermées. Cliquez sur "Réafficher tout"
          pour les voir à nouveau.
        </div>
      )}
    </div>
  );
}

// ─── EXEMPLE 8: ICÔNES PERSONNALISÉES ────────────────────────────────────────

export function CustomIcon() {
  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">
        Icônes Personnalisées
      </h2>
      <p className="text-sm text-gray-600">
        Vous pouvez remplacer l'icône par défaut avec n'importe quel ReactNode.
      </p>

      <div className="space-y-4">
        <ErrorBanner
          variant="warning"
          title="Action sensible"
          message="Cette action nécessite des privilèges administrateur."
          icon={<ShieldExclamationIcon />}
        />

        <ErrorBanner
          variant="error"
          title="Paiement refusé"
          message="Votre carte de crédit a été refusée. Veuillez vérifier vos informations."
          icon={<CreditCardIcon />}
        />

        <ErrorBanner
          variant="warning"
          title="Délai dépassé"
          message="La limite de temps pour compléter cette action a été dépassée."
          icon={<ClockIcon />}
        />

        <ErrorBanner
          variant="info"
          title="Nouvelle fonctionnalité"
          message="Découvrez notre nouveau système de récompenses et gagnez des points !"
          icon={<SparklesIcon />}
        />
      </div>
    </div>
  );
}

// ─── EXEMPLE 9: VALIDATION DE FORMULAIRE ─────────────────────────────────────

export function FormValidationExample() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    // Validation simple
    if (!email || !password) {
      setFormError("Veuillez remplir tous les champs du formulaire.");
      return;
    }

    if (!email.includes("@")) {
      setFormError("L'adresse email n'est pas valide.");
      return;
    }

    if (password.length < 8) {
      setFormError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    // Simule une connexion réussie
    setFormSuccess("Connexion réussie ! Redirection en cours...");
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">
        Validation de Formulaire
      </h2>
      <p className="text-sm text-gray-600">
        Exemple d'utilisation avec un formulaire de connexion.
      </p>

      <div className="max-w-md bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Connexion</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Bannière d'erreur */}
          {formError && (
            <ErrorBanner
              variant="error"
              title="Erreur de validation"
              message={formError}
              dismissible
              onDismiss={() => setFormError(null)}
            />
          )}

          {/* Bannière de succès */}
          {formSuccess && (
            <ErrorBanner variant="success" message={formSuccess} />
          )}

          {/* Champ Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="vous@exemple.com"
            />
          </div>

          {/* Champ Mot de passe */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>

          {/* Bouton de soumission */}
          <button
            type="submit"
            className="w-full px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Se connecter
          </button>
        </form>

        {/* Instructions */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-xs text-blue-700">
            <strong>Pour tester :</strong> Essayez de soumettre sans remplir les
            champs, avec un email invalide, ou avec un mot de passe trop court
            (&lt; 8 caractères).
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── EXEMPLE 10: ALERTES MULTIPLES ───────────────────────────────────────────

export function MultipleAlerts() {
  type Alert = {
    id: number;
    variant: "error" | "warning" | "info" | "success";
    message: string;
  };

  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: 1,
      variant: "warning",
      message: "Votre session expire dans 10 minutes.",
    },
    { id: 2, variant: "info", message: "Nouvelle mise à jour disponible." },
    { id: 3, variant: "success", message: "Export terminé avec succès." },
  ]);

  const removeAlert = (id: number) => {
    setAlerts(alerts.filter((alert) => alert.id !== id));
  };

  const addAlert = () => {
    const variants = ["error", "warning", "info", "success"] as const;
    const messages = [
      "Une erreur s'est produite.",
      "Attention, stock bas.",
      "Information importante.",
      "Opération réussie.",
    ];
    const randomVariant =
      variants[Math.floor(Math.random() * variants.length)]!;
    const randomMessage =
      messages[Math.floor(Math.random() * messages.length)]!;

    const newAlert: Alert = {
      id: Date.now(),
      variant: randomVariant,
      message: randomMessage,
    };

    setAlerts([...alerts, newAlert]);
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Alertes Multiples</h2>
        <button
          onClick={addAlert}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Ajouter une alerte
        </button>
      </div>

      <p className="text-sm text-gray-600">
        Gestion de plusieurs alertes avec suppression individuelle.
      </p>

      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Aucune alerte. Cliquez sur "Ajouter une alerte" pour en créer.
          </div>
        ) : (
          alerts.map((alert) => (
            <ErrorBanner
              key={alert.id}
              variant={alert.variant}
              message={alert.message}
              dismissible
              onDismiss={() => removeAlert(alert.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ─── COMPOSANT PRINCIPAL: TOUS LES EXEMPLES ──────────────────────────────────

export function ErrorBannerExamples() {
  return (
    <div className="space-y-12 pb-12">
      <div className="bg-white border-b border-gray-200 px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ErrorBanner Component - Examples
        </h1>
        <p className="text-gray-600">
          Collection d'exemples pour le composant ErrorBanner, montrant tous les
          variants, configurations et cas d'usage courants.
        </p>
      </div>

      <AllVariants />
      <ErrorMessage />
      <WarningMessage />
      <InfoMessage />
      <SuccessMessage />
      <WithTitle />
      <DismissibleBanner />
      <CustomIcon />
      <FormValidationExample />
      <MultipleAlerts />
    </div>
  );
}

export default ErrorBannerExamples;
