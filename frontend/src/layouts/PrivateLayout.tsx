/**
 * PrivateLayout
 * Layout pour les pages privées (Dashboard, etc.)
 * Avec sidebar, header et navigation
 */

import { useState, useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import {
  TachometerAltIcon,
  GraduationCapIcon,
  UserIcon,
  UsersIcon,
  CreditCardIcon,
  ShoppingCartIcon,
  EnvelopeIcon,
  ChartBarIcon,
  CogIcon,
} from "@patternfly/react-icons";
import { UserRole } from "@clubmanager/types";
import { INFORMATION_KEYS } from "@clubmanager/types";
import { useAuth } from "../shared/hooks/useAuth";
import { useUnreadCount } from "../features/messaging/hooks/useMessaging";
import { useSettingsStore } from "../features/settings/stores/settingsStore";

// ─── SVG Icon Components ──────────────────────────────────────────────────────

function ChevronLeftIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 19.5 8.25 12l7.5-7.5"
      />
    </svg>
  );
}

function ChevronRightIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m8.25 4.5 7.5 7.5-7.5 7.5"
      />
    </svg>
  );
}

function BellIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
      />
    </svg>
  );
}

function UserCircleIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
    </svg>
  );
}

function SmallCogIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
    </svg>
  );
}

function ChevronDownIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m19.5 8.25-7.5 7.5-7.5-7.5"
      />
    </svg>
  );
}

