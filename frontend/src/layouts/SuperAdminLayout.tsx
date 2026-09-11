import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  BuildingOfficeIcon,
  CreditCardIcon,
  Cog8ToothIcon,
  LifebuoyIcon,
  MegaphoneIcon,
  ChartBarSquareIcon,
  PuzzlePieceIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon
,
  ArrowPathRoundedSquareIcon,
  BellIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  MoonIcon,
  SunIcon,
    UserCircleIcon
} from "@heroicons/react/24/outline";
import { useAuth } from "../shared/hooks/useAuth";
import { useTheme } from "../shared/hooks/useTheme";

const navigation = [
  { name: "Tableau de bord", href: "/superadmin", icon: HomeIcon, category: "Général" },
  { name: "Analytics & Usage", href: "/superadmin/analytics", icon: ChartBarSquareIcon, category: "Général" },
  { name: "Support & Résolution", href: "/superadmin/support", icon: LifebuoyIcon, category: "Général" },
  { name: "Clubs & Tenants", href: "/superadmin/clubs", icon: BuildingOfficeIcon, category: "Administratif" },
  { name: "Communications", href: "/superadmin/broadcasts", icon: MegaphoneIcon, category: "Administratif" },
  { name: "Gestion des Modules", href: "/superadmin/modules", icon: PuzzlePieceIcon, category: "Outils & Sécurité" },
  { name: "Gestionnaire de Flux", href: "/superadmin/workflows", icon: ArrowPathRoundedSquareIcon, category: "Outils & Sécurité" },
  { name: "Sécurité & Alertes", href: "/superadmin/security", icon: ShieldCheckIcon, category: "Outils & Sécurité" },
  { name: "Logs d'Audit", href: "/superadmin/audit", icon: ShieldCheckIcon, category: "Outils & Sécurité" },
  { name: "Abonnements", href: "/superadmin/billing", icon: CreditCardIcon, category: "Financier" },
];

