const fs = require('fs');

// --- Fix 1: Inject hook into AlertsPage.tsx ---
const alertsPagePath = 'frontend/src/features/alerts/pages/AlertsPage.tsx';
let alertsPage = fs.readFileSync(alertsPagePath, 'utf8');

// I need to add useLocation since we want to check the URL query params
if (!alertsPage.includes('useLocation')) {
    alertsPage = alertsPage.replace(
        'import { useState } from "react";',
        'import { useState } from "react";\nimport { useLocation, useNavigate } from "react-router-dom";'
    );
}

const targetHook = 'const isAdmin = user?.role_app === "admin";';
const newHook = `const isAdmin = user?.role_app === "admin";

  const { runTutorial, hasSeenTutorial, advanceTutorial, isActive } = useTutorial();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const forceTutorial = params.get("tutorial");
    const tutorialId = "alerts_admin_intro";

    if (isAdmin && (forceTutorial === tutorialId || !hasSeenTutorial(tutorialId))) {
      runTutorial(tutorialId, getAlertsAdminSteps());
      
      // Clean up URL if it was forced
      if (forceTutorial) {
        params.delete("tutorial");
        navigate({ search: params.toString() }, { replace: true });
      }
    }
  }, [isAdmin, hasSeenTutorial, runTutorial, location.search, navigate]);
`;

if (!alertsPage.includes('const { runTutorial')) {
    alertsPage = alertsPage.replace(targetHook, newHook);
    fs.writeFileSync(alertsPagePath, alertsPage, 'utf8');
    console.log('Fixed AlertsPage.tsx hooks');
}

// --- Fix 2: Add to TutorialDropdown.tsx ---
const dropdownPath = 'frontend/src/shared/components/Navigation/TutorialDropdown.tsx';
let dropdown = fs.readFileSync(dropdownPath, 'utf8');

const targetDropdown = `{
      id: "messaging_intro",
      label: "Tutoriel : Envoi de messages",
      path: "/messages",
      roles: ["admin", "professor"],
    }`;

const newDropdown = `{
      id: "messaging_intro",
      label: "Tutoriel : Envoi de messages",
      path: "/messages",
      roles: ["admin", "professor"],
    },
    {
      id: "alerts_intro",
      label: "Tutoriel : Alertes",
      path: "/alerts",
      roles: ["admin"],
    }`;

if (!dropdown.includes('alerts_intro')) {
    dropdown = dropdown.replace(targetDropdown, newDropdown);
    fs.writeFileSync(dropdownPath, dropdown, 'utf8');
    console.log('Fixed TutorialDropdown.tsx');
}
