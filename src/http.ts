import { HttpClientLike, HttpRequestOptions } from "./types/config";
import { LakipayError } from "./types/errors";
import fetch from "cross-fetch";

export class DefaultHttpClient implements HttpClientLike {
  constructor(
    private readonly logRequests: boolean,
    private readonly retries: number,
    private readonly backoffMs: number
  ) {}

  async request<T>(options: HttpRequestOptions): Promise<T> {
    let attempt = 0;

    while (attempt <= this.retries) {
      try {
        if (this.logRequests) {
          console.debug("[LakipaySDK] Request", options.method, options.url, options.body);
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 15000);

        const res = await fetch(options.url, {
          method: options.method,
          headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
          },
          body: options.body ? JSON.stringify(options.body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeout);

        const text = await res.text();
        let json: any = undefined;
        try {
          json = text ? JSON.parse(text) : undefined;
        } catch {
          // ignore
        }

        if (!res.ok) {
          throw new LakipayError(
            `Lakipay API error: ${res.status}`,
            { status: res.status, details: json ?? text }
          );
        }

        return (json ?? {}) as T;
      } catch (err: any) {
        attempt++;
        const status = err?.status as number | undefined;
        const isLast = attempt > this.retries;
        const shouldRetry = !status || (status >= 500 && status < 600);

        if (!shouldRetry || isLast) {
          throw err;
        }

        await new Promise((r) =>
          setTimeout(r, this.backoffMs * Math.pow(2, attempt - 1))
        );
      }
    }

    throw new LakipayError("LakipaySDK: unknown HTTP error");
  }
}