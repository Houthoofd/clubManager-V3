/**
 * DataTable Component
 *
 * Composant de tableau réutilisable avec tri, pagination et rendu personnalisé.
 * Utilise les Design Tokens pour garantir la cohérence visuelle.
 *
 * @example
 * ```tsx
 * // Exemple 1 : Tableau simple
 * <DataTable
 *   columns={[
 *     { key: 'name', label: 'Nom' },
 *     { key: 'email', label: 'Email' },
 *     { key: 'role', label: 'Rôle' },
 *   ]}
 *   data={users}
 *   rowKey="id"
 * />
 *
 * // Exemple 2 : Avec tri
 * <DataTable
 *   columns={[
 *     { key: 'name', label: 'Nom', sortable: true },
 *     { key: 'age', label: 'Âge', sortable: true },
 *     { key: 'email', label: 'Email' },
 *   ]}
 *   data={users}
 *   rowKey="id"
 * />
 *
 * // Exemple 3 : Avec rendu custom
 * <DataTable
 *   columns={[
 *     { key: 'name', label: 'Nom' },
 *     {
 *       key: 'status',
 *       label: 'Statut',
 *       render: (value) => <Badge variant={value === 'active' ? 'success' : 'danger'}>{value}</Badge>
 *     },
 *     {
 *       key: 'actions',
 *       label: 'Actions',
 *       render: (_, row) => (
 *         <Button size="sm" onClick={() => handleEdit(row)}>Éditer</Button>
 *       )
 *     }
 *   ]}
 *   data={users}
 *   rowKey="id"
 *   onRowClick={(row) => console.log(row)}
 * />
 *
 * // Exemple 4 : Loading
 * <DataTable
 *   columns={columns}
 *   data={[]}
 *   rowKey="id"
 *   loading
 * />
 * ```
 */

import { ReactNode, useMemo, useState } from 'react';
import { cn, TABLE } from '../../styles/designTokens';

// ─── TYPES ───────────────────────────────────────────────────────────────────

/**
 * Configuration d'une colonne du tableau
 */
export interface Column<T> {
  /**
   * Clé de la colonne (correspond à la propriété de l'objet)
   */
  key: keyof T | string;

  /**
   * Label affiché dans le header
   */
  label: string;

  /**
   * Fonction de rendu personnalisé (optionnel)
   * @param value - Valeur de la cellule
   * @param row - Objet complet de la ligne
   * @returns ReactNode à afficher dans la cellule
   */
  render?: (value: any, row: T) => ReactNode;

  /**
   * Colonne triable
   * @default false
   */
  sortable?: boolean;

  /**
   * Classes CSS pour la cellule
   */
  className?: string;
}

/**
 * Configuration du tri
 */
interface SortConfig {
  /**
   * Clé de la colonne triée
   */
  key: string;

  /**
   * Direction du tri (null = pas de tri)
   */
  direction: 'asc' | 'desc' | null;
}

/**
 * Props du composant DataTable
 */
export interface DataTableProps<T> {
  /**
   * Colonnes du tableau
   */
  columns: Column<T>[];

  /**
   * Données à afficher
   */
  data: T[];

  /**
   * Clé unique pour chaque ligne
   * Peut être une propriété ou une fonction
   */
  rowKey: keyof T | ((row: T) => string | number);

  /**
   * Fonction appelée au clic sur une ligne
   */
  onRowClick?: (row: T) => void;

  /**
   * État de chargement
   * Affiche un skeleton loader
   * @default false
   */
  loading?: boolean;

  /**
   * Message si tableau vide
   * @default "Aucune donnée à afficher"
   */
  emptyMessage?: string;

  /**
   * Classes CSS additionnelles pour le wrapper
   */
  className?: string;
}

// ─── SKELETON LOADER ─────────────────────────────────────────────────────────

interface SkeletonRowsProps {
  /**
   * Nombre de lignes skeleton
   */
  count?: number;

  /**
   * Nombre de colonnes
   */
  columnCount: number;
}

