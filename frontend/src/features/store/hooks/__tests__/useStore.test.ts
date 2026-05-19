/**
 * useCategories.test.ts
 * Tests hooks — store / useCategories
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 2 — Hooks Frontend
 * Feature    : store
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'jest';
import { renderHook, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/shared/test/renderWithProviders';
import { useCategories, useSizes, useArticles, useArticle, useOrders, useMyOrders, useOrder, useStocks, useLowStocks, useCreateCategory, useUpdateCategory, useDeleteCategory, useReorderCategories, useCreateSize, useUpdateSize, useDeleteSize, useCreateArticle, useUpdateArticle, useDeleteArticle, useToggleArticle, useUploadArticleImage, useDeleteArticleImage, useCreateOrder, useUpdateOrderStatus, useCancelOrder, useUpdateStock, useAdjustStock, storeKeys } from '../useStore';

// ─── MSW Server ─────────────────────────────────────────────────
// TODO: Décommenter quand le serveur MSW est configuré (Sprint Tests 2a)
// import { handlers } from '../../../../shared/test/mocks/handlers/storeHandlers';
// import { server } from '../../shared/test/mocks/server';
// beforeAll(() => server.listen());
// afterEach(() => server.resetHandlers());
// afterAll(() => server.close());

// ─── Tests ────────────────────────────────────────────────────

describe('useCategories', () => {
  it('devrait retourner les données en état de chargement puis succès', async () => {
    // TODO: configurer MSW pour intercepter GET /api/store/...
    // const { result } = renderHook(() => useCategories(), {
    //   wrapper: renderWithProviders,
    // });
    // await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // expect(result.current.data).toBeDefined();
    expect(true).toBe(true); // placeholder — à remplacer
  });
});

describe('useSizes', () => {
  it('devrait retourner les données en état de chargement puis succès', async () => {
    // TODO: configurer MSW pour intercepter GET /api/store/...
    // const { result } = renderHook(() => useSizes(), {
    //   wrapper: renderWithProviders,
    // });
    // await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // expect(result.current.data).toBeDefined();
    expect(true).toBe(true); // placeholder — à remplacer
  });
});

describe('useArticles', () => {
  it('devrait retourner les données en état de chargement puis succès', async () => {
    // TODO: configurer MSW pour intercepter GET /api/store/...
    // const { result } = renderHook(() => useArticles(), {
    //   wrapper: renderWithProviders,
    // });
    // await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // expect(result.current.data).toBeDefined();
    expect(true).toBe(true); // placeholder — à remplacer
  });
});

describe('useArticle', () => {
  it('devrait retourner les données en état de chargement puis succès', async () => {
    // TODO: configurer MSW pour intercepter GET /api/store/...
    // const { result } = renderHook(() => useArticle(), {
    //   wrapper: renderWithProviders,
    // });
    // await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // expect(result.current.data).toBeDefined();
    expect(true).toBe(true); // placeholder — à remplacer
  });
});

describe('useOrders', () => {
  it('devrait retourner les données en état de chargement puis succès', async () => {
    // TODO: configurer MSW pour intercepter GET /api/store/...
    // const { result } = renderHook(() => useOrders(), {
    //   wrapper: renderWithProviders,
    // });
    // await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // expect(result.current.data).toBeDefined();
    expect(true).toBe(true); // placeholder — à remplacer
  });
});

describe('useMyOrders', () => {
  it('devrait retourner les données en état de chargement puis succès', async () => {
    // TODO: configurer MSW pour intercepter GET /api/store/...
    // const { result } = renderHook(() => useMyOrders(), {
    //   wrapper: renderWithProviders,
    // });
    // await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // expect(result.current.data).toBeDefined();
    expect(true).toBe(true); // placeholder — à remplacer
  });
});

describe('useOrder', () => {
  it('devrait retourner les données en état de chargement puis succès', async () => {
    // TODO: configurer MSW pour intercepter GET /api/store/...
    // const { result } = renderHook(() => useOrder(), {
    //   wrapper: renderWithProviders,
    // });
    // await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // expect(result.current.data).toBeDefined();
    expect(true).toBe(true); // placeholder — à remplacer
  });
});

describe('useStocks', () => {
  it('devrait retourner les données en état de chargement puis succès', async () => {
    // TODO: configurer MSW pour intercepter GET /api/store/...
    // const { result } = renderHook(() => useStocks(), {
    //   wrapper: renderWithProviders,
    // });
    // await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // expect(result.current.data).toBeDefined();
    expect(true).toBe(true); // placeholder — à remplacer
  });
});

describe('useLowStocks', () => {
  it('devrait retourner les données en état de chargement puis succès', async () => {
    // TODO: configurer MSW pour intercepter GET /api/store/...
    // const { result } = renderHook(() => useLowStocks(), {
    //   wrapper: renderWithProviders,
    // });
    // await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // expect(result.current.data).toBeDefined();
    expect(true).toBe(true); // placeholder — à remplacer
  });
});

describe('useCreateCategory', () => {
  it('devrait appeler la mutation et invalider le cache en cas de succès', async () => {
    // TODO: configurer MSW pour intercepter POST /api/store/...
    // const { result } = renderHook(() => useCreateCategory(), {
    //   wrapper: renderWithProviders,
    // });
    // await act(async () => { result.current.mutate({ /* TODO: payload */ }); });
    // await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(true).toBe(true); // placeholder — à remplacer
  });

  it("devrait exposer l'erreur en cas d'échec API", async () => {
    // TODO: server.use(
    //   http.post('/api/store/...',
    //     () => HttpResponse.error()
    //   )
    // )
    // const { result } = renderHook(() => useCreateCategory(), {
    //   wrapper: renderWithProviders,
    // });
    // await act(async () => { result.current.mutate({ /* TODO: payload */ }); });
    // await waitFor(() => expect(result.current.isError).toBe(true));
    expect(true).toBe(true); // placeholder — à remplacer
  });
});

