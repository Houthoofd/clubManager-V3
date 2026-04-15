/**
 * Design Tokens - ClubManager V3
 *
 * Constantes centralisées pour garantir la cohérence visuelle
 * de l'application. Tous les composants doivent utiliser ces tokens.
 *
 * @see docs/AUDIT_STYLE.md pour la documentation complète
 */

// ─── COULEURS ────────────────────────────────────────────────────────────────

export const COLORS = {
  // Couleurs primaires
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Couleurs sémantiques
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
  },

  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
  },

  warning: {
    50: '#fefce8',
    100: '#fef9c3',
    600: '#ca8a04',
    700: '#a16207',
    800: '#854d0e',
  },

  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
  },

  // Gris (neutre)
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
} as const;

// ─── ESPACEMENTS ─────────────────────────────────────────────────────────────

export const SPACING = {
  xs: '0.5rem',   // 8px
  sm: '0.75rem',  // 12px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
  '2xl': '3rem',  // 48px
  '3xl': '4rem',  // 64px
} as const;

// ─── BORDER RADIUS ───────────────────────────────────────────────────────────

export const RADIUS = {
  sm: '0.375rem',   // 6px
  md: '0.5rem',     // 8px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  '2xl': '1.5rem',  // 24px
  full: '9999px',   // Cercle
} as const;

// ─── SHADOWS ─────────────────────────────────────────────────────────────────

export const SHADOWS = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  none: 'none',
} as const;

// ─── TRANSITIONS ─────────────────────────────────────────────────────────────

export const TRANSITIONS = {
  fast: '150ms',
  base: '200ms',
  slow: '300ms',
  slower: '500ms',
} as const;

// ─── TYPOGRAPHIE ─────────────────────────────────────────────────────────────

export const TYPOGRAPHY = {
  // Titres
  h1: 'text-2xl font-bold text-gray-900',
  h2: 'text-xl font-semibold text-gray-900',
  h3: 'text-lg font-semibold text-gray-900',
  h4: 'text-base font-semibold text-gray-900',

  // Textes
  body: 'text-sm text-gray-900',
  bodySecondary: 'text-sm text-gray-600',
  small: 'text-xs text-gray-500',
  tiny: 'text-xs text-gray-400',

  // Labels
  label: 'block text-sm font-medium text-gray-700',
  labelRequired: 'block text-sm font-medium text-gray-700 after:content-["*"] after:ml-0.5 after:text-red-500',

  // États
  error: 'text-xs text-red-600',
  success: 'text-xs text-green-600',
  warning: 'text-xs text-amber-600',
} as const;

// ─── COMPOSANTS: CARD ────────────────────────────────────────────────────────

export const CARD = {
  // Base commune à toutes les cartes
  base: 'bg-white rounded-xl shadow-sm border border-gray-100',

  // Variants de padding
  padding: {
    compact: 'p-4',      // Cartes dans des grilles
    standard: 'p-6',     // Cartes de page standard
    emphasis: 'p-8',     // Pages auth/landing
  },

  // Variants de shadow
  shadow: {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
  },

  // Header de carte
  header: 'border-b border-gray-200 pb-4 mb-4',

  // Hover effect (optionnel)
  hover: 'hover:shadow-md transition-shadow duration-200',
} as const;

// ─── COMPOSANTS: BUTTON ──────────────────────────────────────────────────────

export const BUTTON = {
  // Base commune à tous les boutons
  base: 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed',

  // Variants de style
  variant: {
    primary: 'text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 shadow-sm',
    secondary: 'text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-gray-500',
    outline: 'text-blue-600 border border-blue-600 bg-white hover:bg-blue-50 focus:ring-blue-500',
    danger: 'text-white bg-red-600 hover:bg-red-700 focus:ring-red-500 shadow-sm',
    success: 'text-white bg-green-600 hover:bg-green-700 focus:ring-green-500 shadow-sm',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
  },

  // Tailles
  size: {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
    xl: 'px-6 py-3 text-base',
  },

  // Boutons icône uniquement
  icon: {
    xs: 'p-1',
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
    xl: 'p-3',
  },
} as const;

