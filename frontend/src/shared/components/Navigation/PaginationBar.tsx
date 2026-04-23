import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@patternfly/react-icons";
import { useTranslation } from "react-i18next";

interface PaginationBarProps {
  /** Page actuelle (1-based) */
  currentPage: number;
  /** Nombre total de pages */
  totalPages: number;
  /** Callback changement de page */
  onPageChange: (page: number) => void;
  /** Afficher le nombre de résultats */
  showResultsCount?: boolean;
  /** Nombre total d'éléments */
  total?: number;
  /** Taille de page */
  pageSize?: number;
}

/**
 * Génère la liste des numéros de pages à afficher avec ellipses
 * Si totalPages <= 7: affiche tous les numéros
 * Sinon: affiche page 1, dernière page, currentPage et 2 pages avant/après avec ellipses
 */
const generatePageNumbers = (
  currentPage: number,
  totalPages: number,
): (number | "ellipsis")[] => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | "ellipsis")[] = [];
  const showLeftEllipsis = currentPage > 4;
  const showRightEllipsis = currentPage < totalPages - 3;

  // Toujours afficher la page 1
  pages.push(1);

  if (showLeftEllipsis) {
    pages.push("ellipsis");
  }

  // Calculer la plage autour de la page actuelle
  let startPage = Math.max(2, currentPage - 2);
  let endPage = Math.min(totalPages - 1, currentPage + 2);

  // Ajuster pour toujours afficher 5 numéros au centre (si possible)
  if (currentPage <= 4) {
    endPage = Math.min(totalPages - 1, 6);
  }
  if (currentPage >= totalPages - 3) {
    startPage = Math.max(2, totalPages - 5);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  if (showRightEllipsis) {
    pages.push("ellipsis");
  }

  // Toujours afficher la dernière page (si > 1)
  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
};

/**
 * Composant de pagination réutilisable pour les listes et tableaux
 *
 * Fonctionnalités:
 * - Responsive (mobile: prev/next, desktop: numéros de pages)
 * - Ellipses intelligentes pour de nombreuses pages
 * - Affichage optionnel du nombre de résultats
 * - Gestion des états disabled
 * - Accessible (ARIA labels)
 */
export const PaginationBar: React.FC<PaginationBarProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showResultsCount = false,
  total = 0,
  pageSize = 10,
}) => {
  const { t } = useTranslation("common");

  // Calculer les résultats affichés
  const startResult = total > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endResult = Math.min(currentPage * pageSize, total);

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    if (page !== currentPage) {
      onPageChange(page);
    }
  };

  const pageNumbers = generatePageNumbers(currentPage, totalPages);

  return (
    <nav
      className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6"
      aria-label="Pagination"
    >
      {/* Mobile view */}
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className={`
            relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium
            ${
              currentPage === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
            }
          `}
          aria-label={t("pagination.previousPage")}
        >
          {t("pagination.previous")}
        </button>
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={`
            relative ml-3 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium
            ${
              currentPage === totalPages
                ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
            }
          `}
          aria-label={t("pagination.nextPage")}
        >
          {t("pagination.next")}
        </button>
      </div>

      {/* Desktop view */}
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        {/* Texte des résultats */}
        {showResultsCount && total > 0 && (
          <div>
            <p className="text-sm text-gray-700">
              {t("pagination.showing")}{" "}
              <span className="font-medium">{startResult}</span>{" "}
              {t("pagination.to")}{" "}
              <span className="font-medium">{endResult}</span>{" "}
              {t("pagination.of")} <span className="font-medium">{total}</span>{" "}
              {t("pagination.results")}
            </p>
          </div>
        )}

        {/* Pagination */}
        <div className={showResultsCount ? "" : "flex-1 flex justify-center"}>
          <nav
            className="isolate inline-flex -space-x-px rounded-md shadow-sm"
            aria-label="Pagination"
          >
            {/* Bouton Précédent */}
            <button
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className={`
                relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300
                ${
                  currentPage === 1
                    ? "bg-gray-100 cursor-not-allowed opacity-50"
                    : "bg-white hover:bg-gray-50"
                }
              `}
              aria-label={t("pagination.previousPage")}
            >
              <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
            </button>

            {/* Numéros de pages */}
            {pageNumbers.map((page, index) => {
              if (page === "ellipsis") {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 bg-white"
                  >
                    ...
                  </span>
                );
              }

              const isActive = page === currentPage;

              return (
                <button
                  key={page}
                  onClick={() => handlePageClick(page)}
                  aria-current={isActive ? "page" : undefined}
                  className={`
                    relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300
                    ${
                      isActive
                        ? "z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                        : "text-gray-900 hover:bg-gray-50 bg-white"
                    }
                  `}
                >
                  {page}
                </button>
              );
            })}

            {/* Bouton Suivant */}
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className={`
                relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300
                ${
                  currentPage === totalPages
                    ? "bg-gray-100 cursor-not-allowed opacity-50"
                    : "bg-white hover:bg-gray-50"
                }
              `}
              aria-label={t("pagination.nextPage")}
            >
              <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </nav>
  );
};