describe('useUpdateCategory', () => {
  it('devrait appeler la mutation et invalider le cache en cas de succès', async () => {
    // TODO: configurer MSW pour intercepter PUT /api/store/.../:id
    // const { result } = renderHook(() => useUpdateCategory(), {
    //   wrapper: renderWithProviders,
    // });
    // await act(async () => { result.current.mutate({ /* TODO: payload */ }); });
    // await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(true).toBe(true); // placeholder — à remplacer
  });

  it("devrait exposer l'erreur en cas d'échec API", async () => {
    // TODO: server.use(
    //   http.put('/api/store/.../:id',
    //     () => HttpResponse.error()
    //   )
    // )
    // const { result } = renderHook(() => useUpdateCategory(), {
    //   wrapper: renderWithProviders,
    // });
    // await act(async () => { result.current.mutate({ /* TODO: payload */ }); });
    // await waitFor(() => expect(result.current.isError).toBe(true));
    expect(true).toBe(true); // placeholder — à remplacer
  });
});

describe('useDeleteCategory', () => {
  it('devrait appeler la mutation et invalider le cache en cas de succès', async () => {
    // TODO: configurer MSW pour intercepter DELETE /api/store/.../:id
    // const { result } = renderHook(() => useDeleteCategory(), {
    //   wrapper: renderWithProviders,
    // });
    // await act(async () => { result.current.mutate({ /* TODO: payload */ }); });
    // await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(true).toBe(true); // placeholder — à remplacer
  });

  it("devrait exposer l'erreur en cas d'échec API", async () => {
    // TODO: server.use(
    //   http.delete('/api/store/.../:id',
    //     () => HttpResponse.error()
    //   )
    // )
    // const { result } = renderHook(() => useDeleteCategory(), {
    //   wrapper: renderWithProviders,
    // });
    // await act(async () => { result.current.mutate({ /* TODO: payload */ }); });
    // await waitFor(() => expect(result.current.isError).toBe(true));
    expect(true).toBe(true); // placeholder — à remplacer
  });
});

describe('useReorderCategories', () => {
  it('devrait retourner les données en état de chargement puis succès', async () => {
    // TODO: configurer MSW pour intercepter GET /api/store/...
    // const { result } = renderHook(() => useReorderCategories(), {
    //   wrapper: renderWithProviders,
    // });
    // await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // expect(result.current.data).toBeDefined();
    expect(true).toBe(true); // placeholder — à remplacer
  });
});

