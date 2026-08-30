import { useTranslation } from "react-i18next";
import { ArrowLeftIcon, CheckCircleIcon, ExclamationTriangleIcon, InfoCircleIcon } from "@patternfly/react-icons";
import { Modal, Button } from "../../../shared/components";
import { SendFromTemplatePreviewProps } from "./SendFromTemplateTypes";

export const SendFromTemplatePreviewStep = ({
  preview,
  isSending,
  handleSend,
  setStep,
  onClose,
}: SendFromTemplatePreviewProps) => {
  const { t } = useTranslation("messages");

  return (
    <>
      <Modal.Header
        title={t("sendFromTemplate.previewTitle")}
        showCloseButton
        onClose={onClose}
      />

      <Modal.Body>
        <div className="space-y-4">
          {preview.titre && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                {t("sendFromTemplate.preview.titleLabel")}
              </p>
              <p className="text-sm font-medium text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                {preview.titre}
              </p>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              {t("sendFromTemplate.preview.contentLabel")}
            </p>
            <div className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 whitespace-pre-wrap leading-relaxed min-h-[100px]">
              {preview.contenu}
            </div>
          </div>

          {preview.missingVariables.length === 0 ? (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
              <CheckCircleIcon className="w-4 h-4 flex-shrink-0" />
              <span>{t("sendFromTemplate.preview.allVarsOk")}</span>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <p className="text-sm font-medium text-red-700 mb-2 flex items-center gap-1">
                <ExclamationTriangleIcon style={{ fontSize: "14px" }} />
                {t("sendFromTemplate.preview.missingVars", {
                  count: preview.missingVariables.length,
                })}
              </p>
              <div className="flex flex-wrap gap-2">
                {preview.missingVariables.map((v) => (
                  <code
                    key={v}
                    className="text-xs bg-red-100 text-red-800 border border-red-300 px-2 py-0.5 rounded font-mono"
                  >
                    {`{{${v}}}`}
                  </code>
                ))}
              </div>
              <p className="mt-2 text-xs text-red-600">
                {t("sendFromTemplate.preview.goBackHint")}
              </p>
            </div>
          )}

          <div className="text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 flex items-center gap-2">
            <InfoCircleIcon
              className="flex-shrink-0"
              style={{ fontSize: "14px" }}
            />
            <span>{t("sendFromTemplate.preview.exampleNote")}</span>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer align="between">
        <Button
          variant="outline"
          onClick={() => setStep("compose")}
          disabled={isSending}
          icon={<ArrowLeftIcon className="w-4 h-4" />}
        >
          {t("actions.back")}
        </Button>

        <Button
          variant="success"
          onClick={handleSend}
          disabled={isSending || preview.missingVariables.length > 0}
          loading={isSending}
          icon={!isSending && <CheckCircleIcon className="w-4 h-4" />}
        >
          {t("sendFromTemplate.buttons.confirm")}
        </Button>
      </Modal.Footer>
    </>
  );
};
