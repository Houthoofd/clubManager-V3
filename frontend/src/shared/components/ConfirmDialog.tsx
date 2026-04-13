/**
 * ConfirmDialog Component - ClubManager V3
 *
 * Composant de dialogue de confirmation réutilisable.
 * Remplace window.confirm() avec une meilleure UX et accessibilité.
 *
 * @example
 * ```tsx
 * <ConfirmDialog
 *   isOpen={showConfirm}
 *   onClose={() => setShowConfirm(false)}
 *   onConfirm={handleDelete}
 *   title="Supprimer le membre"
 *   message="Êtes-vous sûr de vouloir supprimer ce membre ? Cette action est irréversible."
 *   variant="danger"
 *   isLoading={isDeleting}
 * />
 * ```
 *
 * @see ConfirmDialog.md pour la documentation complète
 * @see ConfirmDialog.examples.tsx pour des exemples d'utilisation
 */

import { Modal } from "./Modal";
import { Button } from "./Button";
import {
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  InfoCircleIcon,
} from "@patternfly/react-icons";

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface ConfirmDialogProps {
  /** Dialog ouvert */
  isOpen: boolean;
  /** Callback fermeture */
  onClose: () => void;
  /** Callback confirmation */
  onConfirm: () => void | Promise<void>;
  /** Titre du dialog */
  title: string;
  /** Message de confirmation */
  message: string;
  /** Type d'action (affecte le style du bouton et l'icône) */
  variant?: "danger" | "warning" | "info";
  /** Label bouton confirmer */
  confirmLabel?: string;
  /** Label bouton annuler */
  cancelLabel?: string;
  /** Loading pendant l'action */
  isLoading?: boolean;
}

// ─── CONFIGURATION DES VARIANTS ──────────────────────────────────────────────

interface VariantConfig {
  icon: typeof ExclamationTriangleIcon;
  iconWrapperClasses: string;
  buttonVariant: "danger" | "primary";
  defaultConfirmLabel: string;
}

const VARIANT_CONFIG: Record<
  NonNullable<ConfirmDialogProps["variant"]>,
  VariantConfig
> = {
  danger: {
    icon: ExclamationTriangleIcon,
    iconWrapperClasses:
      "flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center",
    buttonVariant: "danger",
    defaultConfirmLabel: "Supprimer",
  },
  warning: {
    icon: ExclamationCircleIcon,
    iconWrapperClasses:
      "flex-shrink-0 w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center",
    buttonVariant: "primary",
    defaultConfirmLabel: "Confirmer",
  },
  info: {
    icon: InfoCircleIcon,
    iconWrapperClasses:
      "flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center",
    buttonVariant: "primary",
    defaultConfirmLabel: "Confirmer",
  },
};

// ─── COMPOSANT ───────────────────────────────────────────────────────────────

/**
 * ConfirmDialog — Dialogue de confirmation accessible et stylisé.
 *
 * Utilise le composant Modal avec une API simplifiée.
 * Gère automatiquement les actions asynchrones et le loading.
 *
 * @example
 * ```tsx
 * const [showConfirm, setShowConfirm] = useState(false);
 * const [isDeleting, setIsDeleting] = useState(false);
 *
 * const handleDelete = async () => {
 *   setIsDeleting(true);
 *   try {
 *     await deleteMember(memberId);
 *     toast.success('Membre supprimé');
 *   } catch (error) {
 *     toast.error('Erreur lors de la suppression');
 *   } finally {
 *     setIsDeleting(false);
 *   }
 * };
 *
 * return (
 *   <>
 *     <Button onClick={() => setShowConfirm(true)} variant="danger">
 *       Supprimer
 *     </Button>
 *     <ConfirmDialog
 *       isOpen={showConfirm}
 *       onClose={() => setShowConfirm(false)}
 *       onConfirm={handleDelete}
 *       title="Supprimer le membre"
 *       message="Cette action est irréversible."
 *       variant="danger"
 *       isLoading={isDeleting}
 *     />
 *   </>
 * );
 * ```
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  variant = "danger",
  confirmLabel,
  cancelLabel = "Annuler",
  isLoading = false,
}: ConfirmDialogProps) {
  // Récupération de la configuration du variant
  const config = VARIANT_CONFIG[variant];
  const IconComponent = config.icon;

  // Gestion de la confirmation avec support async
  const handleConfirm = async () => {
    try {
      await onConfirm();
      // Fermer la modal après confirmation réussie
      // (sauf si l'erreur est gérée par le parent)
      onClose();
    } catch (error) {
      // L'erreur est gérée par le parent (toast, etc.)
      // On ne ferme pas la modal en cas d'erreur
      console.error("Erreur lors de la confirmation:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      {/* Header avec icône et titre */}
      <div className="px-6 pt-6 pb-4 border-b border-gray-100">
        <div className="flex items-start gap-3">
          {/* Icône selon le variant */}
          <div className={config.iconWrapperClasses}>
            <IconComponent
              className={`h-6 w-6 ${
                variant === "danger"
                  ? "text-red-600"
                  : variant === "warning"
                    ? "text-yellow-600"
                    : "text-blue-600"
              }`}
              aria-hidden="true"
            />
          </div>

          {/* Titre */}
          <h3 className="text-lg font-semibold text-gray-900 leading-tight pt-1">
            {title}
          </h3>
        </div>
      </div>

      {/* Body avec message */}
      <div className="px-6 py-5">
        <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
      </div>

      {/* Footer avec boutons */}
      <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-3 justify-end">
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          {cancelLabel}
        </Button>

        <Button
          variant={config.buttonVariant}
          onClick={handleConfirm}
          loading={isLoading}
        >
          {confirmLabel || config.defaultConfirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
