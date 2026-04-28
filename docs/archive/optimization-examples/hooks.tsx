/**
 * Performance Optimization Hooks
 * Collection de hooks réutilisables pour optimiser les performances
 */

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { QueryKey } from "@tanstack/react-query";

// ============================================================================
// DEBOUNCE HOOK
// ============================================================================

/**
 * Hook pour debounce une valeur
 * Utile pour les inputs de recherche, filtres, etc.
 *
 * @example
 * const [searchTerm, setSearchTerm] = useState("");
 * const debouncedSearch = useDebounce(searchTerm, 500);
 *
 * useQuery({
 *   queryKey: ["search", debouncedSearch],
 *   queryFn: () => api.search(debouncedSearch),
 *   enabled: debouncedSearch.length >= 3,
 * });
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ============================================================================
// THROTTLE HOOK
// ============================================================================

/**
 * Hook pour throttle une fonction
 * Utile pour les événements scroll, resize, mousemove, etc.
 *
 * @example
 * const handleScroll = useThrottle(() => {
 *   console.log("Scroll position:", window.scrollY);
 * }, 100);
 *
 * useEffect(() => {
 *   window.addEventListener("scroll", handleScroll);
 *   return () => window.removeEventListener("scroll", handleScroll);
 * }, [handleScroll]);
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastRan = useRef<number>(Date.now());

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();

      if (now - lastRan.current >= delay) {
        callback(...args);
        lastRan.current = now;
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          callback(...args);
          lastRan.current = Date.now();
        }, delay - (now - lastRan.current));
      }
    },
    [callback, delay]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttledCallback;
}

// ============================================================================
// PREFETCH HOOK
// ============================================================================

/**
 * Hook pour prefetch des données React Query
 * Utile pour améliorer la navigation et l'UX
 *
 * @example
 * const { prefetchQuery } = usePrefetch();
 *
 * <button
 *   onMouseEnter={() => prefetchQuery(["user", userId], () => api.getUser(userId))}
 *   onClick={() => navigate(`/users/${userId}`)}
 * >
 *   View User
 * </button>
 */
export function usePrefetch() {
  const queryClient = useQueryClient();

  const prefetchQuery = useCallback(
    async (queryKey: QueryKey, queryFn: () => Promise<any>, staleTime = 10000) => {
      await queryClient.prefetchQuery({
        queryKey,
        queryFn,
        staleTime,
      });
    },
    [queryClient]
  );

  const prefetchQueries = useCallback(
    async (queries: Array<{ queryKey: QueryKey; queryFn: () => Promise<any> }>) => {
      await Promise.all(
        queries.map((query) =>
          queryClient.prefetchQuery({
            queryKey: query.queryKey,
            queryFn: query.queryFn,
            staleTime: 10000,
          })
        )
      );
    },
    [queryClient]
  );

  return { prefetchQuery, prefetchQueries };
}

// ============================================================================
// INTERSECTION OBSERVER HOOK
// ============================================================================

/**
 * Hook pour détecter quand un élément est visible (Intersection Observer)
 * Utile pour lazy loading, infinite scroll, animations au scroll, etc.
 *
 * @example
 * const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.5 });
 *
 * return (
 *   <div ref={ref}>
 *     {isIntersecting && <ExpensiveComponent />}
 *   </div>
 * );
 */
interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
) {
  const { threshold = 0, root = null, rootMargin = "0px", freezeOnceVisible = false } = options;

  const [entry, setEntry] = useState<IntersectionObserverEntry>();
  const [node, setNode] = useState<Element | null>(null);
  const frozen = useRef(false);

  useEffect(() => {
    if (!node || (frozen.current && freezeOnceVisible)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setEntry(entry);

        if (entry.isIntersecting && freezeOnceVisible) {
          frozen.current = true;
        }
      },
      { threshold, root, rootMargin }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [node, threshold, root, rootMargin, freezeOnceVisible]);

  return {
    ref: setNode,
    isIntersecting: !!entry?.isIntersecting,
    entry,
  };
}

// ============================================================================
// MEDIA QUERY HOOK
// ============================================================================

/**
 * Hook pour écouter les media queries
 * Utile pour le responsive design et optimiser le rendering mobile
 *
 * @example
 * const isMobile = useMediaQuery("(max-width: 768px)");
 *
 * return isMobile ? <MobileView /> : <DesktopView />;
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Initial check
    setMatches(mediaQuery.matches);

    // Listen for changes
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [query]);

  return matches;
}

// ============================================================================
// WINDOW SIZE HOOK
// ============================================================================

/**
 * Hook pour obtenir la taille de la fenêtre
 * Utilise throttle pour optimiser les performances
 *
 * @example
 * const { width, height } = useWindowSize();
 *
 * if (width < 768) {
 *   return <MobileLayout />;
 * }
 */
export function useWindowSize(throttleMs: number = 200) {
  const [size, setSize] = useState(() => ({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  }));

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, throttleMs);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, [throttleMs]);

  return size;
}

