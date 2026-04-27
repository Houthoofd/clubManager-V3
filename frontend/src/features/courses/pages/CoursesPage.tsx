/**
 * CoursesPage - Version migrée avec design system partagé
 * Page principale de gestion des cours.
 * Onglets : Planning hebdomadaire récurrent, Séances (instances), Professeurs.
 *
 * COMPOSANTS RÉUTILISABLES UTILISÉS :
 * - PageHeader : En-tête de page avec icône et description
 * - TabGroup : Navigation par onglets avec scroll
 * - LoadingSpinner : Indicateurs de chargement centrés
 * - EmptyState : États vides avec icône et message
 * - Badge.Status : Badges de statut (actif/inactif/annulé)
 * - ConfirmDialog : Dialogue de confirmation de suppression
 * - Modal : Modals standardisées
 * - Input : Composants de formulaire standardisés
 * - Button / SubmitButton : Boutons standardisés
 */

import { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useTypesCours } from "../../../shared/hooks/useReferences";
import type { TypeCours } from "../../../shared/hooks/useReferences";
import {
  CalendarIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ClipboardDocumentIcon,
  SparklesIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { useCourses } from "../hooks/useCourses";
import { useAuth } from "../../../shared/hooks/useAuth";
import { PageHeader } from "../../../shared/components/Layout/PageHeader";
import { TabGroup } from "../../../shared/components/Navigation/TabGroup";
import { LoadingSpinner } from "../../../shared/components/Layout/LoadingSpinner";
import { EmptyState } from "../../../shared/components/Layout/EmptyState";
import { Badge } from "../../../shared/components/Badge";
import { AlertBanner } from "../../../shared/components/Feedback/AlertBanner";
import { ConfirmDialog } from "../../../shared/components/Modal/ConfirmDialog";
import { Button } from "../../../shared/components/Button/Button";
import { Input } from "../../../shared/components/Input/Input";
import { DataTable } from "../../../shared/components/Table/DataTable";
import {
  CreateEditCourseRecurrentModal,
  CreateProfessorModal,
  GenerateCoursesModal,
  CreateSessionModal,
  AttendanceModal,
} from "../components/modals";
import type {
  CourseRecurrentListItemDto,
  ProfessorListItemDto,
  CourseListItemDto,
} from "@clubmanager/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS_KEYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId = "planning" | "sessions" | "professeurs";

type ModalState =
  | { type: "none" }
  | { type: "createCourseRecurrent" }
  | { type: "editCourseRecurrent"; item: CourseRecurrentListItemDto }
  | { type: "deleteCourseRecurrent"; item: CourseRecurrentListItemDto }
  | { type: "createProfessor" }
  | { type: "editProfessor"; professor: ProfessorListItemDto }
  | { type: "createSession" }
  | { type: "generateCourses" }
  | { type: "attendance"; session: CourseListItemDto };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const datePart = dateStr.split("T")[0] ?? "";
  const parts = datePart.split("-");
  const yyyy = parts[0] ?? "";
  const mm = parts[1] ?? "";
  const dd = parts[2] ?? "";
  return `${dd}/${mm}/${yyyy}`;
}