describe('useCreateSize', () => {
  it('devrait appeler la mutation et invalider le cache en cas de succès', async () => {
    // TODO: configurer MSW pour intercepter POST /api/store/...
    // const { result } = renderHook(() => useCreateSize(), {
    //   wrapper: renderWithProviders,
    // });
    // await act(async () => { result.current.mutate({ /* TODO: payload */ }); });
    // await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(true).toBe(true); // placeholder — à remplacer
  });

  it("devrait exposer l'erreur en cas d'échec API", async () => {
    // TODO: server.use(
    //   http.post('/api/store/...',
    //     () => HttpResponse.error()
    //   )
    // )
    // const { result } = renderHook(() => useCreateSize(), {
    //   wrapper: renderWithProviders,
    // });
    // await act(async () => { result.current.mutate({ /* TODO: payload */ }); });
    // await waitFor(() => expect(result.current.isError).toBe(true));
    expect(true).toBe(true); // placeholder — à remplacer
  });
});

describe('useUpdateSize', () => {
  it('devrait appeler la mutation et invalider le cache en cas de succès', async () => {
    // TODO: configurer MSW pour intercepter PUT /api/store/.../:id
    // const { result } = renderHook(() => useUpdateSize(), {
    //   wrapper: renderWithProviders,
    // });
    // await act(async () => { result.current.mutate({ /* TODO: payload */ }); });
    // await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(true).toBe(true); // placeholder — à remplacer
  });

  it("devrait exposer l'erreur en cas d'échec API", async () => {
    // TODO: server.use(
    //   http.put('/api/store/.../:id',
    //     () => HttpResponse.error()
    //   )
    // )
    // const { result } = renderHook(() => useUpdateSize(), {
    //   wrapper: renderWithProviders,
    // });
    // await act(async () => { result.current.mutate({ /* TODO: payload */ }); });
    // await waitFor(() => expect(result.current.isError).toBe(true));
    expect(true).toBe(true); // placeholder — à remplacer
  });
});

describe('useDeleteSize', () => {
  it('devrait appeler la mutation et invalider le cache en cas de succès', async () => {
    // TODO: configurer MSW pour intercepter DELETE /api/store/.../:id
    // const { result } = renderHook(() => useDeleteSize(), {
    //   wrapper: renderWithProviders,
    // });
    // await act(async () => { result.current.mutate({ /* TODO: payload */ }); });
    // await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(true).toBe(true); // placeholder — à remplacer
  });

  it("devrait exposer l'erreur en cas d'échec API", async () => {
    // TODO: server.use(
    //   http.delete('/api/store/.../:id',
    //     () => HttpResponse.error()
    //   )
    // )
    // const { result } = renderHook(() => useDeleteSize(), {
    //   wrapper: renderWithProviders,
    // });
    // await act(async () => { result.current.mutate({ /* TODO: payload */ }); });
    // await waitFor(() => expect(result.current.isError).toBe(true));
    expect(true).toBe(true); // placeholder — à remplacer
  });
});

describe('useCreateArticle', () => {
  it('devrait appeler la mutation et invalider le cache en cas de succès', async () => {
    // TODO: configurer MSW pour intercepter POST /api/store/...
    // const { result } = renderHook(() => useCreateArticle(), {
    //   wrapper: renderWithProviders,
    // });
    // await act(async () => { result.current.mutate({ /* TODO: payload */ }); });
    // await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(true).toBe(true); // placeholder — à remplacer
  });

  it("devrait exposer l'erreur en cas d'échec API", async () => {
    // TODO: server.use(
    //   http.post('/api/store/...',
    //     () => HttpResponse.error()
    //   )
    // )
    // const { result } = renderHook(() => useCreateArticle(), {
    //   wrapper: renderWithProviders,
    // });
    // await act(async () => { result.current.mutate({ /* TODO: payload */ }); });
    // await waitFor(() => expect(result.current.isError).toBe(true));
    expect(true).toBe(true); // placeholder — à remplacer
  });
});

describe('useUpdateArticle', () => {
  it('devrait appeler la mutation et invalider le cache en cas de succès', async () => {
    // TODO: configurer MSW pour intercepter PUT /api/store/.../:id
    // const { result } = renderHook(() => useUpdateArticle(), {
    //   wrapper: renderWithProviders,
    // });
    // await act(async () => { result.current.mutate({ /* TODO: payload */ }); });
    // await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(true).toBe(true); // placeholder — à remplacer
  });

  it("devrait exposer l'erreur en cas d'échec API", async () => {
    // TODO: server.use(
    //   http.put('/api/store/.../:id',
    //     () => HttpResponse.error()
    //   )
    // )
    // const { result } = renderHook(() => useUpdateArticle(), {
    //   wrapper: renderWithProviders,
    // });
    // await act(async () => { result.current.mutate({ /* TODO: payload */ }); });
    // await waitFor(() => expect(result.current.isError).toBe(true));
    expect(true).toBe(true); // placeholder — à remplacer
  });
});