function ArrowRightOnRectangleIcon({
  className = "h-5 w-5",
}: {
  className?: string;
}) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15"
      />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export const PrivateLayout: React.FC = () => {
  const { user, logout, getFullName, getInitials } = useAuth();
  const unreadCount = useUnreadCount();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const { settings, fetchSettings, getByKey } = useSettingsStore();

  // Fetch settings on layout mount (if not already loaded)
  useEffect(() => {
    if (settings.length === 0) {
      fetchSettings();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Apply theme CSS variables when settings change
  useEffect(() => {
    const primary =
      getByKey(INFORMATION_KEYS.THEME_PRIMARY_COLOR)?.valeur ?? "#2563eb";
    const secondary =
      getByKey(INFORMATION_KEYS.THEME_SECONDARY_COLOR)?.valeur ?? "#7c3aed";
    const sidebarBg =
      getByKey(INFORMATION_KEYS.THEME_SIDEBAR_BG)?.valeur ?? "#ffffff";
    const sidebarTx =
      getByKey(INFORMATION_KEYS.THEME_SIDEBAR_TEXT)?.valeur ?? "#374151";

    document.documentElement.style.setProperty("--color-primary", primary);
    document.documentElement.style.setProperty("--color-secondary", secondary);
    document.documentElement.style.setProperty("--color-sidebar-bg", sidebarBg);
    document.documentElement.style.setProperty(
      "--color-sidebar-text",
      sidebarTx,
    );
  }, [settings]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      navigate("/login");
    }
  };

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <TachometerAltIcon />,
    },
    {
      name: "Courses",
      path: "/courses",
      icon: <GraduationCapIcon />,
    },
    {
      name: "Users",
      path: "/users",
      icon: <UserIcon />,
      roles: [UserRole.ADMIN, UserRole.PROFESSOR],
    },
    {
      name: "Ma famille",
      path: "/family",
      icon: <UsersIcon />,
    },
    {
      name: "Payments",
      path: "/payments",
      icon: <CreditCardIcon />,
      roles: [UserRole.ADMIN, UserRole.MEMBER],
    },
    {
      name: "Store",
      path: "/store",
      icon: <ShoppingCartIcon />,
    },
    {
      name: "Messages",
      path: "/messages",
      icon: <EnvelopeIcon />,
    },
    {
      name: "Statistics",
      path: "/statistics/dashboard",
      icon: <ChartBarIcon />,
      roles: [UserRole.ADMIN, UserRole.PROFESSOR],
    },
    {
      name: "Settings",
      path: "/settings",
      icon: <CogIcon />,
      roles: [UserRole.ADMIN],
    },
  ];

  const userRole = (user?.role_app as UserRole | undefined) ?? UserRole.MEMBER;

  // Parse active modules from settings
  const activeModulesSetting = getByKey(
    INFORMATION_KEYS.ACTIVE_MODULES,
  )?.valeur;
  const activeModuleKeys = activeModulesSetting
    ? activeModulesSetting.split(",").map((m) => m.trim())
    : null; // null means all modules are active (settings not yet configured)

  // Map route paths to module keys
  const pathToModuleKey: Record<string, string> = {
    "/dashboard": "dashboard",
    "/courses": "courses",
    "/users": "users",
    "/family": "families",
    "/payments": "payments",
    "/store": "store",
    "/messages": "messages",
    "/statistics": "statistics",
    "/settings": "settings", // settings is always visible to admin
  };

  const visibleMenuItems = menuItems
    .filter((item) => !item.roles || item.roles.includes(userRole))
    .filter((item) => {
      if (!activeModuleKeys) return true; // no setting configured = show all
      const moduleKey = pathToModuleKey[item.path];
      if (!moduleKey || moduleKey === "dashboard" || moduleKey === "settings")
        return true; // always show
      return activeModuleKeys.includes(moduleKey);
    });

  const isActive = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? "w-64" : "w-20"
        } shadow-lg transition-all duration-300 ease-in-out flex flex-col`}
        style={{ backgroundColor: "var(--color-sidebar-bg)" }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200/60">
          {isSidebarOpen && (
            <Link to="/dashboard" className="flex items-center gap-2 min-w-0">
              {getByKey(INFORMATION_KEYS.CLUB_LOGO_URL)?.valeur ? (
                <img
                  src={getByKey(INFORMATION_KEYS.CLUB_LOGO_URL)!.valeur}
                  alt="Logo"
                  className="h-8 w-auto object-contain flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : null}
              <h1
                className="text-xl font-bold truncate"
                style={{ color: "var(--color-primary)" }}
              >
                {getByKey(INFORMATION_KEYS.NAVBAR_NAME)?.valeur ||
                  getByKey(INFORMATION_KEYS.CLUB_NAME)?.valeur ||
                  "ClubManager"}
              </h1>
            </Link>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle sidebar"
          >
            {isSidebarOpen ? (
              <ChevronLeftIcon className="h-5 w-5" />
            ) : (
              <ChevronRightIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-3">
            {visibleMenuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-3 py-3 rounded-lg transition-colors ${
                    isActive(item.path) ? "bg-blue-50" : "hover:bg-black/5"
                  }`}
                  style={
                    isActive(item.path)
                      ? { color: "var(--color-primary)" }
                      : { color: "var(--color-sidebar-text)" }
                  }
                  title={!isSidebarOpen ? item.name : undefined}
                >
                  <span className="text-xl">{item.icon}</span>
                  {isSidebarOpen && (
                    <span className="ml-3 font-medium flex-1">{item.name}</span>
                  )}
                  {item.path === "/messages" && unreadCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Info */}
        <div className="border-t border-gray-200/60 p-4">
          {isSidebarOpen ? (
            <div className="flex items-center">
              <div
                className="w-10 h-10 rounded-full text-white flex items-center justify-center font-semibold"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                {getInitials()}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p
                  className="text-sm font-medium truncate"
                  style={{ color: "var(--color-sidebar-text)" }}
                >
                  {getFullName()}
                </p>
                <p
                  className="text-xs truncate"
                  style={{ color: "var(--color-sidebar-text)", opacity: 0.7 }}
                >
                  {user?.email}
                </p>
              </div>
            </div>
          ) : (
            <div
              className="w-10 h-10 rounded-full text-white flex items-center justify-center font-semibold mx-auto"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              {getInitials()}
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              {visibleMenuItems.find((item) => isActive(item.path))?.name ||
                "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Notifications"
            >
              <BellIcon className="h-5 w-5 text-gray-600" />
              <span
                className="absolute top-1 right-1 w-2 h-2 rounded-full"
                style={{ backgroundColor: "var(--color-secondary)" }}
              />
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div
                  className="w-8 h-8 rounded-full text-white flex items-center justify-center text-sm font-semibold"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  {getInitials()}
                </div>
                <span className="text-sm font-medium text-gray-700 hidden md:block">
                  {getFullName()}
                </span>
                <ChevronDownIcon className="h-4 w-4 text-gray-500" />
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <UserCircleIcon className="h-4 w-4 mr-2" />
                    Profil
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <SmallCogIcon className="h-4 w-4 mr-2" />
                    Paramètres
                  </Link>
                  <hr className="my-1 border-gray-200" />
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

      {/* Click outside to close user menu */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default PrivateLayout;
