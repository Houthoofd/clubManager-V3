export var UserStatus;
(function (UserStatus) {
    UserStatus[UserStatus["ACTIVE"] = 1] = "ACTIVE";
    UserStatus[UserStatus["INACTIVE"] = 2] = "INACTIVE";
    UserStatus[UserStatus["SUSPENDED"] = 3] = "SUSPENDED";
    UserStatus[UserStatus["PENDING_VERIFICATION"] = 4] = "PENDING_VERIFICATION";
    UserStatus[UserStatus["DELETED"] = 5] = "DELETED";
})(UserStatus || (UserStatus = {}));
export const UserStatusLabels = {
    [UserStatus.ACTIVE]: "Actif",
    [UserStatus.INACTIVE]: "Inactif",
    [UserStatus.SUSPENDED]: "Suspendu",
    [UserStatus.PENDING_VERIFICATION]: "En attente",
    [UserStatus.DELETED]: "Supprimé",
};
export function isValidUserStatus(value) {
    return Object.values(UserStatus).includes(value);
}
//# sourceMappingURL=UserStatus.enum.js.map