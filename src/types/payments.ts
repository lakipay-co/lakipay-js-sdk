/**
 * Supported currencies according to the public API.
 */
export type Currency = "ETB" | "USD";

/**
 * Supported payment mediums/providers for deposits and withdrawals.
 */
export type PaymentMedium =
  | "MPESA"
  | "TELEBIRR"
  | "CBE"
  | "ETHSWITCH"
  | "LAKIPAY"
  | "CYBERSOURCE";

/**
 * Top‑level API status in HTTP responses.
 */
export type ApiStatus = "SUCCESS" | "ERROR";

/**
 * Generic API envelope returned by LakiPay.
 */
export interface ApiResponse<TData = unknown> {
  status: ApiStatus;
  message: string;
  data?: TData;
  error_code?: string;
  errors?: Record<string, string[]>;
}

/**
 * Request body for Direct Payments API
 * POST /api/v2/payment/direct
 *
 * Field names intentionally use snake_case to match the HTTP JSON contract.
 */
export interface DirectPaymentRequest {
  amount: number; // decimal with 2 dp, represented as number in JS
  currency: Currency;
  phone_number: string; // E.164 without leading +
  medium: PaymentMedium;
  description?: string;
  reference: string;
  callback_url?: string;
  redirects?: {
    success_url?: string;
    failure_url?: string;
  };
  /**
   * For USD payments via CYBERSOURCE:
   * whether the merchant absorbs the transaction fees.
   */
  merchant_pays_fee?: boolean;
}

/**
 * Data section of a successful direct payment response.
 */
export interface DirectPaymentData {
  transaction_id: string;
  reference: string;
  amount: number;
  currency: Currency;
  status: TransactionStatus;
  medium: PaymentMedium;
  created_at: string;
}

export type TransactionStatus = "SUCCESS" | "FAILED" | "PENDING" | "CANCELLED";

/**
 * Request body for Withdrawals API
 * POST /api/v2/payment/withdrawal
 */
export interface WithdrawalRequest {
  amount: number;
  currency: Currency;
  phone_number: string;
  medium: PaymentMedium;
  reference: string;
  callback_url?: string;
}

/**
 * Data section for a successful withdrawal initiation.
 */
export interface WithdrawalData {
  transaction_id: string;
  reference: string;
  amount: number;
  currency: Currency;
  status: TransactionStatus;
  medium: PaymentMedium;
  created_at: string;
}

/**
 * Request body for Hosted Checkout API
 * POST /api/v2/payment/checkout
 */
export interface HostedCheckoutRequest {
  amount: number;
  currency: Currency;
  phone_number: string;
  reference: string;
  callback_url?: string;
  description?: string;
  redirects: {
    success: string;
    failed: string;
  };
  supported_mediums: PaymentMedium[];
}

/**
 * Data section for hosted checkout creation.
 * The exact fields can be expanded as the API evolves
 * (e.g., checkout URL, expiry, etc.).
 */
export interface HostedCheckoutData {
  transaction_id: string;
  reference: string;
  amount: number;
  currency: Currency;
  status: TransactionStatus;
  medium?: PaymentMedium;
  checkout_url?: string;
  created_at: string;
}

/**
 * Transaction details returned by
 * GET /api/v2/payment/transaction/{id}
 */
export interface TransactionDetail {
  transaction_id: string;
  reference: string;
  amount: number;
  currency: Currency;
  status: TransactionStatus;
  medium: PaymentMedium;
  created_at: string;
  updated_at?: string;
}