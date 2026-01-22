import crypto from "crypto";
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
  signature: string; // base64‑encoded RSA signature
  // Allow forward‑compatible additional fields
  [key: string]: any;
}

export class WebhookClient {
  /**
   * Build canonical string as described in the docs:
   * 1. Remove `signature` field
   * 2. Sort keys alphabetically
   * 3. Join as key=value with '&'
   */
  private buildCanonicalString(payload: Record<string, any>): string {
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
  verifySignature(
    payload: LakipayWebhookPayload,
    publicKey: string
  ): boolean {
    if (!payload.signature) return false;

    const canonical = this.buildCanonicalString(payload);
    const verifier = crypto.createVerify("RSA-SHA256");
    verifier.update(canonical);
    verifier.end();

    try {
      return verifier.verify(publicKey, payload.signature, "base64");
    } catch {
      return false;
    }
  }

  /**
   * Verify and return the typed webhook payload.
   * Throws if verification fails.
   */
  verifyAndParse(
    payload: LakipayWebhookPayload,
    publicKey: string
  ): LakipayWebhookPayload {
    const valid = this.verifySignature(payload, publicKey);
    if (!valid) {
      throw new Error("Invalid Lakipay webhook signature");
    }
    return payload;
  }
}