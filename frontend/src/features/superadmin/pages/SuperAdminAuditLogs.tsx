import React, { useState } from "react";
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
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
    date: "2026-09-09T11:20:00Z",
    severity: "WARNING",
    action: "data.export.csv",
    actor: "finance@club.com",
    target: "All Members Data",
    metadata: {
      format: "CSV",
      rowCount: 45000,
      ip: "10.0.0.5"
    }
  },
  {
    id: "log-006",
    date: "2026-09-08T08:15:30Z",
    severity: "CRITICAL",
    action: "club.deleted",
    actor: "support@club.com",
    target: "Club Test 01",
    metadata: {
      reason: "Requested by owner",
      deletionType: "soft_delete",
      scheduledPurge: "2026-10-08T08:15:30Z"
    }
  }
];

const SeverityBadge = ({ severity }: { severity: string }) => {
  switch (severity) {
    case "CRITICAL":
      return <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400">Critique</span>;
    case "WARNING":
      return <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400">Attention</span>;
    case "INFO":
    default:
      return <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">Info</span>;
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
          Journaux d'Audit & Sécurité
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Suivez toutes les actions sensibles effectuées sur la plateforme.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="overflow-hidden rounded-lg bg-white dark:bg-slate-800 px-4 py-5 shadow sm:p-6 border border-gray-200 dark:border-white/10">
          <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">Alertes critiques (24h)</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-red-600 dark:text-red-400">2</dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white dark:bg-slate-800 px-4 py-5 shadow sm:p-6 border border-gray-200 dark:border-white/10">
          <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">Avertissements (24h)</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-orange-600 dark:text-orange-400">2</dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white dark:bg-slate-800 px-4 py-5 shadow sm:p-6 border border-gray-200 dark:border-white/10">
          <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">Actions totales</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-blue-600 dark:text-blue-400">6</dd>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-white/10">
        <div className="relative w-full sm:max-w-xs">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 dark:text-white dark:bg-slate-900 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-green sm:text-sm sm:leading-6"
            placeholder="Rechercher utilisateur ou action..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="w-full sm:w-auto relative">
           <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="block w-full sm:w-48 rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 dark:text-white dark:bg-slate-900 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-brand-green sm:text-sm sm:leading-6"
          >
            <option value="ALL">Toutes sévérités</option>
            <option value="CRITICAL">Critique</option>
            <option value="WARNING">Attention</option>
            <option value="INFO">Info</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-slate-800 shadow-sm ring-1 ring-gray-200 dark:ring-white/10 sm:rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-white/10">
          <thead className="bg-gray-50 dark:bg-slate-900/50">
            <tr>
              <th scope="col" className="w-10 px-6 py-3"></th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sévérité</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acteur</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cible</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-white/10 bg-white dark:bg-slate-800">
            {filteredLogs.map((log) => (
              <React.Fragment key={log.id}>
                <tr 
                  className={"hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors " + (expandedRow === log.id ? "bg-gray-50 dark:bg-white/5" : "")}
                  onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <ChevronRightIcon className={"h-5 w-5 transition-transform " + (expandedRow === log.id ? "rotate-90" : "")} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                    {new Date(log.date).toLocaleString()}
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
                    <td colSpan={6} className="px-6 py-4 bg-gray-50 dark:bg-slate-900/50">
                      <div className="text-sm text-gray-900 dark:text-gray-200 mb-2 font-medium">Métadonnées de l'action :</div>
                      <pre className="p-4 rounded-md bg-gray-900 text-gray-300 text-xs overflow-x-auto">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {filteredLogs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                  Aucun log trouvé pour ces critères.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
