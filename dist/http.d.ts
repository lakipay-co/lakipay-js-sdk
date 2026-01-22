import { HttpClientLike, HttpRequestOptions } from "./types/config";
export declare class DefaultHttpClient implements HttpClientLike {
    private readonly logRequests;
    private readonly retries;
    private readonly backoffMs;
    constructor(logRequests: boolean, retries: number, backoffMs: number);
    request<T>(options: HttpRequestOptions): Promise<T>;
}
