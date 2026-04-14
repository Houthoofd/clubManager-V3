/**
 * TabGroup Component
 *
 * Composant d'onglets de navigation réutilisable avec support des icônes,
 * badges et scroll horizontal. Utilise les Design Tokens pour la cohérence visuelle.
 *
 * @variant default - Border-b-2 simple, pas de background (style par défaut)
 * @variant highlight - Background bg-blue-50 sur l'onglet actif + scroll buttons
 *
 * @example
 * ```tsx
 * // Variant default (classique)
 * <TabGroup
 *   tabs={[
 *     { id: 'products', label: 'Produits', badge: 12 },
 *     { id: 'categories', label: 'Catégories' },
 *   ]}
 *   activeTab={activeTab}
 *   onTabChange={setActiveTab}
 * />
 *
 * // Variant highlight (style Settings)
 * <TabGroup
 *   variant="highlight"
 *   tabs={[
 *     { id: 'general', label: 'Général' },
 *     { id: 'security', label: 'Sécurité' },
 *   ]}
 *   activeTab={activeTab}
 *   onTabChange={setActiveTab}
 *   scrollable={true}
 * />
 * ```
 */

import { ReactNode, useRef, useState, useEffect } from "react";
import { cn } from "../../styles/designTokens";

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
  /** Variant de style
   * - "default": Border-b-2 simple, pas de background
   * - "highlight": Background sur onglet actif + boutons scroll
   * @default "default"
   */
  variant?: "default" | "highlight";
  /** Scroll horizontal sur mobile */
  scrollable?: boolean;
  /** Classes CSS additionnelles */
  className?: string;
}

// ─── ICÔNES CHEVRON (SVG INLINE) ─────────────────────────────────────────────

const ChevronLeftIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-5 h-5"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
      clipRule="evenodd"
    />
  </svg>
);

const ChevronRightIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-5 h-5"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
      clipRule="evenodd"
    />
  </svg>
);

// ─── COMPOSANT ───────────────────────────────────────────────────────────────

export function TabGroup({
  tabs,
  activeTab,
  onTabChange,
  variant = "default",
  scrollable = false,
  className = "",
}: TabGroupProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);

  // Vérifie si les boutons de scroll doivent être affichés
  const checkScrollButtons = () => {
    if (!scrollable || variant !== "highlight" || !scrollContainerRef.current) {
      return;
    }

    const container = scrollContainerRef.current;
    const { scrollLeft, scrollWidth, clientWidth } = container;

    setShowLeftScroll(scrollLeft > 0);
    setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 1);
  };

  // Scroll vers la gauche
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  // Scroll vers la droite
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  // Vérifie les boutons de scroll au chargement et au resize
  useEffect(() => {
    checkScrollButtons();

    if (scrollable && variant === "highlight") {
      const container = scrollContainerRef.current;
      if (container) {
        container.addEventListener("scroll", checkScrollButtons);
        window.addEventListener("resize", checkScrollButtons);

        return () => {
          container.removeEventListener("scroll", checkScrollButtons);
          window.removeEventListener("resize", checkScrollButtons);
        };
      }
    }
  }, [scrollable, variant, tabs]);

  // Classes pour le container principal
  const containerClasses = cn("relative flex items-center", className);

  // Classes pour le wrapper des tabs
  const tabWrapperClasses = cn(
    "flex border-b border-gray-200",
    scrollable && "overflow-x-auto",
    scrollable && variant === "highlight" && "scrollbar-hide",
    variant === "highlight" ? "flex-1" : "w-full",
  );

  // Bouton de scroll (variant highlight uniquement)
  const ScrollButton = ({
    direction,
    onClick,
    show,
  }: {
    direction: "left" | "right";
    onClick: () => void;
    show: boolean;
  }) => {
    if (!show || variant !== "highlight" || !scrollable) return null;

    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={
          direction === "left"
            ? "Défiler vers la gauche"
            : "Défiler vers la droite"
        }
        className={cn(
          "flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md",
          direction === "left" ? "mr-2" : "ml-2",
        )}
      >
        {direction === "left" ? <ChevronLeftIcon /> : <ChevronRightIcon />}
      </button>
    );
  };

  return (
    <div className={containerClasses}>
      {/* Bouton scroll gauche */}
      <ScrollButton
        direction="left"
        onClick={scrollLeft}
        show={showLeftScroll}
      />

      {/* Tabs */}
      <div
        ref={scrollContainerRef}
        role="tablist"
        className={tabWrapperClasses}
        style={
          scrollable && variant === "highlight"
            ? { scrollbarWidth: "none", msOverflowStyle: "none" }
            : undefined
        }
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;

          // Classes conditionnelles selon le variant
          const tabClasses = cn(
            "relative flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
            // Variant default
            variant === "default" &&
              isActive &&
              "border-blue-600 text-blue-600",
            variant === "default" &&
              !isActive &&
              "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
            // Variant highlight
            variant === "highlight" &&
              isActive &&
              "border-blue-600 text-blue-600 bg-blue-50",
            variant === "highlight" &&
              !isActive &&
              "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50",
          );

          // Classes pour le badge
          const badgeClasses = cn(
            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
            isActive
              ? "bg-blue-100 text-blue-800"
              : "bg-gray-100 text-gray-600",
          );

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              id={`tab-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={tabClasses}
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

      {/* Bouton scroll droite */}
      <ScrollButton
        direction="right"
        onClick={scrollRight}
        show={showRightScroll}
      />

      {/* Style pour cacher la scrollbar sur webkit */}
      {scrollable && variant === "highlight" && (
        <style>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      )}
    </div>
  );
}

// ─── EXPORTS ─────────────────────────────────────────────────────────────────

export default TabGroup;
