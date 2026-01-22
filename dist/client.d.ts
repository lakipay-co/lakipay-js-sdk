import { LakipaySDKConfig } from "./types/config";
import { PaymentsClient } from "./payments";
import { WebhookClient } from "./webhooks";
export declare class LakipaySDK {
    readonly payments: PaymentsClient;
    readonly webhooks: WebhookClient;
    private readonly http;
    private readonly baseUrl;
    private readonly apiKey;
    private readonly timeoutMs;
    constructor(cfg: LakipaySDKConfig);
}
