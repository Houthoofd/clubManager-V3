/**
 * TemplatesTab.tsx
 * Onglet Templates de la page Messages — templates groupés par catégorie avec CRUD complet
 */

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useTemplateStore } from "../stores/templateStore";
import { deleteTemplateType } from "../api/templatesApi";
import type { Template, TemplateType } from "../api/templatesApi";
import { TemplateEditorModal } from "./TemplateEditorModal";
import { TemplateTypeModal } from "./TemplateTypeModal";
import { SendFromTemplateModal } from "./SendFromTemplateModal";
import {
  CircleIcon,
  EnvelopeIcon,
  FolderOpenIcon,
  PaperPlaneIcon,
  PencilAltIcon,
  PficonTemplateIcon,
  PlusCircleIcon,
  SearchIcon,
  TrashIcon,
} from "@patternfly/react-icons";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const CardSkeleton = () => (
  <div className="animate-pulse border border-gray-200 rounded-xl p-4 bg-white">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
    <div className="h-3 bg-gray-100 rounded w-full mb-1" />
    <div className="h-3 bg-gray-100 rounded w-2/3 mb-4" />
    <div className="flex items-center justify-between">
      <div className="h-5 bg-gray-100 rounded-full w-14" />
      <div className="flex gap-2">
        <div className="h-7 w-7 bg-gray-100 rounded-lg" />
        <div className="h-7 w-7 bg-gray-100 rounded-lg" />
        <div className="h-7 w-7 bg-gray-100 rounded-lg" />
      </div>
    </div>
  </div>
);

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyCategory = ({ onNew }: { onNew: () => void }) => (
  <button
    onClick={onNew}
    className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors w-full group"
  >
    <span className="text-2xl block mb-1 group-hover:scale-110 transition-transform">
      +
    </span>
    <span className="text-sm font-medium">Nouveau template</span>
  </button>
);

// ─── Template Card ────────────────────────────────────────────────────────────

interface TemplateCardProps {
  template: Template;
  onEdit: () => void;
  onSend: () => void;
  onDelete: () => void;
  onToggle: () => void;
  isDeleting: boolean;
}

