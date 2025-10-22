import { HttpStatusCode } from "../models/http.model";

export class BaseError extends Error {
    public readonly methodName: string;
    public readonly httpCode: number;
    public readonly isOperational: boolean;
    public readonly error: unknown;

    constructor(
        {
            log = "UNDEFINED LOG",
            methodName = "UNDEFINED METHOD",
            httpCode = HttpStatusCode.INTERNAL_SERVER,
            isOperational = true,
            error = null
        }
    ) {
        super(log);
        Object.setPrototypeOf(this, new.target.prototype);
        this.error = error;
        this.methodName = methodName;
        this.httpCode = httpCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this);
    }

    static buildErrorMessage(error: BaseError | unknown): object {
        if (!(error instanceof BaseError)) {
            return {
                status: 500,
                message: "An unexpected error ocurred",
                error: error
            }
        }
        return {
            code: error?.httpCode || 500,
            message: error?.message || "Base error, could not define message",
            method: error?.methodName || ""
        };
    }
}