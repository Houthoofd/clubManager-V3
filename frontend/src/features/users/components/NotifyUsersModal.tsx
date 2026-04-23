/**
 * NotifyUsersModal.tsx
 * Modal pour envoyer une notification groupée aux membres non-conformes
 * Suit le même pattern shell que ComposeModal (backdrop + container centré + modal box)
 */

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import type { UserListItemDto } from "@clubmanager/types";
import { getUsers, notifyBulkUsers } from "../api/usersApi";

// ─── Inline SVG Icons ─────────────────────────────────────────────────────────

const BellAlertIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0M3.124 7.5A8.969 8.969 0 015.292 3m13.416 0a8.969 8.969 0 012.168 4.5"
    />
  </svg>
);

const UsersIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
    />
  </svg>
);

const PencilSquareIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
    />
  </svg>
);

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const InformationCircleIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
    />
  </svg>
);

const SpinnerIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
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
);

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

const ChevronUpIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
  </svg>
);

// ─── Types & Constants ────────────────────────────────────────────────────────

type Step = "select" | "compose" | "confirm";

interface StatusGroup {
  key: string;
  label: string;
  statusId: number;
  description: string;
}

const getStatusGroups = (t: any): StatusGroup[] => [
  {
    key: "inactive",
    label: t("notify.statusGroups.inactive"),
    statusId: 2,
    description: t("notify.statusGroups.inactiveDesc"),
  },
  {
    key: "suspended",
    label: t("notify.statusGroups.suspended"),
    statusId: 3,
    description: t("notify.statusGroups.suspendedDesc"),
  },
  {
    key: "pending",
    label: t("notify.statusGroups.pending"),
    statusId: 4,
    description: t("notify.statusGroups.pendingDesc"),
  },
];

const getStepMeta = (t: any) => [
  { id: "select" as Step, label: t("notify.steps.recipients"), number: 1 },
  { id: "compose" as Step, label: t("notify.steps.message"), number: 2 },
  { id: "confirm" as Step, label: t("notify.steps.confirm"), number: 3 },
];

