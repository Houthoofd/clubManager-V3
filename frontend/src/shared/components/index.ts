/**
 * Shared Components - Barrel Export Global
 *
 * Point d'entrée centralisé pour tous les composants partagés.
 * Les composants sont organisés par famille dans des dossiers dédiés.
 *
 * @example
 * // Import depuis le barrel global
 * import { Button, Card, Modal } from '@/shared/components';
 *
 * @example
 * // Import depuis une famille spécifique
 * import { Button, SubmitButton } from '@/shared/components/Button';
 */

// ─── BUTTON FAMILY ───────────────────────────────────────────────────────────

export * from './Button';

// ─── INPUT FAMILY ────────────────────────────────────────────────────────────

export * from './Input';

// ─── CARD FAMILY ─────────────────────────────────────────────────────────────

export * from './Card';

// ─── BADGE FAMILY ────────────────────────────────────────────────────────────

export * from './Badge';

// ─── MODAL FAMILY ────────────────────────────────────────────────────────────

export * from './Modal';

// ─── LAYOUT COMPONENTS ───────────────────────────────────────────────────────

export * from './Layout';

// ─── NAVIGATION COMPONENTS ───────────────────────────────────────────────────

export * from './Navigation';

// ─── FORMS COMPONENTS ────────────────────────────────────────────────────────

export * from './Forms';

// ─── FEEDBACK COMPONENTS ─────────────────────────────────────────────────────

export * from './Feedback';

// ─── AUTH COMPONENTS ─────────────────────────────────────────────────────────

export * from './Auth';
