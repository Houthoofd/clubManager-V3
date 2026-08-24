import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { WelcomeBanner } from '../WelcomeBanner';

// Mock du store
vi.mock('@/shared/stores/authStore', () => ({
  useAuthStore: vi.fn(),
}));

// Mock de la traduction
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      if (key === 'welcome.greeting') return `Bonjour ${options?.name || ''}`.trim();
      if (key === 'welcome.today') return `Aujourd'hui : ${options?.date || ''}`;
      if (key.startsWith('roles.')) return key.replace('roles.', '');
      return key;
    },
    i18n: {
      language: 'fr',
    },
  }),
}));

import { useAuthStore } from '@/shared/stores/authStore';

describe('WelcomeBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devrait afficher le composant avec un utilisateur admin', () => {
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: any) =>
      selector({
        user: { first_name: 'Jean', role_app: 'admin' },
      })
    );

    render(<WelcomeBanner />);
    
    expect(screen.getByTestId('welcome-banner')).toBeInTheDocument();
    expect(screen.getByText('Bonjour Jean')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
  });

  it('devrait fonctionner même si l\'utilisateur n\'a pas de prénom', () => {
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: any) =>
      selector({
        user: { role_app: 'member' },
      })
    );

    render(<WelcomeBanner />);
    expect(screen.getByText('Bonjour')).toBeInTheDocument();
    expect(screen.getByText('member')).toBeInTheDocument();
  });
});
