export interface ApiSuccessResponse<T = any> {
    success: true;
    message: string;
    data: T;
}
export interface ApiErrorResponse {
    success: false;
    message: string;
    error?: string;
}
export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;
export interface PaginatedResponse<T> {
    success: true;
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
//# sourceMappingURL=ApiResponse.types.d.ts.map