// ─── COMPOSANTS: BADGE ───────────────────────────────────────────────────────

export const BADGE = {
  // Base commune
  base: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1',

  // Variants de couleur
  variant: {
    success: 'bg-green-100 text-green-800 ring-green-200',
    warning: 'bg-yellow-100 text-yellow-800 ring-yellow-200',
    danger: 'bg-red-100 text-red-800 ring-red-200',
    info: 'bg-blue-100 text-blue-800 ring-blue-200',
    neutral: 'bg-gray-100 text-gray-700 ring-gray-200',
    purple: 'bg-purple-100 text-purple-800 ring-purple-200',
    orange: 'bg-orange-100 text-orange-800 ring-orange-200',
  },

  // Tailles
  size: {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  },

  // Dot indicator
  dot: 'mr-1.5 h-1.5 w-1.5 rounded-full',

  // Icon
  icon: 'mr-1 h-3.5 w-3.5',
} as const;

// ─── COMPOSANTS: MODAL ───────────────────────────────────────────────────────

export const MODAL = {
  // Overlay (backdrop)
  overlay: 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4',

  // Container
  container: 'relative bg-white rounded-2xl shadow-xl mx-auto overflow-hidden',

  // Tailles
  size: {
    sm: 'w-full max-w-sm',
    md: 'w-full max-w-md',
    lg: 'w-full max-w-lg',
    xl: 'w-full max-w-xl',
    '2xl': 'w-full max-w-2xl',
    '3xl': 'w-full max-w-3xl',
    '4xl': 'w-full max-w-4xl',
  },

  // Header
  header: 'flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100',
  headerTitle: 'text-xl font-semibold text-gray-900',
  headerSubtitle: 'mt-1 text-sm text-gray-500',
  headerClose: 'p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors',

  // Body
  body: 'px-6 py-5',
  bodyScrollable: 'px-6 py-5 max-h-[60vh] overflow-y-auto',

  // Footer
  footer: 'flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100',
  footerGray: 'flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50',
} as const;

// ─── COMPOSANTS: INPUT ───────────────────────────────────────────────────────

export const INPUT = {
  // Base
  base: 'block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',

  // États
  error: 'border-red-300 focus:ring-red-500 focus:border-red-500',
  success: 'border-green-300 focus:ring-green-500 focus:border-green-500',
  disabled: 'bg-gray-50 text-gray-500 cursor-not-allowed',

  // Tailles
  size: {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-3 py-2.5 text-sm',
    lg: 'px-4 py-3 text-base',
  },

  // Avec icône
  withIconLeft: 'pl-10',
  withIconRight: 'pr-10',

  // Icon container
  iconLeft: 'absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400',
  iconRight: 'absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400',
} as const;

// ─── COMPOSANTS: TABS ────────────────────────────────────────────────────────

export const TABS = {
  // Container
  container: 'border-b border-gray-200',
  list: 'flex space-x-0',

  // Tab item
  tab: 'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
  tabActive: 'border-blue-600 text-blue-600',
  tabInactive: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
} as const;

// ─── COMPOSANTS: PAGINATION ──────────────────────────────────────────────────

export const PAGINATION = {
  // Container
  container: 'flex items-center justify-between',

  // Boutons prev/next
  navButton: 'px-2.5 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed',

  // Numéros de page
  pageButton: 'min-w-[32px] px-2.5 py-1.5 text-sm rounded-md transition-colors',
  pageActive: 'bg-blue-600 text-white font-medium',
  pageInactive: 'text-gray-600 hover:bg-gray-100',

  // Info
  info: 'text-sm text-gray-500',
} as const;

// ─── COMPOSANTS: TABLE ───────────────────────────────────────────────────────

export const TABLE = {
  // Container
  wrapper: 'overflow-x-auto',
  container: 'min-w-full divide-y divide-gray-200',

  // Header
  thead: 'bg-gray-50',
  th: 'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',

  // Body
  tbody: 'bg-white divide-y divide-gray-200',
  tr: 'hover:bg-gray-50 transition-colors',
  td: 'px-4 py-3 text-sm text-gray-900',

  // États
  empty: 'px-4 py-8 text-center text-sm text-gray-500',
} as const;

