import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  BuildingOfficeIcon,
  CreditCardIcon,
  Cog8ToothIcon,
  ArrowRightOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";
import { useAuth } from "../shared/hooks/useAuth";

const navigation = [
  { name: "Tableau de bord", href: "/superadmin", icon: HomeIcon, category: "Général" },
  { name: "Clubs & Tenants", href: "/superadmin/clubs", icon: BuildingOfficeIcon, category: "Administratif" },
  { name: "Abonnements", href: "/superadmin/billing", icon: CreditCardIcon, category: "Financier" },
  { name: "Paramètres globaux", href: "/superadmin/settings", icon: Cog8ToothIcon, category: "Outils" },
];

export const SuperAdminLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

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
    <div>
      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="relative z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-900/80" onClick={() => setMobileMenuOpen(false)} />

          <div className="fixed inset-0 flex">
            <div className="relative mr-16 flex w-full max-w-xs flex-1 bg-white border-r border-gray-200">
              <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                <button type="button" className="-m-2.5 p-2.5" onClick={() => setMobileMenuOpen(false)}>
                  <span className="sr-only">Fermer la sidebar</span>
                  <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                </button>
              </div>

              <div className="flex grow flex-col gap-y-5 overflow-y-auto pb-2">
                <div className="flex h-16 shrink-0 items-center border-b border-gray-100 px-6">
                  <span className="text-brand-dark font-bold text-xl flex items-center gap-2">
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
                                    (isActive ? "bg-brand-green/10 text-brand-green" : "text-gray-600 hover:bg-gray-50 hover:text-brand-dark")
                                  }
                                >
                                  <item.icon className={"h-6 w-6 shrink-0 " + (isActive ? "text-brand-green" : "text-gray-400 group-hover:text-brand-dark")} aria-hidden="true" />
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
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar statique (Desktop) */}
      <div className={"hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col transition-all duration-300 " + (isCollapsed ? "lg:w-20" : "lg:w-72")}>
        {/* Toggle Button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-5 z-10 p-1.5 rounded-lg text-gray-400 hover:text-brand-dark hover:bg-gray-100 bg-white border border-gray-200 shadow-sm transition-colors"
          title={isCollapsed ? "Agrandir" : "Réduire"}
        >
          {isCollapsed ? <ChevronRightIcon className="h-4 w-4" /> : <ChevronLeftIcon className="h-5 w-5" />}
        </button>

        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-gray-200 relative">
          
          <div className={"flex h-16 shrink-0 items-center border-b border-gray-100 px-4 " + (isCollapsed ? "justify-center" : "justify-between")}>
            <span className="text-brand-dark font-bold text-2xl flex items-center gap-2 overflow-hidden">
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
                              (isActive ? "bg-brand-green/10 text-brand-green" : "text-gray-600 hover:bg-gray-50 hover:text-brand-dark") + 
                              (isCollapsed ? " flex items-center justify-center" : " flex items-center gap-x-4 px-2")
                            }
                          >
                            <item.icon className={"h-6 w-6 shrink-0 transition-colors " + (isActive ? "text-brand-green" : "text-gray-400 group-hover:text-brand-dark")} aria-hidden="true" />
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
        </div>
      </div>

      <div className={"transition-all duration-300 " + (isCollapsed ? "lg:pl-20" : "lg:pl-72")}>
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button type="button" className="-m-2.5 p-2.5 text-gray-700 lg:hidden" onClick={() => setMobileMenuOpen(true)}>
            <span className="sr-only">Ouvrir la sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>

          {/* SǸparateur */}
          <div className="h-6 w-px bg-gray-900/10 lg:hidden" aria-hidden="true" />

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="relative flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              
              {/* Profil */}
              <div className="flex items-center gap-x-4 lg:gap-x-6">
                <span className="hidden lg:flex lg:items-center text-sm font-semibold leading-6 text-brand-dark">
                  {user?.firstName} {user?.lastName} (HQ)
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 shadow-sm ring-1 ring-inset ring-red-100 hover:bg-red-100 transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  <span className="hidden sm:inline">DǸconnexion</span>
                </button>
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