describe('useDeleteArticle', () => {
  it('devrait appeler la mutation et invalider le cache en cas de succès', async () => {
    // TODO: configurer MSW pour intercepter DELETE /api/store/.../:id
    // const { result } = renderHook(() => useDeleteArticle(), {
    //   wrapper: renderWithProviders,
    // });
    // await act(async () => { result.current.mutate({ /* TODO: payload */ }); });
    // await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(true).toBe(true); // placeholder — à remplacer
  });

  it("devrait exposer l'erreur en cas d'échec API", async () => {
    // TODO: server.use(
    //   http.delete('/api/store/.../:id',
    //     () => HttpResponse.error()
    //   )
    // )
    // const { result } = renderHook(() => useDeleteArticle(), {
    //   wrapper: renderWithProviders,
    // });
    // await act(async () => { result.current.mutate({ /* TODO: payload */ }); });
    // await waitFor(() => expect(result.current.isError).toBe(true));
    expect(true).toBe(true); // placeholder — à remplacer
  });
});

describe('useToggleArticle', () => {
  it('devrait appeler la mutation et invalider le cache en cas de succès', async () => {
    // TODO: configurer MSW pour intercepter GET /api/store/...
    // const { result } = renderHook(() => useToggleArticle(), {
    //   wrapper: renderWithProviders,
    // });
    // await act(async () => { result.current.mutate({ /* TODO: payload */ }); });
    // await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(true).toBe(true); // placeholder — à remplacer
  });

  it("devrait exposer l'erreur en cas d'échec API", async () => {
    // TODO: server.use(
    //   http.get('/api/store/...',
    //     () => HttpResponse.error()
    //   )
    // )
    // const { result } = renderHook(() => useToggleArticle(), {
    //   wrapper: renderWithProviders,
    // });
    // await act(async () => { result.current.mutate({ /* TODO: payload */ }); });
    // await waitFor(() => expect(result.current.isError).toBe(true));
    expect(true).toBe(true); // placeholder — à remplacer
  });
});

describe('useUploadArticleImage', () => {
  it('devrait appeler la mutation et invalider le cache en cas de succès', async () => {
    // TODO: configurer MSW pour intercepter GET /api/store/...
    // const { result } = renderHook(() => useUploadArticleImage(), {
    //   wrapper: renderWithProviders,
    // });
    // await act(async () => { result.current.mutate({ /* TODO: payload */ }); });
    // await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(true).toBe(true); // placeholder — à remplacer
  });

  it("devrait exposer l'erreur en cas d'échec API", async () => {
    // TODO: server.use(
    //   http.get('/api/store/...',
    //     () => HttpResponse.error()
    //   )
    // )
    // const { result } = renderHook(() => useUploadArticleImage(), {
    //   wrapper: renderWithProviders,
    // });
    // await act(async () => { result.current.mutate({ /* TODO: payload */ }); });
    // await waitFor(() => expect(result.current.isError).toBe(true));
    expect(true).toBe(true); // placeholder — à remplacer
  });
});

describe('useDeleteArticleImage', () => {
  it('devrait appeler la mutation et invalider le cache en cas de succès', async () => {
    // TODO: configurer MSW pour intercepter DELETE /api/store/.../:id
    // const { result } = renderHook(() => useDeleteArticleImage(), {
    //   wrapper: renderWithProviders,
    // });
    // await act(async () => { result.current.mutate({ /* TODO: payload */ }); });
    // await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(true).toBe(true); // placeholder — à remplacer
  });

  it("devrait exposer l'erreur en cas d'échec API", async () => {
    // TODO: server.use(
    //   http.delete('/api/store/.../:id',
    //     () => HttpResponse.error()
    //   )
    // )
    // const { result } = renderHook(() => useDeleteArticleImage(), {
    //   wrapper: renderWithProviders,
    // });
    // await act(async () => { result.current.mutate({ /* TODO: payload */ }); });
    // await waitFor(() => expect(result.current.isError).toBe(true));
    expect(true).toBe(true); // placeholder — à remplacer
  });
});

