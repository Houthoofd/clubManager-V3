/**
 * ClubInfoSection - Section des informations du club
 * Extrait de SettingsPage.tsx (Phase 2 refactorisation)
 *
 * INTERNATIONALISÉ - Utilise react-i18next pour tous les textes
 */

import { useTranslation } from "react-i18next";
import { BuildingOffice2Icon } from "@heroicons/react/24/outline";
import { FormField } from "../../../../shared/components/Forms/FormField";
import { Input } from "../../../../shared/components/Input";
import { Button } from "../../../../shared/components/Button";
import { SectionHeader } from "../SectionHeader";

interface ClubInfoSectionProps {
  clubForm: {
    club_name: string;
    club_address: string;
    club_phone: string;
    club_email: string;
    club_website: string;
  };
  setClubForm: React.Dispatch<
    React.SetStateAction<{
      club_name: string;
      club_address: string;
      club_phone: string;
      club_email: string;
      club_website: string;
    }>
  >;
  handleSaveClub: () => void;
  isSaving: boolean;
}

export function ClubInfoSection({
  clubForm,
  setClubForm,
  handleSaveClub,
  isSaving,
}: ClubInfoSectionProps) {
  const { t } = useTranslation("settings");

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <SectionHeader
        icon={<BuildingOffice2Icon className="h-5 w-5" />}
        iconBg="bg-blue-100"
        iconColor="text-blue-600"
        title={t("clubInfo.title")}
        description={t("clubInfo.description")}
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FormField id="club_name" label={t("clubInfo.name")} required>
            <Input
              id="club_name"
              type="text"
              value={clubForm.club_name}
              onChange={(e) =>
                setClubForm({ ...clubForm, club_name: e.target.value })
              }
              placeholder={t("clubInfo.namePlaceholder")}
            />
          </FormField>
        </div>

        <div className="sm:col-span-2">
          <FormField id="club_address" label={t("clubInfo.address")}>
            <Input
              id="club_address"
              type="text"
              value={clubForm.club_address}
              onChange={(e) =>
                setClubForm({ ...clubForm, club_address: e.target.value })
              }
              placeholder={t("clubInfo.addressPlaceholder")}
            />
          </FormField>
        </div>

        <FormField id="club_phone" label={t("clubInfo.phone")}>
          <Input
            id="club_phone"
            type="tel"
            value={clubForm.club_phone}
            onChange={(e) =>
              setClubForm({ ...clubForm, club_phone: e.target.value })
            }
            placeholder={t("clubInfo.phonePlaceholder")}
          />
        </FormField>

        <FormField id="club_email" label={t("clubInfo.email")}>
          <Input
            id="club_email"
            type="email"
            value={clubForm.club_email}
            onChange={(e) =>
              setClubForm({ ...clubForm, club_email: e.target.value })
            }
            placeholder={t("clubInfo.emailPlaceholder")}
          />
        </FormField>

        <div className="sm:col-span-2">
          <FormField id="club_website" label={t("clubInfo.website")}>
            <Input
              id="club_website"
              type="url"
              value={clubForm.club_website}
              onChange={(e) =>
                setClubForm({ ...clubForm, club_website: e.target.value })
              }
              placeholder={t("clubInfo.websitePlaceholder")}
            />
          </FormField>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-100">
        <Button onClick={handleSaveClub} loading={isSaving} variant="primary">
          {t("actions.save")}
        </Button>
      </div>
    </div>
  );
}
