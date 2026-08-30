export var NotificationType;
(function (NotificationType) {
    NotificationType["INFO"] = "info";
    NotificationType["WARNING"] = "warning";
    NotificationType["ERROR"] = "error";
    NotificationType["SUCCESS"] = "success";
})(NotificationType || (NotificationType = {}));
export const NOTIFICATION_TYPES = Object.values(NotificationType);
export var AlertSeverity;
(function (AlertSeverity) {
    AlertSeverity["INFO"] = "info";
    AlertSeverity["WARNING"] = "warning";
    AlertSeverity["CRITICAL"] = "critical";
})(AlertSeverity || (AlertSeverity = {}));
export const ALERT_SEVERITIES = Object.values(AlertSeverity);
export var AlertStatus;
(function (AlertStatus) {
    AlertStatus["ACTIVE"] = "active";
    AlertStatus["RESOLVED"] = "resolue";
    AlertStatus["IGNORED"] = "ignoree";
})(AlertStatus || (AlertStatus = {}));
export const ALERT_STATUSES = Object.values(AlertStatus);
export var AlertActionType;
(function (AlertActionType) {
    AlertActionType["MESSAGE_SENT"] = "message_envoye";
    AlertActionType["INFORMATION_UPDATED"] = "information_mise_a_jour";
    AlertActionType["PAYMENT_RECEIVED"] = "paiement_recu";
    AlertActionType["STATUS_CHANGED"] = "statut_change";
    AlertActionType["OTHER"] = "autre";
})(AlertActionType || (AlertActionType = {}));
export const ALERT_ACTION_TYPES = Object.values(AlertActionType);
export function isNotificationType(value) {
    return typeof value === 'string' && NOTIFICATION_TYPES.includes(value);
}
export function isAlertSeverity(value) {
    return typeof value === 'string' && ALERT_SEVERITIES.includes(value);
}
export function isAlertStatus(value) {
    return typeof value === 'string' && ALERT_STATUSES.includes(value);
}
export function isAlertActionType(value) {
    return typeof value === 'string' && ALERT_ACTION_TYPES.includes(value);
}
//# sourceMappingURL=messaging.enums.js.map