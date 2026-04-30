import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  UserGroupIcon,
  PencilIcon,
  TrashIcon,
  UsersIcon,
  PlusIcon,
  MagnifyingGlassIcon,
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
  useGroupsList,
  useCreateGroup,
  useUpdateGroup,
  useDeleteGroup,
  useGroupMembers,
  useAddGroupMember,
  useRemoveGroupMember,
} from "../hooks/useGroups";
import type {
  GroupWithCount,
  GroupMemberDto,
  GetGroupsParams,
} from "../api/groupsApi";
import type { CreateGroup, UpdateGroup } from "@clubmanager/types";

// ─── Modal State Machine ──────────────────────────────────────────────────────

type ModalState =
  | { type: "none" }
  | { type: "create" }
  | { type: "edit"; group: GroupWithCount }
  | { type: "delete"; group: GroupWithCount }
  | { type: "members"; group: GroupWithCount };

// ─── Component ────────────────────────────────────────────────────────────────

export function GroupsPage() {
  const { t } = useTranslation("groups");

  // ── Pagination & filters ────────────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState("");
  const [params, setParams] = useState<GetGroupsParams>({ page: 1, limit: 20 });

  // Debounce search input by 300ms before updating query params
  useEffect(() => {
    const timer = setTimeout(() => {
      setParams((p) => ({ ...p, page: 1, search: searchInput || undefined }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // ── Modal state ─────────────────────────────────────────────────────────────
  const [modal, setModal] = useState<ModalState>({ type: "none" });
  const closeModal = () => setModal({ type: "none" });

  // ── Form state (create/edit) ────────────────────────────────────────────────
  const [formNom, setFormNom] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formErrors, setFormErrors] = useState<{ nom?: string }>({});

  // ── Add member form state ───────────────────────────────────────────────────
  const [newMemberUserId, setNewMemberUserId] = useState("");

  // ── React Query ─────────────────────────────────────────────────────────────
  const { data, isLoading } = useGroupsList(params);
  const groups = data?.groups ?? [];
  const pagination = {
    page: data?.page ?? 1,
    total: data?.total ?? 0,
    limit: data?.limit ?? 20,
    totalPages: data?.totalPages ?? 1,
  };

  const membersGroupId = modal.type === "members" ? modal.group.id : null;
  const { data: members = [], isLoading: membersLoading } =
    useGroupMembers(membersGroupId);

  const createMutation = useCreateGroup();
  const updateMutation = useUpdateGroup();
  const deleteMutation = useDeleteGroup();
  const addMemberMutation = useAddGroupMember();
  const removeMemberMutation = useRemoveGroupMember();

  // ── Open modal helpers ──────────────────────────────────────────────────────
  const openCreate = () => {
    setFormNom("");
    setFormDescription("");
    setFormErrors({});
    setModal({ type: "create" });
  };

  const openEdit = (group: GroupWithCount) => {
    setFormNom(group.nom);
    setFormDescription(group.description ?? "");
    setFormErrors({});
    setModal({ type: "edit", group });
  };

  // ── Form validation ─────────────────────────────────────────────────────────
  const validateForm = () => {
    const errors: { nom?: string } = {};
    if (!formNom.trim()) errors.nom = t("validation.nameRequired");
    else if (formNom.trim().length < 2)
      errors.nom = t("validation.nameTooShort");
    else if (formNom.trim().length > 100)
      errors.nom = t("validation.nameTooLong");
    return errors;
  };

  // ── Submit create/edit ──────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const payload: CreateGroup & UpdateGroup = {
      nom: formNom.trim(),
      description: formDescription.trim() || undefined,
    };

    if (modal.type === "create") {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success(t("messages.success.created"));
          closeModal();
        },
        onError: (e: any) =>
          toast.error(
            e?.response?.data?.message ?? t("messages.error.createError"),
          ),
      });
    } else if (modal.type === "edit") {
      updateMutation.mutate(
        { id: modal.group.id, data: payload },
        {
          onSuccess: () => {
            toast.success(t("messages.success.updated"));
            closeModal();
          },
          onError: (e: any) =>
            toast.error(
              e?.response?.data?.message ?? t("messages.error.updateError"),
            ),
        },
      );
    }
  };

  // ── Delete confirm ──────────────────────────────────────────────────────────
  const handleDelete = () => {
    if (modal.type !== "delete") return;
    deleteMutation.mutate(modal.group.id, {
      onSuccess: () => {
        toast.success(t("messages.success.deleted"));
        closeModal();
      },
      onError: (e: any) =>
        toast.error(
          e?.response?.data?.message ?? t("messages.error.deleteError"),
        ),
    });
  };

  // ── Add member ──────────────────────────────────────────────────────────────
  const handleAddMember = () => {
    if (modal.type !== "members") return;
    const userId = parseInt(newMemberUserId, 10);
    if (!userId || isNaN(userId)) return;
    addMemberMutation.mutate(
      { groupId: modal.group.id, userId },
      {
        onSuccess: () => {
          toast.success(t("messages.success.memberAdded"));
          setNewMemberUserId("");
        },
        onError: (e: any) =>
          toast.error(
            e?.response?.data?.message ?? t("messages.error.memberAddError"),
          ),
      },
    );
  };

  // ── Remove member ───────────────────────────────────────────────────────────
  const handleRemoveMember = (userId: number) => {
    if (modal.type !== "members") return;
    removeMemberMutation.mutate(
      { groupId: modal.group.id, userId },
      {
        onSuccess: () => toast.success(t("messages.success.memberRemoved")),
        onError: (e: any) =>
          toast.error(
            e?.response?.data?.message ?? t("messages.error.memberRemoveError"),
          ),
      },
    );
  };

  // ── DataTable columns ───────────────────────────────────────────────────────
  const columns = [
    {
      key: "index",
      label: "#",
      render: (_: any, row: GroupWithCount) => (
        <span className="text-gray-500 text-sm">
          {(pagination.page - 1) * pagination.limit + groups.indexOf(row) + 1}
        </span>
      ),
    },
    {
      key: "nom",
      label: t("fields.name"),
      render: (_: any, row: GroupWithCount) => (
        <span className="font-medium text-gray-900">{row.nom}</span>
      ),
    },
    {
      key: "description",
      label: t("fields.description"),
      render: (_: any, row: GroupWithCount) => (
        <span className="text-gray-500 text-sm truncate max-w-xs block">
          {row.description ?? "—"}
        </span>
      ),
    },
    {
      key: "membre_count",
      label: t("fields.memberCount", { count: 0 }).replace("0 ", ""),
      render: (_: any, row: GroupWithCount) => (
        <span className="inline-flex items-center gap-1 text-sm text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
          <UsersIcon className="h-3.5 w-3.5" />
          {t("fields.memberCount", { count: row.membre_count })}
        </span>
      ),
    },
    {
      key: "created_at",
      label: t("fields.createdAt"),
      render: (_: any, row: GroupWithCount) => (
        <span className="text-gray-500 text-sm">
          {new Date(row.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (_: any, row: GroupWithCount) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => setModal({ type: "members", group: row })}
            className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title={t("aria.viewMembers", { name: row.nom })}
          >
            <UsersIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => openEdit(row)}
            className="p-1.5 rounded-md text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            title={t("aria.editGroup", { name: row.nom })}
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setModal({ type: "delete", group: row })}
            className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title={t("aria.deleteGroup", { name: row.nom })}
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  // ── JSX ─────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* PageHeader */}
      <PageHeader
        icon={<UserGroupIcon className="h-8 w-8 text-blue-600" />}
        title={t("page.title")}
        description={t("page.description")}
        actions={
          <Button
            variant="primary"
            icon={<PlusIcon className="h-4 w-4" />}
            onClick={openCreate}
          >
            {t("actions.create")}
          </Button>
        }
      />

      {/* Search bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <Input
          type="text"
          placeholder={t("placeholders.search")}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          iconLeft={<MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />}
          className="max-w-sm"
        />
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={groups}
        rowKey="id"
        loading={isLoading}
        emptyMessage={
          searchInput
            ? t("messages.empty.description")
            : t("messages.empty.noGroups")
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

      {/* ── Modal: Create / Edit ─────────────────────────────────────────────── */}
      <Modal
        isOpen={modal.type === "create" || modal.type === "edit"}
        onClose={closeModal}
        size="md"
      >
        <Modal.Header
          title={
            modal.type === "edit"
              ? t("modal.editTitle")
              : t("modal.createTitle")
          }
          subtitle={
            modal.type === "edit"
              ? t("modal.editSubtitle")
              : t("modal.createSubtitle")
          }
          showCloseButton
          onClose={closeModal}
        />
        <Modal.Body>
          <div className="space-y-5">
            <FormField
              id="group-nom"
              label={t("fields.name")}
              required
              error={formErrors.nom}
            >
              <Input
                id="group-nom"
                type="text"
                value={formNom}
                onChange={(e) => setFormNom(e.target.value)}
                placeholder={t("placeholders.name")}
                autoFocus
                error={formErrors.nom}
              />
            </FormField>
            <FormField id="group-description" label={t("fields.description")}>
              <textarea
                id="group-description"
                rows={3}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder={t("placeholders.description")}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </FormField>
          </div>
        </Modal.Body>
        <Modal.Footer align="right">
          <Button
            variant="outline"
            onClick={closeModal}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {t("actions.cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={createMutation.isPending || updateMutation.isPending}
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
        title={t("modal.deleteTitle")}
        message={
          modal.type === "delete"
            ? t("messages.confirm.deleteMessage", { name: modal.group.nom })
            : ""
        }
        variant="danger"
        confirmLabel={t("actions.delete")}
        cancelLabel={t("actions.cancel")}
        isLoading={deleteMutation.isPending}
      />

      {/* ── Modal: Members ────────────────────────────────────────────────────── */}
      <Modal isOpen={modal.type === "members"} onClose={closeModal} size="lg">
        <Modal.Header
          title={t("modal.membersTitle")}
          subtitle={
            modal.type === "members"
              ? t("modal.membersSubtitle", {
                  name: modal.group.nom,
                  count: modal.group.membre_count,
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
              placeholder={t("placeholders.userId")}
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
              {t("messages.empty.noGroups")}
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {members.map((m: GroupMemberDto) => (
                <li
                  key={m.user_id}
                  className="flex items-center justify-between py-2.5 px-1"
                >
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      {m.prenom} {m.nom}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      {m.email}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveMember(m.user_id)}
                    className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-md transition-colors"
                    disabled={removeMemberMutation.isPending}
                  >
                    {t("actions.removeMember")}
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

export default GroupsPage;
