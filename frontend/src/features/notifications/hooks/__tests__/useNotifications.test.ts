/**
 * useNotificationCount.test.ts
 * Tests hooks — notifications / useNotificationCount
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 2 — Hooks Frontend
 * Feature    : notifications
 */

import { renderHook, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/shared/test/renderWithProviders';
import { useNotificationCount, useNotifications, useMarkAsRead, useMarkAllAsRead, useDeleteNotification, useDeleteAllNotifications, useBroadcastNotification, notificationKeys } from '../useNotifications';

// ─── MSW Server ─────────────────────────────────────────────────
// TODO: Décommenter quand le serveur MSW est configuré (Sprint Tests 2a)
// import { handlers } from '../../../../shared/test/mocks/handlers/notificationsHandlers';
// import { server } from '../../shared/test/mocks/server';
// beforeAll(() => server.listen());
// afterEach(() => server.resetHandlers());
// afterAll(() => server.close());

// ─── Tests ────────────────────────────────────────────────────

describe('useNotificationCount', () => {
  it('devrait retourner les données en état de chargement puis succès', async () => {
    // TODO: configurer MSW pour intercepter GET /api/notifications/...
    // const { result } = renderHook(() => useNotificationCount(), {
    //   wrapper: renderWithProviders,
    // });
    // await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // expect(result.current.data).toBeDefined();
    expect(true).toBe(true); // placeholder — à remplacer
  });
});

describe('useNotifications', () => {
  it('devrait retourner les données en état de chargement puis succès', async () => {
    // TODO: configurer MSW pour intercepter GET /api/notifications/...
    // const { result } = renderHook(() => useNotifications(), {
    //   wrapper: renderWithProviders,
    // });
    // await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // expect(result.current.data).toBeDefined();
    expect(true).toBe(true); // placeholder — à remplacer
  });
});

describe('useMarkAsRead', () => {
  it('devrait retourner les données en état de chargement puis succès', async () => {
    // TODO: configurer MSW pour intercepter GET /api/notifications/...
    // const { result } = renderHook(() => useMarkAsRead(), {
    //   wrapper: renderWithProviders,
    // });
    // await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // expect(result.current.data).toBeDefined();
    expect(true).toBe(true); // placeholder — à remplacer
  });
});

describe('useMarkAllAsRead', () => {
  it('devrait retourner les données en état de chargement puis succès', async () => {
    // TODO: configurer MSW pour intercepter GET /api/notifications/...
    // const { result } = renderHook(() => useMarkAllAsRead(), {
    //   wrapper: renderWithProviders,
    // });
    // await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // expect(result.current.data).toBeDefined();
    expect(true).toBe(true); // placeholder — à remplacer
  });
});

describe('useDeleteNotification', () => {
  it('devrait appeler la mutation et invalider le cache en cas de succès', async () => {
    // TODO: configurer MSW pour intercepter DELETE /api/notifications/.../:id
    // const { result } = renderHook(() => useDeleteNotification(), {
    //   wrapper: renderWithProviders,
    // });
    // await act(async () => { result.current.mutate({ /* TODO: payload */ }); });
    // await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(true).toBe(true); // placeholder — à remplacer
  });

  it("devrait exposer l'erreur en cas d'échec API", async () => {
    // TODO: server.use(
    //   http.delete('/api/notifications/.../:id',
    //     () => HttpResponse.error()
    //   )
    // )
    // const { result } = renderHook(() => useDeleteNotification(), {
    //   wrapper: renderWithProviders,
    // });
    // await act(async () => { result.current.mutate({ /* TODO: payload */ }); });
    // await waitFor(() => expect(result.current.isError).toBe(true));
    expect(true).toBe(true); // placeholder — à remplacer
  });
});

describe('useDeleteAllNotifications', () => {
  it('devrait appeler la mutation et invalider le cache en cas de succès', async () => {
    // TODO: configurer MSW pour intercepter DELETE /api/notifications/.../:id
    // const { result } = renderHook(() => useDeleteAllNotifications(), {
    //   wrapper: renderWithProviders,
    // });
    // await act(async () => { result.current.mutate({ /* TODO: payload */ }); });
    // await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(true).toBe(true); // placeholder — à remplacer
  });

  it("devrait exposer l'erreur en cas d'échec API", async () => {
    // TODO: server.use(
    //   http.delete('/api/notifications/.../:id',
    //     () => HttpResponse.error()
    //   )
    // )
    // const { result } = renderHook(() => useDeleteAllNotifications(), {
    //   wrapper: renderWithProviders,
    // });
    // await act(async () => { result.current.mutate({ /* TODO: payload */ }); });
    // await waitFor(() => expect(result.current.isError).toBe(true));
    expect(true).toBe(true); // placeholder — à remplacer
  });
});

describe('useBroadcastNotification', () => {
  it('devrait retourner les données en état de chargement puis succès', async () => {
    // TODO: configurer MSW pour intercepter GET /api/notifications/...
    // const { result } = renderHook(() => useBroadcastNotification(), {
    //   wrapper: renderWithProviders,
    // });
    // await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // expect(result.current.data).toBeDefined();
    expect(true).toBe(true); // placeholder — à remplacer
  });
});
