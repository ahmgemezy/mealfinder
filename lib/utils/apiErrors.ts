/**
 * Custom API error classes for better error handling
 */

export class APIError extends Error {
    public readonly code: string;
    public readonly statusCode?: number;
    public readonly isRetryable: boolean;

    constructor(
        message: string,
        code: string = "API_ERROR",
        statusCode?: number,
        isRetryable: boolean = false
    ) {
        super(message);
        this.name = "APIError";
        this.code = code;
        this.statusCode = statusCode;
        this.isRetryable = isRetryable;

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, APIError);
        }
    }
}

export class RateLimitError extends APIError {
    public readonly retryAfter?: number;

    constructor(message: string = "API rate limit exceeded", retryAfter?: number) {
        super(message, "RATE_LIMIT_ERROR", 429, true);
        this.name = "RateLimitError";
        this.retryAfter = retryAfter;
    }
}

export class NetworkError extends APIError {
    constructor(message: string = "Network connection failed") {
        super(message, "NETWORK_ERROR", undefined, true);
        this.name = "NetworkError";
    }
}

export class TimeoutError extends APIError {
    constructor(message: string = "Request timeout") {
        super(message, "TIMEOUT_ERROR", 408, true);
        this.name = "TimeoutError";
    }
}

export class ValidationError extends APIError {
    public readonly field?: string;

    constructor(message: string, field?: string) {
        super(message, "VALIDATION_ERROR", 400, false);
        this.name = "ValidationError";
        this.field = field;
    }
}

export class NotFoundError extends APIError {
    constructor(message: string = "Resource not found") {
        super(message, "NOT_FOUND_ERROR", 404, false);
        this.name = "NotFoundError";
    }
}

/**
 * Determines if an error is retryable
 * @param error - Error to check
 * @returns true if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
    if (error instanceof APIError) {
        return error.isRetryable;
    }

    // Network errors are generally retryable
    if (error instanceof TypeError && error.message.includes("fetch")) {
        return true;
    }

    // Check for common retryable status codes
    if (
        typeof error === "object" &&
        error !== null &&
        "statusCode" in error &&
        typeof error.statusCode === "number"
    ) {
        const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
        return retryableStatusCodes.includes(error.statusCode);
    }

    return false;
}

/**
 * Converts an unknown error to an APIError
 * @param error - Error to convert
 * @returns APIError instance
 */
export function toAPIError(error: unknown): APIError {
    if (error instanceof APIError) {
        return error;
    }

    if (error instanceof Error) {
        return new APIError(error.message, "UNKNOWN_ERROR");
    }

    if (typeof error === "string") {
        return new APIError(error, "UNKNOWN_ERROR");
    }

    return new APIError("An unknown error occurred", "UNKNOWN_ERROR");
}
