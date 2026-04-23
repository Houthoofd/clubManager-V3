/**
 * FinanceSection - Section finance et légal
 * Extrait de SettingsPage.tsx (Phase 2 refactorisation)
 */

import { BanknotesIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("settings");

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <SectionHeader
        icon={<BanknotesIcon className="h-5 w-5" />}
        iconBg="bg-yellow-100"
        iconColor="text-yellow-600"
        title={t("finance.title")}
        description={t("finance.description")}
      />

      <div className="space-y-5">
        <FormField id="bank_account" label={t("finance.iban")}>
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
            placeholder={t("finance.ibanPlaceholder")}
          />
        </FormField>

        <FormField id="vat_number" label={t("finance.vatNumber")}>
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
            placeholder={t("finance.vatPlaceholder")}
          />
        </FormField>

        <FormField id="legal_info" label={t("finance.legalInfo")}>
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
            placeholder={t("finance.legalPlaceholder")}
          />
        </FormField>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-100">
        <Button
          onClick={handleSaveFinance}
          loading={isSaving}
          variant="primary"
        >
          {t("actions.save")}
        </Button>
      </div>
    </div>
  );
}
