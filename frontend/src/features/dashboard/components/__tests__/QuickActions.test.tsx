import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { QuickActions } from '../QuickActions';

// Mock de useTranslation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'quickActions.title': 'Actions Rapides',
        'quickActions.courses': 'Cours',
        'quickActions.members': 'Membres',
        'quickActions.payments': 'Paiements',
        'quickActions.store': 'Boutique',
        'quickActions.messages': 'Messages',
        'quickActions.statistics': 'Statistiques',
        'quickActions.profile': 'Profil',
        'quickActions.notifications': 'Notifications',
      };
      return translations[key] || key;
    },
  }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('QuickActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('affiche le titre et toutes les actions rapides', () => {
    render(<QuickActions />);

    expect(screen.getByText('Actions Rapides')).toBeInTheDocument();
    expect(screen.getByText('Cours')).toBeInTheDocument();
    expect(screen.getByText('Membres')).toBeInTheDocument();
    expect(screen.getByText('Paiements')).toBeInTheDocument();
    expect(screen.getByText('Boutique')).toBeInTheDocument();
    expect(screen.getByText('Messages')).toBeInTheDocument();
    expect(screen.getByText('Statistiques')).toBeInTheDocument();
    expect(screen.getByText('Profil')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('navigue vers la bonne route au clic', () => {
    render(<QuickActions />);

    const coursesAction = screen.getByTestId('quick-action-courses');
    fireEvent.click(coursesAction);
    expect(mockNavigate).toHaveBeenCalledWith('/courses');

    const profileAction = screen.getByTestId('quick-action-profile');
    fireEvent.click(profileAction);
    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });

  it('navigue vers la bonne route au clavier (Enter)', () => {
    render(<QuickActions />);

    const membersAction = screen.getByTestId('quick-action-users');
    fireEvent.keyDown(membersAction, { key: 'Enter', code: 'Enter' });
    expect(mockNavigate).toHaveBeenCalledWith('/users');
  });
});
