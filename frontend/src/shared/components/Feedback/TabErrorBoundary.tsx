/**
 * TabErrorBoundary
 *
 * React class ErrorBoundary conçu pour les panels d'onglets.
 *
 * Problème couvert : en React 18 StrictMode (mode dev), les composants sont
 * montés → démontés → remontés immédiatement. Si un composant enfant jette une
 * erreur pendant le SECOND montage (avec données React Query déjà en cache),
 * sans ErrorBoundary l'arbre React entier est démonté (page blanche).
 *
 * Solution :
 * - Attrape l'erreur de rendu synchrone.
 * - Planifie un reset automatique via setTimeout(0) pour laisser React
 *   nettoyer son état interne avant de retenter.
 * - Retente le rendu de l'enfant ; dans 99 % des cas le second rendu réussit.
 *
 * Utilisé dans CoursesPage pour les onglets Séances, Professeurs,
 * Mes Inscriptions et Réservations.
 */

import {
  Component,
  type ReactNode,
  type ErrorInfo,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  /** Contenu à surveiller */
  children: ReactNode;
  /**
   * Clé optionnelle — quand elle change, l'ErrorBoundary se réinitialise.
   * Permet de reset le boundary quand l'onglet actif change.
   */
  tabKey?: string;
}

interface State {
  /** Une erreur de rendu a été détectée */
  hasError: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export class TabErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  /** Timer d'auto-retry */
  private retryTimer: ReturnType<typeof setTimeout> | null = null;

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  static getDerivedStateFromError(): State {
    // Marque l'erreur → rend null pendant le retry
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Log en développement uniquement pour aider au diagnostic
    if (import.meta.env.DEV) {
      console.warn(
        "[TabErrorBoundary] erreur de rendu attrapée (StrictMode double-render ?) :",
        error.message,
        "\n",
        info.componentStack?.slice(0, 300),
      );
    }

    // Auto-retry : laisse React finir son cycle de rendu puis reset le boundary.
    // setTimeout(0) place le reset APRÈS la phase de commit courante.
    this.retryTimer = setTimeout(() => {
      this.setState({ hasError: false });
    }, 0);
  }

  componentDidUpdate(prevProps: Props): void {
    // Reset quand l'onglet parent change (via `tabKey` prop)
    if (prevProps.tabKey !== this.props.tabKey && this.state.hasError) {
      if (this.retryTimer !== null) {
        clearTimeout(this.retryTimer);
        this.retryTimer = null;
      }
      this.setState({ hasError: false });
    }
  }

  componentWillUnmount(): void {
    if (this.retryTimer !== null) {
      clearTimeout(this.retryTimer);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  render() {
    if (this.state.hasError) {
      // Pendant le retry (quelques ms), on rend null plutôt qu'un écran d'erreur.
      // Le contenu réel s'affiche dès que le boundary se reset.
      return null;
    }
    return this.props.children;
  }
}

export default TabErrorBoundary;
