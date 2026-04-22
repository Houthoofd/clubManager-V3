/**
 * AppearanceSection - Section apparence
 * Extrait de SettingsPage.tsx (Phase 2 refactorisation)
 */

import { PaintBrushIcon } from "@heroicons/react/24/outline";
import { FormField } from "../../../../shared/components/Forms/FormField";
import { Input } from "../../../../shared/components/Input";
import { Button } from "../../../../shared/components/Button";
import { SectionHeader } from "../SectionHeader";
import { ColorField } from "../ColorField";

interface AppearanceSectionProps {
  apparenceForm: {
    theme_primary_color: string;
    theme_secondary_color: string;
    theme_sidebar_bg: string;
    theme_sidebar_text: string;
    club_logo_url: string;
    navbar_name: string;
  };
  setApparenceForm: React.Dispatch<
    React.SetStateAction<{
      theme_primary_color: string;
      theme_secondary_color: string;
      theme_sidebar_bg: string;
      theme_sidebar_text: string;
      club_logo_url: string;
      navbar_name: string;
    }>
  >;
  handleSaveApparence: () => void;
  isSaving: boolean;
}

export function AppearanceSection({
  apparenceForm,
  setApparenceForm,
  handleSaveApparence,
  isSaving,
}: AppearanceSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <SectionHeader
        icon={<PaintBrushIcon className="h-5 w-5" />}
        iconBg="bg-indigo-100"
        iconColor="text-indigo-600"
        title="Apparence"
        description="Personnalisez les couleurs et le logo"
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <ColorField
          label="Couleur principale"
          value={apparenceForm.theme_primary_color}
          onChange={(val) =>
            setApparenceForm({
              ...apparenceForm,
              theme_primary_color: val,
            })
          }
        />

        <ColorField
          label="Couleur secondaire"
          value={apparenceForm.theme_secondary_color}
          onChange={(val) =>
            setApparenceForm({
              ...apparenceForm,
              theme_secondary_color: val,
            })
          }
        />

        <ColorField
          label="Fond barre latérale"
          value={apparenceForm.theme_sidebar_bg}
          onChange={(val) =>
            setApparenceForm({
              ...apparenceForm,
              theme_sidebar_bg: val,
            })
          }
        />

        <ColorField
          label="Texte barre latérale"
          value={apparenceForm.theme_sidebar_text}
          onChange={(val) =>
            setApparenceForm({
              ...apparenceForm,
              theme_sidebar_text: val,
            })
          }
        />

        <div className="sm:col-span-2">
          <FormField id="club_logo_url" label="URL du logo">
            <Input
              id="club_logo_url"
              type="url"
              value={apparenceForm.club_logo_url}
              onChange={(e) =>
                setApparenceForm({
                  ...apparenceForm,
                  club_logo_url: e.target.value,
                })
              }
              placeholder="https://exemple.com/logo.png"
            />
          </FormField>
        </div>

        <div className="sm:col-span-2">
          <FormField
            id="navbar_name"
            label="Nom affiché dans la navigation"
          >
            <Input
              id="navbar_name"
              type="text"
              value={apparenceForm.navbar_name}
              onChange={(e) =>
                setApparenceForm({
                  ...apparenceForm,
                  navbar_name: e.target.value,
                })
              }
              placeholder="Mon Club"
            />
          </FormField>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-100">
        <Button
          onClick={handleSaveApparence}
          loading={isSaving}
          variant="primary"
        >
          Sauvegarder
        </Button>
      </div>
    </div>
  );
}
