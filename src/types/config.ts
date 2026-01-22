export type Environment = "sandbox" | "production" | "custom";

export interface LakipaySDKConfig {
  /**
   * API key in the form PUBLICKEY:SECRETKEY as required by LakiPay,
   * passed in the X-API-Key header.
   */
  apiKey: string;
  environment?: Environment;
  baseUrl?: string;          // used when environment === "custom"
  timeoutMs?: number;
  logRequests?: boolean;
  retries?: number;
  backoffMs?: number;
  httpClient?: HttpClientLike;
}

export interface HttpClientLike {
  request<T>(options: HttpRequestOptions): Promise<T>;
}

export interface HttpRequestOptions {
  method: "GET" | "POST" | "PUT" | "DELETE";
  url: string;
  headers?: Record<string, string>;
  body?: unknown;
  timeoutMs?: number;
}