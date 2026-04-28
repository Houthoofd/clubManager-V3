import { useTranslation } from "react-i18next";

interface ModuleToggleProps {
  label: string;
  moduleKey: string;
  enabled: boolean;
  disabled?: boolean;
  onChange: (key: string, enabled: boolean) => void;
}

export function ModuleToggle({
  label,
  moduleKey,
  enabled,
  disabled = false,
  onChange,
}: ModuleToggleProps) {
  const { t } = useTranslation("common");

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div>
        <p
          className={`text-sm font-medium ${disabled ? "text-gray-400" : "text-gray-900"}`}
        >
          {label}
        </p>
        {disabled && (
          <p className="text-xs text-gray-400">{t("status.alwaysActive")}</p>
        )}
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && onChange(moduleKey, !enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          enabled ? "bg-blue-600" : "bg-gray-200"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        aria-checked={enabled}
        role="switch"
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
