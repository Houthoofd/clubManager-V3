/**
 * TemplatesPage
 *
 * Page d'administration des modèles de messages.
 *
 * Layout deux colonnes :
 *  - Panneau gauche  : liste des types de modèles (CRUD)
 *  - Panneau droit   : liste des templates filtrée par type sélectionné (CRUD + toggle + preview + send)
 *
 * Modales inline :
 *  - TemplateTypeModal     — créer / modifier un type
 *  - TemplateEditorModal   — créer / modifier un template
 *  - TemplatePreviewModal  — aperçu rendu avec variables
 *  - SendTemplateModal     — envoyer depuis un template
 *  - ConfirmDialog         — confirmer les suppressions
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  DocumentTextIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  PaperAirplaneIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { PageHeader } from "../../../shared/components/Layout/PageHeader";
import { EmptyState } from "../../../shared/components/Layout/EmptyState";
import { Modal } from "../../../shared/components/Modal/Modal";
import { ConfirmDialog } from "../../../shared/components/Modal/ConfirmDialog";
import { Button } from "../../../shared/components/Button/Button";
import { Input } from "../../../shared/components/Input/Input";
import { FormField } from "../../../shared/components/Forms/FormField";
import { useAuth } from "../../../shared/hooks/useAuth";
import { UserRole } from "@clubmanager/types";

import {
  useTemplateTypes,
  useTemplatesList,
  useCreateTemplateType,
  useUpdateTemplateType,
  useDeleteTemplateType,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
  useToggleTemplate,
  usePreviewTemplate,
  useSendFromTemplate,
} from "../hooks/useTemplates";
import type { TemplateType, Template } from "../api/templatesApi";

// ─── Modal State Machine ──────────────────────────────────────────────────────

type ModalState =
  | { type: "none" }
  | { type: "createType" }
  | { type: "editType"; typeItem: TemplateType }
  | { type: "deleteType"; typeItem: TemplateType }
  | { type: "createTemplate" }
  | { type: "editTemplate"; template: Template }
  | { type: "deleteTemplate"; template: Template }
  | { type: "preview"; template: Template }
  | { type: "send"; template: Template };

// ─── Active Filter ────────────────────────────────────────────────────────────

type ActiveFilter = "all" | "active" | "inactive";

// ─── Component ────────────────────────────────────────────────────────────────

export function TemplatesPage() {
  const { t } = useTranslation("templates");
  const { hasRole } = useAuth();
  const isAdmin = hasRole(UserRole.ADMIN);
  const isProfessorOrAdmin =
    hasRole(UserRole.ADMIN) || hasRole(UserRole.PROFESSOR);

  // ── Selected type filter ────────────────────────────────────────────────────
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");

  // ── Modal state ─────────────────────────────────────────────────────────────
  const [modal, setModal] = useState<ModalState>({ type: "none" });
  const closeModal = () => setModal({ type: "none" });

  // ── Type form state ─────────────────────────────────────────────────────────
  const [typeFormNom, setTypeFormNom] = useState("");
  const [typeFormDescription, setTypeFormDescription] = useState("");
  const [typeFormErrors, setTypeFormErrors] = useState<{ nom?: string }>({});

  // ── Template form state ─────────────────────────────────────────────────────
  const [tplFormTitre, setTplFormTitre] = useState("");
  const [tplFormContenu, setTplFormContenu] = useState("");
  const [tplFormTypeId, setTplFormTypeId] = useState<number | "">("");
  const [tplFormActif, setTplFormActif] = useState(true);
  const [tplFormErrors, setTplFormErrors] = useState<{
    titre?: string;
    contenu?: string;
    type_id?: string;
  }>({});

  // ── Preview state ───────────────────────────────────────────────────────────
  const [previewVars, setPreviewVars] = useState<Record<string, string>>({});
  const [previewRendered, setPreviewRendered] = useState<string>("");

  // ── Send form state ─────────────────────────────────────────────────────────
  const [sendRecipientId, setSendRecipientId] = useState("");
  const [sendByEmail, setSendByEmail] = useState(false);
  const [sendManualVars, setSendManualVars] = useState<Record<string, string>>(
    {},
  );
  const [sendErrors, setSendErrors] = useState<{ recipientId?: string }>({});

  // ── React Query ─────────────────────────────────────────────────────────────
  const { data: types = [], isLoading: typesLoading } = useTemplateTypes();

  const listParams =
    selectedTypeId !== null
      ? {
          type_id: selectedTypeId,
          ...(activeFilter === "active"
            ? { actif: true }
            : activeFilter === "inactive"
              ? { actif: false }
              : {}),
        }
      : activeFilter === "active"
        ? { actif: true }
        : activeFilter === "inactive"
          ? { actif: false }
          : undefined;

  const { data: templates = [], isLoading: templatesLoading } =
    useTemplatesList(listParams);

  // ── Mutations ───────────────────────────────────────────────────────────────
  const createTypeMutation = useCreateTemplateType();
  const updateTypeMutation = useUpdateTemplateType();
  const deleteTypeMutation = useDeleteTemplateType();
  const createTemplateMutation = useCreateTemplate();
  const updateTemplateMutation = useUpdateTemplate();
  const deleteTemplateMutation = useDeleteTemplate();
  const toggleMutation = useToggleTemplate();
  const previewMutation = usePreviewTemplate();
  const sendMutation = useSendFromTemplate();

  // ── Open helpers ────────────────────────────────────────────────────────────
  const openCreateType = () => {
    setTypeFormNom("");
    setTypeFormDescription("");
    setTypeFormErrors({});
    setModal({ type: "createType" });
  };

  const openEditType = (typeItem: TemplateType) => {
    setTypeFormNom(typeItem.nom);
    setTypeFormDescription(typeItem.description ?? "");
    setTypeFormErrors({});
    setModal({ type: "editType", typeItem });
  };

  const openCreateTemplate = () => {
    setTplFormTitre("");
    setTplFormContenu("");
    setTplFormTypeId(selectedTypeId ?? "");
    setTplFormActif(true);
    setTplFormErrors({});
    setModal({ type: "createTemplate" });
  };

  const openEditTemplate = (template: Template) => {
    setTplFormTitre(template.titre);
    setTplFormContenu(template.contenu);
    setTplFormTypeId(template.type_id);
    setTplFormActif(template.actif);
    setTplFormErrors({});
    setModal({ type: "editTemplate", template });
  };

  const openPreview = (template: Template) => {
    const initialVars: Record<string, string> = {};
    template.variables.forEach((v) => {
      initialVars[v] = "";
    });
    setPreviewVars(initialVars);
    setPreviewRendered("");
    setModal({ type: "preview", template });
  };

  const openSend = (template: Template) => {
    setSendRecipientId("");
    setSendByEmail(false);
    const initialVars: Record<string, string> = {};
    template.variables.forEach((v) => {
      initialVars[v] = "";
    });
    setSendManualVars(initialVars);
    setSendErrors({});
    setModal({ type: "send", template });
  };

  // ── Type form validation + submit ───────────────────────────────────────────
  const validateTypeForm = () => {
    const errors: { nom?: string } = {};
    if (!typeFormNom.trim()) errors.nom = t("validation.typeNameRequired");
    return errors;
  };

  const handleTypeSubmit = () => {
    const errors = validateTypeForm();
    if (Object.keys(errors).length > 0) {
      setTypeFormErrors(errors);
      return;
    }

    const payload = {
      nom: typeFormNom.trim(),
      description: typeFormDescription.trim() || undefined,
    };

    if (modal.type === "createType") {
      createTypeMutation.mutate(payload, {
        onSuccess: () => {
          toast.success(t("messages.typeCreated"));
          closeModal();
        },
        onError: (e: any) =>
          toast.error(e?.response?.data?.message ?? e.message),
      });
    } else if (modal.type === "editType") {
      updateTypeMutation.mutate(
        { id: modal.typeItem.id, data: payload },
        {
          onSuccess: () => {
            toast.success(t("messages.typeUpdated"));
            closeModal();
          },
          onError: (e: any) =>
            toast.error(e?.response?.data?.message ?? e.message),
        },
      );
    }
  };

  const handleDeleteType = () => {
    if (modal.type !== "deleteType") return;
    deleteTypeMutation.mutate(modal.typeItem.id, {
      onSuccess: () => {
        toast.success(t("messages.typeDeleted"));
        if (selectedTypeId === modal.typeItem.id) setSelectedTypeId(null);
        closeModal();
      },
      onError: (e: any) =>
        toast.error(e?.response?.data?.message ?? e.message),
    });
  };

  // ── Template form validation + submit ───────────────────────────────────────
  const validateTemplateForm = () => {
    const errors: {
      titre?: string;
      contenu?: string;
      type_id?: string;
    } = {};
    if (!tplFormTitre.trim()) errors.titre = t("validation.titleRequired");
    if (!tplFormContenu.trim()) errors.contenu = t("validation.contentRequired");
    if (!tplFormTypeId) errors.type_id = t("validation.typeRequired");
    return errors;
  };

  const handleTemplateSubmit = () => {
    const errors = validateTemplateForm();
    if (Object.keys(errors).length > 0) {
      setTplFormErrors(errors);
      return;
    }

    const payload = {
      titre: tplFormTitre.trim(),
      contenu: tplFormContenu.trim(),
      type_id: tplFormTypeId as number,
      actif: tplFormActif,
    };

    if (modal.type === "createTemplate") {
      createTemplateMutation.mutate(payload, {
        onSuccess: () => {
          toast.success(t("messages.templateCreated"));
          closeModal();
        },
        onError: (e: any) =>
          toast.error(e?.response?.data?.message ?? e.message),
      });
    } else if (modal.type === "editTemplate") {
      updateTemplateMutation.mutate(
        { id: modal.template.id, data: payload },
        {
          onSuccess: () => {
            toast.success(t("messages.templateUpdated"));
            closeModal();
          },
          onError: (e: any) =>
            toast.error(e?.response?.data?.message ?? e.message),
        },
      );
    }
  };

  const handleDeleteTemplate = () => {
    if (modal.type !== "deleteTemplate") return;
    deleteTemplateMutation.mutate(modal.template.id, {
      onSuccess: () => {
        toast.success(t("messages.templateDeleted"));
        closeModal();
      },
      onError: (e: any) =>
        toast.error(e?.response?.data?.message ?? e.message),
    });
  };

  // ── Toggle ──────────────────────────────────────────────────────────────────
  const handleToggle = (template: Template) => {
    toggleMutation.mutate(
      { id: template.id, actif: !template.actif },
      {
        onSuccess: () => {
          toast.success(
            template.actif
              ? t("messages.templateDeactivated")
              : t("messages.templateActivated"),
          );
        },
        onError: (e: any) =>
          toast.error(e?.response?.data?.message ?? e.message),
      },
    );
  };

  // ── Preview ─────────────────────────────────────────────────────────────────
  const handleGeneratePreview = () => {
    if (modal.type !== "preview") return;
    previewMutation.mutate(
      { id: modal.template.id, data: { manual_vars: previewVars } },
      {
        onSuccess: (result) => {
          setPreviewRendered(result.rendered);
        },
        onError: (e: any) =>
          toast.error(e?.response?.data?.message ?? e.message),
      },
    );
  };

  // ── Send ────────────────────────────────────────────────────────────────────
  const handleSend = () => {
    if (modal.type !== "send") return;
    const recipientId = parseInt(sendRecipientId, 10);
    if (!recipientId || isNaN(recipientId)) {
      setSendErrors({ recipientId: t("validation.recipientRequired") });
      return;
    }
    setSendErrors({});
    sendMutation.mutate(
      {
        id: modal.template.id,
        data: {
          destinataire_id: recipientId,
          manual_vars: sendManualVars,
          envoye_par_email: sendByEmail,
        },
      },
      {
        onSuccess: () => {
          toast.success(t("messages.messageSent"));
          closeModal();
        },
        onError: (e: any) =>
          toast.error(e?.response?.data?.message ?? e.message),
      },
    );
  };

  // ── JSX ─────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* PageHeader */}
      <PageHeader
        icon={<DocumentTextIcon className="h-8 w-8 text-blue-600" />}
        title={t("page.title")}
        description={t("page.description")}
        actions={
          isProfessorOrAdmin ? (
            <Button
              variant="primary"
              icon={<PlusIcon className="h-4 w-4" />}
              onClick={openCreateTemplate}
            >
              {t("list.newTemplate")}
            </Button>
          ) : undefined
        }
      />

      {/* ── Two-column layout ─────────────────────────────────────────────── */}
      <div className="flex gap-6 items-start">
        {/* ── Left panel: Template Types ─────────────────────────────────── */}
        <div className="w-64 flex-shrink-0 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
            <span className="text-sm font-semibold text-gray-700">
              {t("types.title")}
            </span>
            {isProfessorOrAdmin && (
              <button
                onClick={openCreateType}
                className="p-1 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                title={t("types.createType")}
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* "All" option */}
          <button
            onClick={() => setSelectedTypeId(null)}
            className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
              selectedTypeId === null
                ? "bg-blue-50 text-blue-700 font-medium"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span>{t("types.allTemplates")}</span>
            <span className="text-xs text-gray-400">
              {t("types.templatesCount", { count: templates.length })}
            </span>
          </button>

          {/* Type list */}
          {typesLoading ? (
            <div className="px-4 py-6 text-sm text-gray-400 text-center">
              {t("states.loading")}
            </div>
          ) : types.length === 0 ? (
            <div className="px-4 py-6 text-sm text-gray-400 text-center italic">
              {t("types.noTypes")}
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {types.map((typeItem) => (
                <li key={typeItem.id}>
                  <button
                    onClick={() => setSelectedTypeId(typeItem.id)}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors group ${
                      selectedTypeId === typeItem.id
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <TagIcon className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                        <span className="truncate">{typeItem.nom}</span>
                      </div>
                      {isProfessorOrAdmin && (
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditType(typeItem);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.stopPropagation();
                                openEditType(typeItem);
                              }
                            }}
                            className="p-0.5 rounded hover:text-indigo-600 hover:bg-indigo-50"
                            title={t("types.editType")}
                          >
                            <PencilIcon className="h-3 w-3" />
                          </span>
                          {isAdmin && (
                            <span
                              role="button"
                              tabIndex={0}
                              onClick={(e) => {
                                e.stopPropagation();
                                setModal({ type: "deleteType", typeItem });
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.stopPropagation();
                                  setModal({ type: "deleteType", typeItem });
                                }
                              }}
                              className="p-0.5 rounded hover:text-red-600 hover:bg-red-50"
                              title={t("types.deleteType")}
                            >
                              <TrashIcon className="h-3 w-3" />
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {typeItem.description && (
                      <p className="text-xs text-gray-400 truncate mt-0.5 pl-5">
                        {typeItem.description}
                      </p>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Right panel: Templates list ────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Filters bar */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4 flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-gray-600">
              {t("list.title")}
            </span>
            <div className="flex items-center gap-1 ml-auto">
              {(["all", "active", "inactive"] as ActiveFilter[]).map(
                (filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      activeFilter === filter
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    {filter === "all"
                      ? t("list.filterAll")
                      : filter === "active"
                        ? t("list.filterActive")
                        : t("list.filterInactive")}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Templates list */}
          {templatesLoading ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center text-sm text-gray-400">
              {t("states.loading")}
            </div>
          ) : templates.length === 0 ? (
            <EmptyState
              icon={<DocumentTextIcon />}
              title={t("list.noTemplates")}
              description={t("page.description")}
              variant="dashed"
              action={
                isProfessorOrAdmin
                  ? {
                      label: t("list.newTemplate"),
                      onClick: openCreateTemplate,
                    }
                  : undefined
              }
            />
          ) : (
            <div className="space-y-3">
              {templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  types={types}
                  onEdit={openEditTemplate}
                  onDelete={(tpl) =>
                    setModal({ type: "deleteTemplate", template: tpl })
                  }
                  onToggle={handleToggle}
                  onPreview={openPreview}
                  onSend={openSend}
                  isAdmin={isProfessorOrAdmin}
                  t={t}
                  isToggling={toggleMutation.isPending}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Modal: Create / Edit Type ──────────────────────────────────────── */}
      <Modal
        isOpen={modal.type === "createType" || modal.type === "editType"}
        onClose={closeModal}
        size="sm"
      >
        <Modal.Header
          title={
            modal.type === "editType"
              ? t("modal.editTypeTitle")
              : t("modal.createTypeTitle")
          }
          showCloseButton
          onClose={closeModal}
        />
        <Modal.Body>
          <div className="space-y-4">
            <FormField
              id="type-nom"
              label={t("form.typeName")}
              required
              error={typeFormErrors.nom}
            >
              <Input
                id="type-nom"
                type="text"
                value={typeFormNom}
                onChange={(e) => setTypeFormNom(e.target.value)}
                placeholder={t("form.typeNamePlaceholder")}
                autoFocus
                error={typeFormErrors.nom}
              />
            </FormField>
            <FormField id="type-description" label={t("form.typeDescription")}>
              <textarea
                id="type-description"
                rows={3}
                value={typeFormDescription}
                onChange={(e) => setTypeFormDescription(e.target.value)}
                placeholder={t("form.typeDescriptionPlaceholder")}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </FormField>
          </div>
        </Modal.Body>
        <Modal.Footer align="right">
          <Button
            variant="outline"
            onClick={closeModal}
            disabled={
              createTypeMutation.isPending || updateTypeMutation.isPending
            }
          >
            {t("actions.cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={handleTypeSubmit}
            loading={
              createTypeMutation.isPending || updateTypeMutation.isPending
            }
          >
            {t("actions.save")}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Modal: Delete Type confirm ─────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={modal.type === "deleteType"}
        onClose={closeModal}
        onConfirm={handleDeleteType}
        title={t("modal.deleteTypeTitle")}
        message={t("messages.deleteTypeConfirm")}
        variant="danger"
        confirmLabel={t("actions.delete")}
        cancelLabel={t("actions.cancel")}
        isLoading={deleteTypeMutation.isPending}
      />

      {/* ── Modal: Create / Edit Template ─────────────────────────────────── */}
      <Modal
        isOpen={
          modal.type === "createTemplate" || modal.type === "editTemplate"
        }
        onClose={closeModal}
        size="xl"
      >
        <Modal.Header
          title={
            modal.type === "editTemplate"
              ? t("modal.editTemplateTitle")
              : t("modal.createTemplateTitle")
          }
          showCloseButton
          onClose={closeModal}
        />
        <Modal.Body>
          <div className="space-y-4">
            {/* Type select */}
            <FormField
              id="tpl-type"
              label={t("form.templateType")}
              required
              error={tplFormErrors.type_id}
            >
              <select
                id="tpl-type"
                value={tplFormTypeId}
                onChange={(e) =>
                  setTplFormTypeId(
                    e.target.value ? parseInt(e.target.value, 10) : "",
                  )
                }
                className={`block w-full px-3 py-2 border rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${
                  tplFormErrors.type_id
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              >
                <option value="">{t("form.selectType")}</option>
                {types.map((typeItem) => (
                  <option key={typeItem.id} value={typeItem.id}>
                    {typeItem.nom}
                  </option>
                ))}
              </select>
              {tplFormErrors.type_id && (
                <p className="mt-1 text-xs text-red-500">
                  {tplFormErrors.type_id}
                </p>
              )}
            </FormField>

            {/* Titre */}
            <FormField
              id="tpl-titre"
              label={t("form.templateTitle")}
              required
              error={tplFormErrors.titre}
            >
              <Input
                id="tpl-titre"
                type="text"
                value={tplFormTitre}
                onChange={(e) => setTplFormTitre(e.target.value)}
                placeholder={t("form.templateTitlePlaceholder")}
                error={tplFormErrors.titre}
              />
            </FormField>

            {/* Contenu */}
            <FormField
              id="tpl-contenu"
              label={t("form.templateContent")}
              required
              error={tplFormErrors.contenu}
            >
              <textarea
                id="tpl-contenu"
                rows={8}
                value={tplFormContenu}
                onChange={(e) => setTplFormContenu(e.target.value)}
                placeholder={t("form.templateContentPlaceholder")}
                className={`block w-full px-3 py-2 border rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y font-mono ${
                  tplFormErrors.contenu ? "border-red-500" : "border-gray-300"
                }`}
              />
              {tplFormErrors.contenu && (
                <p className="mt-1 text-xs text-red-500">
                  {tplFormErrors.contenu}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-400">
                {t("form.variablesHelp")}
              </p>
            </FormField>

            {/* Active checkbox */}
            <div className="flex items-center gap-2">
              <input
                id="tpl-actif"
                type="checkbox"
                checked={tplFormActif}
                onChange={(e) => setTplFormActif(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="tpl-actif"
                className="text-sm font-medium text-gray-700"
              >
                {t("form.activeTemplate")}
              </label>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer align="right">
          <Button
            variant="outline"
            onClick={closeModal}
            disabled={
              createTemplateMutation.isPending ||
              updateTemplateMutation.isPending
            }
          >
            {t("actions.cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={handleTemplateSubmit}
            loading={
              createTemplateMutation.isPending ||
              updateTemplateMutation.isPending
            }
          >
            {t("actions.save")}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Modal: Delete Template confirm ────────────────────────────────── */}
      <ConfirmDialog
        isOpen={modal.type === "deleteTemplate"}
        onClose={closeModal}
        onConfirm={handleDeleteTemplate}
        title={t("modal.deleteTemplateTitle")}
        message={t("messages.deleteTemplateConfirm")}
        variant="danger"
        confirmLabel={t("actions.delete")}
        cancelLabel={t("actions.cancel")}
        isLoading={deleteTemplateMutation.isPending}
      />

      {/* ── Modal: Preview ─────────────────────────────────────────────────── */}
      <Modal
        isOpen={modal.type === "preview"}
        onClose={closeModal}
        size="2xl"
      >
        <Modal.Header
          title={t("modal.previewTitle")}
          subtitle={modal.type === "preview" ? modal.template.titre : ""}
          showCloseButton
          onClose={closeModal}
        />
        <Modal.Body>
          {modal.type === "preview" && (
            <div className="space-y-5">
              {/* Variable inputs */}
              {modal.template.variables.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    {t("preview.variablesToFill")}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {modal.template.variables.map((varName) => (
                      <div key={varName}>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          {"{{"}{varName}{"}}"}
                        </label>
                        <input
                          type="text"
                          value={previewVars[varName] ?? ""}
                          onChange={(e) =>
                            setPreviewVars((prev) => ({
                              ...prev,
                              [varName]: e.target.value,
                            }))
                          }
                          placeholder={t("preview.variablePlaceholder", {
                            variable: varName,
                          })}
                          className="block w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleGeneratePreview}
                      loading={previewMutation.isPending}
                    >
                      {t("preview.generatePreview")}
                    </Button>
                  </div>
                </div>
              )}

              {/* Rendered content */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  {t("preview.renderedContent")}
                </p>
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 min-h-[120px]">
                  {previewRendered ? (
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans">
                      {previewRendered}
                    </pre>
                  ) : (
                    <pre className="text-sm text-gray-400 whitespace-pre-wrap font-sans">
                      {modal.template.contenu}
                    </pre>
                  )}
                </div>
              </div>

              {/* Variables list */}
              {modal.template.variables.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-xs text-gray-500 font-medium">
                    {t("fields.variables")}:
                  </span>
                  {modal.template.variables.map((v) => (
                    <span
                      key={v}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono bg-blue-50 text-blue-700"
                    >
                      {"{{"}{v}{"}}"}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer align="right">
          {modal.type === "preview" &&
            modal.template.variables.length === 0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleGeneratePreview}
                loading={previewMutation.isPending}
              >
                {t("preview.generatePreview")}
              </Button>
            )}
          <Button variant="outline" onClick={closeModal}>
            {t("actions.close")}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Modal: Send ────────────────────────────────────────────────────── */}
      <Modal
        isOpen={modal.type === "send"}
        onClose={closeModal}
        size="lg"
      >
        <Modal.Header
          title={t("modal.sendTitle")}
          subtitle={modal.type === "send" ? modal.template.titre : ""}
          showCloseButton
          onClose={closeModal}
        />
        <Modal.Body>
          {modal.type === "send" && (
            <div className="space-y-4">
              {/* Recipient ID */}
              <FormField
                id="send-recipient"
                label={t("form.recipientId")}
                required
                error={sendErrors.recipientId}
              >
                <Input
                  id="send-recipient"
                  type="number"
                  value={sendRecipientId}
                  onChange={(e) => setSendRecipientId(e.target.value)}
                  placeholder="123"
                  autoFocus
                  error={sendErrors.recipientId}
                />
              </FormField>

              {/* Send by email checkbox */}
              <div className="flex items-center gap-2">
                <input
                  id="send-by-email"
                  type="checkbox"
                  checked={sendByEmail}
                  onChange={(e) => setSendByEmail(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="send-by-email"
                  className="text-sm font-medium text-gray-700"
                >
                  {t("form.sendByEmail")}
                </label>
              </div>

              {/* Manual vars */}
              {modal.template.variables.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    {t("preview.variablesToFill")}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {modal.template.variables.map((varName) => (
                      <div key={varName}>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          {"{{"}{varName}{"}}"}
                        </label>
                        <input
                          type="text"
                          value={sendManualVars[varName] ?? ""}
                          onChange={(e) =>
                            setSendManualVars((prev) => ({
                              ...prev,
                              [varName]: e.target.value,
                            }))
                          }
                          placeholder={t("preview.variablePlaceholder", {
                            variable: varName,
                          })}
                          className="block w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer align="right">
          <Button
            variant="outline"
            onClick={closeModal}
            disabled={sendMutation.isPending}
          >
            {t("actions.cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={handleSend}
            loading={sendMutation.isPending}
            icon={<PaperAirplaneIcon className="h-4 w-4" />}
          >
            {t("actions.send")}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

// ─── TemplateCard Sub-component ───────────────────────────────────────────────

interface TemplateCardProps {
  template: Template;
  types: TemplateType[];
  onEdit: (template: Template) => void;
  onDelete: (template: Template) => void;
  onToggle: (template: Template) => void;
  onPreview: (template: Template) => void;
  onSend: (template: Template) => void;
  isAdmin: boolean;
  t: (key: string, opts?: any) => string;
  isToggling: boolean;
}

function TemplateCard({
  template,
  types,
  onEdit,
  onDelete,
  onToggle,
  onPreview,
  onSend,
  isAdmin,
  t,
  isToggling,
}: TemplateCardProps) {
  const typeName =
    template.type_nom ??
    types.find((tp) => tp.id === template.type_id)?.nom ??
    `#${template.type_id}`;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
      {/* Left: content */}
      <div className="flex-1 min-w-0">
        {/* Title row */}
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {template.titre}
          </h3>
          {/* Active badge */}
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              template.actif
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {template.actif ? t("fields.active") : t("fields.inactive")}
          </span>
        </div>

        {/* Type badge */}
        <div className="flex items-center gap-1.5 mt-1">
          <TagIcon className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
          <span className="text-xs text-gray-500">{typeName}</span>
        </div>

        {/* Content preview */}
        <p className="mt-2 text-sm text-gray-500 line-clamp-2">
          {template.contenu}
        </p>

        {/* Variables + createdAt */}
        <div className="mt-2 flex items-center gap-3 flex-wrap">
          {template.variables.length > 0 ? (
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-xs text-gray-400">
                {t("fields.variables")}:
              </span>
              {template.variables.map((v) => (
                <span
                  key={v}
                  className="inline-flex items-center px-1.5 py-0 rounded text-xs font-mono bg-blue-50 text-blue-600"
                >
                  {"{{"}{v}{"}}"}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-xs text-gray-400 italic">
              {t("fields.noVariables")}
            </span>
          )}
          <span className="text-xs text-gray-300">|</span>
          <span className="text-xs text-gray-400">
            {t("fields.createdAt")}:{" "}
            {new Date(template.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* Preview */}
        <button
          onClick={() => onPreview(template)}
          className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          title={t("actions.preview")}
        >
          <EyeIcon className="h-4 w-4" />
        </button>

        {/* Send */}
        <button
          onClick={() => onSend(template)}
          className="p-1.5 rounded-md text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
          title={t("actions.send")}
        >
          <PaperAirplaneIcon className="h-4 w-4" />
        </button>

        {isAdmin && (
          <>
            {/* Toggle */}
            <button
              onClick={() => onToggle(template)}
              disabled={isToggling}
              className={`p-1.5 rounded-md transition-colors ${
                template.actif
                  ? "text-green-600 hover:text-gray-400 hover:bg-gray-50"
                  : "text-gray-400 hover:text-green-600 hover:bg-green-50"
              }`}
              title={t("actions.toggle")}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                {template.actif ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                  />
                )}
                {!template.actif && (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                )}
              </svg>
            </button>

            {/* Edit */}
            <button
              onClick={() => onEdit(template)}
              className="p-1.5 rounded-md text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              title={t("actions.edit")}
            >
              <PencilIcon className="h-4 w-4" />
            </button>

            {/* Delete */}
            <button
              onClick={() => onDelete(template)}
              className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title={t("actions.delete")}
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
