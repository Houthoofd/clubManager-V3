/**
 * TabGroup Component
 *
 * Composant d'onglets de navigation réutilisable avec support des icônes,
 * badges et scroll horizontal. Utilise les Design Tokens pour la cohérence visuelle.
 *
 * @example
 * ```tsx
 * <TabGroup
 *   tabs={[
 *     { id: 'products', label: 'Produits', badge: 12 },
 *     { id: 'categories', label: 'Catégories' },
 *   ]}
 *   activeTab={activeTab}
 *   onTabChange={setActiveTab}
 * />
 * ```
 */

import { ReactNode } from 'react';
import { cn } from '../styles/designTokens';

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface Tab {
  /** ID unique de l'onglet */
  id: string;
  /** Label affiché */
  label: string;
  /** Icône optionnelle */
  icon?: ReactNode;
  /** Badge numérique optionnel */
  badge?: number;
}

export interface TabGroupProps {
  /** Liste des onglets */
  tabs: Tab[];
  /** Onglet actif (id) */
  activeTab: string;
  /** Callback changement d'onglet */
  onTabChange: (tabId: string) => void;
  /** Scroll horizontal sur mobile */
  scrollable?: boolean;
  /** Classes CSS additionnelles */
  className?: string;
}

// ─── COMPOSANT ───────────────────────────────────────────────────────────────

export function TabGroup({
  tabs,
  activeTab,
  onTabChange,
  scrollable = false,
  className = '',
}: TabGroupProps) {
  return (
    <div
      role="tablist"
      className={cn(
        'flex border-b border-gray-200',
        scrollable && 'overflow-x-auto scrollbar-hide',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;

        // Classes pour le badge
        const badgeClasses = cn(
          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
          isActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
        );

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            id={`tab-${tab.id}`}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'relative flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
              isActive
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            {/* Icône */}
            {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}

            {/* Label */}
            <span>{tab.label}</span>

            {/* Badge numérique */}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className={badgeClasses}>{tab.badge}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── EXPORTS ─────────────────────────────────────────────────────────────────

export default TabGroup;
