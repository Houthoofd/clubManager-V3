const fs = require('fs');
const file = 'frontend/src/features/dashboard/components/QuickActions.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add useAuth import
if (!content.includes('useAuth')) {
    content = content.replace(
        'import { useNavigate } from "react-router-dom";',
        'import { useNavigate } from "react-router-dom";\nimport { useAuth } from "../../../shared/hooks/useAuth";\nimport { UserRole } from "@clubmanager/types";'
    );
}

// Add new icons
const newIcons = `
const UserGroupIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
  </svg>
);

const TicketIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
  </svg>
);

const DocumentIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);
`;

if (!content.includes('UserGroupIcon')) {
    content = content.replace('const CalendarDaysIcon', newIcons + '\nconst CalendarDaysIcon');
}

// Modify the component
const componentCode = `export function QuickActions() {
  const { t } = useTranslation("dashboard");
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const isAdminOrProf = user?.role_app === UserRole.ADMIN || user?.role_app === UserRole.PROFESSOR;

  const adminActions: ActionConfig[] = [
    { route: "/courses", labelKey: "quickActions.courses", Icon: CalendarDaysIcon, iconColor: "bg-indigo-100 text-indigo-600" },
    { route: "/users", labelKey: "quickActions.members", Icon: UsersIcon, iconColor: "bg-blue-100 text-blue-600" },
    { route: "/payments", labelKey: "quickActions.payments", Icon: CreditCardIcon, iconColor: "bg-green-100 text-green-600" },
    { route: "/store", labelKey: "quickActions.store", Icon: ShoppingBagIcon, iconColor: "bg-orange-100 text-orange-600" },
    { route: "/messages", labelKey: "quickActions.messages", Icon: ChatBubbleIcon, iconColor: "bg-teal-100 text-teal-600" },
    { route: "/statistics", labelKey: "quickActions.statistics", Icon: ChartBarIcon, iconColor: "bg-purple-100 text-purple-600" },
    { route: "/alerts", labelKey: "Alertes", Icon: DocumentIcon, iconColor: "bg-red-100 text-red-600" },
    { route: "/notifications", labelKey: "quickActions.notifications", Icon: BellIcon, iconColor: "bg-yellow-100 text-yellow-600" },
  ];

  const memberActions: ActionConfig[] = [
    { route: "/reservations", labelKey: "Réservations", Icon: CalendarDaysIcon, iconColor: "bg-indigo-100 text-indigo-600" },
    { route: "/events", labelKey: "Événements", Icon: TicketIcon, iconColor: "bg-pink-100 text-pink-600" },
    { route: "/family", labelKey: "Ma Famille", Icon: UserGroupIcon, iconColor: "bg-blue-100 text-blue-600" },
    { route: "/payments", labelKey: "quickActions.payments", Icon: CreditCardIcon, iconColor: "bg-green-100 text-green-600" },
    { route: "/store", labelKey: "quickActions.store", Icon: ShoppingBagIcon, iconColor: "bg-orange-100 text-orange-600" },
    { route: "/messages", labelKey: "quickActions.messages", Icon: ChatBubbleIcon, iconColor: "bg-teal-100 text-teal-600" },
    { route: "/profile", labelKey: "quickActions.profile", Icon: UserCircleIcon, iconColor: "bg-gray-100 text-gray-600" },
    { route: "/notifications", labelKey: "quickActions.notifications", Icon: BellIcon, iconColor: "bg-yellow-100 text-yellow-600" },
  ];

  const currentActions = isAdminOrProf ? adminActions : memberActions;

  return (
    <section aria-labelledby="quick-actions-title" data-testid="quick-actions">
      <h2 id="quick-actions-title" className="text-base font-semibold text-gray-800 mb-3">
        {t("quickActions.title")}
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {currentActions.map(({ route, labelKey, Icon, iconColor }) => (
          <div
            key={route}
            data-testid={"quick-action-" + route.slice(1)}
            role="button"
            tabIndex={0}
            onClick={() => navigate(route)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate(route);
              }
            }}
            className="bg-white rounded-xl shadow hover:shadow-md transition-shadow cursor-pointer p-5 flex flex-col items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <div className={\`flex items-center justify-center w-11 h-11 rounded-full \${iconColor}\`}>
              <Icon className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-gray-700 text-center leading-tight">
              {labelKey.includes('.') ? t(labelKey) : labelKey}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}`;

content = content.replace(/const ACTIONS: ActionConfig\[\] = \[[\s\S]*?\];/, '');
content = content.replace(/export function QuickActions\(\) \{[\s\S]*?export default QuickActions;/m, componentCode + '\n\nexport default QuickActions;');

fs.writeFileSync(file, content, 'utf8');
console.log('QuickActions.tsx updated');
