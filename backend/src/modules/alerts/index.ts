/**
 * Alerts Module — Public API
 * Exporte le router par défaut pour le montage dans app.ts
 * Exporte aussi CreateUserAlertUseCase et MySQLAlertRepository
 * pour permettre à d'autres modules de déclencher des alertes
 */

export { default } from './presentation/routes/alertRoutes.js';
export { CreateUserAlertUseCase } from './application/use-cases/CreateUserAlertUseCase.js';
export { MySQLAlertRepository } from './infrastructure/repositories/MySQLAlertRepository.js';
