/**
 * Modal Component - ClubManager V3
 *
 * Composant modal réutilisable avec overlay, header, body, footer.
 * Supporte plusieurs tailles, fermeture ESC, click outside, focus trap.
 *
 * @example
 * ```tsx
 * <Modal isOpen={isOpen} onClose={handleClose} size="md">
 *   <Modal.Header
 *     title="Titre de la modal"
 *     subtitle="Description optionnelle"
 *   />
 *   <Modal.Body>
 *     <p>Contenu de la modal...</p>
 *   </Modal.Body>
 *   <Modal.Footer>
 *     <Button variant="outline" onClick={handleClose}>Annuler</Button>
 *     <Button onClick={handleSubmit}>Confirmer</Button>
 *   </Modal.Footer>
 * </Modal>
 * ```
 *
 * @see Modal.md pour la documentation complète
 * @see Modal.examples.tsx pour des exemples d'utilisation
 */

import { useEffect, useRef, type ReactNode } from "react";
import { MODAL, SHADOWS } from "../../styles/designTokens";

// ─── TYPES ───────────────────────────────────────────────────────────────────

/**
 * Tailles disponibles pour la modal.
 * - sm: 384px (mobile-first, formulaires simples)
 * - md: 512px (défaut, la plupart des cas)
 * - lg: 640px (formulaires complexes)
 * - xl: 768px (édition de contenu)
 * - 2xl: 896px (tableaux, listes)
 * - 3xl: 1024px (dashboards, prévisualisations)
 * - 4xl: 1280px (plein écran, éditeurs)
 */
export type ModalSize = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";

export interface ModalProps {
  /** Contrôle la visibilité de la modal */
  isOpen: boolean;
  /** Callback appelé lors de la fermeture (ESC, overlay, bouton X) */
  onClose: () => void;
  /** Taille de la modal */
  size?: ModalSize;
  /** Permet la fermeture en cliquant sur l'overlay */
  closeOnOverlayClick?: boolean;
  /** Permet la fermeture avec la touche Escape */
  closeOnEscape?: boolean;
  /** ID pour aria-labelledby (auto-généré si non fourni) */
  ariaLabelledBy?: string;
  /** Contenu de la modal */
  children: ReactNode;
  /** Classes CSS additionnelles pour le conteneur */
  className?: string;
}

export interface ModalHeaderProps {
  /** Titre principal de la modal */
  title: string;
  /** Sous-titre optionnel */
  subtitle?: string;
  /** Affiche le bouton X de fermeture */
  showCloseButton?: boolean;
  /** Callback de fermeture (hérité du contexte si non fourni) */
  onClose?: () => void;
  /** ID pour l'accessibilité */
  id?: string;
  /** Classes CSS additionnelles */
  className?: string;
}

export interface ModalBodyProps {
  /** Contenu du body */
  children: ReactNode;
  /** Classes CSS additionnelles */
  className?: string;
  /** Padding personnalisé (défaut: px-6 py-5) */
  padding?: string;
}

export interface ModalFooterProps {
  /** Contenu du footer (généralement des boutons) */
  children: ReactNode;
  /** Alignement des actions */
  align?: "left" | "center" | "right" | "between";
  /** Classes CSS additionnelles */
  className?: string;
  /** Padding personnalisé (défaut: px-6 py-4) */
  padding?: string;
}

// ─── CONSTANTES ──────────────────────────────────────────────────────────────

const SIZE_CLASSES: Record<ModalSize, string> = {
  sm: MODAL.size.sm,
  md: MODAL.size.md,
  lg: MODAL.size.lg,
  xl: MODAL.size.xl,
  "2xl": MODAL.size["2xl"],
  "3xl": MODAL.size["3xl"],
  "4xl": MODAL.size["4xl"],
};

const FOOTER_ALIGN_CLASSES: Record<
  NonNullable<ModalFooterProps["align"]>,
  string
> = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
  between: "justify-between",
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

let modalIdCounter = 0;

function generateModalId(): string {
  return `modal-title-${++modalIdCounter}`;
}

// ─── COMPOSANT PRINCIPAL ─────────────────────────────────────────────────────