// ─── COMPOSANTS: ALERT ───────────────────────────────────────────────────────

export const ALERT = {
  // Base
  base: 'p-4 rounded-lg border',

  // Variants
  variant: {
    success: 'bg-green-50 border-green-300 text-green-800',
    warning: 'bg-amber-50 border-amber-300 text-amber-800',
    danger: 'bg-red-50 border-red-300 text-red-800',
    info: 'bg-blue-50 border-blue-300 text-blue-800',
  },

  // Éléments
  title: 'font-medium mb-1',
  message: 'text-sm',
  icon: 'h-5 w-5 flex-shrink-0',
} as const;

// ─── COMPOSANTS: SKELETON ────────────────────────────────────────────────────

export const SKELETON = {
  base: 'animate-pulse bg-gray-200 rounded',
  text: 'h-4 bg-gray-200 rounded',
  title: 'h-6 bg-gray-200 rounded',
  avatar: 'h-10 w-10 bg-gray-200 rounded-full',
  button: 'h-10 w-24 bg-gray-200 rounded-lg',
} as const;

// ─── LAYOUT ──────────────────────────────────────────────────────────────────

export const LAYOUT = {
  // Container
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  containerFluid: 'w-full px-4 sm:px-6 lg:px-8',

  // Sections
  section: 'py-6',
  sectionLg: 'py-12',

  // Grid
  grid: 'grid gap-4',
  gridCols2: 'grid grid-cols-1 md:grid-cols-2 gap-4',
  gridCols3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
  gridCols4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4',

  // Flex
  flexCenter: 'flex items-center justify-center',
  flexBetween: 'flex items-center justify-between',
  flexStart: 'flex items-center justify-start',
  flexEnd: 'flex items-center justify-end',

  // Spacing
  spaceY: {
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6',
    xl: 'space-y-8',
  },

  spaceX: {
    sm: 'space-x-2',
    md: 'space-x-4',
    lg: 'space-x-6',
    xl: 'space-x-8',
  },

  gap: {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  },
} as const;

// ─── UTILITAIRES ─────────────────────────────────────────────────────────────

/**
 * Helper pour combiner des classes CSS
 */
export function cn(...classes: Array<string | boolean | undefined | null>): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Helper pour créer un composant Card
 */
export function cardClass(variant: keyof typeof CARD.padding = 'standard', withHover = false): string {
  return cn(
    CARD.base,
    CARD.padding[variant],
    withHover && CARD.hover
  );
}

/**
 * Helper pour créer un bouton
 */
export function buttonClass(
  variant: keyof typeof BUTTON.variant = 'primary',
  size: keyof typeof BUTTON.size = 'md'
): string {
  return cn(
    BUTTON.base,
    BUTTON.variant[variant],
    BUTTON.size[size]
  );
}

/**
 * Helper pour créer un badge
 */
export function badgeClass(
  variant: keyof typeof BADGE.variant = 'neutral',
  size: keyof typeof BADGE.size = 'md'
): string {
  return cn(
    BADGE.base,
    BADGE.variant[variant],
    BADGE.size[size]
  );
}

/**
 * Helper pour créer un input
 */
export function inputClass(
  size: keyof typeof INPUT.size = 'md',
  hasError = false,
  hasSuccess = false
): string {
  return cn(
    INPUT.base,
    INPUT.size[size],
    hasError && INPUT.error,
    hasSuccess && INPUT.success
  );
}

// ─── EXPORTS ─────────────────────────────────────────────────────────────────

export const DESIGN_TOKENS = {
  colors: COLORS,
  spacing: SPACING,
  radius: RADIUS,
  shadows: SHADOWS,
  transitions: TRANSITIONS,
  typography: TYPOGRAPHY,
  card: CARD,
  button: BUTTON,
  badge: BADGE,
  modal: MODAL,
  input: INPUT,
  tabs: TABS,
  pagination: PAGINATION,
  table: TABLE,
  alert: ALERT,
  skeleton: SKELETON,
  layout: LAYOUT,
} as const;

export type DesignTokens = typeof DESIGN_TOKENS;
