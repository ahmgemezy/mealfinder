import {
    APIError,
    RateLimitError,
    NetworkError,
    TimeoutError,
    ValidationError,
    NotFoundError,
    isRetryableError,
    toAPIError,
} from "../../lib/utils/apiErrors";

describe("Error class hierarchy", () => {
    it("APIError has correct defaults", () => {
        const err = new APIError("something broke");
        expect(err.message).toBe("something broke");
        expect(err.code).toBe("API_ERROR");
        expect(err.statusCode).toBeUndefined();
        expect(err.isRetryable).toBe(false);
        expect(err).toBeInstanceOf(Error);
    });

    it("RateLimitError is retryable with 429 status", () => {
        const err = new RateLimitError("too many", 60);
        expect(err.code).toBe("RATE_LIMIT_ERROR");
        expect(err.statusCode).toBe(429);
        expect(err.isRetryable).toBe(true);
        expect(err.retryAfter).toBe(60);
        expect(err).toBeInstanceOf(APIError);
    });

    it("NetworkError is retryable without status code", () => {
        const err = new NetworkError();
        expect(err.code).toBe("NETWORK_ERROR");
        expect(err.statusCode).toBeUndefined();
        expect(err.isRetryable).toBe(true);
    });

    it("TimeoutError has 408 status", () => {
        const err = new TimeoutError();
        expect(err.statusCode).toBe(408);
        expect(err.isRetryable).toBe(true);
    });

    it("ValidationError is NOT retryable with 400 status", () => {
        const err = new ValidationError("bad input", "email");
        expect(err.statusCode).toBe(400);
        expect(err.isRetryable).toBe(false);
        expect(err.field).toBe("email");
    });

    it("NotFoundError has 404 status", () => {
        const err = new NotFoundError();
        expect(err.statusCode).toBe(404);
        expect(err.isRetryable).toBe(false);
    });
});

describe("isRetryableError", () => {
    it("returns true for retryable APIError", () => {
        expect(isRetryableError(new RateLimitError())).toBe(true);
        expect(isRetryableError(new NetworkError())).toBe(true);
        expect(isRetryableError(new TimeoutError())).toBe(true);
    });

    it("returns false for non-retryable APIError", () => {
        expect(isRetryableError(new ValidationError("bad"))).toBe(false);
        expect(isRetryableError(new NotFoundError())).toBe(false);
    });

    it("returns true for TypeError with 'fetch' in message", () => {
        expect(isRetryableError(new TypeError("Failed to fetch"))).toBe(true);
    });

    it("returns false for TypeError without 'fetch'", () => {
        expect(isRetryableError(new TypeError("Cannot read property"))).toBe(false);
    });

    it("returns true for objects with retryable statusCode", () => {
        expect(isRetryableError({ statusCode: 429 })).toBe(true);
        expect(isRetryableError({ statusCode: 503 })).toBe(true);
    });

    it("returns false for objects with non-retryable statusCode", () => {
        expect(isRetryableError({ statusCode: 400 })).toBe(false);
    });

    it("returns false for unknown error types", () => {
        expect(isRetryableError("random string")).toBe(false);
        expect(isRetryableError(null)).toBe(false);
    });
});

describe("toAPIError", () => {
    it("returns the same instance for APIError", () => {
        const original = new APIError("test");
        expect(toAPIError(original)).toBe(original);
    });

    it("wraps a regular Error", () => {
        const err = toAPIError(new Error("oops"));
        expect(err).toBeInstanceOf(APIError);
        expect(err.message).toBe("oops");
        expect(err.code).toBe("UNKNOWN_ERROR");
    });

    it("wraps a string", () => {
        const err = toAPIError("something went wrong");
        expect(err.message).toBe("something went wrong");
    });

    it("wraps unknown types", () => {
        const err = toAPIError(42);
        expect(err.message).toBe("An unknown error occurred");
    });
});
