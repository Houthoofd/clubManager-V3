import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Modal } from "../../../../shared/components/Modal/Modal";
import { Button } from "../../../../shared/components/Button/Button";
import { SubmitButton } from "../../../../shared/components/Button/SubmitButton";
import { LoadingSpinner } from "../../../../shared/components/Layout/LoadingSpinner";
import type {
  CourseListItemDto,
  AttendanceSheetDto,
  BulkUpdatePresenceDto,
} from "@clubmanager/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────
// TODO: Migrer vers shared/utils
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

// ─── Component ────────────────────────────────────────────────────────────────

export interface AttendanceModalProps {
  isOpen: boolean;
  session: CourseListItemDto | null;
  attendanceSheet: AttendanceSheetDto | null;
  attendanceLoading: boolean;
  onClose: () => void;
  onSave: (cours_id: number, dto: BulkUpdatePresenceDto) => Promise<void>;
}

export function AttendanceModal({
  isOpen,
  session,
  attendanceSheet,
  attendanceLoading,
  onClose,
  onSave,
}: AttendanceModalProps) {
  const [presenceMap, setPresenceMap] = useState<Record<number, number | null>>(
    {},
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (attendanceSheet && isOpen) {
      const initial: Record<number, number | null> = {};
      attendanceSheet.inscriptions.forEach((ins) => {
        initial[ins.id] = ins.status_id ?? null;
      });
      setPresenceMap(initial);
    }
  }, [attendanceSheet, isOpen]);

  const togglePresence = (inscriptionId: number) => {
    setPresenceMap((prev) => ({
      ...prev,
      [inscriptionId]: prev[inscriptionId] === 1 ? null : 1,
    }));
  };

  const handleSave = async () => {
    if (!session) return;
    setSaving(true);
    try {
      const updates = Object.entries(presenceMap).map(([id, status_id]) => ({
        inscription_id: Number(id),
        status_id,
      }));
      await onSave(session.id, { updates });
      toast.success("Présences sauvegardées");
      onClose();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ?? "Erreur lors de la sauvegarde.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <Modal.Header
        title="Feuille d'appel"
        subtitle={
          session
            ? `${session.type_cours} — ${formatDate(session.date_cours)} ${formatTime(session.heure_debut)}–${formatTime(session.heure_fin)}`
            : undefined
        }
      />
      <Modal.Body padding="px-6 py-5">
        {attendanceLoading ? (
          <LoadingSpinner size="lg" />
        ) : !attendanceSheet ? (
          <p className="text-center text-gray-500 py-12">
            Aucune donnée disponible.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap gap-4 mb-5 p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">
                Total :{" "}
                <strong>{attendanceSheet.statistiques.total_inscrits}</strong>
              </span>
              <span className="text-sm text-green-700">
                Présents :{" "}
                <strong>{attendanceSheet.statistiques.nombre_presents}</strong>
              </span>
              <span className="text-sm text-red-600">
                Absents :{" "}
                <strong>{attendanceSheet.statistiques.nombre_absents}</strong>
              </span>
              {attendanceSheet.professeurs.length > 0 && (
                <span className="text-sm text-blue-600">
                  Prof :{" "}
                  {attendanceSheet.professeurs
                    .map((p) => p.nom_complet)
                    .join(", ")}
                </span>
              )}
            </div>

            {attendanceSheet.inscriptions.length === 0 ? (
              <p className="text-center text-gray-400 py-8">
                Aucun inscrit pour cette séance.
              </p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide pb-3 pr-4">
                      Nom complet
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide pb-3 pr-4">
                      Grade
                    </th>
                    <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wide pb-3 w-24">
                      Présent
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {attendanceSheet.inscriptions.map((ins) => (
                    <tr
                      key={ins.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 pr-4 text-sm font-medium text-gray-900">
                        {ins.nom_complet}
                      </td>
                      <td className="py-3 pr-4 text-sm text-gray-500">
                        {ins.grade ? (
                          <span className="inline-flex items-center gap-2">
                            {ins.grade.couleur && (
                              <span
                                className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: ins.grade.couleur }}
                              />
                            )}
                            {ins.grade.nom}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="py-3 text-center">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={presenceMap[ins.id] === 1}
                          onClick={() => togglePresence(ins.id)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            presenceMap[ins.id] === 1
                              ? "bg-green-500"
                              : "bg-gray-200"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                              presenceMap[ins.id] === 1
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </Modal.Body>
      <Modal.Footer align="right">
        <Button variant="outline" onClick={onClose} disabled={saving}>
          Fermer
        </Button>
        {attendanceSheet && attendanceSheet.inscriptions.length > 0 && (
          <SubmitButton
            type="button"
            onClick={handleSave}
            isLoading={saving}
            disabled={attendanceLoading}
            loadingText="Sauvegarde…"
          >
            Sauvegarder les présences
          </SubmitButton>
        )}
      </Modal.Footer>
    </Modal>
  );
}
