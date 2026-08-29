export declare enum UserStatus {
    ACTIVE = 1,
    INACTIVE = 2,
    SUSPENDED = 3,
    PENDING_VERIFICATION = 4,
    DELETED = 5
}
export declare const UserStatusLabels: Record<UserStatus, string>;
export declare function isValidUserStatus(value: number): value is UserStatus;
//# sourceMappingURL=UserStatus.enum.d.ts.map