import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { KpiGrid } from '../KpiGrid';

// Mock de useTranslation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === 'kpis.members') return 'Membres Actifs';
      if (key === 'kpis.courses') return 'Cours Actifs';
      if (key === 'kpis.revenue') return 'Revenus';
      if (key === 'kpis.notifications') return 'Notifications';
      return key;
    },
  }),
}));

// Mock des hooks
vi.mock('@/features/statistics/hooks/useStatistics', () => ({
  useDashboardAnalytics: vi.fn(),
}));

vi.mock('@/features/notifications/hooks/useNotifications', () => ({
  useNotificationCount: vi.fn(),
}));

// Mock the formatting function
vi.mock('@/features/statistics/utils/formatting', () => ({
  formatPercentage: (val: number) => `${val}%`,
  formatNumber: (val: number) => String(val),
  formatCurrency: (val: number) => `${val} €`,
}));

import { useDashboardAnalytics } from '@/features/statistics/hooks/useStatistics';
import { useNotificationCount } from '@/features/notifications/hooks/useNotifications';

describe('KpiGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('affiche un état de chargement lorsque les hooks chargent', () => {
    (useDashboardAnalytics as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ isLoading: true, data: null });
    (useNotificationCount as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ isLoading: true, data: null });

    render(<KpiGrid />);
    expect(screen.getByTestId('kpi-grid')).toBeInTheDocument();
    // Les titres des KPI doivent être présents
    expect(screen.getByText('Membres Actifs')).toBeInTheDocument();
  });

  it('affiche les données correctes', () => {
    (useDashboardAnalytics as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isLoading: false,
      data: {
        members: { overview: { total_membres: 120, taux_croissance: 5 } },
        courses: { overview: { total_cours: 45, taux_presence: 80 } },
        finance: { overview: { total_revenus: 5400, taux_paiement: 90 } },
      },
    });
    (useNotificationCount as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ isLoading: false, data: 3 });

    render(<KpiGrid />);

    expect(screen.getByText('Membres Actifs')).toBeInTheDocument();
    expect(screen.getByText('Cours Actifs')).toBeInTheDocument();
    expect(screen.getByText('Revenus')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();

    // Vérifier quelques valeurs
    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
