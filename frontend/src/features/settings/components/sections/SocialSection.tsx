/**
 * SocialSection - Section des réseaux sociaux
 * Extrait de SettingsPage.tsx (Phase 2 refactorisation)
 */

import { GlobeAltIcon } from "@heroicons/react/24/outline";
import { FormField } from "../../../../shared/components/Forms/FormField";
import { Input } from "../../../../shared/components/Input";
import { Button } from "../../../../shared/components/Button";
import { SectionHeader } from "../SectionHeader";
import { FacebookIcon, InstagramIcon, TwitterXIcon } from "../index";

interface SocialSectionProps {
  socialForm: {
    social_facebook: string;
    social_instagram: string;
    social_twitter: string;
  };
  setSocialForm: React.Dispatch<
    React.SetStateAction<{
      social_facebook: string;
      social_instagram: string;
      social_twitter: string;
    }>
  >;
  handleSaveSocial: () => void;
  isSaving: boolean;
}

export function SocialSection({
  socialForm,
  setSocialForm,
  handleSaveSocial,
  isSaving,
}: SocialSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <SectionHeader
        icon={<GlobeAltIcon className="h-5 w-5" />}
        iconBg="bg-purple-100"
        iconColor="text-purple-600"
        title="Réseaux sociaux"
        description="Liez vos réseaux sociaux"
      />

      <div className="space-y-5">
        <FormField
          id="social_facebook"
          label="Facebook"
          icon={<FacebookIcon className="text-blue-600" />}
        >
          <Input
            id="social_facebook"
            type="url"
            value={socialForm.social_facebook}
            onChange={(e) =>
              setSocialForm({
                ...socialForm,
                social_facebook: e.target.value,
              })
            }
            placeholder="https://facebook.com/votre-club"
          />
        </FormField>

        <FormField
          id="social_instagram"
          label="Instagram"
          icon={<InstagramIcon className="text-pink-600" />}
        >
          <Input
            id="social_instagram"
            type="url"
            value={socialForm.social_instagram}
            onChange={(e) =>
              setSocialForm({
                ...socialForm,
                social_instagram: e.target.value,
              })
            }
            placeholder="https://instagram.com/votre-club"
          />
        </FormField>

        <FormField
          id="social_twitter"
          label="X (Twitter)"
          icon={<TwitterXIcon className="text-gray-900" />}
        >
          <Input
            id="social_twitter"
            type="url"
            value={socialForm.social_twitter}
            onChange={(e) =>
              setSocialForm({
                ...socialForm,
                social_twitter: e.target.value,
              })
            }
            placeholder="https://x.com/votre-club"
          />
        </FormField>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-100">
        <Button
          onClick={handleSaveSocial}
          loading={isSaving}
          variant="primary"
        >
          Sauvegarder
        </Button>
      </div>
    </div>
  );
}
