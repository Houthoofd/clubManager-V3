export declare enum NotificationType {
    INFO = "info",
    WARNING = "warning",
    ERROR = "error",
    SUCCESS = "success"
}
export declare const NOTIFICATION_TYPES: NotificationType[];
export declare enum AlertSeverity {
    INFO = "info",
    WARNING = "warning",
    CRITICAL = "critical"
}
export declare const ALERT_SEVERITIES: AlertSeverity[];
export declare enum AlertStatus {
    ACTIVE = "active",
    RESOLVED = "resolue",
    IGNORED = "ignoree"
}
export declare const ALERT_STATUSES: AlertStatus[];
export declare enum AlertActionType {
    MESSAGE_SENT = "message_envoye",
    INFORMATION_UPDATED = "information_mise_a_jour",
    PAYMENT_RECEIVED = "paiement_recu",
    STATUS_CHANGED = "statut_change",
    OTHER = "autre"
}
export declare const ALERT_ACTION_TYPES: AlertActionType[];
export declare function isNotificationType(value: unknown): value is NotificationType;
export declare function isAlertSeverity(value: unknown): value is AlertSeverity;
export declare function isAlertStatus(value: unknown): value is AlertStatus;
export declare function isAlertActionType(value: unknown): value is AlertActionType;
//# sourceMappingURL=messaging.enums.d.ts.map