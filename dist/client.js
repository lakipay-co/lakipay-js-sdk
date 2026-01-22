"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LakipaySDK = void 0;
const http_1 = require("./http");
const payments_1 = require("./payments");
const webhooks_1 = require("./webhooks");
function resolveBaseUrl(env, customBaseUrl) {
    if (env === "custom" && customBaseUrl)
        return customBaseUrl;
    if (env === "sandbox")
        return "https://sandbox.api.lakipay.co";
    return "https://api.lakipay.co";
}
class LakipaySDK {
    constructor(cfg) {
        var _a, _b, _c, _d, _e, _f;
        if (!cfg.apiKey)
            throw new Error("LakipaySDK: apiKey is required");
        const env = (_a = cfg.environment) !== null && _a !== void 0 ? _a : "sandbox";
        this.baseUrl = resolveBaseUrl(env, cfg.baseUrl);
        this.apiKey = cfg.apiKey;
        this.timeoutMs = (_b = cfg.timeoutMs) !== null && _b !== void 0 ? _b : 15000;
        this.http =
            (_c = cfg.httpClient) !== null && _c !== void 0 ? _c : new http_1.DefaultHttpClient((_d = cfg.logRequests) !== null && _d !== void 0 ? _d : false, (_e = cfg.retries) !== null && _e !== void 0 ? _e : 2, (_f = cfg.backoffMs) !== null && _f !== void 0 ? _f : 500);
        this.payments = new payments_1.PaymentsClient(this.http, this.baseUrl, this.apiKey, this.timeoutMs);
        this.webhooks = new webhooks_1.WebhookClient();
    }
}
exports.LakipaySDK = LakipaySDK;
