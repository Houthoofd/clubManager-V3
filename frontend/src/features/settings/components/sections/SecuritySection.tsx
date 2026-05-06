/**
 * SecuritySection
 * Tableau admin des tentatives de connexion (audit logs)
 */
import { useState } from "react";
import { useLoginAttempts } from "../../hooks/useSettings";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

export function SecuritySection() {
  const [page, setPage] = useState(1);
  const [onlyFailed, setOnlyFailed] = useState(false);
  const [emailFilter, setEmailFilter] = useState("");

  const { data, isLoading, isError } = useLoginAttempts({
    page,
    limit: 20,
    email: emailFilter || undefined,
    onlyFailed,
  });

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Audit de sécurité
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Historique des tentatives de connexion
        </p>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          value={emailFilter}
          onChange={(e) => {
            setEmailFilter(e.target.value);
            setPage(1);
          }}
          placeholder="Filtrer par email..."
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
        />
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={onlyFailed}
            onChange={(e) => {
              setOnlyFailed(e.target.checked);
              setPage(1);
            }}
            className="rounded border-gray-300"
          />
          Échecs uniquement
        </label>
        {data && (
          <span className="text-xs text-gray-400 ml-auto">
            {data.total} entrée(s)
          </span>
        )}
      </div>

      {/* Tableau */}
      {isLoading ? (
        <div className="py-10 text-center text-sm text-gray-400">
          Chargement...
        </div>
      ) : isError ? (
        <div className="py-10 text-center text-sm text-red-500">
          Erreur lors du chargement
        </div>
      ) : !data || data.attempts.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-400">
          Aucune tentative enregistrée
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Date", "Email", "IP", "Résultat", "Raison", "Agent"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {data.attempts.map((a) => (
                <tr
                  key={a.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                    {formatDate(a.created_at)}
                  </td>
                  <td className="px-4 py-3 text-gray-900 font-medium">
                    {a.email}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-gray-500">
                    {a.ip_address}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {a.success ? (
                      <span className="inline-flex items-center gap-1 text-green-600">
                        <CheckCircleIcon className="w-4 h-4" /> Succès
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-500">
                        <ExclamationTriangleIcon className="w-4 h-4" /> Échec
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {a.failure_reason ?? "—"}
                  </td>
                  <td
                    className="px-4 py-3 max-w-xs truncate text-xs text-gray-400"
                    title={a.user_agent ?? ""}
                  >
                    {a.user_agent ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Précédent
          </button>
          <span className="text-xs text-gray-500">
            Page {page} / {data.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Suivant →
          </button>
        </div>
      )}
    </div>
  );
}

export default SecuritySection;
