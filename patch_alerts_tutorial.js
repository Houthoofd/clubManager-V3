const fs = require('fs');

const file = 'frontend/src/features/alerts/pages/AlertsPage.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add imports
const importJoyride = `import { useTutorial } from "../../../shared/providers/TutorialProvider";
import { getAlertsAdminSteps } from "../../../shared/providers/tutorialsConfig";
import { useEffect } from "react";`;

content = content.replace(
  'import { useTranslation } from "react-i18next";',
  'import { useTranslation } from "react-i18next";\n' + importJoyride
);

// 2. Add tutorial hook in component
const hookTarget = `const { isAdmin } = useAuthStore();`;
const hookCode = `  const { isAdmin } = useAuthStore();
  const { runTutorial, hasSeenTutorial, advanceTutorial, isActive } = useTutorial();

  useEffect(() => {
    // Only run for admins (to simplify the tutorial logic here)
    if (isAdmin && !hasSeenTutorial("alerts_admin_intro")) {
      runTutorial("alerts_admin_intro", getAlertsAdminSteps());
    }
  }, [isAdmin, hasSeenTutorial, runTutorial]);`;

content = content.replace(hookTarget, hookCode);

// 3. Add advanceTutorial logic to tabs and buttons
content = content.replace(
  `onClick={() => setSection("alerts")}`,
  `onClick={() => { setSection("alerts"); if (isActive) setTimeout(advanceTutorial, 400); }}`
);

content = content.replace(
  `onClick={() => setSection("types")}`,
  `onClick={() => { setSection("types"); if (isActive) setTimeout(advanceTutorial, 400); }}`
);

content = content.replace(
  `onClick={() => setIsCreateAlertOpen(true)}`,
  `onClick={() => { setIsCreateAlertOpen(true); if (isActive) setTimeout(advanceTutorial, 400); }}`
);

content = content.replace(
  `onClick={() => {
                  setEditingType(null);`,
  `onClick={() => {
                  if (isActive) setTimeout(advanceTutorial, 400);
                  setEditingType(null);`
);


fs.writeFileSync(file, content, 'utf8');
console.log('Patched AlertsPage.tsx');
