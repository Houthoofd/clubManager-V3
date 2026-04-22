/**
 * ClubInfoSection - Section des informations du club
 * Extrait de SettingsPage.tsx (Phase 2 refactorisation)
 */

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
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <SectionHeader
        icon={<BuildingOffice2Icon className="h-5 w-5" />}
        iconBg="bg-blue-100"
        iconColor="text-blue-600"
        title="Informations du club"
        description="Gérez les informations essentielles de votre club"
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FormField id="club_name" label="Nom du club" required>
            <Input
              id="club_name"
              type="text"
              value={clubForm.club_name}
              onChange={(e) =>
                setClubForm({ ...clubForm, club_name: e.target.value })
              }
              placeholder="Club de Sport Exemple"
            />
          </FormField>
        </div>

        <div className="sm:col-span-2">
          <FormField id="club_address" label="Adresse">
            <Input
              id="club_address"
              type="text"
              value={clubForm.club_address}
              onChange={(e) =>
                setClubForm({ ...clubForm, club_address: e.target.value })
              }
              placeholder="123 Rue de la République, 75001 Paris"
            />
          </FormField>
        </div>

        <FormField id="club_phone" label="Téléphone">
          <Input
            id="club_phone"
            type="tel"
            value={clubForm.club_phone}
            onChange={(e) =>
              setClubForm({ ...clubForm, club_phone: e.target.value })
            }
            placeholder="+33 1 23 45 67 89"
          />
        </FormField>

        <FormField id="club_email" label="Email">
          <Input
            id="club_email"
            type="email"
            value={clubForm.club_email}
            onChange={(e) =>
              setClubForm({ ...clubForm, club_email: e.target.value })
            }
            placeholder="contact@club.fr"
          />
        </FormField>

        <div className="sm:col-span-2">
          <FormField id="club_website" label="Site web">
            <Input
              id="club_website"
              type="url"
              value={clubForm.club_website}
              onChange={(e) =>
                setClubForm({ ...clubForm, club_website: e.target.value })
              }
              placeholder="https://www.club.fr"
            />
          </FormField>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-100">
        <Button
          onClick={handleSaveClub}
          loading={isSaving}
          variant="primary"
        >
          Sauvegarder
        </Button>
      </div>
    </div>
  );
}
