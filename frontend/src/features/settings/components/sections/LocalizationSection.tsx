/**
 * LocalizationSection - Section de localisation
 * Extrait de SettingsPage.tsx (Phase 2 refactorisation)
 */

import { LanguageIcon } from "@heroicons/react/24/outline";
import { Button } from "../../../../shared/components/Button";
import { SectionHeader } from "../SectionHeader";
import { SelectField as SharedSelectField } from "../../../../shared/components/Forms/SelectField";

interface LocalizationSectionProps {
  localisationForm: {
    app_language: string;
    date_format: string;
    time_format: string;
    timezone: string;
  };
  setLocalisationForm: React.Dispatch<
    React.SetStateAction<{
      app_language: string;
      date_format: string;
      time_format: string;
      timezone: string;
    }>
  >;
  handleSaveLocalisation: () => void;
  isSaving: boolean;
}

export function LocalizationSection({
  localisationForm,
  setLocalisationForm,
  handleSaveLocalisation,
  isSaving,
}: LocalizationSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <SectionHeader
        icon={<LanguageIcon className="h-5 w-5" />}
        iconBg="bg-red-100"
        iconColor="text-red-600"
        title="Localisation"
        description="Langue, format de date et fuseau horaire"
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <SharedSelectField
          id="app_language"
          label="Langue de l'application"
          value={localisationForm.app_language}
          onChange={(val) =>
            setLocalisationForm({
              ...localisationForm,
              app_language: val.toString(),
            })
          }
          options={[
            { value: "fr", label: "Français" },
            { value: "en", label: "English" },
          ]}
        />

        <SharedSelectField
          id="date_format"
          label="Format de date"
          value={localisationForm.date_format}
          onChange={(val) =>
            setLocalisationForm({
              ...localisationForm,
              date_format: val.toString(),
            })
          }
          options={[
            { value: "DD/MM/YYYY", label: "JJ/MM/AAAA" },
            { value: "MM/DD/YYYY", label: "MM/JJ/AAAA" },
            { value: "YYYY-MM-DD", label: "AAAA-MM-JJ" },
          ]}
        />

        <SharedSelectField
          id="time_format"
          label="Format d'heure"
          value={localisationForm.time_format}
          onChange={(val) =>
            setLocalisationForm({
              ...localisationForm,
              time_format: val.toString(),
            })
          }
          options={[
            { value: "24h", label: "24 heures" },
            { value: "12h", label: "12 heures (AM/PM)" },
          ]}
        />

        <SharedSelectField
          id="timezone"
          label="Fuseau horaire"
          value={localisationForm.timezone}
          onChange={(val) =>
            setLocalisationForm({
              ...localisationForm,
              timezone: val.toString(),
            })
          }
          options={[
            { value: "Europe/Paris", label: "Europe/Paris (GMT+1)" },
            { value: "Europe/London", label: "Europe/London (GMT+0)" },
            {
              value: "America/New_York",
              label: "America/New_York (GMT-5)",
            },
            {
              value: "America/Los_Angeles",
              label: "America/Los_Angeles (GMT-8)",
            },
            { value: "Asia/Tokyo", label: "Asia/Tokyo (GMT+9)" },
            {
              value: "Australia/Sydney",
              label: "Australia/Sydney (GMT+10)",
            },
            {
              value: "Pacific/Auckland",
              label: "Pacific/Auckland (GMT+12)",
            },
          ]}
        />
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-100">
        <Button
          onClick={handleSaveLocalisation}
          loading={isSaving}
          variant="primary"
        >
          Sauvegarder
        </Button>
      </div>
    </div>
  );
}
