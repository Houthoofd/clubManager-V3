import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { RecentNotifications } from '../RecentNotifications';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';

// Mock de useTranslation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'notifications.title': 'Notifications récentes',
        'notifications.markAllRead': 'Tout marquer comme lu',
        'notifications.empty': 'Aucune notification',
        'notifications.emptyDesc': 'Vous êtes à jour !',
        'notifications.viewAll': 'Voir toutes les notifications',
        'notifications.types.info': 'Info',
        'notifications.types.success': 'Succès',
        'notifications.types.warning': 'Avertissement',
        'notifications.types.error': 'Erreur',
      };
      return translations[key] || key;
    },
  }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

const mockMutate = vi.fn();
vi.mock('@/features/notifications/hooks/useNotifications', () => ({
  useNotifications: vi.fn(),
  useMarkAllAsRead: () => ({
    mutate: mockMutate,
    isPending: false,
  }),
}));

vi.mock('@/features/statistics/utils/formatting', () => ({
  formatRelativeDate: () => 'Il y a 1 heure',
}));

describe('RecentNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('affiche les squelettes de chargement', () => {
    (useNotifications as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ isLoading: true, data: undefined });
    render(<RecentNotifications />);
    expect(screen.getByTestId('recent-notifications-section')).toBeInTheDocument();
  });

  it('affiche un message quand il n\'y a pas de notifications', () => {
    (useNotifications as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ isLoading: false, data: [] });
    render(<RecentNotifications />);
    expect(screen.getByText('Aucune notification')).toBeInTheDocument();
  });

  it('affiche la liste des notifications', () => {
    const mockData = [
      { id: 1, user_id: 1, type: 'info', titre: 'Nouvelle info', contenu: 'Contenu info', lu: false, created_at: '2026-08-15T10:00:00Z' },
      { id: 2, user_id: 1, type: 'success', titre: 'Succès !', contenu: 'Contenu succès', lu: true, created_at: '2026-08-15T09:00:00Z' },
    ];
    (useNotifications as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ isLoading: false, data: mockData });
    render(<RecentNotifications />);
    
    expect(screen.getByText('Nouvelle info')).toBeInTheDocument();
    expect(screen.getByText('Succès !')).toBeInTheDocument();
    expect(screen.getByText('Tout marquer comme lu')).toBeInTheDocument();
  });

  it('n\'affiche pas le bouton "Tout marquer comme lu" si tout est lu', () => {
    const mockData = [
      { id: 1, user_id: 1, type: 'info', titre: 'Nouvelle info', contenu: 'Contenu info', lu: true, created_at: '2026-08-15T10:00:00Z' },
    ];
    (useNotifications as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ isLoading: false, data: mockData });
    render(<RecentNotifications />);
    
    expect(screen.queryByText('Tout marquer comme lu')).not.toBeInTheDocument();
  });

  it('appelle la mutation au clic sur "Tout marquer comme lu"', () => {
    const mockData = [
      { id: 1, user_id: 1, type: 'info', titre: 'Nouvelle info', contenu: 'Contenu info', lu: false, created_at: '2026-08-15T10:00:00Z' },
    ];
    (useNotifications as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ isLoading: false, data: mockData });
    render(<RecentNotifications />);
    
    fireEvent.click(screen.getByText('Tout marquer comme lu'));
    expect(mockMutate).toHaveBeenCalled();
  });

  it('navigue vers la page des notifications au clic sur "Voir toutes les notifications"', () => {
    (useNotifications as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ isLoading: false, data: [] });
    render(<RecentNotifications />);
    
    fireEvent.click(screen.getByText('Voir toutes les notifications'));
    expect(mockNavigate).toHaveBeenCalledWith('/notifications');
  });
});
