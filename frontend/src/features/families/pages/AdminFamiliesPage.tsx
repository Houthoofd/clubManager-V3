import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  UsersIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { PageHeader } from "../../../shared/components/Layout/PageHeader";
import { DataTable } from "../../../shared/components/Table/DataTable";
import { PaginationBar } from "../../../shared/components/Navigation/PaginationBar";
import { Modal } from "../../../shared/components/Modal/Modal";
import { Button } from "../../../shared/components/Button/Button";
import { Input } from "../../../shared/components/Input/Input";
import { FormField } from "../../../shared/components/Forms/FormField";
import { ConfirmDialog } from "../../../shared/components/Modal/ConfirmDialog";

import {
  useFamiliesList,
  useUpdateFamily,
  useDeleteFamily,
  useFamilyMembers,
  useAdminAddFamilyMember,
  useAdminRemoveFamilyMember,
} from "../hooks/useFamilies";
import type {
  FamilyWithCount,
  FamilyMemberAdminDto,
  GetFamiliesParams,
} from "../api/familyApi";

// ─── Modal State Machine ──────────────────────────────────────────────────────

type ModalState =
  | { type: "none" }
  | { type: "edit"; family: FamilyWithCount }
  | { type: "delete"; family: FamilyWithCount }
  | { type: "members"; family: FamilyWithCount };

