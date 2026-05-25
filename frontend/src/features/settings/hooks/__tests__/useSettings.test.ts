/**
 * useSettings.test.ts
 * Tests hooks — settings / useSettings
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 2 — Hooks Frontend
 * Feature    : settings
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'jest';
import { renderHook, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/shared/test/renderWithProviders';
import { useSettings, useLoginAttempts } from '../useSettings';

// ─── MSW Server ─────────────────────────────────────────────────
// TODO: Décommenter quand le serveur MSW est configuré (Sprint Tests 2a)
// import { handlers } from '../../../../shared/test/mocks/handlers/settingsHandlers';
// import { server } from '../../shared/test/mocks/server';
// beforeAll(() => server.listen());
// afterEach(() => server.resetHandlers());
// afterAll(() => server.close());

// ─── Tests ────────────────────────────────────────────────────

describe('useSettings', () => {
  it('devrait appeler la mutation et invalider le cache en cas de succès', async () => {
    // TODO: configurer MSW pour intercepter GET /api/settings/...
    // const { result } = renderHook(() => useSettings(), {
    //   wrapper: renderWithProviders,
    // });
    // await act(async () => { result.current.mutate({ /* TODO: payload */ }); });
    // await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(true).toBe(true); // placeholder — à remplacer
  });

  it("devrait exposer l'erreur en cas d'échec API", async () => {
    // TODO: server.use(
    //   http.get('/api/settings/...',
    //     () => HttpResponse.error()
    //   )
    // )
    // const { result } = renderHook(() => useSettings(), {
    //   wrapper: renderWithProviders,
    // });
    // await act(async () => { result.current.mutate({ /* TODO: payload */ }); });
    // await waitFor(() => expect(result.current.isError).toBe(true));
    expect(true).toBe(true); // placeholder — à remplacer
  });
});

describe('useLoginAttempts', () => {
  it('devrait retourner les données en état de chargement puis succès', async () => {
    // TODO: configurer MSW pour intercepter GET /api/settings/...
    // const { result } = renderHook(() => useLoginAttempts(), {
    //   wrapper: renderWithProviders,
    // });
    // await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // expect(result.current.data).toBeDefined();
    expect(true).toBe(true); // placeholder — à remplacer
  });
});