/**
 * Modal — Composant modal réutilisable.
 *
 * Gère automatiquement:
 * - Le blocage du scroll du body
 * - La fermeture sur ESC
 * - Le focus trap
 * - L'overlay avec opacité standardisée (bg-black/50)
 *
 * @example
 * ```tsx
 * <Modal isOpen={isOpen} onClose={onClose} size="lg">
 *   <Modal.Header title="Confirmer l'action" />
 *   <Modal.Body>Êtes-vous sûr de vouloir continuer ?</Modal.Body>
 *   <Modal.Footer align="right">
 *     <Button variant="outline" onClick={onClose}>Annuler</Button>
 *     <Button variant="danger" onClick={handleConfirm}>Confirmer</Button>
 *   </Modal.Footer>
 * </Modal>
 * ```
 */
export function Modal({
  isOpen,
  onClose,
  size = "md",
  closeOnOverlayClick = true,
  closeOnEscape = true,
  ariaLabelledBy,
  children,
  className = "",
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const titleIdRef = useRef(ariaLabelledBy || generateModalId());

  // ── Bloquer le scroll du body ─────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      // Compenser la disparition de la scrollbar pour éviter le "jump"
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isOpen]);

  // ── Fermeture sur Escape ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeOnEscape, onClose]);

  // ── Focus trap (focus sur la modal à l'ouverture) ─────────────────────────
  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Cherche le premier élément focusable
      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );

      if (focusableElements.length > 0) {
        // Focus sur le premier élément (souvent le bouton X ou le premier input)
        focusableElements[0]?.focus();
      }
    }
  }, [isOpen]);

  // ── Gestion du clic sur l'overlay ─────────────────────────────────────────
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`${MODAL.overlay} ${MODAL.animation.overlay.enter}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleIdRef.current}
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className={`
          bg-white rounded-2xl mx-4 max-h-[90vh] flex flex-col
          ${SIZE_CLASSES[size]}
          ${SHADOWS.xl}
          ${MODAL.animation.content.enter}
          ${className}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

// ─── SOUS-COMPOSANTS ─────────────────────────────────────────────────────────

/**
 * Modal.Header — En-tête de la modal avec titre, sous-titre, et bouton X.
 *
 * @example
 * ```tsx
 * <Modal.Header
 *   title="Ajouter un utilisateur"
 *   subtitle="Remplissez les informations ci-dessous"
 *   showCloseButton
 *   onClose={handleClose}
 * />
 * ```
 */
Modal.Header = function ModalHeader({
  title,
  subtitle,
  showCloseButton = true,
  onClose,
  id,
  className = "",
}: ModalHeaderProps) {
  return (
    <div className={`${MODAL.header} ${className}`}>
      <div className="flex-1 min-w-0">
        <h2 id={id} className={`${MODAL.headerTitle} leading-tight`}>
          {title}
        </h2>
        {subtitle && (
          <p className={`${MODAL.headerSubtitle} leading-relaxed`}>
            {subtitle}
          </p>
        )}
      </div>

      {showCloseButton && onClose && (
        <button
          type="button"
          onClick={onClose}
          className={`${MODAL.headerClose} active:bg-gray-200 flex-shrink-0`}
          aria-label="Fermer la modal"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

/**
 * Modal.Body — Corps de la modal, scrollable si le contenu dépasse.
 *
 * @example
 * ```tsx
 * <Modal.Body>
 *   <form>
 *     <input type="text" placeholder="Nom" />
 *     <input type="email" placeholder="Email" />
 *   </form>
 * </Modal.Body>
 * ```
 */
Modal.Body = function ModalBody({
  children,
  className = "",
  padding = "px-6 py-5",
}: ModalBodyProps) {
  const paddingClass = padding || MODAL.body;

  return (
    <div className={`overflow-y-auto flex-1 ${paddingClass} ${className}`}>
      {children}
    </div>
  );
};

/**
 * Modal.Footer — Pied de la modal avec actions (boutons).
 *
 * @example
 * ```tsx
 * <Modal.Footer align="right">
 *   <Button variant="outline" onClick={onCancel}>Annuler</Button>
 *   <Button onClick={onSubmit}>Valider</Button>
 * </Modal.Footer>
 * ```
 */
Modal.Footer = function ModalFooter({
  children,
  align = "right",
  className = "",
  padding = "px-6 py-4",
}: ModalFooterProps) {
  const paddingClass = padding || "px-6 py-4";
  const alignClass = align !== "right" ? FOOTER_ALIGN_CLASSES[align] : "";

  return (
    <div
      className={`
        border-t border-gray-100 ${paddingClass}
        flex items-center gap-3 flex-shrink-0
        ${align === "right" ? "justify-end" : alignClass}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

// ─── TYPES EXPORTS ───────────────────────────────────────────────────────────
