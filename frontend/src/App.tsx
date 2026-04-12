/**
 * @fileoverview Main Application Component
 * @module App
 *
 * Root component of the ClubManager V3 application.
 * Configures routing, providers, and main layout.
 */

import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  Page,
  PageSection,
  PageSectionVariants,
  Masthead,
  MastheadToggle,
  MastheadMain,
  MastheadBrand,
  MastheadContent,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  Nav,
  NavList,
  NavItem,
  PageSidebar,
  PageSidebarBody,
  Title,
  EmptyState,
  EmptyStateIcon,
  EmptyStateBody,
  Button,
  Flex,
  FlexItem,
} from "@patternfly/react-core";
import {
  BarsIcon,
  RocketIcon,
  ChartLineIcon,
  UsersIcon,
  CalendarAltIcon,
  DollarSignIcon,
  ShoppingCartIcon,
} from "@patternfly/react-icons";
import { StatisticsRouter } from "./features/statistics/StatisticsRouter";

// ============================================================================
// REACT QUERY CONFIGURATION
// ============================================================================

/**
 * Configure React Query client with default options
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// ============================================================================
// HOME PAGE COMPONENT
// ============================================================================

/**
 * Home page component
 */
const HomePage: React.FC = () => {
  return (
    <PageSection variant={PageSectionVariants.light}>
      <EmptyState>
        <EmptyStateIcon icon={RocketIcon} />
        <Title headingLevel="h1" size="4xl">
          Bienvenue dans ClubManager V3
        </Title>
        <EmptyStateBody>
          <p style={{ fontSize: "1.1rem", marginBottom: "2rem" }}>
            Votre application complète de gestion de club de jiu-jitsu.
          </p>
          <Flex
            direction={{ default: "column" }}
            spaceItems={{ default: "spaceItemsLg" }}
          >
            <FlexItem>
              <Title headingLevel="h2" size="xl">
                Modules disponibles :
              </Title>
            </FlexItem>
            <FlexItem>
              <Link to="/statistics" style={{ textDecoration: "none" }}>
                <Button variant="primary" size="lg" icon={<ChartLineIcon />}>
                  📊 Statistiques et Analytics
                </Button>
              </Link>
            </FlexItem>
            <FlexItem style={{ marginTop: "2rem", color: "#6a6e73" }}>
              <p>D'autres modules seront bientôt disponibles :</p>
              <ul style={{ listStyle: "none", padding: 0, marginTop: "1rem" }}>
                <li>👥 Gestion des membres</li>
                <li>📅 Gestion des cours</li>
                <li>💰 Gestion des paiements</li>
                <li>🛍️ Boutique en ligne</li>
                <li>💬 Messagerie</li>
              </ul>
            </FlexItem>
          </Flex>
        </EmptyStateBody>
      </EmptyState>
    </PageSection>
  );
};

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

/**
 * Main Application Component
 *
 * Provides:
 * - React Query client for data fetching
 * - React Router for navigation
 * - PatternFly layout with sidebar navigation
 * - Route configuration for all modules
 */
const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [activeNavItem, setActiveNavItem] = React.useState("home");

  /**
   * Toggle sidebar visibility
   */
  const onSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  /**
   * Masthead component (top navigation bar)
   */
  const masthead = (
    <Masthead>
      <MastheadToggle>
        <Button
          variant="plain"
          onClick={onSidebarToggle}
          aria-label="Global navigation"
          icon={<BarsIcon />}
        />
      </MastheadToggle>
      <MastheadMain>
        <MastheadBrand>
          <Title headingLevel="h1" size="2xl">
            🥋 ClubManager V3
          </Title>
        </MastheadBrand>
      </MastheadMain>
      <MastheadContent>
        <Toolbar id="toolbar" isFullHeight isStatic>
          <ToolbarContent>
            <ToolbarGroup
              variant="icon-button-group"
              align={{ default: "alignRight" }}
              spacer={{ default: "spacerNone", md: "spacerMd" }}
            >
              <ToolbarItem>
                <span style={{ color: "#fff", fontSize: "0.875rem" }}>
                  Version 3.0.0
                </span>
              </ToolbarItem>
            </ToolbarGroup>
          </ToolbarContent>
        </Toolbar>
      </MastheadContent>
    </Masthead>
  );

  /**
   * Sidebar navigation component
   */
  const sidebar = (
    <PageSidebar isSidebarOpen={isSidebarOpen}>
      <PageSidebarBody>
        <Nav aria-label="Navigation principale" theme="dark">
          <NavList>
            <NavItem
              itemId="home"
              isActive={activeNavItem === "home"}
              to="/"
              component={(props: any) => <Link {...props} />}
              onClick={() => setActiveNavItem("home")}
            >
              <RocketIcon /> Accueil
            </NavItem>

            <NavItem
              itemId="statistics"
              isActive={activeNavItem === "statistics"}
              to="/statistics"
              component={(props: any) => <Link {...props} />}
              onClick={() => setActiveNavItem("statistics")}
            >
              <ChartLineIcon /> Statistiques
            </NavItem>

            {/* Future modules - Coming soon */}
            <NavItem itemId="members" disabled>
              <UsersIcon /> Membres{" "}
              <span style={{ fontSize: "0.75rem" }}>(bientôt)</span>
            </NavItem>

            <NavItem itemId="courses" disabled>
              <CalendarAltIcon /> Cours{" "}
              <span style={{ fontSize: "0.75rem" }}>(bientôt)</span>
            </NavItem>

            <NavItem itemId="payments" disabled>
              <DollarSignIcon /> Paiements{" "}
              <span style={{ fontSize: "0.75rem" }}>(bientôt)</span>
            </NavItem>

            <NavItem itemId="store" disabled>
              <ShoppingCartIcon /> Boutique{" "}
              <span style={{ fontSize: "0.75rem" }}>(bientôt)</span>
            </NavItem>
          </NavList>
        </Nav>
      </PageSidebarBody>
    </PageSidebar>
  );

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Page header={masthead} sidebar={sidebar}>
          <Routes>
            {/* Home route */}
            <Route path="/" element={<HomePage />} />

            {/* Statistics module routes */}
            <Route path="/statistics/*" element={<StatisticsRouter />} />

            {/* Future module routes - placeholder */}
            {/* <Route path="/members/*" element={<MembersRouter />} /> */}
            {/* <Route path="/courses/*" element={<CoursesRouter />} /> */}
            {/* <Route path="/payments/*" element={<PaymentsRouter />} /> */}
            {/* <Route path="/store/*" element={<StoreRouter />} /> */}
            {/* <Route path="/messaging/*" element={<MessagingRouter />} /> */}

            {/* Catch-all route - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Page>
      </BrowserRouter>

      {/* React Query DevTools - only in development */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
};

export default App;
