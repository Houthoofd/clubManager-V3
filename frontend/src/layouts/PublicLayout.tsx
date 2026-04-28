/**
 * PublicLayout
 * Layout pour les pages publiques (Login, Register, etc.)
 */

import { Outlet, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const PublicLayout: React.FC = () => {
  const { t } = useTranslation("common");
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">
                {t("layout.clubManager")}
              </h1>
            </Link>

            <nav className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {t("navigation.login")}
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {t("navigation.register")}
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} {t("layout.clubManager")}.{" "}
              {t("footer.allRightsReserved")}.
            </p>
            <div className="flex space-x-6">
              <a
                href="#"
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                {t("footer.privacyPolicy")}
              </a>
              <a
                href="#"
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                {t("footer.termsOfService")}
              </a>
              <a
                href="#"
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                {t("footer.contact")}
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
