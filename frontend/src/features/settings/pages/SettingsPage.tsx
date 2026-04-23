/**
 * SettingsPage - Version migrée avec design system
 *
 * MIGRATIONS EFFECTUÉES :
 * ✅ Phase 1: Icônes Heroicons (suppression de 9 fonctions SVG custom, -180 lignes)
 * ✅ Phase 2: Formulaires (FormField + Input/Select)
 * ✅ Phase 3: LoadingSpinner partagé
 * ✅ Phase 4: Internationalisation (i18n avec react-i18next)
 *
 * Page de gestion des paramètres du club.
 * Accessible aux administrateurs uniquement.
 */

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useSettings } from "../hooks/useSettings";
import { INFORMATION_KEYS } from "@clubmanager/types";
import type { CreateInformation } from "@clubmanager/types";

// ─── Composants partagés ──────────────────────────────────────────────────────
import { TabGroup } from "../../../shared/components/Navigation/TabGroup";
import type { Tab } from "../../../shared/components/Navigation/TabGroup";
import { PageHeader } from "../../../shared/components/Layout/PageHeader";
import { LoadingSpinner } from "../../../shared/components/Layout/LoadingSpinner";

// ─── Heroicons (remplace les 9 SVG custom) ────────────────────────────────────
import {
  Cog6ToothIcon,
  BuildingOffice2Icon,
  ClockIcon,
  GlobeAltIcon,
  BanknotesIcon,
  PaintBrushIcon,
  Squares2X2Icon,
  LanguageIcon,
} from "@heroicons/react/24/outline";

// ─── Sections de paramètres ───────────────────────────────────────────────────
import {
  ClubInfoSection,
  ScheduleSection,
  SocialSection,
  FinanceSection,
  AppearanceSection,
  NavigationSection,
  LocalizationSection,
} from "../components/sections";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId =
  | "club"
  | "horaires"
  | "social"
  | "finance"
  | "apparence"
  | "navigation"
  | "localisation";

// ─── Composant principal ──────────────────────────────────────────────────────

