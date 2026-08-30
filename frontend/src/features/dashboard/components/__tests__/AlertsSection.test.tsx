import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { AlertsSection } from '../AlertsSection';
import type { DashboardAnalytics } from '@clubmanager/types';

// Mock de useTranslation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      const translations: Record<string, string> = {
        'alerts.latePayments': 'Paiements en retard',
        'alerts.lowStock': 'Stock bas',
      };
      if (key === 'alerts.latePaymentsMessage') {
        return `${options?.count} paiements en retard (${options?.amount})`;
      }
      if (key === 'alerts.lowStockMessage') {
        return `${options?.count} articles en stock bas`;
      }
      return translations[key] || key;
    },
  }),
}));

vi.mock('@/features/statistics/utils/formatting', () => ({
  formatCurrency: (val: number) => `${val} €`,
}));

describe('AlertsSection', () => {
  it('ne rend rien pendant le chargement', () => {
    const { container } = render(<AlertsSection data={undefined} isLoading={true} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('ne rend rien si aucune alerte', () => {
    const mockData = {
      finance: { overview: { nombre_echeances_retard: 0, montant_echeances_retard: 0 } },
      store: { low_stock: [] },
    } as unknown as DashboardAnalytics;
    
    const { container } = render(<AlertsSection data={mockData} isLoading={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('affiche les paiements en retard', () => {
    const mockData = {
      finance: { overview: { nombre_echeances_retard: 3, montant_echeances_retard: 150 } },
      store: { low_stock: [] },
    } as unknown as DashboardAnalytics;
    
    render(<AlertsSection data={mockData} isLoading={false} />);
    expect(screen.getByText('Paiements en retard')).toBeInTheDocument();
    expect(screen.getByText('3 paiements en retard (150 €)')).toBeInTheDocument();
  });

  it('affiche les articles en stock bas', () => {
    const mockData = {
      finance: { overview: { nombre_echeances_retard: 0, montant_echeances_retard: 0 } },
      store: { low_stock: [{ id: 1 }, { id: 2 }] },
    } as unknown as DashboardAnalytics;
    
    render(<AlertsSection data={mockData} isLoading={false} />);
    expect(screen.getByText('Stock bas')).toBeInTheDocument();
    expect(screen.getByText('2 articles en stock bas')).toBeInTheDocument();
  });

  it('affiche plusieurs alertes', () => {
    const mockData = {
      finance: { overview: { nombre_echeances_retard: 2, montant_echeances_retard: 100 } },
      store: { low_stock: [{ id: 1 }] },
    } as unknown as DashboardAnalytics;
    
    render(<AlertsSection data={mockData} isLoading={false} />);
    expect(screen.getAllByRole('alert')).toHaveLength(2);
  });
});
