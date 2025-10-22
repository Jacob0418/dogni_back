import { BaseError } from './base-error';
import { HttpStatusCode } from '../models/http.model';


export class AuthenticationError extends BaseError {
    constructor(message: string, methodName = '', httpCode = HttpStatusCode.BAD_REQUEST, fields?: string[], error?: unknown) {
        super({ httpCode: httpCode, log: message, methodName: methodName, error: error });
    }
}

export class ParametersError extends BaseError {
    fields: string[];
    constructor(message: string, methodName = '', httpCode = HttpStatusCode.BAD_REQUEST, fields?: string[], error?: unknown) {
        super({ httpCode: httpCode, log: message, methodName: methodName, error: error });
        this.fields = fields;
    }
}

export class NotFoundError extends BaseError {
    constructor(message: string, methodName = '', httpCode = HttpStatusCode.BAD_REQUEST, isOperational = true, error?: unknown) {
        super({ httpCode: httpCode, log: message, methodName: methodName, isOperational, error: error });
    }
}

export class SwApiError extends BaseError {
    details: any;
    constructor(message: string, methodName = '', details?: object, httpCode = HttpStatusCode.BAD_REQUEST, isOperational = true, error?: unknown) {
        super({ httpCode: httpCode, log: message, methodName: methodName, isOperational, error: error });
        this.details = details;
    }
}
