interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
}

export function ColorField({ label, value, onChange, description }: ColorFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value || "#2563eb"}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-20 cursor-pointer rounded border border-gray-300 p-0.5"
        />
        <input
          type="text"
          value={value || "#2563eb"}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#2563eb"
          className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
        />
        <div
          className="h-8 w-8 rounded-full border border-gray-300"
          style={{ backgroundColor: value || "#2563eb" }}
        />
      </div>
      {description && (
        <p className="mt-1 text-xs text-gray-500">{description}</p>
      )}
    </div>
  );
}