export const SettingsPage = () => {
  const { t } = useTranslation("settings");
  const { settings, isLoading, isSaving, bulkUpsertSettings, getByKey } =
    useSettings();

  const [activeTab, setActiveTab] = useState<TabId>("club");

  // ─── États du formulaire ──────────────────────────────────────────────────
  const [clubForm, setClubForm] = useState({
    club_name: "",
    club_address: "",
    club_phone: "",
    club_email: "",
    club_website: "",
  });

  const [horairesForm, setHorairesForm] = useState({
    opening_hours: "",
  });

  const [socialForm, setSocialForm] = useState({
    social_facebook: "",
    social_instagram: "",
    social_twitter: "",
  });

  const [financeForm, setFinanceForm] = useState({
    bank_account: "",
    vat_number: "",
    legal_info: "",
  });

  const [apparenceForm, setApparenceForm] = useState({
    theme_primary_color: "",
    theme_secondary_color: "",
    theme_sidebar_bg: "",
    theme_sidebar_text: "",
    club_logo_url: "",
    navbar_name: "",
  });

  const [activeModules, setActiveModules] = useState({
    dashboard: true,
    courses: true,
    users: true,
    families: true,
    payments: true,
    store: true,
    messages: true,
    statistics: true,
  });

  const [localisationForm, setLocalisationForm] = useState({
    app_language: "",
    date_format: "",
    time_format: "",
    timezone: "",
  });

  // ─── Chargement initial des données ────────────────────────────────────────
  useEffect(() => {
    if (!settings || settings.length === 0) return;

    // Informations du club
    setClubForm({
      club_name: getByKey(INFORMATION_KEYS.CLUB_NAME)?.valeur || "",
      club_address: getByKey(INFORMATION_KEYS.CLUB_ADDRESS)?.valeur || "",
      club_phone: getByKey(INFORMATION_KEYS.CLUB_PHONE)?.valeur || "",
      club_email: getByKey(INFORMATION_KEYS.CLUB_EMAIL)?.valeur || "",
      club_website: getByKey(INFORMATION_KEYS.CLUB_WEBSITE)?.valeur || "",
    });

    // Horaires
    setHorairesForm({
      opening_hours: getByKey(INFORMATION_KEYS.OPENING_HOURS)?.valeur || "",
    });

    // Réseaux sociaux
    setSocialForm({
      social_facebook: getByKey(INFORMATION_KEYS.SOCIAL_FACEBOOK)?.valeur || "",
      social_instagram:
        getByKey(INFORMATION_KEYS.SOCIAL_INSTAGRAM)?.valeur || "",
      social_twitter: getByKey(INFORMATION_KEYS.SOCIAL_TWITTER)?.valeur || "",
    });

    // Finance
    setFinanceForm({
      bank_account: getByKey(INFORMATION_KEYS.BANK_ACCOUNT)?.valeur || "",
      vat_number: getByKey(INFORMATION_KEYS.VAT_NUMBER)?.valeur || "",
      legal_info: getByKey(INFORMATION_KEYS.LEGAL_INFO)?.valeur || "",
    });

    // Apparence
    setApparenceForm({
      theme_primary_color:
        getByKey(INFORMATION_KEYS.THEME_PRIMARY_COLOR)?.valeur || "#2563eb",
      theme_secondary_color:
        getByKey(INFORMATION_KEYS.THEME_SECONDARY_COLOR)?.valeur || "#10b981",
      theme_sidebar_bg:
        getByKey(INFORMATION_KEYS.THEME_SIDEBAR_BG)?.valeur || "#1e293b",
      theme_sidebar_text:
        getByKey(INFORMATION_KEYS.THEME_SIDEBAR_TEXT)?.valeur || "#f1f5f9",
      club_logo_url: getByKey(INFORMATION_KEYS.CLUB_LOGO_URL)?.valeur || "",
      navbar_name: getByKey(INFORMATION_KEYS.NAVBAR_NAME)?.valeur || "",
    });

    // Modules actifs
    const savedModules = [
      getByKey(INFORMATION_KEYS.MODULE_DASHBOARD),
      getByKey(INFORMATION_KEYS.MODULE_COURSES),
      getByKey(INFORMATION_KEYS.MODULE_USERS),
      getByKey(INFORMATION_KEYS.MODULE_FAMILIES),
      getByKey(INFORMATION_KEYS.MODULE_PAYMENTS),
      getByKey(INFORMATION_KEYS.MODULE_STORE),
      getByKey(INFORMATION_KEYS.MODULE_MESSAGES),
      getByKey(INFORMATION_KEYS.MODULE_STATISTICS),
    ];

    const moduleList = {
      dashboard: savedModules[0]?.valeur !== "false",
      courses: savedModules[1]?.valeur !== "false",
      users: savedModules[2]?.valeur !== "false",
      families: savedModules[3]?.valeur !== "false",
      payments: savedModules[4]?.valeur !== "false",
      store: savedModules[5]?.valeur !== "false",
      messages: savedModules[6]?.valeur !== "false",
      statistics: savedModules[7]?.valeur !== "false",
    };
    setActiveModules(moduleList);

    // Localisation
    setLocalisationForm({
      app_language: getByKey(INFORMATION_KEYS.APP_LANGUAGE)?.valeur || "fr",
      date_format:
        getByKey(INFORMATION_KEYS.DATE_FORMAT)?.valeur || "DD/MM/YYYY",
      time_format: getByKey(INFORMATION_KEYS.TIME_FORMAT)?.valeur || "24h",
      timezone: getByKey(INFORMATION_KEYS.TIMEZONE)?.valeur || "Europe/Paris",
    });
  }, [settings, getByKey]);

  // ─── Helpers ───────────────────────────────────────────────────────────────

  const buildPayload = (data: Record<string, string>): CreateInformation[] => {
    return Object.entries(data).map(([cle, valeur]) => ({
      cle: cle as any,
      valeur: valeur ?? "",
    }));
  };

  const saveSection = async (payload: CreateInformation[]) => {
    try {
      await bulkUpsertSettings(payload);
      toast.success(t("messages.saveSuccess"));
    } catch (error: any) {
      toast.error(error.message || t("messages.saveError"));
    }
  };

  // ─── Handlers de sauvegarde ────────────────────────────────────────────────

  const handleSaveClub = () => {
    const payload = buildPayload(clubForm);
    saveSection(payload);
  };

  const handleSaveHoraires = () => {
    const payload = buildPayload(horairesForm);
    saveSection(payload);
  };

  const handleSaveSocial = () => {
    const payload = buildPayload(socialForm);
    saveSection(payload);
  };

  const handleSaveFinance = () => {
    const payload = buildPayload(financeForm);
    saveSection(payload);
  };

  const handleSaveApparence = () => {
    const payload = buildPayload(apparenceForm);
    saveSection(payload);
  };

  const handleSaveNavigation = () => {
    const enabledModules = Object.entries(activeModules).map(([k, v]) => ({
      cle: `module_${k}` as any,
      valeur: String(v),
    }));
    saveSection(enabledModules);
  };

  const handleSaveLocalisation = () => {
    const payload = buildPayload(localisationForm);
    saveSection(payload);
  };

  // ─── Définition des onglets ────────────────────────────────────────────────

  const tabs: Tab[] = [
    {
      id: "club",
      label: t("tabs.clubInfo"),
      icon: <BuildingOffice2Icon className="h-5 w-5" />,
    },
    {
      id: "horaires",
      label: t("tabs.schedule"),
      icon: <ClockIcon className="h-5 w-5" />,
    },
    {
      id: "social",
      label: t("tabs.social"),
      icon: <GlobeAltIcon className="h-5 w-5" />,
    },
    {
      id: "finance",
      label: t("tabs.finance"),
      icon: <BanknotesIcon className="h-5 w-5" />,
    },
    {
      id: "apparence",
      label: t("tabs.appearance"),
      icon: <PaintBrushIcon className="h-5 w-5" />,
    },
    {
      id: "navigation",
      label: t("tabs.navigation"),
      icon: <Squares2X2Icon className="h-5 w-5" />,
    },
    {
      id: "localisation",
      label: t("tabs.localization"),
      icon: <LanguageIcon className="h-5 w-5" />,
    },
  ];

  // ─── Rendu ─────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="p-6">
        <LoadingSpinner size="lg" text={t("loading")} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        description={t("subtitle")}
        icon={<Cog6ToothIcon className="h-8 w-8" />}
      />

      <TabGroup
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as TabId)}
      />

      {/* ─── Onglet: Informations du club ─────────────────────────────────── */}
      {activeTab === "club" && (
        <ClubInfoSection
          clubForm={clubForm}
          setClubForm={setClubForm}
          handleSaveClub={handleSaveClub}
          isSaving={isSaving}
        />
      )}

      {/* ─── Onglet: Horaires d'ouverture ─────────────────────────────────── */}
      {activeTab === "horaires" && (
        <ScheduleSection
          horairesForm={horairesForm}
          setHorairesForm={setHorairesForm}
          handleSaveHoraires={handleSaveHoraires}
          isSaving={isSaving}
        />
      )}

      {/* ─── Onglet: Réseaux sociaux ──────────────────────────────────────── */}
      {activeTab === "social" && (
        <SocialSection
          socialForm={socialForm}
          setSocialForm={setSocialForm}
          handleSaveSocial={handleSaveSocial}
          isSaving={isSaving}
        />
      )}

      {/* ─── Onglet: Finance & Légal ──────────────────────────────────────── */}
      {activeTab === "finance" && (
        <FinanceSection
          financeForm={financeForm}
          setFinanceForm={setFinanceForm}
          handleSaveFinance={handleSaveFinance}
          isSaving={isSaving}
        />
      )}

      {/* ─── Onglet: Apparence ────────────────────────────────────────────── */}
      {activeTab === "apparence" && (
        <AppearanceSection
          apparenceForm={apparenceForm}
          setApparenceForm={setApparenceForm}
          handleSaveApparence={handleSaveApparence}
          isSaving={isSaving}
        />
      )}

      {/* ─── Onglet: Navigation ───────────────────────────────────────────── */}
      {activeTab === "navigation" && (
        <NavigationSection
          activeModules={activeModules}
          setActiveModules={setActiveModules}
          handleSaveNavigation={handleSaveNavigation}
          isSaving={isSaving}
        />
      )}

      {/* ─── Onglet: Localisation ─────────────────────────────────────────── */}
      {activeTab === "localisation" && (
        <LocalizationSection
          localisationForm={localisationForm}
          setLocalisationForm={setLocalisationForm}
          handleSaveLocalisation={handleSaveLocalisation}
          isSaving={isSaving}
        />
      )}
    </div>
  );
};

export default SettingsPage;