export interface AdminFamiliesPageProps {
  /**
   * Mode embarqué : masque le PageHeader et s'intègre dans un onglet parent.
   * Le contenu est rendu avec padding `p-6` sans carte blanche propre.
   * @default false
   */
  flat?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AdminFamiliesPage({ flat = false }: AdminFamiliesPageProps) {
  const { t } = useTranslation("families");

  // ── Pagination & filters ────────────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState("");
  const [params, setParams] = useState<GetFamiliesParams>({
    page: 1,
    limit: 20,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setParams((p) => ({ ...p, page: 1, search: searchInput || undefined }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // ── Modal state ─────────────────────────────────────────────────────────────
  const [modal, setModal] = useState<ModalState>({ type: "none" });
  const closeModal = () => setModal({ type: "none" });

  // ── Form state (rename) ─────────────────────────────────────────────────────
  const [formNom, setFormNom] = useState<string>("");
  const [formErrors, setFormErrors] = useState<{ nom?: string }>({});

  // ── Add member form state ───────────────────────────────────────────────────
  const [newMemberUserId, setNewMemberUserId] = useState("");

  // ── React Query ─────────────────────────────────────────────────────────────
  const { data, isLoading } = useFamiliesList(params);
  const families = data?.families ?? [];
  const pagination = {
    page: data?.pagination.page ?? 1,
    total: data?.pagination.total ?? 0,
    limit: data?.pagination.limit ?? 20,
    totalPages: data?.pagination.totalPages ?? 1,
  };

  const membersFamilyId = modal.type === "members" ? modal.family.id : null;
  const { data: members = [], isLoading: membersLoading } =
    useFamilyMembers(membersFamilyId);

  const updateMutation = useUpdateFamily();
  const deleteMutation = useDeleteFamily();
  const addMemberMutation = useAdminAddFamilyMember();
  const removeMemberMutation = useAdminRemoveFamilyMember();

  // ── Open modal helpers ──────────────────────────────────────────────────────
  const openEdit = (family: FamilyWithCount) => {
    setFormNom(family.nom ?? "");
    setFormErrors({});
    setModal({ type: "edit", family });
  };

  // ── Form validation ─────────────────────────────────────────────────────────
  const validateForm = () => {
    const errors: { nom?: string } = {};
    if (formNom.trim().length > 0 && formNom.trim().length < 2) {
      errors.nom = t("admin.validation.nameTooShort");
    }
    if (formNom.trim().length > 100) {
      errors.nom = t("admin.validation.nameTooLong");
    }
    return errors;
  };

  // ── Submit rename ───────────────────────────────────────────────────────────
  const handleSubmit = () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    if (modal.type !== "edit") return;
    const nom = formNom.trim() || null;
    updateMutation.mutate(
      { id: modal.family.id, nom },
      {
        onSuccess: () => {
          toast.success(t("admin.messages.success.updated"));
          closeModal();
        },
        onError: (e: any) =>
          toast.error(
            e?.response?.data?.message ?? t("admin.messages.error.updateError"),
          ),
      },
    );
  };

  // ── Delete confirm ──────────────────────────────────────────────────────────
  const handleDelete = () => {
    if (modal.type !== "delete") return;
    deleteMutation.mutate(modal.family.id, {
      onSuccess: () => {
        toast.success(t("admin.messages.success.deleted"));
        closeModal();
      },
      onError: (e: any) =>
        toast.error(
          e?.response?.data?.message ?? t("admin.messages.error.deleteError"),
        ),
    });
  };

  // ── Add member ──────────────────────────────────────────────────────────────
  const handleAddMember = () => {
    if (modal.type !== "members") return;
    const userId = parseInt(newMemberUserId, 10);
    if (!userId || isNaN(userId)) return;
    addMemberMutation.mutate(
      { familyId: modal.family.id, userId },
      {
        onSuccess: () => {
          toast.success(t("admin.messages.success.memberAdded"));
          setNewMemberUserId("");
        },
        onError: (e: any) =>
          toast.error(
            e?.response?.data?.message ??
              t("admin.messages.error.memberAddError"),
          ),
      },
    );
  };

  // ── Remove member ───────────────────────────────────────────────────────────
  const handleRemoveMember = (userId: number) => {
    if (modal.type !== "members") return;
    removeMemberMutation.mutate(
      { familyId: modal.family.id, userId },
      {
        onSuccess: () =>
          toast.success(t("admin.messages.success.memberRemoved")),
        onError: (e: any) =>
          toast.error(
            e?.response?.data?.message ??
              t("admin.messages.error.memberRemoveError"),
          ),
      },
    );
  };

  // ── DataTable columns ───────────────────────────────────────────────────────
  const columns = [
    {
      key: "index",
      label: "#",
      render: (_: any, row: FamilyWithCount) => (
        <span className="text-gray-500 text-sm">
          {(pagination.page - 1) * pagination.limit + families.indexOf(row) + 1}
        </span>
      ),
    },
    {
      key: "nom",
      label: t("admin.fields.name"),
      render: (_: any, row: FamilyWithCount) => (
        <span className="font-medium text-gray-900">
          {row.nom ?? (
            <span className="text-gray-400 italic">
              {t("admin.fields.unnamed", { id: row.id })}
            </span>
          )}
        </span>
      ),
    },
    {
      key: "membre_count",
      label: t("admin.fields.memberCount"),
      render: (_: any, row: FamilyWithCount) => (
        <span className="inline-flex items-center gap-1 text-sm text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
          <UsersIcon className="h-3.5 w-3.5" />
          {t("fields.memberCount", { count: row.membre_count })}
        </span>
      ),
    },
    {
      key: "created_at",
      label: t("admin.fields.createdAt"),
      render: (_: any, row: FamilyWithCount) => (
        <span className="text-gray-500 text-sm">
          {new Date(row.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (_: any, row: FamilyWithCount) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => setModal({ type: "members", family: row })}
            className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title={t("admin.aria.viewMembers", { id: row.id })}
          >
            <UsersIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => openEdit(row)}
            className="p-1.5 rounded-md text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            title={t("admin.aria.editFamily", { id: row.id })}
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setModal({ type: "delete", family: row })}
            className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title={t("admin.aria.deleteFamily", { id: row.id })}
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  // Helper to get family display name
  const getFamilyDisplayName = (family: FamilyWithCount) =>
    family.nom ?? t("admin.fields.unnamed", { id: family.id });

  // ── JSX ─────────────────────────────────────────────────────────────────────
  return (
    <div className={flat ? "" : "space-y-6"}>
      {/* PageHeader — masqué en mode flat (onglet embarqué) */}
      {!flat && (
        <PageHeader
          icon={<UserGroupIcon className="h-8 w-8 text-blue-600" />}
          title={t("admin.page.title")}
          description={t("admin.page.description")}
        />
      )}

      {/* Contenu principal */}
      <div className={flat ? "p-6 space-y-4" : "space-y-6"}>
        {/* Search bar */}
        {flat ? (
          <Input
            type="text"
            placeholder={t("admin.placeholders.search")}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            iconLeft={<MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />}
            className="max-w-sm"
          />
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <Input
              type="text"
              placeholder={t("admin.placeholders.search")}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              iconLeft={
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
              }
              className="max-w-sm"
            />
          </div>
        )}

        {/* DataTable */}
        <DataTable
          columns={columns}
          data={families}
          rowKey="id"
          loading={isLoading}
          emptyMessage={
            searchInput
              ? t("admin.messages.empty.description")
              : t("admin.messages.empty.noFamilies")
          }
        />

        {/* Pagination */}
        {!isLoading && pagination.totalPages > 1 && (
          <PaginationBar
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={(p) => setParams((prev) => ({ ...prev, page: p }))}
            showResultsCount
            total={pagination.total}
            pageSize={pagination.limit}
          />
        )}
      </div>

      {/* ── Modal: Rename ──────────────────────────────────────────────────────── */}
      <Modal isOpen={modal.type === "edit"} onClose={closeModal} size="md">
        <Modal.Header
          title={t("admin.modal.editTitle")}
          subtitle={
            modal.type === "edit"
              ? t("admin.modal.editSubtitle", {
                  name: getFamilyDisplayName(modal.family),
                })
              : ""
          }
          showCloseButton
          onClose={closeModal}
        />
        <Modal.Body>
          <div className="space-y-5">
            <FormField
              id="family-nom"
              label={t("admin.fields.name")}
              error={formErrors.nom}
            >
              <Input
                id="family-nom"
                type="text"
                value={formNom}
                onChange={(e) => setFormNom(e.target.value)}
                placeholder={t("admin.placeholders.name")}
                autoFocus
                error={formErrors.nom}
              />
            </FormField>
            <p className="text-xs text-gray-400">{t("admin.modal.editHint")}</p>
          </div>
        </Modal.Body>
        <Modal.Footer align="right">
          <Button
            variant="outline"
            onClick={closeModal}
            disabled={updateMutation.isPending}
          >
            {t("actions.cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={updateMutation.isPending}
          >
            {t("actions.save")}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Modal: Delete confirm ─────────────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={modal.type === "delete"}
        onClose={closeModal}
        onConfirm={handleDelete}
        title={t("admin.modal.deleteTitle")}
        message={
          modal.type === "delete"
            ? t("admin.messages.confirm.deleteMessage", {
                name: getFamilyDisplayName(modal.family),
              })
            : ""
        }
        variant="danger"
        confirmLabel={t("actions.confirm")}
        cancelLabel={t("actions.cancel")}
        isLoading={deleteMutation.isPending}
      />

      {/* ── Modal: Members ────────────────────────────────────────────────────── */}
      <Modal isOpen={modal.type === "members"} onClose={closeModal} size="lg">
        <Modal.Header
          title={t("admin.modal.membersTitle")}
          subtitle={
            modal.type === "members"
              ? t("admin.modal.membersSubtitle", {
                  name: getFamilyDisplayName(modal.family),
                  count: modal.family.membre_count,
                })
              : ""
          }
          showCloseButton
          onClose={closeModal}
        />
        <Modal.Body>
          {/* Add member row */}
          <div className="flex gap-2 mb-4">
            <Input
              type="number"
              value={newMemberUserId}
              onChange={(e) => setNewMemberUserId(e.target.value)}
              placeholder={t("admin.placeholders.userId")}
              className="w-40"
            />
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddMember}
              loading={addMemberMutation.isPending}
              disabled={!newMemberUserId}
            >
              {t("actions.addMember")}
            </Button>
          </div>

          {/* Members list */}
          {membersLoading ? (
            <p className="text-sm text-gray-500">{t("states.loading")}</p>
          ) : members.length === 0 ? (
            <p className="text-sm text-gray-400 italic">
              {t("admin.messages.empty.noMembers")}
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {(members as FamilyMemberAdminDto[]).map((m) => (
                <li
                  key={m.user_id}
                  className="flex items-center justify-between py-2.5 px-1"
                >
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      {m.user.first_name} {m.user.last_name}
                    </span>
                    <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                      {t(`roles.${m.role}` as any)}
                    </span>
                    {m.est_responsable && (
                      <span className="ml-1 text-xs text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        {t("badges.responsible")}
                      </span>
                    )}
                    {m.est_tuteur_legal && (
                      <span className="ml-1 text-xs text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                        {t("badges.legalGuardian")}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveMember(m.user_id)}
                    className="p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    disabled={removeMemberMutation.isPending}
                    title={t("admin.aria.removeMember", {
                      name: `${m.user.first_name} ${m.user.last_name}`,
                    })}
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Modal.Body>
        <Modal.Footer align="right">
          <Button variant="outline" onClick={closeModal}>
            {t("actions.cancel")}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
