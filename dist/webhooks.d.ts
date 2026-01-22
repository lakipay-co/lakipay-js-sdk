import type { PaymentMedium, Currency, TransactionStatus } from "./types/payments";
/**
 * Raw webhook payload as sent by LakiPay.
 */
export interface LakipayWebhookPayload {
    event: "DEPOSIT" | "WITHDRAWAL";
    transaction_id: string;
    reference: string;
    amount: number;
    currency: Currency;
    status: TransactionStatus;
    medium: PaymentMedium;
    timestamp: string;
    signature: string;
    [key: string]: any;
}
export declare class WebhookClient {
    /**
     * Build canonical string as described in the docs:
     * 1. Remove `signature` field
     * 2. Sort keys alphabetically
     * 3. Join as key=value with '&'
     */
    private buildCanonicalString;
    /**
     * Verify RSA‑2048 signature using the configured public key.
     *
     * @param payload Parsed JSON webhook payload (including `signature` field)
     * @param publicKey RSA public key in PEM format
     */
    verifySignature(payload: LakipayWebhookPayload, publicKey: string): boolean;
    /**
     * Verify and return the typed webhook payload.
     * Throws if verification fails.
     */
    verifyAndParse(payload: LakipayWebhookPayload, publicKey: string): LakipayWebhookPayload;
}