export const SuperAdminLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Grouper par catégorie
  const groupedNavigation = navigation.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof navigation>);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="relative z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-900/80" onClick={() => setMobileMenuOpen(false)} />

          <div className="fixed inset-0 flex">
            <div className="relative mr-16 flex w-full max-w-xs flex-1 bg-white dark:bg-white/5 border-r border-gray-200 dark:border-white/10 transition-colors duration-200">
              <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                <button type="button" className="-m-2.5 p-2.5" onClick={() => setMobileMenuOpen(false)}>
                  <span className="sr-only">Fermer la sidebar</span>
                  <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                </button>
              </div>

              <div className="flex grow flex-col gap-y-5 overflow-y-auto pb-2">
                <div className="flex h-16 shrink-0 items-center border-b border-gray-100 dark:border-white/10 px-6">
                  <span className="text-brand-dark dark:text-white font-bold text-xl flex items-center gap-2">
                    <span className="bg-brand-green text-white p-1.5 rounded-lg text-sm">SA</span>
                    SuperAdmin
                  </span>
                </div>
                <nav className="flex flex-1 flex-col justify-center mt-4 mb-16 px-6">
                  <ul role="list" className="flex flex-col gap-y-7 my-auto">
                    {Object.entries(groupedNavigation).map(([category, items]) => (
                      <li key={category}>
                        <div className="text-xs font-semibold leading-6 text-gray-400 uppercase tracking-wider mb-2 text-left px-2">
                          {category}
                        </div>
                        <ul role="list" className="-mx-2 space-y-2">
                          {items.map((item) => {
                            const isActive = location.pathname === item.href || (location.pathname.startsWith(item.href) && item.href !== '/superadmin');
                            return (
                              <li key={item.name}>
                                <Link
                                  to={item.href}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className={
                                    "group flex items-center gap-x-4 rounded-lg px-4 py-2.5 text-sm leading-6 font-semibold transition-all " +
                                    (isActive ? "bg-brand-green/10 dark:bg-brand-green/20 text-brand-green dark:text-brand-green" : "text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-white/10 hover:text-brand-dark dark:hover:text-slate-200")
                                  }
                                >
                                  <item.icon className={"h-6 w-6 shrink-0 " + (isActive ? "text-brand-green" : "text-gray-400 group-hover:text-brand-dark dark:text-slate-400 dark:group-hover:text-slate-200")} aria-hidden="true" />
                                  <span>{item.name}</span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </li>
                    ))}
                                </ul>
            </nav>
            
            {/* Settings at the bottom */}
            <div className="mt-auto border-t border-gray-100 dark:border-white/10 p-4">
              <Link
                to="/superadmin/settings"
                title={isCollapsed ? "Paramètres" : undefined}
                className={
                  "group rounded-lg p-2.5 text-sm leading-6 font-semibold transition-all " +
                  (location.pathname.startsWith('/superadmin/settings') ? "bg-brand-green/10 dark:bg-brand-green/20 text-brand-green dark:text-brand-green" : "text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-white/10 hover:text-brand-dark dark:hover:text-slate-200") + 
                  (isCollapsed ? " flex items-center justify-center" : " flex items-center gap-x-4 px-2")
                }
              >
                <Cog8ToothIcon className={"h-6 w-6 shrink-0 " + (location.pathname.startsWith('/superadmin/settings') ? "text-brand-green" : "text-gray-400 group-hover:text-brand-dark dark:text-slate-400 dark:group-hover:text-slate-200")} />
                {!isCollapsed && <span>Paramètres</span>}
              </Link>
            </div>
            
          </div>
        </div>
          </div>
        </div>
      )}

      {/* Sidebar statique (Desktop) */}
      <div className={"hidden lg:fixed lg:inset-y-0 lg:z-[120] lg:flex lg:flex-col transition-all duration-300 " + (isCollapsed ? "lg:w-20" : "lg:w-72")}>

        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-white/5 border-r border-gray-200 dark:border-white/10 transition-colors duration-200 relative">

          
          <div className={"flex h-16 shrink-0 items-center border-b border-gray-100 dark:border-white/10 px-4 " + (isCollapsed ? "justify-center" : "justify-between")}>
            <span className="text-brand-dark dark:text-white font-bold text-2xl flex items-center gap-2 overflow-hidden">
              <span className="bg-brand-green text-white p-1.5 rounded-lg text-sm shrink-0">SA</span>
              {!isCollapsed && <span className="whitespace-nowrap">Super Admin</span>}
            </span>
            
            {/* Toggle Button moved to Top */}
            
              
          </div>
          
          <nav className="flex flex-1 flex-col justify-center mt-4 mb-16 px-4">
            <ul role="list" className="flex flex-col gap-y-7 my-auto">
              {Object.entries(groupedNavigation).map(([category, items]) => (
                <li key={category}>
                  {!isCollapsed && (
                    <div className="text-xs font-semibold leading-6 text-gray-400 uppercase tracking-wider mb-2 text-left px-2">
                      {category}
                    </div>
                  )}
                  
                  <ul role="list" className="space-y-2">
                    {items.map((item) => {
                      const isActive = location.pathname === item.href || (location.pathname.startsWith(item.href) && item.href !== '/superadmin');
                      return (
                        <li key={item.name} title={isCollapsed ? item.name : undefined}>
                          <Link
                            to={item.href}
                            className={
                              "group rounded-lg p-2.5 text-sm leading-6 font-semibold transition-all " +
                              (isActive ? "bg-brand-green/10 dark:bg-brand-green/20 text-brand-green dark:text-brand-green" : "text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-white/10 hover:text-brand-dark dark:hover:text-slate-200") + 
                              (isCollapsed ? " flex items-center justify-center" : " flex items-center gap-x-4 px-2")
                            }
                          >
                            <item.icon className={"h-6 w-6 shrink-0 transition-colors " + (isActive ? "text-brand-green" : "text-gray-400 group-hover:text-brand-dark dark:text-slate-400 dark:group-hover:text-slate-200")} aria-hidden="true" />
                            {!isCollapsed && <span className="whitespace-nowrap">{item.name}</span>}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
                          </ul>
            </nav>
            
            {/* Settings at the bottom */}
            <div className="mt-auto border-t border-gray-100 dark:border-white/10 p-4">
              <Link
                to="/superadmin/settings"
                title={isCollapsed ? "Paramètres" : undefined}
                className={
                  "group rounded-lg p-2.5 text-sm leading-6 font-semibold transition-all " +
                  (location.pathname.startsWith('/superadmin/settings') ? "bg-brand-green/10 dark:bg-brand-green/20 text-brand-green dark:text-brand-green" : "text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-white/10 hover:text-brand-dark dark:hover:text-slate-200") + 
                  (isCollapsed ? " flex items-center justify-center" : " flex items-center gap-x-4 px-2")
                }
              >
                <Cog8ToothIcon className={"h-6 w-6 shrink-0 " + (location.pathname.startsWith('/superadmin/settings') ? "text-brand-green" : "text-gray-400 group-hover:text-brand-dark dark:text-slate-400 dark:group-hover:text-slate-200")} />
                {!isCollapsed && <span>Paramètres</span>}
              </Link>
            </div>
            
          </div>

        {/* Toggle Button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-[14px] top-[18px] z-[120] flex h-7 w-7 items-center justify-center rounded-full text-gray-400 dark:text-gray-500 hover:text-brand-dark dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 shadow-md transition-colors"
          title={isCollapsed ? "Agrandir" : "Réduire"}
        >
          {isCollapsed ? <ChevronRightIcon className="h-4 w-4" /> : <ChevronLeftIcon className="h-5 w-5" />}
        </button>

        </div>

      <div className={"transition-all duration-300 " + (isCollapsed ? "lg:pl-20" : "lg:pl-72")}>
        <div className="sticky top-0 z-[100] flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 transition-colors duration-200 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button type="button" className="-m-2.5 p-2.5 text-gray-700 lg:hidden" onClick={() => setMobileMenuOpen(true)}>
            <span className="sr-only">Ouvrir la sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>

          {/* SǸparateur */}
          <div className="h-6 w-px bg-gray-900/10 lg:hidden" aria-hidden="true" />

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="relative flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              
              {/* Outils Header */}
                <div className="flex items-center gap-x-2 sm:gap-x-4">
                  <button onClick={toggleTheme} type="button" className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors">
                    <span className="sr-only">Mode Sombre / Clair</span>
                    {theme === 'dark' ? (
                      <SunIcon className="h-6 w-6 text-yellow-400" aria-hidden="true" />
                    ) : (
                      <MoonIcon className="h-6 w-6" aria-hidden="true" />
                    )}
                  </button>
                  <button type="button" className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500 relative">
                    <span className="sr-only">Messages</span>
                    <ChatBubbleOvalLeftEllipsisIcon className="h-6 w-6" aria-hidden="true" />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-brand-green"></span>
                  </button>
                  <button type="button" className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500 relative">
                    <span className="sr-only">Notifications</span>
                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                    <span className="absolute top-2 right-2 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                  </button>
                </div>

                {/* Séparateur */}
                <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />

                {/* Profil & Avatar */}
                <div className="relative">
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center gap-x-3 p-1.5 rounded-full hover:bg-gray-50 transition-colors"
                  >
                    <span className="sr-only">Ouvrir le menu utilisateur</span>
                    <div className="h-9 w-9 rounded-full bg-brand-green text-white flex items-center justify-center font-bold text-sm shadow-sm">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </div>
                    <span className="hidden lg:flex lg:items-center">
                      <span className="text-sm font-semibold leading-6 text-brand-dark dark:text-white" aria-hidden="true">
                        {user?.firstName} {user?.lastName}
                      </span>
                    </span>
                  </button>

                  {profileMenuOpen && (
                    <div className="absolute right-0 z-[110] mt-2.5 w-56 origin-top-right rounded-md bg-white dark:bg-slate-800 py-2 shadow-lg ring-1 ring-gray-900/5 dark:ring-white/10 focus:outline-none">
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-white/10">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Connecté en tant que</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.email}</p>
                      </div>
                      <Link to="/superadmin/profile" onClick={() => setProfileMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm leading-6 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/10">
                          <UserCircleIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" /> Mon Profil
                        </Link>
                      <Link to="/superadmin/settings" onClick={() => setProfileMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm leading-6 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/10">
                          <Cog8ToothIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" /> Paramètres
                        </Link>
                      <div className="border-t border-gray-100 dark:border-white/10 my-1"></div>
                      <button onClick={() => { setProfileMenuOpen(false); handleLogout(); }} className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm leading-6 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10">
                          <ArrowRightOnRectangleIcon className="h-4 w-4 text-red-500 dark:text-red-400" /> Déconnexion
                        </button>
                    </div>
                  )}
                </div>
            </div>
          </div>
        </div>

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
