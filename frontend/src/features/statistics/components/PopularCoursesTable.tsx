import React from "react";
import { useTranslation } from "react-i18next";
import { formatPercentage } from "../utils/formatting";
import { CourseAnalyticsResponse } from "./CourseStats.types";

export interface PopularCoursesTableProps {
  courses: CourseAnalyticsResponse["popular_courses"];
}

export function PopularCoursesTable({ courses }: PopularCoursesTableProps) {
  const { t } = useTranslation("statistics");

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t("courses.popularCourses")}
      </h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("courses.table.name")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("courses.table.schedule")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("courses.table.enrolled")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("courses.table.attendanceRate")}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {courses.map((course, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {course.cours_nom}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {course.jour} - {course.heure_debut}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {course.nombre_inscrits}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      course.taux_presence >= 75
                        ? "bg-green-100 text-green-800"
                        : course.taux_presence >= 50
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {formatPercentage(course.taux_presence, 0)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
