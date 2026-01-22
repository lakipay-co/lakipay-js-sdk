import {
    LakipaySDKConfig,
    Environment,
    HttpClientLike,
  } from "./types/config";
  import { DefaultHttpClient } from "./http";
  import { PaymentsClient } from "./payments";
  import { WebhookClient } from "./webhooks";
  
  function resolveBaseUrl(env: Environment, customBaseUrl?: string): string {
    if (env === "custom" && customBaseUrl) return customBaseUrl;
    if (env === "sandbox") return "https://sandbox.api.lakipay.co";
    return "https://api.lakipay.co";
  }
  
  export class LakipaySDK {
    public readonly payments: PaymentsClient;
    public readonly webhooks: WebhookClient;
    private readonly http: HttpClientLike;
    private readonly baseUrl: string;
    private readonly apiKey: string;
    private readonly timeoutMs: number;
  
    constructor(cfg: LakipaySDKConfig) {
      if (!cfg.apiKey) throw new Error("LakipaySDK: apiKey is required");
  
      const env: Environment = cfg.environment ?? "sandbox";
      this.baseUrl = resolveBaseUrl(env, cfg.baseUrl);
      this.apiKey = cfg.apiKey;
      this.timeoutMs = cfg.timeoutMs ?? 15000;
  
      this.http =
        cfg.httpClient ??
        new DefaultHttpClient(
          cfg.logRequests ?? false,
          cfg.retries ?? 2,
          cfg.backoffMs ?? 500
        );
  
      this.payments = new PaymentsClient(this.http, this.baseUrl, this.apiKey, this.timeoutMs);
      this.webhooks = new WebhookClient();
    }
  }