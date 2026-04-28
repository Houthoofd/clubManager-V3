interface SectionHeaderProps {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
}

export function SectionHeader({
  icon,
  iconBg,
  iconColor,
  title,
  description,
}: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100">
      <span
        className={`inline-flex items-center justify-center rounded-xl p-2.5 ${iconBg} ${iconColor} flex-shrink-0`}
      >
        {icon}
      </span>
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
}
