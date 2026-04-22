/**
 * LazyRoute Component
 *
 * Composant wrapper pour faciliter le lazy loading des routes avec:
 * - Suspense automatique
 * - Error boundary intégré
 * - Retry logic
 * - Loading states customisables
 * - Préchargement au hover
 *
 * @example
 * // Basic usage
 * const DashboardPage = lazy(() => import("./features/dashboard/pages/DashboardPage"));
 * <Route path="/dashboard" element={<LazyRoute component={DashboardPage} />} />
 *
 * @example
 * // With custom loading
 * <LazyRoute
 *   component={DashboardPage}
 *   fallback={<CustomLoader />}
 * />
 *
 * @example
 * // With error fallback
 * <LazyRoute
 *   component={DashboardPage}
 *   errorFallback={(error, retry) => (
 *     <ErrorView error={error} onRetry={retry} />
 *   )}
 * />
 */

import {
  Suspense,
  ComponentType,
  ReactElement,
  Component,
  ReactNode,
  lazy,
  LazyExoticComponent,
} from "react";

// ============================================================================
// TYPES
// ============================================================================

interface LazyRouteProps {
  /** Lazy loaded component */
  component: LazyExoticComponent<ComponentType<any>> | ComponentType<any>;
  /** Custom loading fallback */
  fallback?: ReactElement;
  /** Custom error fallback */
  errorFallback?: (error: Error, retry: () => void) => ReactElement;
  /** Props to pass to the lazy component */
  componentProps?: Record<string, any>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// ============================================================================
// DEFAULT COMPONENTS
// ============================================================================

/**
 * Default Loading Fallback
 * Skeleton loader avec animation
 */
const DefaultLoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[400px] w-full">
    <div className="text-center space-y-4">
      {/* Spinner */}
      <div className="relative w-16 h-16 mx-auto">
        <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
        <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
      </div>

      {/* Text */}
      <p className="text-sm text-gray-600 font-medium">
        Chargement...
      </p>

      {/* Progress bar (optional) */}
      <div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden mx-auto">
        <div className="h-full bg-blue-600 rounded-full animate-[progress_1.5s_ease-in-out_infinite]"></div>
      </div>
    </div>

    <style>{`
      @keyframes progress {
        0% { width: 0%; margin-left: 0%; }
        50% { width: 75%; margin-left: 12.5%; }
        100% { width: 0%; margin-left: 100%; }
      }
    `}</style>
  </div>
);

/**
 * Default Error Fallback
 * Affiche l'erreur avec option de retry
 */
const DefaultErrorFallback = ({ error, retry }: { error: Error; retry: () => void }) => (
  <div className="flex items-center justify-center min-h-[400px] w-full p-6">
    <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      {/* Error Icon */}
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg
          className="w-8 h-8 text-red-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-red-900 mb-2">
        Erreur de chargement
      </h3>

      {/* Error Message */}
      <p className="text-sm text-red-700 mb-4">
        {error.message || "Une erreur s'est produite lors du chargement de la page."}
      </p>

      {/* Actions */}
      <div className="flex gap-3 justify-center">
        <button
          onClick={retry}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium text-sm"
        >
          Réessayer
        </button>
        <button
          onClick={() => window.location.href = "/dashboard"}
          className="px-4 py-2 bg-white text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition-colors font-medium text-sm"
        >
          Retour au tableau de bord
        </button>
      </div>

      {/* Details (dev mode) */}
      {import.meta.env.DEV && (
        <details className="mt-4 text-left">
          <summary className="text-xs text-red-600 cursor-pointer hover:text-red-700">
            Détails techniques
          </summary>
          <pre className="mt-2 p-3 bg-red-100 rounded text-xs text-red-900 overflow-auto">
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  </div>
);

// ============================================================================
// ERROR BOUNDARY
// ============================================================================

/**
 * Error Boundary pour capturer les erreurs de chargement lazy
 */
class LazyErrorBoundary extends Component<
  {
    children: ReactNode;
    fallback: (error: Error, retry: () => void) => ReactElement;
  },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log à Sentry ou autre service de monitoring
    if (import.meta.env.PROD) {
      console.error("LazyRoute Error:", error, errorInfo);

      // Si Sentry est configuré
      if (typeof window !== "undefined" && (window as any).Sentry) {
        (window as any).Sentry.captureException(error, {
          contexts: {
            react: {
              componentStack: errorInfo.componentStack,
            },
          },
          tags: {
            errorBoundary: "LazyRoute",
          },
        });
      }
    } else {
      console.error("LazyRoute Error:", error, errorInfo);
    }
  }

  retry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return this.props.fallback(this.state.error, this.retry);
    }

    return this.props.children;
  }
}

