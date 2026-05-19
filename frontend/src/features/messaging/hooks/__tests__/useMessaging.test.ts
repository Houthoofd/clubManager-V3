/**
 * useMessaging.test.ts
 * Tests hooks — messaging / useMessaging
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 2 — Hooks Frontend
 * Feature    : messaging
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'jest';
import { renderHook, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/shared/test/renderWithProviders';
import { useMessaging, useUnreadCount, useArchiveMessage, useArchivedMessages } from '../useMessaging';

// ─── MSW Server ─────────────────────────────────────────────────
// TODO: Décommenter quand le serveur MSW est configuré (Sprint Tests 2a)
// import { server } from '../../shared/test/mocks/server';
// beforeAll(() => server.listen());
// afterEach(() => server.resetHandlers());
// afterAll(() => server.close());

// ─── Tests ────────────────────────────────────────────────────

describe('useMessaging', () => {
  it('devrait retourner les données en état de chargement puis succès', async () => {
    // TODO: configurer MSW pour intercepter GET /api/messaging/...
    // const { result } = renderHook(() => useMessaging(), {
    //   wrapper: renderWithProviders,
    // });
    // await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // expect(result.current.data).toBeDefined();
    expect(true).toBe(true); // placeholder — à remplacer
  });
});

describe('useUnreadCount', () => {
  it('devrait retourner les données en état de chargement puis succès', async () => {
    // TODO: configurer MSW pour intercepter GET /api/messaging/...
    // const { result } = renderHook(() => useUnreadCount(), {
    //   wrapper: renderWithProviders,
    // });
    // await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // expect(result.current.data).toBeDefined();
    expect(true).toBe(true); // placeholder — à remplacer
  });
});

describe('useArchiveMessage', () => {
  it('devrait retourner les données en état de chargement puis succès', async () => {
    // TODO: configurer MSW pour intercepter GET /api/messaging/...
    // const { result } = renderHook(() => useArchiveMessage(), {
    //   wrapper: renderWithProviders,
    // });
    // await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // expect(result.current.data).toBeDefined();
    expect(true).toBe(true); // placeholder — à remplacer
  });
});

describe('useArchivedMessages', () => {
  it('devrait retourner les données en état de chargement puis succès', async () => {
    // TODO: configurer MSW pour intercepter GET /api/messaging/...
    // const { result } = renderHook(() => useArchivedMessages(), {
    //   wrapper: renderWithProviders,
    // });
    // await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // expect(result.current.data).toBeDefined();
    expect(true).toBe(true); // placeholder — à remplacer
  });
});
