export const DUREE_LABELS = {
    1: '1 mois',
    3: '3 mois',
    6: '6 mois',
    12: '1 an',
    24: '2 ans',
};
export function getDureeLabel(duree_mois) {
    if (DUREE_LABELS[duree_mois]) {
        return DUREE_LABELS[duree_mois];
    }
    return `${duree_mois} mois`;
}
//# sourceMappingURL=PricingPlan.types.js.map