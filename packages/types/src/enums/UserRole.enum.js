export var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "admin";
    UserRole["MEMBER"] = "member";
    UserRole["PROFESSOR"] = "professor";
})(UserRole || (UserRole = {}));
export const UserRoleLabels = {
    [UserRole.ADMIN]: "Administrateur",
    [UserRole.MEMBER]: "Membre",
    [UserRole.PROFESSOR]: "Professeur",
};
export function isValidUserRole(value) {
    return Object.values(UserRole).includes(value);
}
//# sourceMappingURL=UserRole.enum.js.map