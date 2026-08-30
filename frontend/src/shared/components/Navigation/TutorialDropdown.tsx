import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export const TutorialDropdown: React.FC = () => {
  const { t } = useTranslation("common");
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const isAdmin = user?.role_app === "admin";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const tutorials = [
    {
      id: "courses_intro",
      label: "Tutoriel : Gestion des cours",
      path: "/courses",
      roles: ["admin", "professor", "member"],
    },
    {
      id: "dashboard_intro",
      label: "Tutoriel : Tableau de bord",
      path: "/dashboard",
      roles: ["admin", "professor"],
    },
    {
      id: "users_intro",
      label: "Tutoriel : Annuaire des membres",
      path: "/users",
      roles: ["admin", "professor"],
    },
    {
      id: "messaging_intro",
      label: "Tutoriel : Envoi de messages",
      path: "/messages",
      roles: ["admin", "professor"],
    }
  ];

  const visibleTutorials = tutorials.filter(t => !t.roles || t.roles.includes(user?.role_app || ""));

  const launchTutorial = (path: string, id: string) => {
    setIsOpen(false);
    window.location.href = `${path}?tutorial=${isAdmin ? id.replace("intro", "admin_intro") : id.replace("intro", "user_intro")}`;
  };

  if (visibleTutorials.length === 0) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
        aria-label="Tutoriels"
        title="Tutoriels"
      >
        <QuestionMarkCircleIcon className="h-6 w-6" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-2 border border-gray-100 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800">{t("tutorials.interactiveTutorials", "Tutoriels interactifs")}</h3>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {visibleTutorials.map((tutorial) => (
              <button
                key={tutorial.id}
                onClick={() => launchTutorial(tutorial.path, tutorial.id)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-start gap-3 transition-colors"
              >
                <div className="mt-0.5 bg-blue-100 p-1.5 rounded-full text-blue-600">
                  <QuestionMarkCircleIcon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{tutorial.label}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
