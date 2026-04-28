/**
 * NavigationSection - Section des modules de navigation
 * Extrait de SettingsPage.tsx (Phase 2 refactorisation)
 */

import { Squares2X2Icon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { Button } from "../../../../shared/components/Button";
import { SectionHeader } from "../SectionHeader";
import { ModuleToggle } from "../ModuleToggle";

interface NavigationSectionProps {
  activeModules: {
    dashboard: boolean;
    courses: boolean;
    users: boolean;
    families: boolean;
    payments: boolean;
    store: boolean;
    messages: boolean;
    statistics: boolean;
  };
  setActiveModules: React.Dispatch<
    React.SetStateAction<{
      dashboard: boolean;
      courses: boolean;
      users: boolean;
      families: boolean;
      payments: boolean;
      store: boolean;
      messages: boolean;
      statistics: boolean;
    }>
  >;
  handleSaveNavigation: () => void;
  isSaving: boolean;
}

export function NavigationSection({
  activeModules,
  setActiveModules,
  handleSaveNavigation,
  isSaving,
}: NavigationSectionProps) {
  const { t } = useTranslation("common");

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <SectionHeader
        icon={<Squares2X2Icon className="h-5 w-5" />}
        iconBg="bg-teal-100"
        iconColor="text-teal-600"
        title={t("modules.title")}
        description={t("modules.description")}
      />

      <div className="space-y-3">
        <ModuleToggle
          label={t("modules.dashboard")}
          moduleKey="dashboard"
          enabled={activeModules.dashboard}
          disabled={true}
          onChange={(k, v) => setActiveModules({ ...activeModules, [k]: v })}
        />
        <ModuleToggle
          label={t("modules.courses")}
          moduleKey="courses"
          enabled={activeModules.courses}
          onChange={(k, v) => setActiveModules({ ...activeModules, [k]: v })}
        />
        <ModuleToggle
          label={t("modules.users")}
          moduleKey="users"
          enabled={activeModules.users}
          onChange={(k, v) => setActiveModules({ ...activeModules, [k]: v })}
        />
        <ModuleToggle
          label={t("modules.families")}
          moduleKey="families"
          enabled={activeModules.families}
          onChange={(k, v) => setActiveModules({ ...activeModules, [k]: v })}
        />
        <ModuleToggle
          label={t("modules.payments")}
          moduleKey="payments"
          enabled={activeModules.payments}
          onChange={(k, v) => setActiveModules({ ...activeModules, [k]: v })}
        />
        <ModuleToggle
          label={t("modules.store")}
          moduleKey="store"
          enabled={activeModules.store}
          onChange={(k, v) => setActiveModules({ ...activeModules, [k]: v })}
        />
        <ModuleToggle
          label={t("modules.messages")}
          moduleKey="messages"
          enabled={activeModules.messages}
          onChange={(k, v) => setActiveModules({ ...activeModules, [k]: v })}
        />
        <ModuleToggle
          label={t("modules.statistics")}
          moduleKey="statistics"
          enabled={activeModules.statistics}
          onChange={(k, v) => setActiveModules({ ...activeModules, [k]: v })}
        />
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-100">
        <Button
          onClick={handleSaveNavigation}
          loading={isSaving}
          variant="primary"
        >
          {t("modules.save")}
        </Button>
      </div>
    </div>
  );
}
