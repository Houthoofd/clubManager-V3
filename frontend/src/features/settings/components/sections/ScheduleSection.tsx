/**
 * ScheduleSection - Section des horaires d'ouverture
 * Extrait de SettingsPage.tsx (Phase 2 refactorisation)
 *
 * INTERNATIONALISÉ - Utilise react-i18next pour tous les textes
 */

import { useTranslation } from "react-i18next";
import { ClockIcon } from "@heroicons/react/24/outline";
import { FormField } from "../../../../shared/components/Forms/FormField";
import { Input } from "../../../../shared/components/Input";
import { Button } from "../../../../shared/components/Button";
import { SectionHeader } from "../SectionHeader";

interface ScheduleSectionProps {
  horairesForm: {
    opening_hours: string;
  };
  setHorairesForm: React.Dispatch<
    React.SetStateAction<{
      opening_hours: string;
    }>
  >;
  handleSaveHoraires: () => void;
  isSaving: boolean;
}

export function ScheduleSection({
  horairesForm,
  setHorairesForm,
  handleSaveHoraires,
  isSaving,
}: ScheduleSectionProps) {
  const { t } = useTranslation("settings");

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <SectionHeader
        icon={<ClockIcon className="h-5 w-5" />}
        iconBg="bg-green-100"
        iconColor="text-green-600"
        title={t("schedule.title")}
        description={t("schedule.description")}
      />

      <FormField
        id="opening_hours"
        label={t("schedule.openingHours")}
        helpText={t("schedule.customHours")}
      >
        <Input
          id="opening_hours"
          type="text"
          value={horairesForm.opening_hours}
          onChange={(e) => setHorairesForm({ opening_hours: e.target.value })}
          placeholder={t("schedule.customHours")}
        />
      </FormField>

      <div className="flex justify-end pt-4 border-t border-gray-100">
        <Button
          onClick={handleSaveHoraires}
          loading={isSaving}
          variant="primary"
        >
          {t("actions.save")}
        </Button>
      </div>
    </div>
  );
}
