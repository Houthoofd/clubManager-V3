import { useTranslation } from "react-i18next";
import { useAuth } from "@/shared/hooks/useAuth";
import { useCourses } from "../hooks/useCourses";
import { toast } from "sonner";
import {
  CalendarIcon,
  CheckCircleIcon,
  UserPlusIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { Button } from "../../../shared/components/Button/Button";
import { LoadingSpinner } from "../../../shared/components/Layout/LoadingSpinner";
import { EmptyState } from "../../../shared/components/Layout/EmptyState";
import { PageHeader } from "../../../shared/components/Layout/PageHeader";

function formatDateLong(dateStr: string, lang: string): string {
  const d = new Date(dateStr);
  return new Intl.DateTimeFormat(lang, { weekday: "long", year: "numeric", month: "long", day: "numeric" }).format(d);
}

function formatTime(timeStr: string): string {
  return timeStr.slice(0, 5);
}

export function MemberCoursesView() {
  const { t, i18n } = useTranslation("courses");
  const { user } = useAuth();
  const {
    sessions,
    sessionsLoading,
    myEnrollments,
    createInscription,
    createInscriptionLoading,
    deleteInscription,
    deleteInscriptionLoading,
  } = useCourses();

  if (sessionsLoading) {
    return <LoadingSpinner size="lg" text={t("loading.sessions")} />;
  }

  // Filter future sessions only
  const now = new Date();
  const futureSessions = sessions.filter((s) => {
    const sessionDate = new Date(`${s.date_cours}T${s.heure_debut}`);
    return sessionDate > now;
  });

  if (futureSessions.length === 0) {
    return (
      <div className="space-y-6" data-testid="courses-member-page">
        <PageHeader
          title={t("page.title")}
          description="Inscrivez-vous aux prochaines séances de votre club."
          icon={<CalendarIcon className="h-8 w-8" />}
        />
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <EmptyState
            icon={<CalendarIcon className="h-12 w-12" />}
            title="Aucune séance"
            description="Il n'y a aucune séance prévue pour le moment."
          />
        </div>
      </div>
    );
  }

  const handleEnroll = async (cours_id: number) => {
    if (!user) return;
    try {
      await createInscription(cours_id, {
        utilisateur_id: user.userId,
        cours_id,
      });
      toast.success(t("messages.success.inscriptionCreated"));
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Erreur d'inscription");
    }
  };

  const handleUnenroll = async (inscription_id: number) => {
    try {
      await deleteInscription(inscription_id);
      toast.success(t("messages.success.inscriptionDeleted"));
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Erreur de désinscription");
    }
  };

  // Group by date
  const groupedSessions = futureSessions.reduce((acc, session) => {
    if (!acc[session.date_cours]) {
      acc[session.date_cours] = [];
    }
    acc[session.date_cours].push(session);
    return acc;
  }, {} as Record<string, typeof sessions>);

  return (
    <div className="space-y-6" data-testid="courses-member-page">
      <PageHeader
        title={t("page.title")}
        description="Inscrivez-vous aux prochaines séances de votre club."
        icon={<CalendarIcon className="h-8 w-8" />}
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 space-y-8">
        {Object.entries(groupedSessions).map(([date, daySessions]) => (
        <div key={date} className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
            {formatDateLong(date, i18n.language)}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {daySessions.map((session) => {
              const myEnrollment = myEnrollments.find((e) => e.cours_id === session.id);
              const isEnrolled = !!myEnrollment;
              const isFull = session.nombre_inscriptions >= session.capacite_max;

              return (
                <div
                  key={session.id}
                  className={`border rounded-xl p-4 shadow-sm transition-all flex flex-col ${
                    isEnrolled ? "bg-green-50 border-green-200" : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-700">
                      <ClockIcon className="h-4 w-4" />
                      {formatTime(session.heure_debut)} - {formatTime(session.heure_fin)}
                    </span>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {session.type_cours}
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-1 font-medium">
                      {session.professeurs_noms.length > 0
                        ? `Prof: ${session.professeurs_noms.join(", ")}`
                        : "Prof: Non assigné"}
                    </div>
                    <div className="text-xs text-gray-500">
                      Places : {session.nombre_inscriptions} / {session.capacite_max}
                    </div>
                  </div>

                  <div className="mt-auto pt-4">
                    {isEnrolled ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-center text-green-700 bg-green-100 hover:bg-red-50 hover:text-red-700 group"
                        icon={<CheckCircleIcon className="h-5 w-5 group-hover:hidden" />}
                        onClick={() => handleUnenroll(myEnrollment.inscription_id)}
                        disabled={deleteInscriptionLoading}
                      >
                        <span className="group-hover:hidden">Inscrit(e)</span>
                        <span className="hidden group-hover:inline">Me désinscrire</span>
                      </Button>
                    ) : (
                      <Button
                        variant={isFull ? "outline" : "primary"}
                        size="sm"
                        className="w-full justify-center"
                        icon={<UserPlusIcon className="h-4 w-4" />}
                        onClick={() => handleEnroll(session.id)}
                        disabled={createInscriptionLoading || isFull}
                      >
                        {isFull ? "Complet" : "M'inscrire"}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      </div>
    </div>
  );
}
