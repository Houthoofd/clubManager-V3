/**
 * StorePage
 * Page principale du module boutique.
 *
 * MIGRATION : Utilise les composants réutilisables de la bibliothèque shared
 * - TabGroup pour la navigation par onglets
 * - SelectField pour les filtres/dropdowns
 * - IconButton pour les actions (edit, delete, adjust)
 * - ConfirmDialog pour les confirmations
 * - LoadingSpinner, EmptyState, ErrorBanner pour le feedback
 */

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { UserRole } from "@clubmanager/types";
import { useAuth } from "../../../shared/hooks/useAuth";
import { useStoreUI } from "../stores/storeStore";
import {
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  ArchiveBoxIcon,
  ArrowsRightLeftIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

// ═══════════════════════════════════════════════════════════════════════════
// IMPORTS DES COMPOSANTS RÉUTILISABLES
// ═══════════════════════════════════════════════════════════════════════════

import { TabGroup } from "../../../shared/components/Navigation/TabGroup";
import { PageHeader } from "../../../shared/components/Layout/PageHeader";

// ═══════════════════════════════════════════════════════════════════════════
// TABS COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

import { CatalogueTab } from "../components/tabs/CatalogueTab";
import { BoutiqueTab } from "../components/tabs/BoutiqueTab";
import { OrdersTab } from "../components/tabs/OrdersTab";
import { MyOrdersTab } from "../components/tabs/MyOrdersTab";
import { StocksTab } from "../components/tabs/StocksTab";
import { ConfigurationTab } from "../components/tabs/ConfigurationTab";
import { MovementsTab } from "../components/tabs/MovementsTab";

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL : STOREPAGE
// ═══════════════════════════════════════════════════════════════════════════

export function StorePage() {
  const { t } = useTranslation("store");
  const { user } = useAuth();
  const { activeTab, setActiveTab } = useStoreUI();
  const userRole = (user?.role_app ?? UserRole.MEMBER) as UserRole;
  const canManageStore =
    userRole === UserRole.ADMIN || userRole === UserRole.PROFESSOR;

  useEffect(() => {
    if (canManageStore) {
      if (activeTab === "boutique" || activeTab === "mes_commandes") {
        setActiveTab("catalogue");
      }
      return;
    }

    if (
      activeTab === "catalogue" ||
      activeTab === "commandes" ||
      activeTab === "stocks" ||
      activeTab === "configuration"
    ) {
      setActiveTab("boutique");
    }
  }, [activeTab, canManageStore, setActiveTab]);

  // MIGRATION : TabGroup - Définition des onglets
  const tabs = canManageStore
    ? [
        {
          id: "catalogue",
          label: t("tabs.catalogue"),
          icon: <ShoppingBagIcon className="h-4 w-4" />,
          testId: "tab-catalogue",
        },
        {
          id: "commandes",
          label: t("tabs.orders"),
          icon: <ClipboardDocumentListIcon className="h-4 w-4" />,
          testId: "tab-commandes",
        },
        {
          id: "stocks",
          label: t("tabs.stocks"),
          icon: <ArchiveBoxIcon className="h-4 w-4" />,
          testId: "tab-stocks",
        },
        {
          id: "mouvements",
          label: t("tabs.movements", "Mouvements"),
          icon: <ArrowsRightLeftIcon className="h-4 w-4" />,
          testId: "tab-mouvements",
        },
        {
          id: "configuration",
          label: t("tabs.configuration"),
          icon: <Cog6ToothIcon className="h-4 w-4" />,
          testId: "tab-configuration",
        },
      ]
    : [
        {
          id: "boutique",
          label: t("tabs.shop"),
          icon: <ShoppingBagIcon className="h-4 w-4" />,
          testId: "tab-boutique",
        },
        {
          id: "mes_commandes",
          label: t("tabs.myOrders"),
          icon: <ClipboardDocumentListIcon className="h-4 w-4" />,
          testId: "tab-mes-commandes",
        },
      ];

  return (
    <div className="space-y-6" data-testid="store-page">
      {/* ── En-tête ── */}
      <PageHeader
        title={t("page.title")}
        description={
          canManageStore
            ? t("page.descriptionAdmin")
            : t("page.descriptionMember")
        }
      />

      {/* ── Conteneur onglets ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* MIGRATION : TabGroup pour la navigation */}
        <TabGroup
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId as typeof activeTab)}
          scrollable
        />

        {/* ── Contenu des onglets ── */}
        {activeTab === "catalogue" && <CatalogueTab />}
        {activeTab === "commandes" && <OrdersTab />}
        {activeTab === "stocks" && <StocksTab />}
        {activeTab === "mouvements" && <MovementsTab />}
        {activeTab === "configuration" && <ConfigurationTab />}
        {activeTab === "boutique" && <BoutiqueTab />}
        {activeTab === "mes_commandes" && <MyOrdersTab />}
      </div>
    </div>
  );
}
