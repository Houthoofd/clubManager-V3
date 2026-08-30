import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { TodayCourses } from '../TodayCourses';

// Mock de useTranslation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'todayCourses.title': 'Cours du jour',
        'todayCourses.viewAll': 'Voir tout',
        'todayCourses.noCourses': 'Aucun cours prévu',
        'todayCourses.noCoursesDesc': 'Profitez de votre journée !',
      };
      return translations[key] || key;
    },
  }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
}));

vi.mock('@/features/statistics/utils/formatting', () => ({
  formatTime: (time: string) => time.substring(0, 5), // simplified format
}));

import { useQuery } from '@tanstack/react-query';

describe('TodayCourses', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-17T10:00:00Z')); // Lundi
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('affiche les squelettes de chargement', () => {
    (useQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ isLoading: true, data: undefined });
    render(<TodayCourses />);
    expect(screen.getByTestId('today-courses-section')).toBeInTheDocument();
  });

  it('affiche un message quand il n\'y a pas de cours', () => {
    (useQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ isLoading: false, data: [] });
    render(<TodayCourses />);
    expect(screen.getByText('Aucun cours prévu')).toBeInTheDocument();
  });

  it('affiche les cours du jour', () => {
    const mockCourses = [
      { id: 1, jour_semaine: 1, heure_debut: '10:00:00', heure_fin: '11:00:00', type_cours: 'yoga' },
      { id: 2, jour_semaine: 2, heure_debut: '12:00:00', heure_fin: '13:00:00', type_cours: 'pilates' },
    ];
    (useQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ isLoading: false, data: mockCourses });

    render(<TodayCourses />);
    
    expect(screen.getByText(/10:00/)).toBeInTheDocument();
    expect(screen.getByText(/11:00/)).toBeInTheDocument();
    expect(screen.getByText('Yoga')).toBeInTheDocument();

    expect(screen.queryByText('Pilates')).not.toBeInTheDocument();
  });

  it('navigue vers /courses au clic sur Voir tout', () => {
    (useQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ isLoading: false, data: [] });
    render(<TodayCourses />);
    
    fireEvent.click(screen.getByText('Voir tout'));
    expect(mockNavigate).toHaveBeenCalledWith('/courses');
  });
});
