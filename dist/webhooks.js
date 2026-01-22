"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookClient = void 0;
const crypto_1 = __importDefault(require("crypto"));
class WebhookClient {
    /**
     * Build canonical string as described in the docs:
     * 1. Remove `signature` field
     * 2. Sort keys alphabetically
     * 3. Join as key=value with '&'
     */
    buildCanonicalString(payload) {
        const entries = Object.keys(payload)
            .filter((k) => k !== "signature")
            .sort()
            .map((k) => `${k}=${payload[k]}`);
        return entries.join("&");
    }
    /**
     * Verify RSA‑2048 signature using the configured public key.
     *
     * @param payload Parsed JSON webhook payload (including `signature` field)
     * @param publicKey RSA public key in PEM format
     */
    verifySignature(payload, publicKey) {
        if (!payload.signature)
            return false;
        const canonical = this.buildCanonicalString(payload);
        const verifier = crypto_1.default.createVerify("RSA-SHA256");
        verifier.update(canonical);
        verifier.end();
        try {
            return verifier.verify(publicKey, payload.signature, "base64");
        }
        catch {
            return false;
        }
    }
    /**
     * Verify and return the typed webhook payload.
     * Throws if verification fails.
     */
    verifyAndParse(payload, publicKey) {
        const valid = this.verifySignature(payload, publicKey);
        if (!valid) {
            throw new Error("Invalid Lakipay webhook signature");
        }
        return payload;
    }
}
exports.WebhookClient = WebhookClient;