const TemplateCard = ({
  template,
  onEdit,
  onSend,
  onDelete,
  onToggle,
  isDeleting,
}: TemplateCardProps) => {
  const preview =
    template.contenu.length > 60
      ? template.contenu.slice(0, 60).trimEnd() + "…"
      : template.contenu;

  return (
    <div
      className={[
        "border rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3",
        template.actif ? "border-gray-200" : "border-gray-100 opacity-60",
      ].join(" ")}
    >
      {/* Titre */}
      <div className="flex items-start gap-2">
        <EnvelopeIcon
          className="flex-shrink-0 mt-0.5 text-gray-400"
          style={{ fontSize: "16px" }}
        />
        <p className="text-sm font-semibold text-gray-800 leading-snug flex-1 min-w-0 break-words">
          {template.titre}
        </p>
      </div>

      {/* Aperçu contenu */}
      <p className="text-xs text-gray-500 leading-relaxed font-mono line-clamp-2">
        {preview || <span className="italic text-gray-300">Contenu vide</span>}
      </p>

      {/* Variables */}
      {template.variables && template.variables.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {template.variables.slice(0, 4).map((v) => (
            <span
              key={v}
              className="text-xs bg-gray-100 text-gray-600 rounded px-1.5 py-0.5 font-mono"
            >
              {`{{${v}}}`}
            </span>
          ))}
          {template.variables.length > 4 && (
            <span className="text-xs text-gray-400">
              +{template.variables.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Footer : badge + actions */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-100 mt-auto">
        {/* Badge actif/inactif cliquable */}
        <button
          type="button"
          onClick={onToggle}
          title={
            template.actif ? "Cliquer pour désactiver" : "Cliquer pour activer"
          }
          className={[
            "flex items-center gap-1 text-xs font-medium rounded-full px-2.5 py-1 transition-colors cursor-pointer",
            template.actif
              ? "bg-green-100 text-green-700 hover:bg-green-200"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200",
          ].join(" ")}
        >
          {template.actif ? (
            <CircleIcon
              className="text-green-500"
              style={{ fontSize: "10px" }}
            />
          ) : (
            <CircleIcon
              className="text-gray-300"
              style={{ fontSize: "10px" }}
            />
          )}
          {template.actif ? "Actif" : "Inactif"}
        </button>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Modifier */}
          <button
            type="button"
            onClick={onEdit}
            title="Modifier ce template"
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <PencilAltIcon style={{ fontSize: "14px" }} />
          </button>

          {/* Envoyer */}
          <button
            type="button"
            onClick={onSend}
            disabled={!template.actif}
            title={
              template.actif ? "Envoyer depuis ce template" : "Template inactif"
            }
            className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <PaperPlaneIcon style={{ fontSize: "14px" }} />
          </button>

          {/* Supprimer */}
          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            title="Supprimer ce template"
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <svg
                className="w-4 h-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            ) : (
              <TrashIcon style={{ fontSize: "14px" }} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Category Row ─────────────────────────────────────────────────────────────

interface CategoryRowProps {
  type: TemplateType;
  templates: Template[];
  onNewTemplate: () => void;
  onEditTemplate: (t: Template) => void;
  onSendTemplate: (t: Template) => void;
  onDeleteTemplate: (id: number) => void;
  onToggleTemplate: (id: number, actif: boolean) => void;
  deletingIds: Set<number>;
}

const CategoryRow = ({
  type,
  templates,
  onNewTemplate,
  onEditTemplate,
  onSendTemplate,
  onDeleteTemplate,
  onToggleTemplate,
  deletingIds,
}: CategoryRowProps) => (
  <section className="space-y-3">
    {/* Category header */}
    <div className="flex items-center gap-3">
      <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
        {type.nom}
      </h3>
      {type.description && (
        <span
          className="text-xs text-gray-400 truncate max-w-xs"
          title={type.description}
        >
          — {type.description}
        </span>
      )}
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-xs text-gray-400 flex-shrink-0">
        {templates.length} template{templates.length !== 1 ? "s" : ""}
      </span>
    </div>

    {/* Cards grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {templates.map((t) => (
        <TemplateCard
          key={t.id}
          template={t}
          onEdit={() => onEditTemplate(t)}
          onSend={() => onSendTemplate(t)}
          onDelete={() => onDeleteTemplate(t.id)}
          onToggle={() => onToggleTemplate(t.id, !t.actif)}
          isDeleting={deletingIds.has(t.id)}
        />
      ))}
      {/* Add new card */}
      <EmptyCategory onNew={onNewTemplate} />
    </div>
  </section>
);

// ─── Category Management Panel ────────────────────────────────────────────────

interface CategoryPanelProps {
  types: TemplateType[];
  isOpen: boolean;
  onClose: () => void;
  onNewType: () => void;
  onEditType: (type: TemplateType) => void;
  onDeleteType: (id: number) => void;
  deletingTypeIds: Set<number>;
}

const CategoryPanel = ({
  types,
  isOpen,
  onClose,
  onNewType,
  onEditType,
  onDeleteType,
  deletingTypeIds,
}: CategoryPanelProps) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Drawer */}
      <aside className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <FolderOpenIcon style={{ fontSize: "16px" }} />
            Gérer les catégories
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Fermer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
          {types.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              Aucune catégorie pour l'instant.
            </p>
          ) : (
            types.map((type) => (
              <div
                key={type.id}
                className={[
                  "flex items-center justify-between gap-2 px-3 py-3 rounded-lg border group",
                  type.actif
                    ? "border-gray-200 bg-white hover:border-gray-300"
                    : "border-gray-100 bg-gray-50 opacity-60",
                ].join(" ")}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {type.nom}
                  </p>
                  {type.description && (
                    <p className="text-xs text-gray-400 truncate">
                      {type.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={[
                        "text-xs rounded-full px-2 py-0.5 font-medium",
                        type.actif
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500",
                      ].join(" ")}
                    >
                      {type.actif ? "Active" : "Inactive"}
                    </span>
                    {type.templates_count !== undefined && (
                      <span className="text-xs text-gray-400">
                        {type.templates_count} template
                        {type.templates_count !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => onEditType(type)}
                    title="Modifier"
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <PencilAltIcon style={{ fontSize: "12px" }} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteType(type.id)}
                    disabled={deletingTypeIds.has(type.id)}
                    title="Supprimer"
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {deletingTypeIds.has(type.id) ? (
                      <svg
                        className="w-3.5 h-3.5 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>
                    ) : (
                      <TrashIcon style={{ fontSize: "12px" }} />
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-gray-200 flex-shrink-0">
          <button
            type="button"
            onClick={onNewType}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1"
          >
            <PlusCircleIcon style={{ fontSize: "16px" }} />
            Nouvelle catégorie
          </button>
        </div>
      </aside>
    </>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const TemplatesTab = () => {
  const {
    types,
    templates,
    isLoading,
    error,
    fetchTypes,
    fetchTemplates,
    deleteTemplate,
    toggleTemplate,
  } = useTemplateStore();

  // ── Modal states ─────────────────────────────────────────────────────────────
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | undefined>(
    undefined,
  );
  const [defaultTypeId, setDefaultTypeId] = useState<number | undefined>(
    undefined,
  );

  const [isSendOpen, setIsSendOpen] = useState(false);
  const [sendingTemplate, setSendingTemplate] = useState<Template | null>(null);

  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<TemplateType | undefined>(
    undefined,
  );

  const [isCategoryPanelOpen, setIsCategoryPanelOpen] = useState(false);

  // ── Loading states ───────────────────────────────────────────────────────────
  const [deletingTemplateIds, setDeletingTemplateIds] = useState<Set<number>>(
    new Set(),
  );
  const [deletingTypeIds, setDeletingTypeIds] = useState<Set<number>>(
    new Set(),
  );

  // ── Filters ───────────────────────────────────────────────────────────────────
  const [filterTypeId, setFilterTypeId] = useState<number | "all">("all");

  // ── Initial load ──────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchTypes();
    fetchTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Filtered & grouped templates ─────────────────────────────────────────────
  const filteredTypes = useMemo(() => {
    if (filterTypeId === "all") return types;
    return types.filter((t) => t.id === filterTypeId);
  }, [types, filterTypeId]);

  const templatesByType = useMemo(() => {
    const map = new Map<number, Template[]>();
    for (const type of filteredTypes) {
      map.set(type.id, []);
    }
    for (const tpl of templates) {
      if (filterTypeId !== "all" && tpl.type_id !== filterTypeId) continue;
      const list = map.get(tpl.type_id);
      if (list) list.push(tpl);
    }
    return map;
  }, [filteredTypes, templates, filterTypeId]);

  // ── Handlers — Templates ──────────────────────────────────────────────────────

  const handleNewTemplate = (typeId?: number) => {
    setEditingTemplate(undefined);
    setDefaultTypeId(typeId);
    setIsEditorOpen(true);
  };

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setDefaultTypeId(undefined);
    setIsEditorOpen(true);
  };

  const handleSendTemplate = (template: Template) => {
    setSendingTemplate(template);
    setIsSendOpen(true);
  };

  const handleDeleteTemplate = async (id: number) => {
    const template = templates.find((t) => t.id === id);
    const name = template?.titre ?? "ce template";

    if (
      !window.confirm(`Supprimer « ${name} » ? Cette action est irréversible.`)
    )
      return;

    setDeletingTemplateIds((prev) => new Set(prev).add(id));
    try {
      await deleteTemplate(id);
      toast.success("Template supprimé.");
    } catch {
      // Error already toasted in store
    } finally {
      setDeletingTemplateIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleToggleTemplate = async (id: number, actif: boolean) => {
    try {
      await toggleTemplate(id, actif);
      toast.success(actif ? "Template activé." : "Template désactivé.");
    } catch {
      // Error already toasted in store
    }
  };

  // ── Handlers — Template Types ─────────────────────────────────────────────────

  const handleNewType = () => {
    setEditingType(undefined);
    setIsTypeModalOpen(true);
  };

  const handleEditType = (type: TemplateType) => {
    setEditingType(type);
    setIsTypeModalOpen(true);
  };

  const handleDeleteType = async (id: number) => {
    const type = types.find((t) => t.id === id);
    const name = type?.nom ?? "cette catégorie";

    if (
      !window.confirm(
        `Supprimer la catégorie « ${name} » ?\n\nAttention : tous les templates de cette catégorie seront également supprimés.`,
      )
    )
      return;

    setDeletingTypeIds((prev) => new Set(prev).add(id));
    try {
      await deleteTemplateType(id);
      // Also refresh local store state
      await fetchTypes();
      await fetchTemplates();
      toast.success("Catégorie supprimée.");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "Erreur lors de la suppression.";
      toast.error(msg);
    } finally {
      setDeletingTypeIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleTypeSaved = () => {
    fetchTypes();
    fetchTemplates();
  };

  const handleTemplateSaved = () => {
    fetchTemplates();
  };

  // ── Total count ───────────────────────────────────────────────────────────────
  const totalTemplates = templates.length;
  const activeTemplates = templates.filter((t) => t.actif).length;

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full">
      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-white flex-shrink-0 flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          {/* New template */}
          <button
            type="button"
            onClick={() => handleNewTemplate()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1"
          >
            <span>+</span>
            Nouveau template
          </button>

          {/* Filter by type */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="filter-type"
              className="text-sm text-gray-600 flex-shrink-0"
            >
              Filtrer :
            </label>
            <select
              id="filter-type"
              value={filterTypeId}
              onChange={(e) =>
                setFilterTypeId(
                  e.target.value === "all" ? "all" : Number(e.target.value),
                )
              }
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors"
            >
              <option value="all">Toutes les catégories</option>
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nom}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Stats */}
          {!isLoading && (
            <span className="text-xs text-gray-400">
              {activeTemplates}/{totalTemplates} actif
              {activeTemplates !== 1 ? "s" : ""}
            </span>
          )}

          {/* Manage categories */}
          <button
            type="button"
            onClick={() => setIsCategoryPanelOpen(true)}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors border border-gray-200 hover:border-blue-200"
          >
            <FolderOpenIcon style={{ fontSize: "16px" }} />
            Gérer les catégories
          </button>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="mx-5 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between flex-shrink-0">
          <p className="text-sm text-red-700">{error}</p>
          <button
            type="button"
            onClick={() => {
              fetchTypes();
              fetchTemplates();
            }}
            className="text-xs text-red-600 underline hover:no-underline ml-3 flex-shrink-0"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        {/* Loading skeleton */}
        {isLoading && templates.length === 0 ? (
          <div className="space-y-8">
            {[1, 2].map((section) => (
              <div key={section} className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {[1, 2, 3].map((i) => (
                    <CardSkeleton key={i} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : types.length === 0 ? (
          /* No categories yet */
          <div className="flex flex-col items-center justify-center h-full py-20 text-gray-400">
            <div className="text-gray-300 mb-4" style={{ fontSize: "48px" }}>
              <PficonTemplateIcon />
            </div>
            <p className="text-base font-medium text-gray-500 mb-2">
              Aucune catégorie de templates
            </p>
            <p className="text-sm text-center max-w-sm mb-6">
              Commencez par créer une catégorie (ex : «&nbsp;Bienvenue&nbsp;»,
              «&nbsp;Cours annulé&nbsp;»…) puis ajoutez vos templates.
            </p>
            <button
              type="button"
              onClick={() => {
                setIsCategoryPanelOpen(true);
                // Small delay to let panel open before triggering new type
                setTimeout(() => handleNewType(), 100);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
            >
              <FolderOpenIcon style={{ fontSize: "16px" }} />
              Créer une première catégorie
            </button>
          </div>
        ) : filteredTypes.length === 0 ? (
          /* Filter yields no results */
          <div className="flex flex-col items-center justify-center h-full py-20 text-gray-400">
            <div className="text-gray-300 mb-3" style={{ fontSize: "48px" }}>
              <SearchIcon />
            </div>
            <p className="text-sm font-medium text-gray-500">
              Aucun résultat pour ce filtre.
            </p>
          </div>
        ) : (
          /* Main content — categories + template grids */
          <div className="space-y-8">
            {filteredTypes.map((type) => {
              const typeTemplates = templatesByType.get(type.id) ?? [];
              return (
                <CategoryRow
                  key={type.id}
                  type={type}
                  templates={typeTemplates}
                  onNewTemplate={() => handleNewTemplate(type.id)}
                  onEditTemplate={handleEditTemplate}
                  onSendTemplate={handleSendTemplate}
                  onDeleteTemplate={handleDeleteTemplate}
                  onToggleTemplate={handleToggleTemplate}
                  deletingIds={deletingTemplateIds}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* ════════════════ MODALS & PANELS ════════════════ */}

      {/* Editor modal */}
      <TemplateEditorModal
        template={editingTemplate}
        types={types}
        defaultTypeId={defaultTypeId}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSaved={handleTemplateSaved}
      />

      {/* Send modal */}
      {sendingTemplate && (
        <SendFromTemplateModal
          template={sendingTemplate}
          isOpen={isSendOpen}
          onClose={() => {
            setIsSendOpen(false);
            setSendingTemplate(null);
          }}
          onSent={() => {
            setIsSendOpen(false);
            setSendingTemplate(null);
          }}
        />
      )}

      {/* Type modal */}
      <TemplateTypeModal
        type={editingType}
        isOpen={isTypeModalOpen}
        onClose={() => setIsTypeModalOpen(false)}
        onSaved={handleTypeSaved}
      />

      {/* Category management panel */}
      <CategoryPanel
        types={types}
        isOpen={isCategoryPanelOpen}
        onClose={() => setIsCategoryPanelOpen(false)}
        onNewType={handleNewType}
        onEditType={(t) => {
          setIsCategoryPanelOpen(false);
          handleEditType(t);
        }}
        onDeleteType={handleDeleteType}
        deletingTypeIds={deletingTypeIds}
      />
    </div>
  );
};
