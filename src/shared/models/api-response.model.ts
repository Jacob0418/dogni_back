export interface ApiResponse {
    message: string;
    status: number;
    hasError: boolean;
    data?: unknown;
    methodName?: string;
    errorDetails?: unknown;
    errorType?: string;
}