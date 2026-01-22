export declare class LakipayError extends Error {
    status?: number;
    code?: string;
    details?: unknown;
    constructor(message: string, opts?: {
        status?: number;
        code?: string;
        details?: unknown;
    });
}
