/**
 * ActiveSessionsSection
 * Section ProfilePage — liste et révocation des sessions actives
 */
import { toast } from "sonner";
import { useSessions, useRevokeSession } from "../hooks/useSessions";
import type { ActiveSessionDto } from "../api/sessionsApi";
import { LaptopIcon, TrashIcon } from "@patternfly/react-icons";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function parseUserAgent(ua: string | null): string {
  if (!ua) return "Appareil inconnu";
  if (ua.includes("Chrome") && !ua.includes("Edg")) return "Google Chrome";
  if (ua.includes("Firefox")) return "Mozilla Firefox";
  if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
  if (ua.includes("Edg")) return "Microsoft Edge";
  return ua.substring(0, 60) + (ua.length > 60 ? "..." : "");
}

interface SessionItemProps {
  session: ActiveSessionDto;
  onRevoke: (id: number) => void;
  isRevoking: boolean;
}

function SessionItem({ session, onRevoke, isRevoking }: SessionItemProps) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 bg-white border border-gray-200 rounded-lg">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-gray-400">
          <LaptopIcon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {parseUserAgent(session.user_agent)}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            IP : {session.ip_address ?? "inconnue"} · Créée le{" "}
            {formatDate(session.created_at)}
          </p>
          <p className="text-xs text-gray-400">
            Expire le {formatDate(session.expires_at)}
          </p>
        </div>
      </div>
      <button
        onClick={() => onRevoke(session.id)}
        disabled={isRevoking}
        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 hover:border-red-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <TrashIcon className="w-3.5 h-3.5" />
        Révoquer
      </button>
    </div>
  );
}

export function ActiveSessionsSection({ flat = false }: { flat?: boolean }) {
  const { data: sessions = [], isLoading, isError, refetch } = useSessions();
  const { mutate: revokeSession, isPending: isRevoking } = useRevokeSession();

  const handleRevoke = (id: number) => {
    revokeSession(id, {
      onSuccess: () => toast.success("Session révoquée"),
      onError: () => toast.error("Erreur lors de la révocation"),
    });
  };

  const content = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Sessions actives
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Gérez les appareils connectés à votre compte
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          Actualiser
        </button>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-sm text-gray-400">
          Chargement...
        </div>
      ) : isError ? (
        <div className="py-8 text-center text-sm text-red-500">
          Erreur lors du chargement des sessions
        </div>
      ) : sessions.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-400">
          Aucune session active
        </div>
      ) : (
        <div className="space-y-2">
          {sessions.map((session) => (
            <SessionItem
              key={session.id}
              session={session}
              onRevoke={handleRevoke}
              isRevoking={isRevoking}
            />
          ))}
        </div>
      )}

      {sessions.length > 0 && (
        <p className="text-xs text-gray-400 pt-1">
          {sessions.length} session{sessions.length > 1 ? "s" : ""} active
          {sessions.length > 1 ? "s" : ""}
        </p>
      )}
    </div>
  );

  if (flat) return content;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {content}
    </div>
  );
}

export default ActiveSessionsSection;