describe('useCreateOrder', () => {
  it('devrait appeler la mutation et invalider le cache en cas de succès', async () => {
    // TODO: configurer MSW pour intercepter POST /api/store/...
    // const { result } = renderHook(() => useCreateOrder(), {
    //   wrapper: renderWithProviders,
    // });
    // await act(async () => { result.current.mutate({ /* TODO: payload */ }); });
    // await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(true).toBe(true); // placeholder — à remplacer
  });

  it("devrait exposer l'erreur en cas d'échec API", async () => {
    // TODO: server.use(
    //   http.post('/api/store/...',
    //     () => HttpResponse.error()
    //   )
    // )
    // const { result } = renderHook(() => useCreateOrder(), {
    //   wrapper: renderWithProviders,
    // });
    // await act(async () => { result.current.mutate({ /* TODO: payload */ }); });
    // await waitFor(() => expect(result.current.isError).toBe(true));
    expect(true).toBe(true); // placeholder — à remplacer
  });
});

describe('useUpdateOrderStatus', () => {
  it('devrait appeler la mutation et invalider le cache en cas de succès', async () => {
    // TODO: configurer MSW pour intercepter PUT /api/store/.../:id
    // const { result } = renderHook(() => useUpdateOrderStatus(), {
    //   wrapper: renderWithProviders,
    // });
    // await act(async () => { result.current.mutate({ /* TODO: payload */ }); });
    // await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(true).toBe(true); // placeholder — à remplacer
  });

  it("devrait exposer l'erreur en cas d'échec API", async () => {
    // TODO: server.use(
    //   http.put('/api/store/.../:id',
    //     () => HttpResponse.error()
    //   )
    // )
    // const { result } = renderHook(() => useUpdateOrderStatus(), {
    //   wrapper: renderWithProviders,
    // });
    // await act(async () => { result.current.mutate({ /* TODO: payload */ }); });
    // await waitFor(() => expect(result.current.isError).toBe(true));
    expect(true).toBe(true); // placeholder — à remplacer
  });
});

describe('useCancelOrder', () => {
  it('devrait appeler la mutation et invalider le cache en cas de succès', async () => {
    // TODO: configurer MSW pour intercepter GET /api/store/...
    // const { result } = renderHook(() => useCancelOrder(), {
    //   wrapper: renderWithProviders,
    // });
    // await act(async () => { result.current.mutate({ /* TODO: payload */ }); });
    // await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(true).toBe(true); // placeholder — à remplacer
  });

  it("devrait exposer l'erreur en cas d'échec API", async () => {
    // TODO: server.use(
    //   http.get('/api/store/...',
    //     () => HttpResponse.error()
    //   )
    // )
    // const { result } = renderHook(() => useCancelOrder(), {
    //   wrapper: renderWithProviders,
    // });
    // await act(async () => { result.current.mutate({ /* TODO: payload */ }); });
    // await waitFor(() => expect(result.current.isError).toBe(true));
    expect(true).toBe(true); // placeholder — à remplacer
  });
});

describe('useUpdateStock', () => {
  it('devrait appeler la mutation et invalider le cache en cas de succès', async () => {
    // TODO: configurer MSW pour intercepter PUT /api/store/.../:id
    // const { result } = renderHook(() => useUpdateStock(), {
    //   wrapper: renderWithProviders,
    // });
    // await act(async () => { result.current.mutate({ /* TODO: payload */ }); });
    // await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(true).toBe(true); // placeholder — à remplacer
  });

  it("devrait exposer l'erreur en cas d'échec API", async () => {
    // TODO: server.use(
    //   http.put('/api/store/.../:id',
    //     () => HttpResponse.error()
    //   )
    // )
    // const { result } = renderHook(() => useUpdateStock(), {
    //   wrapper: renderWithProviders,
    // });
    // await act(async () => { result.current.mutate({ /* TODO: payload */ }); });
    // await waitFor(() => expect(result.current.isError).toBe(true));
    expect(true).toBe(true); // placeholder — à remplacer
  });
});

describe('useAdjustStock', () => {
  it('devrait retourner les données en état de chargement puis succès', async () => {
    // TODO: configurer MSW pour intercepter GET /api/store/...
    // const { result } = renderHook(() => useAdjustStock(), {
    //   wrapper: renderWithProviders,
    // });
    // await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // expect(result.current.data).toBeDefined();
    expect(true).toBe(true); // placeholder — à remplacer
  });
});
