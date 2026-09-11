import React, { useState } from "react";
import {
  MagnifyingGlassIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";

// Mock Data
const MOCK_LOGS = [
  {
    id: "log-001",
    date: "2026-09-11T10:23:45Z",
    severity: "CRITICAL",
    action: "auth.login.failed",
    actor: "john.doe@example.com",
    target: "System",
    metadata: {
      ip: "192.168.1.45",
      reason: "Invalid password (attempt 5)",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)..."
    }
  },
  {
    id: "log-002",
    date: "2026-09-11T09:12:00Z",
    severity: "INFO",
    action: "module.activated",
    actor: "superadmin@club.com",
    target: "Online Payment Module",
    metadata: {
      tenantId: "tenant_88",
      module: "Online Payment",
      activatedBy: "admin_01"
    }
  },
  {
    id: "log-003",
    date: "2026-09-10T16:45:12Z",
    severity: "WARNING",
    action: "admin.impersonate",
    actor: "support@club.com",
    target: "Club Paris 15",
    metadata: {
      reason: "Troubleshooting billing issue #4502",
      durationLimit: "1h",
      targetTenantId: "tenant_450"
    }
  },
  {
    id: "log-004",
    date: "2026-09-10T14:30:00Z",
    severity: "INFO",
    action: "billing.plan.changed",
    actor: "admin_01 (superadmin@club.com)",
    target: "Club Lyon Est",
    metadata: {
      previousPlan: "Basic",
      newPlan: "Pro",
      tenantId: "tenant_210"
    }
  },
  {
    id: "log-005",
    date: "2026-09-09T13:20:00Z",
    severity: "WARNING",
    action: "data.export.csv",
    actor: "finance@club.com",
    target: "All Members Data",
    metadata: {
      recordsExported: 1450,
      ip: "82.124.65.12",
      tenantId: "tenant_12"
    }
  },
  {
    id: "log-006",
    date: "2026-09-08T10:15:30Z",
    severity: "CRITICAL",
    action: "club.deleted",
    actor: "support@club.com",
    target: "Club Test 01",
    metadata: {
      tenantId: "tenant_999",
      reason: "Requested by owner",
      confirmationCodeMatched: true
    }
  }
];

const SeverityBadge = ({ severity }: { severity: string }) => {
  switch (severity) {
    case "CRITICAL":
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset bg-red-50 text-red-700 ring-red-600/10 dark:bg-red-400/10 dark:text-red-400 dark:ring-red-400/20">Critique</span>;
    case "WARNING":
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset bg-yellow-50 text-yellow-800 ring-yellow-600/20 dark:bg-yellow-400/10 dark:text-yellow-500 dark:ring-yellow-400/20">Attention</span>;
    case "INFO":
    default:
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset bg-blue-50 text-blue-700 ring-blue-700/10 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/30">Info</span>;
  }
};

export const SuperAdminAuditLogs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState("ALL");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const filteredLogs = MOCK_LOGS.filter((log) => {
    const matchesSearch = log.actor.toLowerCase().includes(searchTerm.toLowerCase()) || log.action.toLowerCase().includes(searchTerm.toLowerCase()) || log.target.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = selectedSeverity === "ALL" || log.severity === selectedSeverity;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
          Journaux d'Audit & Sécurité
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Suivez toutes les actions sensibles effectuées sur la plateforme.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-white/10">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Alertes critiques (24h)</div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">2</div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-white/10">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Avertissements (24h)</div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">2</div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-white/10">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Actions totales</div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">6</div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-white/5 rounded-2xl shadow-sm ring-1 ring-gray-200 dark:ring-white/10 p-4 mb-8 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative flex items-center w-full sm:w-96">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Rechercher utilisateur ou action..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-white/10 rounded-lg text-sm focus:ring-brand-blue focus:border-brand-blue bg-white dark:bg-white/5 dark:text-slate-300 dark:placeholder-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="w-full sm:w-auto relative">
           <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="w-full sm:w-48 border border-gray-300 dark:border-white/10 rounded-lg text-sm focus:ring-brand-blue focus:border-brand-blue bg-white dark:bg-white/5 dark:text-slate-300 py-2 pl-3 pr-10"
          >
            <option value="ALL">Toutes sévérités</option>
            <option value="CRITICAL">Critique</option>
            <option value="WARNING">Attention</option>
            <option value="INFO">Info</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-800 shadow-sm ring-1 ring-gray-200 dark:ring-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-white/10">
            <thead className="bg-gray-50 dark:bg-slate-900/40">
              <tr>
                <th scope="col" className="w-10 px-6 py-4"></th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Sévérité</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Action</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Acteur</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Cible</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-white/5">
              {filteredLogs.map((log) => (
                <React.Fragment key={log.id}>
                  <tr 
                    className={"hover:bg-gray-50/50 dark:hover:bg-white/5 cursor-pointer transition-colors " + (expandedRow === log.id ? "bg-gray-50/50 dark:bg-white/5" : "")}
                    onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      <ChevronRightIcon className={"h-5 w-5 transition-transform " + (expandedRow === log.id ? "rotate-90" : "")} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {new Date(log.date).toLocaleString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <SeverityBadge severity={log.severity} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {log.actor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {log.target}
                    </td>
                  </tr>
                  {expandedRow === log.id && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 bg-gray-50/50 dark:bg-slate-900/20 border-t border-gray-100 dark:border-white/5">
                        <div className="text-sm text-gray-900 dark:text-gray-200 mb-2 font-medium">Métadonnées de l'action :</div>
                        <pre className="p-4 rounded-xl bg-gray-900 text-gray-300 text-xs overflow-x-auto shadow-inner ring-1 ring-white/10">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                    Aucun log trouvé pour ces critères.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
