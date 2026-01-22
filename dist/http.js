"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultHttpClient = void 0;
const errors_1 = require("./types/errors");
const cross_fetch_1 = __importDefault(require("cross-fetch"));
class DefaultHttpClient {
    constructor(logRequests, retries, backoffMs) {
        this.logRequests = logRequests;
        this.retries = retries;
        this.backoffMs = backoffMs;
    }
    async request(options) {
        var _a;
        let attempt = 0;
        while (attempt <= this.retries) {
            try {
                if (this.logRequests) {
                    console.debug("[LakipaySDK] Request", options.method, options.url, options.body);
                }
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), (_a = options.timeoutMs) !== null && _a !== void 0 ? _a : 15000);
                const res = await (0, cross_fetch_1.default)(options.url, {
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
                let json = undefined;
                try {
                    json = text ? JSON.parse(text) : undefined;
                }
                catch {
                    // ignore
                }
                if (!res.ok) {
                    throw new errors_1.LakipayError(`Lakipay API error: ${res.status}`, { status: res.status, details: json !== null && json !== void 0 ? json : text });
                }
                return (json !== null && json !== void 0 ? json : {});
            }
            catch (err) {
                attempt++;
                const status = err === null || err === void 0 ? void 0 : err.status;
                const isLast = attempt > this.retries;
                const shouldRetry = !status || (status >= 500 && status < 600);
                if (!shouldRetry || isLast) {
                    throw err;
                }
                await new Promise((r) => setTimeout(r, this.backoffMs * Math.pow(2, attempt - 1)));
            }
        }
        throw new errors_1.LakipayError("LakipaySDK: unknown HTTP error");
    }
}
exports.DefaultHttpClient = DefaultHttpClient;
