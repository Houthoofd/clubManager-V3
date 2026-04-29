/**
 * Notifications Module — Public API
 * Exports the router as default for mounting in app.ts
 * Also exports CreateNotificationUseCase and MySQLNotificationRepository
 * so other modules can trigger notifications (e.g. payment confirmed, order shipped)
 */

export { default } from './presentation/routes/notificationRoutes.js';
export { CreateNotificationUseCase } from './application/use-cases/CreateNotificationUseCase.js';
export { MySQLNotificationRepository } from './infrastructure/repositories/MySQLNotificationRepository.js';
