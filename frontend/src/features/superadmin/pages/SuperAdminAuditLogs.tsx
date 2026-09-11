import React, { useState } from "react";
import {
  MagnifyingGlassIcon,
  ChevronRightIcon,
  ShieldExclamationIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentListIcon,
  FunnelIcon,
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
    <div className="w-full relative pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8 justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-brand-green/10 dark:bg-emerald-500/10 p-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-brand-green dark:text-emerald-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-brand-dark dark:text-white">
              Journaux d'Audit & Sécurité
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Suivez toutes les actions sensibles effectuées sur la plateforme.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-2xl bg-white dark:bg-white/5 p-6 shadow-sm ring-1 ring-gray-200 dark:ring-white/10">
          <div className="flex items-center gap-x-4">
            <div className="bg-red-500/10 p-2 rounded-lg">
              <ShieldExclamationIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-sm font-semibold leading-7 text-gray-600 dark:text-gray-400">Alertes critiques (24h)</h3>
          </div>
          <p className="mt-4 text-3xl font-semibold tracking-tight text-brand-dark dark:text-white">2</p>
        </div>
        
        <div className="rounded-2xl bg-white dark:bg-white/5 p-6 shadow-sm ring-1 ring-gray-200 dark:ring-white/10">
          <div className="flex items-center gap-x-4">
            <div className="bg-orange-500/10 p-2 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-sm font-semibold leading-7 text-gray-600 dark:text-gray-400">Avertissements (24h)</h3>
          </div>
          <p className="mt-4 text-3xl font-semibold tracking-tight text-brand-dark dark:text-white">2</p>
        </div>

        <div className="rounded-2xl bg-white dark:bg-white/5 p-6 shadow-sm ring-1 ring-gray-200 dark:ring-white/10">
          <div className="flex items-center gap-x-4">
            <div className="bg-brand-blue/10 p-2 rounded-lg">
              <ClipboardDocumentListIcon className="h-6 w-6 text-brand-blue" />
            </div>
            <h3 className="text-sm font-semibold leading-7 text-gray-600 dark:text-gray-400">Actions totales</h3>
          </div>
          <p className="mt-4 text-3xl font-semibold tracking-tight text-brand-dark dark:text-white">6</p>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-800 shadow-sm ring-1 ring-gray-200 dark:ring-white/10 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 dark:bg-slate-800/50 gap-4">
          <div className="flex items-center gap-3">
            <ClipboardDocumentListIcon className="h-5 w-5 text-brand-blue" />
            <h2 className="text-lg font-semibold leading-7 text-brand-dark dark:text-white">Historique d'activité</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher utilisateur ou action..."
                className="pl-9 pr-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg text-sm focus:ring-brand-blue focus:border-brand-blue w-64 bg-white dark:bg-white/5 dark:text-slate-300 dark:placeholder-slate-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative flex items-center">
              <FunnelIcon className="h-4 w-4 text-gray-400 absolute left-3 pointer-events-none" />
              <select
                className="pl-9 pr-8 py-2 border border-gray-300 dark:border-white/10 rounded-lg text-sm focus:ring-brand-blue focus:border-brand-blue appearance-none bg-white dark:bg-slate-800 dark:text-slate-400"
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
              >
                <option className="bg-white dark:bg-slate-800 dark:text-slate-300" value="ALL">Toutes sévérités</option>
                <option className="bg-white dark:bg-slate-800 dark:text-slate-300" value="CRITICAL">Critique</option>
                <option className="bg-white dark:bg-slate-800 dark:text-slate-300" value="WARNING">Attention</option>
                <option className="bg-white dark:bg-slate-800 dark:text-slate-300" value="INFO">Info</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-white/10">
            <thead className="bg-white dark:bg-slate-900/40 border-b border-gray-200 dark:border-white/10">
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
