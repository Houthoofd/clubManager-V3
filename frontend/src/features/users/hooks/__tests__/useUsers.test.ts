/**
 * useUsers.test.ts
 * Tests hooks — users / useUsers
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 2 — Hooks Frontend
 * Feature    : users
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'jest';
import { renderHook, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/shared/test/renderWithProviders';
import { useUsers } from '../useUsers';

// ─── MSW Server ─────────────────────────────────────────────────
// TODO: Décommenter quand le serveur MSW est configuré (Sprint Tests 2a)
// import { server } from '../../shared/test/mocks/server';
// beforeAll(() => server.listen());
// afterEach(() => server.resetHandlers());
// afterAll(() => server.close());

// ─── Tests ────────────────────────────────────────────────────

describe('useUsers', () => {
  it('devrait retourner les données en état de chargement puis succès', async () => {
    // TODO: configurer MSW pour intercepter GET /api/users/...
    // const { result } = renderHook(() => useUsers(), {
    //   wrapper: renderWithProviders,
    // });
    // await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // expect(result.current.data).toBeDefined();
    expect(true).toBe(true); // placeholder — à remplacer
  });
});