// ============================================================================
// IDLE CALLBACK HOOK
// ============================================================================

/**
 * Hook pour exécuter du code pendant les périodes d'inactivité du navigateur
 * Utile pour les tâches non-critiques (analytics, prefetch, cleanup, etc.)
 *
 * @example
 * useIdleCallback(() => {
 *   // Code à exécuter pendant l'idle
 *   console.log("Running during idle time");
 *   prefetchNextPage();
 * }, []);
 */
export function useIdleCallback(
  callback: () => void,
  deps: React.DependencyList = [],
  options: IdleRequestOptions = {}
) {
  useEffect(() => {
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(callback, options);
      return () => window.cancelIdleCallback(id);
    } else {
      // Fallback pour Safari
      const timeout = setTimeout(callback, 1);
      return () => clearTimeout(timeout);
    }
  }, deps);
}

// ============================================================================
// PERFORMANCE MEASURE HOOK
// ============================================================================

/**
 * Hook pour mesurer les performances d'une opération
 * Utilise l'API Performance pour des mesures précises
 *
 * @example
 * const measure = usePerformanceMeasure("data-loading");
 *
 * useEffect(() => {
 *   measure.start();
 *   fetchData().then(() => {
 *     measure.end();
 *   });
 * }, []);
 */
export function usePerformanceMeasure(name: string) {
  const startMark = `${name}-start`;
  const endMark = `${name}-end`;

  const start = useCallback(() => {
    try {
      performance.mark(startMark);
    } catch (e) {
      console.warn("Performance API not available:", e);
    }
  }, [startMark]);

  const end = useCallback(() => {
    try {
      performance.mark(endMark);
      performance.measure(name, startMark, endMark);

      const measure = performance.getEntriesByName(name, "measure")[0];

      if (measure) {
        console.log(`[Performance] ${name}: ${measure.duration.toFixed(2)}ms`);

        // Envoyer à analytics si configuré
        if (typeof window !== "undefined" && (window as any).gtag) {
          (window as any).gtag("event", "timing_complete", {
            name: name,
            value: Math.round(measure.duration),
            event_category: "Performance",
          });
        }
      }

      // Cleanup
      performance.clearMarks(startMark);
      performance.clearMarks(endMark);
      performance.clearMeasures(name);
    } catch (e) {
      console.warn("Performance measure failed:", e);
    }
  }, [name, startMark, endMark]);

  return { start, end };
}

// ============================================================================
// ASYNC STATE HOOK
// ============================================================================

/**
 * Hook pour gérer l'état asynchrone avec loading/error
 * Alternative légère à React Query pour des cas simples
 *
 * @example
 * const { data, loading, error, execute } = useAsync(
 *   () => api.fetchData(),
 *   { immediate: true }
 * );
 */
interface UseAsyncOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  options: UseAsyncOptions = {}
) {
  const { immediate = false, onSuccess, onError } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await asyncFunction();
      setData(result);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [asyncFunction, onSuccess, onError]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate]);

  return { data, loading, error, execute };
}

// ============================================================================
// PREVIOUS VALUE HOOK
// ============================================================================

/**
 * Hook pour garder la valeur précédente d'une variable
 * Utile pour comparer les changements et éviter les re-renders
 *
 * @example
 * const [count, setCount] = useState(0);
 * const previousCount = usePrevious(count);
 *
 * console.log(`Count changed from ${previousCount} to ${count}`);
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

// ============================================================================
// OPTIMIZED CALLBACK HOOK
// ============================================================================

/**
 * Hook pour créer un callback optimisé avec dépendances
 * Évite les re-créations inutiles tout en gardant les dernières valeurs
 *
 * @example
 * const handleClick = useOptimizedCallback(() => {
 *   console.log("Current count:", count);
 * }, [count]);
 */
export function useOptimizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  return useCallback(
    ((...args) => callbackRef.current(...args)) as T,
    deps
  );
}

// ============================================================================
// MOUNT STATE HOOK
// ============================================================================

/**
 * Hook pour savoir si le composant est monté
 * Évite les setState sur composants démontés
 *
 * @example
 * const isMounted = useMountedState();
 *
 * const fetchData = async () => {
 *   const data = await api.fetch();
 *   if (isMounted()) {
 *     setData(data);
 *   }
 * };
 */
export function useMountedState(): () => boolean {
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return useCallback(() => mountedRef.current, []);
}

// ============================================================================
// TYPES
// ============================================================================

declare global {
  interface Window {
    requestIdleCallback: (
      callback: () => void,
      options?: IdleRequestOptions
    ) => number;
    cancelIdleCallback: (id: number) => void;
  }
}
