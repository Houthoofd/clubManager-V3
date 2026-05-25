/**
 * useReservationsList.test.ts
 * Tests hooks — reservations / useReservationsList
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 2 — Hooks Frontend
 * Feature    : reservations
 */

import { renderHook, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/shared/test/renderWithProviders';
import { useReservationsList, useMyReservations, useCreateReservation, useCancelReservation, reservationKeys } from '../useReservations';

// ─── MSW Server ─────────────────────────────────────────────────
// TODO: Décommenter quand le serveur MSW est configuré (Sprint Tests 2a)
// import { handlers } from '../../../../shared/test/mocks/handlers/reservationsHandlers';
// import { server } from '../../shared/test/mocks/server';
// beforeAll(() => server.listen());
// afterEach(() => server.resetHandlers());
// afterAll(() => server.close());

// ─── Tests ────────────────────────────────────────────────────

describe('useReservationsList', () => {
  it('devrait retourner les données en état de chargement puis succès', async () => {
    // TODO: configurer MSW pour intercepter GET /api/reservations/...
    // const { result } = renderHook(() => useReservationsList(), {
    //   wrapper: renderWithProviders,
    // });
    // await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // expect(result.current.data).toBeDefined();
    expect(true).toBe(true); // placeholder — à remplacer
  });
});

describe('useMyReservations', () => {
  it('devrait retourner les données en état de chargement puis succès', async () => {
    // TODO: configurer MSW pour intercepter GET /api/reservations/...
    // const { result } = renderHook(() => useMyReservations(), {
    //   wrapper: renderWithProviders,
    // });
    // await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // expect(result.current.data).toBeDefined();
    expect(true).toBe(true); // placeholder — à remplacer
  });
});

describe('useCreateReservation', () => {
  it('devrait appeler la mutation et invalider le cache en cas de succès', async () => {
    // TODO: configurer MSW pour intercepter POST /api/reservations/...
    // const { result } = renderHook(() => useCreateReservation(), {
    //   wrapper: renderWithProviders,
    // });
    // await act(async () => { result.current.mutate({ /* TODO: payload */ }); });
    // await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(true).toBe(true); // placeholder — à remplacer
  });

  it("devrait exposer l'erreur en cas d'échec API", async () => {
    // TODO: server.use(
    //   http.post('/api/reservations/...',
    //     () => HttpResponse.error()
    //   )
    // )
    // const { result } = renderHook(() => useCreateReservation(), {
    //   wrapper: renderWithProviders,
    // });
    // await act(async () => { result.current.mutate({ /* TODO: payload */ }); });
    // await waitFor(() => expect(result.current.isError).toBe(true));
    expect(true).toBe(true); // placeholder — à remplacer
  });
});

describe('useCancelReservation', () => {
  it('devrait appeler la mutation et invalider le cache en cas de succès', async () => {
    // TODO: configurer MSW pour intercepter GET /api/reservations/...
    // const { result } = renderHook(() => useCancelReservation(), {
    //   wrapper: renderWithProviders,
    // });
    // await act(async () => { result.current.mutate({ /* TODO: payload */ }); });
    // await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(true).toBe(true); // placeholder — à remplacer
  });

  it("devrait exposer l'erreur en cas d'échec API", async () => {
    // TODO: server.use(
    //   http.get('/api/reservations/...',
    //     () => HttpResponse.error()
    //   )
    // )
    // const { result } = renderHook(() => useCancelReservation(), {
    //   wrapper: renderWithProviders,
    // });
    // await act(async () => { result.current.mutate({ /* TODO: payload */ }); });
    // await waitFor(() => expect(result.current.isError).toBe(true));
    expect(true).toBe(true); // placeholder — à remplacer
  });
});
