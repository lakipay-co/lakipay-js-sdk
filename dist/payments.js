"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsClient = void 0;
const errors_1 = require("./types/errors");
class PaymentsClient {
    constructor(http, baseUrl, apiKey, timeoutMs) {
        this.http = http;
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
        this.timeoutMs = timeoutMs;
    }
    withAuthHeader() {
        return {
            "X-API-Key": this.apiKey,
        };
    }
    unwrapResponse(res) {
        var _a;
        if (res.status !== "SUCCESS") {
            throw new errors_1.LakipayError(`Lakipay API error: ${res.message}`, {
                details: res,
            });
        }
        return (_a = res.data) !== null && _a !== void 0 ? _a : {};
    }
    /**
     * Direct Payment API
     * POST /api/v2/payment/direct
     */
    async createDirectPayment(req) {
        const envelope = await this.http.request({
            method: "POST",
            url: `${this.baseUrl}/api/v2/payment/direct`,
            headers: this.withAuthHeader(),
            body: req,
            timeoutMs: this.timeoutMs,
        });
        return this.unwrapResponse(envelope);
    }
    /**
     * Withdrawal API
     * POST /api/v2/payment/withdrawal
     */
    async createWithdrawal(req) {
        const envelope = await this.http.request({
            method: "POST",
            url: `${this.baseUrl}/api/v2/payment/withdrawal`,
            headers: this.withAuthHeader(),
            body: req,
            timeoutMs: this.timeoutMs,
        });
        return this.unwrapResponse(envelope);
    }
    /**
     * Hosted Checkout API
     * POST /api/v2/payment/checkout
     */
    async createHostedCheckout(req) {
        const envelope = await this.http.request({
            method: "POST",
            url: `${this.baseUrl}/api/v2/payment/checkout`,
            headers: this.withAuthHeader(),
            body: req,
            timeoutMs: this.timeoutMs,
        });
        return this.unwrapResponse(envelope);
    }
    /**
     * Transaction Detail API
     * GET /api/v2/payment/transaction/{id}
     */
    async getTransaction(id) {
        const envelope = await this.http.request({
            method: "GET",
            url: `${this.baseUrl}/api/v2/payment/transaction/${encodeURIComponent(id)}`,
            headers: this.withAuthHeader(),
            timeoutMs: this.timeoutMs,
        });
        return this.unwrapResponse(envelope);
    }
}
exports.PaymentsClient = PaymentsClient;