// ============================================================================
// LAZY ROUTE COMPONENT
// ============================================================================

/**
 * LazyRoute Component
 * Wrapper pour lazy loading avec error handling et suspense
 */
export const LazyRoute = ({
  component: Component,
  fallback,
  errorFallback,
  componentProps = {},
}: LazyRouteProps) => {
  const LoadingFallback = fallback || <DefaultLoadingFallback />;
  const ErrorFallback = errorFallback || DefaultErrorFallback;

  return (
    <LazyErrorBoundary fallback={ErrorFallback}>
      <Suspense fallback={LoadingFallback}>
        <Component {...componentProps} />
      </Suspense>
    </LazyErrorBoundary>
  );
};

// ============================================================================
// HELPER FUNCTION - RETRY IMPORT
// ============================================================================

/**
 * Helper pour retry l'import en cas d'échec (network issues, etc.)
 *
 * @example
 * const DashboardPage = lazy(() =>
 *   retryImport(() => import("./features/dashboard/pages/DashboardPage"))
 * );
 */
export const retryImport = <T,>(
  importFn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> => {
  return new Promise((resolve, reject) => {
    importFn()
      .then(resolve)
      .catch((error) => {
        if (retries === 0) {
          reject(error);
          return;
        }

        console.warn(
          `Import failed, retrying... (${retries} attempts left)`,
          error
        );

        setTimeout(() => {
          retryImport(importFn, retries - 1, delay)
            .then(resolve)
            .catch(reject);
        }, delay);
      });
  });
};

// ============================================================================
// HELPER FUNCTION - PRELOAD
// ============================================================================

/**
 * Helper pour précharger un composant lazy
 * Utile pour le prefetch au hover
 *
 * @example
 * const DashboardPage = lazy(() => import("./features/dashboard/pages/DashboardPage"));
 *
 * <Link
 *   to="/dashboard"
 *   onMouseEnter={() => preloadComponent(DashboardPage)}
 * >
 *   Dashboard
 * </Link>
 */
export const preloadComponent = (
  Component: LazyExoticComponent<ComponentType<any>>
) => {
  const componentModule = (Component as any)._payload;
  if (componentModule && componentModule._status === -1) {
    // Component not loaded yet, trigger the load
    componentModule._result();
  }
};

// ============================================================================
// LOADING VARIANTS
// ============================================================================

/**
 * Skeleton loader pour pages avec contenu
 */
export const SkeletonLoader = () => (
  <div className="animate-pulse space-y-6 p-6">
    {/* Header skeleton */}
    <div className="h-8 bg-gray-200 rounded w-1/3"></div>

    {/* Content skeleton */}
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 rounded"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      <div className="h-4 bg-gray-200 rounded w-4/6"></div>
    </div>

    {/* Cards skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-32 bg-gray-200 rounded"></div>
      ))}
    </div>
  </div>
);

/**
 * Minimal loader (pour petits composants)
 */
export const MinimalLoader = () => (
  <div className="flex items-center justify-center py-8">
    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

/**
 * Full page loader (pour pages entières)
 */
export const FullPageLoader = () => (
  <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
    <div className="text-center space-y-4">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p className="text-gray-600 font-medium">Chargement...</p>
    </div>
  </div>
);

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default LazyRoute;
