export var ScheduleStatus;
(function (ScheduleStatus) {
    ScheduleStatus["EN_ATTENTE"] = "en_attente";
    ScheduleStatus["PAYE"] = "paye";
    ScheduleStatus["EN_RETARD"] = "en_retard";
    ScheduleStatus["ANNULE"] = "annule";
})(ScheduleStatus || (ScheduleStatus = {}));
export const SCHEDULE_STATUS_LABELS = {
    [ScheduleStatus.EN_ATTENTE]: 'En attente',
    [ScheduleStatus.PAYE]: 'Payé',
    [ScheduleStatus.EN_RETARD]: 'En retard',
    [ScheduleStatus.ANNULE]: 'Annulé',
};
export const SCHEDULE_STATUS_COLORS = {
    [ScheduleStatus.EN_ATTENTE]: 'orange',
    [ScheduleStatus.PAYE]: 'green',
    [ScheduleStatus.EN_RETARD]: 'red',
    [ScheduleStatus.ANNULE]: 'gray',
};
//# sourceMappingURL=PaymentSchedule.types.js.map