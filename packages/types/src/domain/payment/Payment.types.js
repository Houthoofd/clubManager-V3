export var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["STRIPE"] = "stripe";
    PaymentMethod["ESPECES"] = "especes";
    PaymentMethod["VIREMENT"] = "virement";
    PaymentMethod["AUTRE"] = "autre";
})(PaymentMethod || (PaymentMethod = {}));
export var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["EN_ATTENTE"] = "en_attente";
    PaymentStatus["VALIDE"] = "valide";
    PaymentStatus["ECHOUE"] = "echoue";
    PaymentStatus["REMBOURSE"] = "rembourse";
})(PaymentStatus || (PaymentStatus = {}));
export const PAYMENT_METHOD_LABELS = {
    [PaymentMethod.STRIPE]: 'Carte bancaire (Stripe)',
    [PaymentMethod.ESPECES]: 'Espèces',
    [PaymentMethod.VIREMENT]: 'Virement bancaire',
    [PaymentMethod.AUTRE]: 'Autre',
};
export const PAYMENT_STATUS_LABELS = {
    [PaymentStatus.EN_ATTENTE]: 'En attente',
    [PaymentStatus.VALIDE]: 'Validé',
    [PaymentStatus.ECHOUE]: 'Échoué',
    [PaymentStatus.REMBOURSE]: 'Remboursé',
};
//# sourceMappingURL=Payment.types.js.map