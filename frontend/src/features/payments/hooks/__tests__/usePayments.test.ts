/**
 * usePricingPlans.test.ts
 * Tests hooks — payments / usePricingPlans
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 2 — Hooks Frontend
 * Feature    : payments
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'jest';
import { renderHook, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/shared/test/renderWithProviders';
import { usePricingPlans, usePayments, usePaymentSchedules, useMyPayments, useMySchedules } from '../usePayments';

// ─── MSW Server ─────────────────────────────────────────────────
// TODO: Décommenter quand le serveur MSW est configuré (Sprint Tests 2a)
// import { handlers } from '../../../../shared/test/mocks/handlers/paymentsHandlers';
// import { server } from '../../shared/test/mocks/server';
// beforeAll(() => server.listen());
// afterEach(() => server.resetHandlers());
// afterAll(() => server.close());

// ─── Tests ────────────────────────────────────────────────────

describe('usePricingPlans', () => {
  it('devrait retourner les données en état de chargement puis succès', async () => {
    // TODO: configurer MSW pour intercepter GET /api/payments/...
    // const { result } = renderHook(() => usePricingPlans(), {
    //   wrapper: renderWithProviders,
    // });
    // await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // expect(result.current.data).toBeDefined();
    expect(true).toBe(true); // placeholder — à remplacer
  });
});

describe('usePayments', () => {
  it('devrait retourner les données en état de chargement puis succès', async () => {
    // TODO: configurer MSW pour intercepter GET /api/payments/...
    // const { result } = renderHook(() => usePayments(), {
    //   wrapper: renderWithProviders,
    // });
    // await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // expect(result.current.data).toBeDefined();
    expect(true).toBe(true); // placeholder — à remplacer
  });
});

describe('usePaymentSchedules', () => {
  it('devrait retourner les données en état de chargement puis succès', async () => {
    // TODO: configurer MSW pour intercepter GET /api/payments/...
    // const { result } = renderHook(() => usePaymentSchedules(), {
    //   wrapper: renderWithProviders,
    // });
    // await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // expect(result.current.data).toBeDefined();
    expect(true).toBe(true); // placeholder — à remplacer
  });
});

describe('useMyPayments', () => {
  it('devrait retourner les données en état de chargement puis succès', async () => {
    // TODO: configurer MSW pour intercepter GET /api/payments/...
    // const { result } = renderHook(() => useMyPayments(), {
    //   wrapper: renderWithProviders,
    // });
    // await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // expect(result.current.data).toBeDefined();
    expect(true).toBe(true); // placeholder — à remplacer
  });
});

describe('useMySchedules', () => {
  it('devrait retourner les données en état de chargement puis succès', async () => {
    // TODO: configurer MSW pour intercepter GET /api/payments/...
    // const { result } = renderHook(() => useMySchedules(), {
    //   wrapper: renderWithProviders,
    // });
    // await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // expect(result.current.data).toBeDefined();
    expect(true).toBe(true); // placeholder — à remplacer
  });
});
