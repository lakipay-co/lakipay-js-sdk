import type { HttpClientLike } from "./types/config";
import type { DirectPaymentRequest, DirectPaymentData, WithdrawalRequest, WithdrawalData, HostedCheckoutRequest, HostedCheckoutData, TransactionDetail } from "./types/payments";
export declare class PaymentsClient {
    private readonly http;
    private readonly baseUrl;
    private readonly apiKey;
    private readonly timeoutMs;
    constructor(http: HttpClientLike, baseUrl: string, apiKey: string, timeoutMs: number);
    private withAuthHeader;
    private unwrapResponse;
    /**
     * Direct Payment API
     * POST /api/v2/payment/direct
     */
    createDirectPayment(req: DirectPaymentRequest): Promise<DirectPaymentData>;
    /**
     * Withdrawal API
     * POST /api/v2/payment/withdrawal
     */
    createWithdrawal(req: WithdrawalRequest): Promise<WithdrawalData>;
    /**
     * Hosted Checkout API
     * POST /api/v2/payment/checkout
     */
    createHostedCheckout(req: HostedCheckoutRequest): Promise<HostedCheckoutData>;
    /**
     * Transaction Detail API
     * GET /api/v2/payment/transaction/{id}
     */
    getTransaction(id: string): Promise<TransactionDetail>;
}
