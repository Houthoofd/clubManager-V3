/**
 * @fileoverview TodayCourses Component
 * @module features/dashboard/components
 *
 * Affiche les cours récurrents planifiés pour le jour actuel.
 * Convertit le jour JS (0=dim, 1=lun...6=sam) vers la convention
 * backend (1=lun...7=dim / ISO 8601).
 */

import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { CourseRecurrentListItemDto } from "@clubmanager/types";
import { getCourseRecurrents } from "../../../features/courses/api/coursesApi";
import { formatTime } from "../../../features/statistics/utils/formatting";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Palette de couleurs pour les badges de type de cours */
const COURSE_BADGE_PALETTE = [
  "bg-indigo-100 text-indigo-700",
  "bg-purple-100 text-purple-700",
  "bg-teal-100 text-teal-700",
  "bg-orange-100 text-orange-700",
  "bg-pink-100 text-pink-700",
  "bg-cyan-100 text-cyan-700",
] as const;

/**
 * Retourne une classe de badge déterministe basée sur le nom du type de cours.
 * Même type → même couleur, peu importe l'ordre d'affichage.
 */
function getCourseTypeBadgeClass(typeStr: string): string {
  let hash = 0;
  for (let i = 0; i < typeStr.length; i++) {
    hash = (hash * 31 + typeStr.charCodeAt(i)) & 0xff;
  }
  return (
    COURSE_BADGE_PALETTE[hash % COURSE_BADGE_PALETTE.length] ??
    "bg-gray-100 text-gray-700"
  );
}

/** Met en majuscule la première lettre, passe le reste en minuscules. */
function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// ─── Icônes SVG (heroicons outline) ──────────────────────────────────────────

const CalendarIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
    />
  </svg>
);

// ─── Composant ────────────────────────────────────────────────────────────────

/**
 * TodayCourses
 *
 * Charge tous les cours récurrents puis filtre ceux dont `jour_semaine`
 * correspond au jour courant (convention backend ISO : 1=lun, 7=dim).
 *
 * @example
 * ```tsx
 * <TodayCourses />
 * ```
 */
export function TodayCourses() {
  const { t } = useTranslation("dashboard");
  const navigate = useNavigate();

  // Conversion JS → backend :
  //   JS  getDay() : 0=dim, 1=lun ... 6=sam
  //   Backend      : 1=lun ... 7=dim  (ISO 8601)
  const jsDay = new Date().getDay();
  const backendDay = jsDay === 0 ? 7 : jsDay;

  const { data: allCourses, isLoading } = useQuery<
    CourseRecurrentListItemDto[]
  >({
    queryKey: ["courses", "recurrent", "today"],
    queryFn: getCourseRecurrents,
    staleTime: 5 * 60 * 1000,
  });

  const todayCourses = (allCourses ?? []).filter(
    (c) => c.jour_semaine === backendDay,
  );

  return (
    <section
      className="bg-white rounded-xl shadow p-6"
      aria-labelledby="today-courses-title"
    >
      {/* ── En-tête ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <h2
          id="today-courses-title"
          className="text-base font-semibold text-gray-800"
        >
          {t("todayCourses.title")}
        </h2>

        <button
          type="button"
          onClick={() => navigate("/courses")}
          className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          {t("todayCourses.viewAll")}
        </button>
      </div>

      {/* ── Squelettes de chargement ─────────────────────────────────────── */}
      {isLoading && (
        <div className="space-y-3" aria-busy="true" aria-label={t("loading")}>
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-200 rounded h-12 w-full"
            />
          ))}
        </div>
      )}

      {/* ── État vide ────────────────────────────────────────────────────── */}
      {!isLoading && todayCourses.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <CalendarIcon className="w-10 h-10 text-gray-300 mb-3" />
          <p className="text-sm font-medium text-gray-600">
            {t("todayCourses.noCourses")}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {t("todayCourses.noCoursesDesc")}
          </p>
        </div>
      )}

      {/* ── Liste des cours du jour ──────────────────────────────────────── */}
      {!isLoading && todayCourses.length > 0 && (
        <ul className="divide-y divide-gray-100" role="list">
          {todayCourses.map((c) => (
            <li
              key={c.id}
              className="py-3 flex items-center justify-between gap-4"
            >
              {/* Plage horaire */}
              <span className="text-sm font-mono text-gray-600 flex-shrink-0 tabular-nums">
                {formatTime(c.heure_debut)}
                <span className="mx-1 text-gray-400" aria-hidden="true">
                  →
                </span>
                {formatTime(c.heure_fin)}
              </span>

              {/* Badge type de cours */}
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium flex-shrink-0 ${getCourseTypeBadgeClass(c.type_cours)}`}
              >
                {capitalize(c.type_cours)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default TodayCourses;