function SkeletonRows({ count = 5, columnCount }: SkeletonRowsProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <tr key={`skeleton-${i}`}>
          {Array.from({ length: columnCount }).map((_, j) => (
            <td key={`skeleton-cell-${i}-${j}`} className={TABLE.td}>
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ─── SORT ICON ───────────────────────────────────────────────────────────────

interface SortIconProps {
  direction: 'asc' | 'desc' | null;
}

function SortIcon({ direction }: SortIconProps) {
  return (
    <span className="ml-2 inline-flex flex-col text-gray-400">
      <svg
        className={cn(
          'h-3 w-3 -mb-1',
          direction === 'asc' && 'text-gray-900'
        )}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
          clipRule="evenodd"
        />
      </svg>
      <svg
        className={cn(
          'h-3 w-3',
          direction === 'desc' && 'text-gray-900'
        )}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
    </span>
  );
}

// ─── COMPOSANT PRINCIPAL ─────────────────────────────────────────────────────

export function DataTable<T>({
  columns,
  data,
  rowKey,
  onRowClick,
  loading = false,
  emptyMessage = 'Aucune donnée à afficher',
  className = '',
}: DataTableProps<T>) {
  // ─── STATE ─────────────────────────────────────────────────────────────────

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: '',
    direction: null,
  });

  // ─── HELPERS ───────────────────────────────────────────────────────────────

  /**
   * Récupère la clé unique d'une ligne
   */
  const getRowKey = (row: T): string | number => {
    if (typeof rowKey === 'function') {
      return rowKey(row);
    }
    return row[rowKey] as string | number;
  };

  /**
   * Récupère la valeur d'une cellule
   */
  const getCellValue = (row: T, key: keyof T | string): any => {
    return (row as any)[key];
  };

  // ─── SORTING ───────────────────────────────────────────────────────────────

  /**
   * Gère le clic sur un header de colonne triable
   */
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' | null = 'asc';

    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        direction = null;
      }
    }

    setSortConfig({ key, direction });
  };

  /**
   * Données triées selon la configuration actuelle
   */
  const sortedData = useMemo(() => {
    if (!sortConfig.direction || !sortConfig.key) {
      return data;
    }

    return [...data].sort((a, b) => {
      const aVal = getCellValue(a, sortConfig.key);
      const bVal = getCellValue(b, sortConfig.key);

      // Gestion des valeurs nulles/undefined
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      // Tri numérique
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      // Tri alphabétique (et dates converties en string)
      const comparison = String(aVal).localeCompare(String(bVal));
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [data, sortConfig]);

  // ─── RENDER ────────────────────────────────────────────────────────────────

  return (
    <div className={cn(TABLE.wrapper, className)}>
      <table className={TABLE.container}>
        {/* Header */}
        <thead className={TABLE.thead}>
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={cn(TABLE.th, column.className)}
              >
                {column.sortable ? (
                  <button
                    type="button"
                    onClick={() => handleSort(String(column.key))}
                    className="inline-flex items-center hover:text-gray-700 transition-colors focus:outline-none focus:text-gray-900"
                    aria-label={`Trier par ${column.label}`}
                  >
                    {column.label}
                    <SortIcon
                      direction={
                        sortConfig.key === column.key
                          ? sortConfig.direction
                          : null
                      }
                    />
                  </button>
                ) : (
                  column.label
                )}
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody className={TABLE.tbody}>
          {/* Loading state */}
          {loading && (
            <SkeletonRows count={5} columnCount={columns.length} />
          )}

          {/* Empty state */}
          {!loading && sortedData.length === 0 && (
            <tr>
              <td colSpan={columns.length} className={TABLE.empty}>
                <div className="flex flex-col items-center justify-center py-4">
                  <svg
                    className="h-12 w-12 text-gray-400 mb-3"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                  <p className="text-sm text-gray-500">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          )}

          {/* Data rows */}
          {!loading &&
            sortedData.map((row) => (
              <tr
                key={getRowKey(row)}
                className={cn(
                  TABLE.tr,
                  onRowClick && 'cursor-pointer'
                )}
                onClick={() => onRowClick?.(row)}
                role={onRowClick ? 'button' : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={
                  onRowClick
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onRowClick(row);
                        }
                      }
                    : undefined
                }
                aria-label={onRowClick ? 'Cliquer pour voir les détails' : undefined}
              >
                {columns.map((column) => {
                  const value = getCellValue(row, column.key);
                  return (
                    <td
                      key={String(column.key)}
                      className={cn(TABLE.td, column.className)}
                    >
                      {column.render ? column.render(value, row) : value ?? '-'}
                    </td>
                  );
                })}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── EXPORTS ─────────────────────────────────────────────────────────────────

export default DataTable;
