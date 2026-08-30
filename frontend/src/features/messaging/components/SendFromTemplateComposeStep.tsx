import { useTranslation } from "react-i18next";
import { CheckCircleIcon, ExclamationTriangleIcon, EyeIcon, PaperPlaneIcon, PencilAltIcon, UsersIcon } from "@patternfly/react-icons";
import { Modal, Button } from "../../../shared/components";
import { Input } from "../../../shared/components/Input/index";
import { SendFromTemplateComposeProps, RoleCible } from "./SendFromTemplateTypes";

// @ts-ignore
const InputSelect = Input.Select;
// @ts-ignore
const InputCheckbox = Input.Checkbox;

export const SendFromTemplateComposeStep = ({
  template,
  manualVarNames,
  manualVars,
  setManualVars,
  recipientType,
  setRecipientType,
  destinataireId,
  setDestinatataireId,
  roleCible,
  setRoleCible,
  envoyeParEmail,
  setEnvoyeParEmail,
  errors,
  setErrors,
  isLoadingPreview,
  isSending,
  handleShowPreview,
  handleSend,
  onClose,
}: SendFromTemplateComposeProps) => {
  const { t } = useTranslation("messages");

  return (
    <>
      <Modal.Header
        title={t("sendFromTemplate.title", { titre: template.titre })}
        showCloseButton
        onClose={onClose}
      />

      <Modal.Body>
        <div className="space-y-6">
          {/* Variables manuelles */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <PencilAltIcon style={{ fontSize: "16px" }} />
              {t("sendFromTemplate.sections.variables")}
            </h3>

            {manualVarNames.length === 0 ? (
              <p className="text-sm text-gray-400 italic bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 flex items-center gap-2">
                <CheckCircleIcon
                  className="text-green-600 flex-shrink-0"
                  style={{ fontSize: "14px" }}
                />
                {t("sendFromTemplate.noManualVars")}
              </p>
            ) : (
              <div className="space-y-3">
                {manualVarNames.map((varName) => (
                  <div key={varName}>
                    <label
                      htmlFor={`var-${varName}`}
                      className="block text-sm text-gray-600 mb-1"
                    >
                      <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-xs text-gray-700">
                        {`{{${varName}}}`}
                      </code>
                    </label>
                    <input
                      id={`var-${varName}`}
                      type="text"
                      value={manualVars[varName] ?? ""}
                      onChange={(e) =>
                        setManualVars((prev) => ({
                          ...prev,
                          [varName]: e.target.value,
                        }))
                      }
                      placeholder={t("sendFromTemplate.placeholders.varValue", {
                        varName,
                      })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors"
                    />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Destinataires */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <UsersIcon style={{ fontSize: "16px" }} />
              {t("sendFromTemplate.sections.recipients")}
            </h3>

            <div className="flex flex-wrap gap-4 mb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="send-recipientType"
                  value="user"
                  checked={recipientType === "user"}
                  onChange={() => {
                    setRecipientType("user");
                    if (errors.destinataire) {
                      setErrors((prev) => {
                        const n = { ...prev };
                        delete n.destinataire;
                        return n;
                      });
                    }
                  }}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  {t("compose.individual")}
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="send-recipientType"
                  value="all"
                  checked={recipientType === "all"}
                  onChange={() => setRecipientType("all")}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  {t("compose.broadcast")}
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="send-recipientType"
                  value="role"
                  checked={recipientType === "role"}
                  onChange={() => setRecipientType("role")}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  {t("sendFromTemplate.byRole")}
                </span>
              </label>
            </div>

            {recipientType === "user" && (
              <Input
                id="destinataire-id"
                type="number"
                value={destinataireId}
                onChange={(e) => {
                  setDestinatataireId(e.target.value);
                  if (errors.destinataire) {
                    setErrors((prev) => {
                      const n = { ...prev };
                      delete n.destinataire;
                      return n;
                    });
                  }
                }}
                placeholder={t("sendFromTemplate.recipientUserIdPlaceholder")}
                error={errors.destinataire}
              />
            )}

            {recipientType === "role" && (
              <InputSelect
                id="role-cible"
                value={roleCible}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setRoleCible(e.target.value as RoleCible)
                }
                options={[
                  { value: "member", label: t("roles.member") },
                  { value: "professor", label: t("roles.professor") },
                  { value: "admin", label: t("roles.admin") },
                ]}
              />
            )}

            {recipientType !== "user" && (
              <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <span className="font-medium inline-flex items-center gap-1">
                  <ExclamationTriangleIcon style={{ fontSize: "14px" }} />{" "}
                  {t("sendFromTemplate.broadcastWarningLabel")}
                </span>{" "}
                {recipientType === "all"
                  ? t("sendFromTemplate.broadcastAll")
                  : t("sendFromTemplate.broadcastRole", {
                      role: roleCible,
                    })}
              </p>
            )}
          </section>

          {/* Envoi par email */}
          <InputCheckbox
            id="envoye-par-email"
            label={t("sendFromTemplate.sendAlsoByEmail")}
            checked={envoyeParEmail}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEnvoyeParEmail(e.target.checked)
            }
          />
        </div>
      </Modal.Body>

      <Modal.Footer align="between">
        <Button
          variant="outline"
          onClick={handleShowPreview}
          disabled={isLoadingPreview || isSending}
          loading={isLoadingPreview}
          icon={!isLoadingPreview && <EyeIcon className="w-4 h-4" />}
        >
          {t("sendFromTemplate.buttons.preview")}
        </Button>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSending || isLoadingPreview}
          >
            {t("actions.cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={handleSend}
            disabled={isSending || isLoadingPreview}
            loading={isSending}
            icon={!isSending && <PaperPlaneIcon className="w-4 h-4" />}
          >
            {t("actions.send")}
          </Button>
        </div>
      </Modal.Footer>
    </>
  );
};