function formatTime(timeStr: string): string {
  return timeStr.slice(0, 5);
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function CoursesPage() {
  const { t, i18n } = useTranslation("courses");
  const typesCours: TypeCours[] = useTypesCours();
  const { user } = useAuth();
  const isAdmin = user?.role_app === "admin";

  const [activeTab, setActiveTab] = useState<TabId>("planning");
  const [modal, setModal] = useState<ModalState>({ type: "none" });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [attendanceCourseId, setAttendanceCourseId] = useState<number | null>(
    null,
  );

  const {
    planning,
    planningLoading,
    planningError,
    professors,
    professorsLoading,
    sessions,
    sessionsLoading,
    sessionsError,
    sessionFilters,
    attendanceSheet,
    attendanceLoading,
    bulkUpdatePresence,
    createCourseRecurrent,
    updateCourseRecurrent,
    deleteCourseRecurrent,
    createProfessor,
    updateProfessor,
    createSession,
    generateSessions,
    setSessionFilter,
    clearError,
  } = useCourses({ attendanceCourseId });

  // ─────────────────────────────────────────────────────────────────
  // Filtres & tri
  // ─────────────────────────────────────────────────────────────────

  const uniqueTypes = [...new Set(sessions.map((s) => s.type_cours))].sort();
  const filterTypes = typesCours.length > 0 ? typesCours : null;

  const handleConfirmDelete = async () => {
    if (modal.type !== "deleteCourseRecurrent") return;
    setDeleteLoading(true);
    try {
      await deleteCourseRecurrent(modal.item.id);
      toast.success(t("messages.success.recurrentCourseDeleted"));
      setModal({ type: "none" });
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? t("messages.error.generic"));
    } finally {
      setDeleteLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // Tabs
  // ─────────────────────────────────────────────────────────────────

  const tabs = [
    {
      id: "planning" as const,
      label: t("tabs.planning"),
      icon: <CalendarIcon className="h-5 w-5" />,
    },
    {
      id: "sessions" as const,
      label: t("tabs.sessions"),
      icon: <ClipboardDocumentIcon className="h-5 w-5" />,
    },
    {
      id: "professeurs" as const,
      label: t("tabs.professors"),
      icon: <EnvelopeIcon className="h-5 w-5" />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("page.title")}
        description={t("page.description")}
        icon={<CalendarIcon className="h-8 w-8" />}
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <TabGroup
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(id) => setActiveTab(id as TabId)}
        />

        {/* ──────────────────────────────── TAB 1 : Planning récurrent */}
        {activeTab === "planning" && (
          <div className="p-6 space-y-6">
            {isAdmin && (
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="primary"
                  size="md"
                  icon={<PlusIcon className="h-5 w-5" />}
                  onClick={() => setModal({ type: "createCourseRecurrent" })}
                >
                  {t("buttons.newRecurrentCourse")}
                </Button>
                {planning.length > 0 && (
                  <Button
                    variant="outline"
                    size="md"
                    icon={<SparklesIcon className="h-5 w-5" />}
                    onClick={() => setModal({ type: "generateCourses" })}
                  >
                    {t("buttons.generateSessions")}
                  </Button>
                )}
              </div>
            )}

            {planningError && (
              <AlertBanner
                variant="danger"
                message={planningError}
                dismissible
                onDismiss={clearError}
              />
            )}

            {planningLoading ? (
              <LoadingSpinner size="lg" text={t("loading.planning")} />
            ) : planning.length === 0 ? (
              <EmptyState
                icon={<CalendarIcon className="h-12 w-12" />}
                title={t("empty.noRecurrentCourses")}
                description={t("empty.noRecurrentCoursesDescription")}
                action={
                  isAdmin
                    ? {
                        label: t("empty.noRecurrentCoursesAction"),
                        onClick: () =>
                          setModal({ type: "createCourseRecurrent" }),
                      }
                    : undefined
                }
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {DAYS_KEYS.map((dayKey, idx) => {
                  const dayNum = idx + 1;
                  const dayCourses = planning
                    .filter((c) => c.jour_semaine === dayNum)
                    .sort(
                      (a, b) =>
                        a.heure_debut.localeCompare(b.heure_debut) ||
                        a.heure_fin.localeCompare(b.heure_fin),
                    );

                  return (
                    <div
                      key={dayKey}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                          {t(`days.${dayKey}`)}
                        </h3>
                      </div>
                      <div className="p-3 space-y-2.5">
                        {dayCourses.length === 0 ? (
                          <p className="text-xs text-gray-400 text-center py-2">
                            {t("empty.noCourse")}
                          </p>
                        ) : (
                          dayCourses.map((course) => (
                            <div
                              key={course.id}
                              className={`relative px-3 py-3 border rounded-lg text-sm ${
                                course.active
                                  ? "border-blue-200 bg-blue-50"
                                  : "border-gray-200 bg-gray-50"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2 mb-1.5">
                                <p
                                  className={`font-semibold leading-tight ${
                                    course.active
                                      ? "text-blue-900"
                                      : "text-gray-600"
                                  }`}
                                >
                                  {course.type_cours}
                                </p>
                                <Badge.Status
                                  status={course.active ? "active" : "inactive"}
                                />
                              </div>

                              <p className="text-xs text-gray-600 mb-1">
                                {formatTime(course.heure_debut)} –{" "}
                                {formatTime(course.heure_fin)}
                              </p>

                              {course.professeurs_noms.length > 0 && (
                                <p className="text-xs text-gray-500 mb-2">
                                  {t("labels.professor")}{" "}
                                  {course.professeurs_noms
                                    .slice(0, 2)
                                    .join(", ")}
                                  {course.professeurs_noms.length > 2 &&
                                    ` +${course.professeurs_noms.length - 2}`}
                                </p>
                              )}

                              {isAdmin && (
                                <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                                  <button
                                    onClick={() =>
                                      setModal({
                                        type: "editCourseRecurrent",
                                        item: course,
                                      })
                                    }
                                    className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                                    title={t("buttons.modify")}
                                  >
                                    <PencilIcon className="h-3.5 w-3.5" />
                                    {t("buttons.edit")}
                                  </button>
                                  <button
                                    onClick={() =>
                                      setModal({
                                        type: "deleteCourseRecurrent",
                                        item: course,
                                      })
                                    }
                                    className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                    title={t("buttons.delete")}
                                  >
                                    <TrashIcon className="h-3.5 w-3.5" />
                                    {t("buttons.delete")}
                                  </button>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ──────────────────────────────── TAB 2 : Séances */}
        {activeTab === "sessions" && (
          <div className="p-6 space-y-6">
            {isAdmin && (
              <div className="flex gap-3">
                <Button
                  variant="primary"
                  size="md"
                  icon={<PlusIcon className="h-5 w-5" />}
                  onClick={() => setModal({ type: "createSession" })}
                >
                  {t("buttons.newSession")}
                </Button>
              </div>
            )}

            {sessionsError && (
              <AlertBanner
                variant="danger"
                message={sessionsError}
                dismissible
                onDismiss={clearError}
              />
            )}

            {/* Filtres */}
            <div className="flex flex-wrap gap-3">
              <Input.Select
                label={t("filters.filterByType")}
                id="filter-type"
                value={sessionFilters.type_cours ?? ""}
                onChange={(e) =>
                  setSessionFilter("type_cours", e.target.value || "")
                }
                size="sm"
                containerClassName="w-64"
              >
                <option value="">{t("filters.allTypes")}</option>
                {filterTypes
                  ? filterTypes.map((type) => (
                      <option key={type.code} value={type.code}>
                        {i18n.language === "en" && type.nom_en
                          ? type.nom_en
                          : type.nom}
                      </option>
                    ))
                  : uniqueTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
              </Input.Select>
            </div>

            {sessionsLoading ? (
              <LoadingSpinner size="lg" text={t("loading.sessions")} />
            ) : sessions.length === 0 ? (
              <EmptyState
                icon={<ClipboardDocumentIcon className="h-12 w-12" />}
                title={t("empty.noSessions")}
                description={t("empty.noSessionsDescription")}
                action={
                  isAdmin
                    ? {
                        label: t("empty.noSessionsAction"),
                        onClick: () => setModal({ type: "createSession" }),
                      }
                    : undefined
                }
              />
            ) : (
              <DataTable
                rowKey="id"
                columns={[
                  {
                    key: "date_cours",
                    label: t("columns.date"),
                    render: (session: CourseListItemDto) =>
                      formatDate(session.date_cours),
                  },
                  {
                    key: "type_cours",
                    label: t("columns.type"),
                  },
                  {
                    key: "horaire",
                    label: t("columns.schedule"),
                    render: (session: CourseListItemDto) => (
                      <span>
                        {formatTime(session.heure_debut)} –{" "}
                        {formatTime(session.heure_fin)}
                      </span>
                    ),
                  },
                  {
                    key: "recurrent",
                    label: t("columns.linkedPlanning"),
                    render: (session: CourseListItemDto) =>
                      session.cours_recurrent_id ? (
                        <Badge variant="info" size="sm">
                          {t("status.yes")}
                        </Badge>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      ),
                  },
                  {
                    key: "status",
                    label: t("columns.status"),
                    render: (session: CourseListItemDto) =>
                      session.annule ? (
                        <Badge variant="danger" size="sm">
                          {t("status.cancelled")}
                        </Badge>
                      ) : (
                        <Badge variant="success" size="sm">
                          {t("status.scheduled")}
                        </Badge>
                      ),
                  },
                  {
                    key: "actions",
                    label: t("columns.actions"),
                    className: "text-right",
                    render: (session: CourseListItemDto) => (
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<ClipboardDocumentIcon className="h-4 w-4" />}
                          onClick={() => {
                            setAttendanceCourseId(session.id);
                            setModal({
                              type: "attendance",
                              session,
                            });
                          }}
                        >
                          {t("buttons.attendance")}
                        </Button>
                      </div>
                    ),
                  },
                ]}
                data={sessions}
                emptyMessage={t("empty.noSessionsFound")}
              />
            )}
          </div>
        )}

        {/* ──────────────────────────────── TAB 3 : Professeurs */}
        {activeTab === "professeurs" && (
          <div className="p-6 space-y-6">
            {isAdmin && (
              <Button
                variant="primary"
                size="md"
                icon={<PlusIcon className="h-5 w-5" />}
                onClick={() => setModal({ type: "createProfessor" })}
              >
                {t("buttons.newProfessor")}
              </Button>
            )}

            {professorsLoading ? (
              <LoadingSpinner size="lg" text={t("loading.professors")} />
            ) : professors.length === 0 ? (
              <EmptyState
                icon={<EnvelopeIcon className="h-12 w-12" />}
                title={t("empty.noProfessors")}
                description={t("empty.noProfessorsDescription")}
                action={
                  isAdmin
                    ? {
                        label: t("empty.noProfessorsAction"),
                        onClick: () => setModal({ type: "createProfessor" }),
                      }
                    : undefined
                }
              />
            ) : (
              <DataTable
                rowKey="id"
                columns={[
                  {
                    key: "nom_complet",
                    label: t("columns.fullName"),
                    render: (professor: ProfessorListItemDto) => (
                      <div>
                        <p className="font-medium text-gray-900">
                          {professor.nom_complet}
                        </p>
                        {professor.specialite && (
                          <p className="text-xs text-gray-500">
                            {professor.specialite}
                          </p>
                        )}
                      </div>
                    ),
                  },
                  {
                    key: "email",
                    label: t("columns.email"),
                    render: (professor: ProfessorListItemDto) =>
                      professor.email ? (
                        <a
                          href={`mailto:${professor.email}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {professor.email}
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      ),
                  },
                  {
                    key: "telephone",
                    label: t("columns.phone"),
                    render: (professor: ProfessorListItemDto) =>
                      professor.telephone || (
                        <span className="text-gray-400 text-sm">—</span>
                      ),
                  },
                  {
                    key: "actif",
                    label: t("columns.status"),
                    render: (professor: ProfessorListItemDto) => (
                      <Badge.Status
                        status={professor.actif ? "active" : "inactive"}
                      />
                    ),
                  },
                  {
                    key: "actions",
                    label: t("columns.actions"),
                    className: "text-right",
                    render: (professor: ProfessorListItemDto) => (
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<PencilIcon className="h-4 w-4" />}
                        onClick={() =>
                          setModal({ type: "editProfessor", professor })
                        }
                      >
                        {t("buttons.modify")}
                      </Button>
                    ),
                  },
                ]}
                data={professors}
                emptyMessage={t("empty.noProfessorsFound")}
              />
            )}
          </div>
        )}
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODALS                                                          */}
      {/* ───────────────────────────────────────────────────────────── */}

      <CreateEditCourseRecurrentModal
        isOpen={
          modal.type === "createCourseRecurrent" ||
          modal.type === "editCourseRecurrent"
        }
        editItem={modal.type === "editCourseRecurrent" ? modal.item : null}
        professors={professors}
        planning={planning}
        onClose={() => setModal({ type: "none" })}
        onSubmit={createCourseRecurrent}
        onUpdate={updateCourseRecurrent}
      />

      <CreateProfessorModal
        isOpen={
          modal.type === "createProfessor" || modal.type === "editProfessor"
        }
        editProfessor={modal.type === "editProfessor" ? modal.professor : null}
        onClose={() => setModal({ type: "none" })}
        onSubmit={createProfessor}
        onUpdate={updateProfessor}
      />

      <GenerateCoursesModal
        isOpen={modal.type === "generateCourses"}
        planning={planning}
        onClose={() => setModal({ type: "none" })}
        onSubmit={generateSessions}
      />

      <CreateSessionModal
        isOpen={modal.type === "createSession"}
        planning={planning}
        onClose={() => setModal({ type: "none" })}
        onSubmit={createSession}
      />

      <AttendanceModal
        isOpen={modal.type === "attendance"}
        session={modal.type === "attendance" ? modal.session : null}
        attendanceSheet={attendanceSheet}
        attendanceLoading={attendanceLoading}
        onClose={() => {
          setModal({ type: "none" });
          setAttendanceCourseId(null);
        }}
        onSave={bulkUpdatePresence}
      />

      <ConfirmDialog
        isOpen={modal.type === "deleteCourseRecurrent"}
        title={t("modals.deleteRecurrentCourse")}
        message={
          modal.type === "deleteCourseRecurrent"
            ? t("messages.confirm.deleteRecurrentCourse", {
                courseType: modal.item.type_cours,
                day: modal.item.jour_semaine_nom,
                startTime: formatTime(modal.item.heure_debut),
                endTime: formatTime(modal.item.heure_fin),
              })
            : ""
        }
        confirmLabel={t("buttons.delete")}
        onConfirm={handleConfirmDelete}
        onClose={() => setModal({ type: "none" })}
        isLoading={deleteLoading}
      />
    </div>
  );
}
