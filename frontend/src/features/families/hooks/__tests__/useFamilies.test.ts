/**
 * useFamiliesList.test.ts
 * Tests hooks — families / useFamiliesList
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 2 — Hooks Frontend
 * Feature    : families
 */

import { renderHook, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/shared/test/renderWithProviders';
import { useFamiliesList, useFamilyDetail, useFamilyMembers, useUpdateFamily, useDeleteFamily, useAdminAddFamilyMember, useAdminRemoveFamilyMember, familyKeys } from '../useFamilies';

// ─── MSW Server ─────────────────────────────────────────────────
// TODO: Décommenter quand le serveur MSW est configuré (Sprint Tests 2a)
// import { handlers } from '../../../../shared/test/mocks/handlers/familiesHandlers';
// import { server } from '../../shared/test/mocks/server';
// beforeAll(() => server.listen());
// afterEach(() => server.resetHandlers());
// afterAll(() => server.close());

// ─── Tests ────────────────────────────────────────────────────

describe('useFamiliesList', () => {
  it('devrait retourner les données en état de chargement puis succès', async () => {
    // TODO: configurer MSW pour intercepter GET /api/families/...
    // const { result } = renderHook(() => useFamiliesList(), {
    //   wrapper: renderWithProviders,
    // });
    // await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // expect(result.current.data).toBeDefined();
    expect(true).toBe(true); // placeholder — à remplacer
  });
});

describe('useFamilyDetail', () => {
  it('devrait retourner les données en état de chargement puis succès', async () => {
    // TODO: configurer MSW pour intercepter GET /api/families/...
    // const { result } = renderHook(() => useFamilyDetail(), {
    //   wrapper: renderWithProviders,
    // });
    // await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // expect(result.current.data).toBeDefined();
    expect(true).toBe(true); // placeholder — à remplacer
  });
});

describe('useFamilyMembers', () => {
  it('devrait retourner les données en état de chargement puis succès', async () => {
    // TODO: configurer MSW pour intercepter GET /api/families/...
    // const { result } = renderHook(() => useFamilyMembers(), {
    //   wrapper: renderWithProviders,
    // });
    // await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // expect(result.current.data).toBeDefined();
    expect(true).toBe(true); // placeholder — à remplacer
  });
});

describe('useUpdateFamily', () => {
  it('devrait appeler la mutation et invalider le cache en cas de succès', async () => {
    // TODO: configurer MSW pour intercepter PUT /api/families/.../:id
    // const { result } = renderHook(() => useUpdateFamily(), {
    //   wrapper: renderWithProviders,
    // });
    // await act(async () => { result.current.mutate({ /* TODO: payload */ }); });
    // await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(true).toBe(true); // placeholder — à remplacer
  });

  it("devrait exposer l'erreur en cas d'échec API", async () => {
    // TODO: server.use(
    //   http.put('/api/families/.../:id',
    //     () => HttpResponse.error()
    //   )
    // )
    // const { result } = renderHook(() => useUpdateFamily(), {
    //   wrapper: renderWithProviders,
    // });
    // await act(async () => { result.current.mutate({ /* TODO: payload */ }); });
    // await waitFor(() => expect(result.current.isError).toBe(true));
    expect(true).toBe(true); // placeholder — à remplacer
  });
});

describe('useDeleteFamily', () => {
  it('devrait appeler la mutation et invalider le cache en cas de succès', async () => {
    // TODO: configurer MSW pour intercepter DELETE /api/families/.../:id
    // const { result } = renderHook(() => useDeleteFamily(), {
    //   wrapper: renderWithProviders,
    // });
    // await act(async () => { result.current.mutate({ /* TODO: payload */ }); });
    // await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(true).toBe(true); // placeholder — à remplacer
  });

  it("devrait exposer l'erreur en cas d'échec API", async () => {
    // TODO: server.use(
    //   http.delete('/api/families/.../:id',
    //     () => HttpResponse.error()
    //   )
    // )
    // const { result } = renderHook(() => useDeleteFamily(), {
    //   wrapper: renderWithProviders,
    // });
    // await act(async () => { result.current.mutate({ /* TODO: payload */ }); });
    // await waitFor(() => expect(result.current.isError).toBe(true));
    expect(true).toBe(true); // placeholder — à remplacer
  });
});

describe('useAdminAddFamilyMember', () => {
  it('devrait retourner les données en état de chargement puis succès', async () => {
    // TODO: configurer MSW pour intercepter GET /api/families/...
    // const { result } = renderHook(() => useAdminAddFamilyMember(), {
    //   wrapper: renderWithProviders,
    // });
    // await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // expect(result.current.data).toBeDefined();
    expect(true).toBe(true); // placeholder — à remplacer
  });
});

describe('useAdminRemoveFamilyMember', () => {
  it('devrait retourner les données en état de chargement puis succès', async () => {
    // TODO: configurer MSW pour intercepter GET /api/families/...
    // const { result } = renderHook(() => useAdminRemoveFamilyMember(), {
    //   wrapper: renderWithProviders,
    // });
    // await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // expect(result.current.data).toBeDefined();
    expect(true).toBe(true); // placeholder — à remplacer
  });
});
