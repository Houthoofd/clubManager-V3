import { setupServer } from 'msw/node';
import { alertsHandlers } from './handlers/alertsHandlers';
import { notificationsHandlers } from './handlers/notificationsHandlers';

/**
 * Consolidated MSW server with all feature handlers.
 * Usage in tests:
 *   beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
 *   afterEach(() => server.resetHandlers());
 *   afterAll(() => server.close());
 */
export const server = setupServer(...alertsHandlers, ...notificationsHandlers);