interface NotifyUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const NotifyUsersModal: React.FC<NotifyUsersModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation("users");

  // ── Dynamic constants with i18n ───────────────────────────────────────────
  const STATUS_GROUPS = getStatusGroups(t);
  const STEP_META = getStepMeta(t);

  // ── Step & loading ────────────────────────────────────────────────────────
  const [step, setStep] = useState<Step>("select");
  const [isSending, setIsSending] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // ── Step 1 state ──────────────────────────────────────────────────────────
  const [allUsers, setAllUsers] = useState<UserListItemDto[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(
    new Set(),
  );
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // ── Step 2 state ──────────────────────────────────────────────────────────
  const [sujet, setSujet] = useState("");
  const [contenu, setContenu] = useState("");
  const [envoyeParEmail, setEnvoyeParEmail] = useState(false);
  const [contenuError, setContenuError] = useState("");

  // ── Derived ───────────────────────────────────────────────────────────────

  const groupedUsers = useMemo(() => {
    const result: Record<string, UserListItemDto[]> = {};
    STATUS_GROUPS.forEach((g) => {
      result[g.key] = allUsers.filter((u) => u.status_id === g.statusId);
    });
    return result;
  }, [allUsers]);

  const selectedCount = selectedUserIds.size;

  const allGroupsEmpty = STATUS_GROUPS.every(
    (g) => (groupedUsers[g.key] ?? []).length === 0,
  );

  const currentStepIndex = STEP_META.findIndex((s) => s.id === step);

  // ── Reset on open ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    setStep("select");
    setIsSending(false);
    setAllUsers([]);
    setSelectedUserIds(new Set());
    setExpandedGroups(new Set());
    setSujet("");
    setContenu("");
    setEnvoyeParEmail(false);
    setContenuError("");

    // Load users
    const load = async () => {
      setIsLoadingUsers(true);
      try {
        const result = await getUsers({ page: 1, limit: 200 });
        setAllUsers(result.users);
      } catch {
        toast.error(t("common:errors.loadUsers"));
      } finally {
        setIsLoadingUsers(false);
      }
    };

    load();
  }, [isOpen]);

  // ── Escape key ────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSending) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSending, onClose]);

  // ── Step 1 handlers ───────────────────────────────────────────────────────

  const toggleGroupSelection = (groupKey: string) => {
    const groupUsers = groupedUsers[groupKey] ?? [];
    const allSelected = groupUsers.every((u) => selectedUserIds.has(u.id));

    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        groupUsers.forEach((u) => next.delete(u.id));
      } else {
        groupUsers.forEach((u) => next.add(u.id));
      }
      return next;
    });
  };

  const toggleGroupExpanded = (groupKey: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupKey)) {
        next.delete(groupKey);
      } else {
        next.add(groupKey);
      }
      return next;
    });
  };

  // ── Navigation ────────────────────────────────────────────────────────────

  const handleNext = () => {
    if (step === "select") {
      setStep("compose");
    } else if (step === "compose") {
      if (!contenu.trim()) {
        setContenuError("Le contenu du message est obligatoire.");
        return;
      }
      setStep("confirm");
    }
  };

  const handleBack = () => {
    if (step === "compose") setStep("select");
    else if (step === "confirm") setStep("compose");
  };

  // ── Send ──────────────────────────────────────────────────────────────────

  const handleSend = async () => {
    setIsSending(true);
    try {
      const result = await notifyBulkUsers({
        user_ids: Array.from(selectedUserIds),
        sujet: sujet.trim() || undefined,
        contenu: contenu.trim(),
        envoye_par_email: envoyeParEmail,
      });
      toast.success(t("notify.notificationsSent", { count: result.sent }), {
        description:
          result.errors > 0
            ? t("notify.errorsIgnored", { count: result.errors })
            : undefined,
      });
      onClose();
    } catch {
      toast.error(t("common:errors.sendError"));
    } finally {
      setIsSending(false);
    }
  };

  // ── Guard ─────────────────────────────────────────────────────────────────
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-50 transition-opacity"
        onClick={!isSending ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notify-users-modal-title"
      >
        <div
          className="bg-white rounded-xl shadow-2xl w-full max-w-xl flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <h2
              id="notify-users-modal-title"
              className="text-lg font-semibold text-gray-900 flex items-center gap-2"
            >
              <BellAlertIcon className="w-5 h-5 text-blue-600" />
              {t("notify.title")}
            </h2>
            <button
              type="button"
              onClick={onClose}
              disabled={isSending}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={t("notify.close")}
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

          {/* ── Scrollable body ── */}
          <div className="flex flex-col flex-1 overflow-y-auto">
            <div className="px-6 py-5 space-y-6">
              {/* ── Step indicator ── */}
              <div className="flex items-start justify-center">
                {STEP_META.map((s, idx) => {
                  const isDone = idx < currentStepIndex;
                  const isActive = idx === currentStepIndex;
                  const isLast = idx === STEP_META.length - 1;

                  return (
                    <div key={s.id} className="flex items-start">
                      {/* Circle + label */}
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className={[
                            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 transition-colors",
                            isDone
                              ? "bg-green-500 text-white"
                              : isActive
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-400 border-2 border-gray-200",
                          ].join(" ")}
                        >
                          {isDone ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={3}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          ) : (
                            s.number
                          )}
                        </div>
                        <span
                          className={[
                            "text-xs font-medium whitespace-nowrap",
                            isActive
                              ? "text-blue-600"
                              : isDone
                                ? "text-green-600"
                                : "text-gray-400",
                          ].join(" ")}
                        >
                          {s.label}
                        </span>
                      </div>

                      {/* Connector line */}
                      {!isLast && (
                        <div
                          className={[
                            "w-16 h-0.5 mx-2 mt-4 flex-shrink-0",
                            idx < currentStepIndex
                              ? "bg-green-400"
                              : "bg-gray-200",
                          ].join(" ")}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* ══ Step 1: Select recipients ══ */}
              {step === "select" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <UsersIcon className="w-4 h-4 text-gray-500" />
                    {t("notify.selectRecipients")}
                  </h3>

                  {isLoadingUsers ? (
                    <div className="flex items-center justify-center gap-2 py-10 text-gray-400 text-sm">
                      <SpinnerIcon className="w-5 h-5 animate-spin" />
                      {t("notify.loadingUsers")}
                    </div>
                  ) : allGroupsEmpty ? (
                    <div className="flex items-center justify-center py-10 text-gray-400 text-sm">
                      {t("notify.noUsersFound")}
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3">
                        {STATUS_GROUPS.map((group) => {
                          const groupUsers = groupedUsers[group.key] ?? [];
                          const isEmpty = groupUsers.length === 0;
                          const allChecked =
                            !isEmpty &&
                            groupUsers.every((u) => selectedUserIds.has(u.id));
                          const someChecked =
                            !isEmpty &&
                            groupUsers.some((u) => selectedUserIds.has(u.id));
                          const isExpanded = expandedGroups.has(group.key);

                          return (
                            <div
                              key={group.key}
                              className={[
                                "rounded-lg border p-4 transition-colors",
                                isEmpty
                                  ? "border-gray-100 bg-gray-50 opacity-50"
                                  : allChecked
                                    ? "border-blue-200 bg-blue-50/40"
                                    : "border-gray-200 bg-white",
                              ].join(" ")}
                            >
                              <div className="flex items-start gap-3">
                                <input
                                  type="checkbox"
                                  checked={allChecked}
                                  ref={(el: HTMLInputElement | null) => {
                                    if (el)
                                      el.indeterminate =
                                        someChecked && !allChecked;
                                  }}
                                  onChange={() =>
                                    !isEmpty && toggleGroupSelection(group.key)
                                  }
                                  disabled={isEmpty}
                                  className="mt-0.5 w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <p className="text-sm font-medium text-gray-900">
                                      {group.label}
                                    </p>
                                    <span
                                      className={[
                                        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0",
                                        isEmpty
                                          ? "bg-gray-100 text-gray-400"
                                          : "bg-blue-100 text-blue-700",
                                      ].join(" ")}
                                    >
                                      {t("notify.memberCount", {
                                        count: groupUsers.length,
                                      })}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    {group.description}
                                  </p>

                                  {!isEmpty && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        toggleGroupExpanded(group.key)
                                      }
                                      className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                                    >
                                      {isExpanded ? (
                                        <>
                                          <ChevronUpIcon className="w-3 h-3" />
                                          {t("notify.hideMembers")}
                                        </>
                                      ) : (
                                        <>
                                          <ChevronDownIcon className="w-3 h-3" />
                                          {t("notify.showMembers")}
                                        </>
                                      )}
                                    </button>
                                  )}

                                  {isExpanded && !isEmpty && (
                                    <ul className="mt-2 space-y-1 pl-1">
                                      {groupUsers.map((u) => (
                                        <li
                                          key={u.id}
                                          className="text-xs text-gray-600 flex items-center gap-2"
                                        >
                                          <span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                                          <span>
                                            {u.first_name} {u.last_name}
                                          </span>
                                          <span className="text-gray-400 truncate">
                                            ({u.email})
                                          </span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <p className="text-sm text-gray-600 font-medium">
                        {t("notify.selectedCount", { count: selectedCount })}
                      </p>
                    </>
                  )}
                </div>
              )}

              {/* ══ Step 2: Compose ══ */}
              {step === "compose" && (
                <div className="space-y-5">
                  <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <PencilSquareIcon className="w-4 h-4 text-gray-500" />
                    {t("notify.composeMessage")}
                  </h3>

                  {/* Sujet */}
                  <div>
                    <label
                      htmlFor="nu-sujet"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      {t("notify.subject")}{" "}
                      <span className="text-gray-400 font-normal">
                        {t("notify.subjectOptional")}
                      </span>
                    </label>
                    <input
                      id="nu-sujet"
                      type="text"
                      value={sujet}
                      onChange={(e) => setSujet(e.target.value)}
                      placeholder={t("notify.subjectPlaceholder")}
                      maxLength={200}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors"
                    />
                  </div>

                  {/* Contenu */}
                  <div>
                    <label
                      htmlFor="nu-contenu"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      {t("notify.message")}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="nu-contenu"
                      value={contenu}
                      onChange={(e) => {
                        setContenu(e.target.value);
                        if (contenuError) setContenuError("");
                      }}
                      placeholder={t("notify.messagePlaceholder")}
                      rows={6}
                      className={[
                        "w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-y min-h-[140px]",
                        contenuError
                          ? "border-red-300 focus:ring-red-200 bg-red-50"
                          : "border-gray-300 focus:ring-blue-200 focus:border-blue-400",
                      ].join(" ")}
                    />
                    {contenuError && (
                      <p className="mt-1 text-xs text-red-600">
                        {contenuError}
                      </p>
                    )}
                  </div>

                  {/* Email toggle */}
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={envoyeParEmail}
                      onChange={(e) => setEnvoyeParEmail(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                      {t("notify.sendByEmail")}
                    </span>
                  </label>

                  {/* Email info note */}
                  {envoyeParEmail && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-100">
                      <InformationCircleIcon className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-700 leading-relaxed">
                        {t("notify.emailInfo")}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ══ Step 3: Confirm ══ */}
              {step === "confirm" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-gray-500" />
                    {t("notify.confirmAndSend")}
                  </h3>

                  {/* Summary card */}
                  <div className="rounded-lg border border-gray-200 bg-gray-50 overflow-hidden divide-y divide-gray-200">
                    {/* Destinataires */}
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-sm text-gray-600">
                        {t("notify.recipients")}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {t("notify.memberCount", { count: selectedCount })}
                      </span>
                    </div>

                    {/* Email */}
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-sm text-gray-600">
                        {t("notify.sendByEmailLabel")}
                      </span>
                      <span
                        className={[
                          "text-sm font-semibold",
                          envoyeParEmail ? "text-green-600" : "text-gray-500",
                        ].join(" ")}
                      >
                        {envoyeParEmail ? t("notify.yes") : t("notify.no")}
                      </span>
                    </div>

                    {/* Sujet */}
                    {sujet.trim() && (
                      <div className="px-4 py-3">
                        <p className="text-xs text-gray-500 mb-1">
                          {t("notify.subjectLabel")}
                        </p>
                        <p className="text-sm text-gray-900 font-medium">
                          {sujet}
                        </p>
                      </div>
                    )}

                    {/* Contenu preview */}
                    <div className="px-4 py-3">
                      <p className="text-xs text-gray-500 mb-1">
                        {t("notify.messageLabel")}
                      </p>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                        {contenu.length > 300
                          ? `${contenu.slice(0, 300)}\u2026`
                          : contenu}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-200 flex-shrink-0 bg-gray-50 rounded-b-xl">
            {/* Left: Back button */}
            <div>
              {step !== "select" && (
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={isSending}
                  className="px-4 py-2 text-sm font-medium bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("notify.back")}
                </button>
              )}
            </div>

            {/* Right: Cancel + primary action */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSending}
                className="px-4 py-2 text-sm font-medium bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("notify.cancel")}
              </button>

              {step !== "confirm" ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={step === "select" && selectedCount === 0}
                  className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1"
                >
                  {t("notify.next")}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={isSending}
                  className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-1"
                >
                  {isSending ? (
                    <>
                      <SpinnerIcon className="w-4 h-4 animate-spin" />
                      {t("notify.sending")}
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-4 h-4" />
                      {t("notify.send")}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
