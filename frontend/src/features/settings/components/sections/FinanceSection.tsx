/**
 * FinanceSection - Section finance et légal
 * Extrait de SettingsPage.tsx (Phase 2 refactorisation)
 */

import { BanknotesIcon } from "@heroicons/react/24/outline";
import { FormField } from "../../../../shared/components/Forms/FormField";
import { Input } from "../../../../shared/components/Input";
import { Button } from "../../../../shared/components/Button";
import { SectionHeader } from "../SectionHeader";

interface FinanceSectionProps {
  financeForm: {
    bank_account: string;
    vat_number: string;
    legal_info: string;
  };
  setFinanceForm: React.Dispatch<
    React.SetStateAction<{
      bank_account: string;
      vat_number: string;
      legal_info: string;
    }>
  >;
  handleSaveFinance: () => void;
  isSaving: boolean;
}

export function FinanceSection({
  financeForm,
  setFinanceForm,
  handleSaveFinance,
  isSaving,
}: FinanceSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <SectionHeader
        icon={<BanknotesIcon className="h-5 w-5" />}
        iconBg="bg-yellow-100"
        iconColor="text-yellow-600"
        title="Finance & Légal"
        description="Informations bancaires et légales"
      />

      <div className="space-y-5">
        <FormField id="bank_account" label="IBAN">
          <Input
            id="bank_account"
            type="text"
            value={financeForm.bank_account}
            onChange={(e) =>
              setFinanceForm({
                ...financeForm,
                bank_account: e.target.value,
              })
            }
            placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
          />
        </FormField>

        <FormField id="vat_number" label="Numéro de TVA">
          <Input
            id="vat_number"
            type="text"
            value={financeForm.vat_number}
            onChange={(e) =>
              setFinanceForm({
                ...financeForm,
                vat_number: e.target.value,
              })
            }
            placeholder="FR12345678901"
          />
        </FormField>

        <FormField id="legal_info" label="Mentions légales">
          <Input
            id="legal_info"
            type="text"
            value={financeForm.legal_info}
            onChange={(e) =>
              setFinanceForm({
                ...financeForm,
                legal_info: e.target.value,
              })
            }
            placeholder="Siret, RCS, etc."
          />
        </FormField>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-100">
        <Button
          onClick={handleSaveFinance}
          loading={isSaving}
          variant="primary"
        >
          Sauvegarder
        </Button>
      </div>
    </div>
  );
}
