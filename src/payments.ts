import type { HttpClientLike } from "./types/config";
import type {
  ApiResponse,
  DirectPaymentRequest,
  DirectPaymentData,
  WithdrawalRequest,
  WithdrawalData,
  HostedCheckoutRequest,
  HostedCheckoutData,
  TransactionDetail,
} from "./types/payments";
import { LakipayError } from "./types/errors";

export class PaymentsClient {
  constructor(
    private readonly http: HttpClientLike,
    private readonly baseUrl: string,
    private readonly apiKey: string,
    private readonly timeoutMs: number
  ) {}

  private withAuthHeader() {
    return {
      "X-API-Key": this.apiKey,
    };
  }

  private unwrapResponse<T>(res: ApiResponse<T>): T {
    if (res.status !== "SUCCESS") {
      throw new LakipayError(`Lakipay API error: ${res.message}`, {
        details: res,
      });
    }
    return (res.data as T) ?? ({} as T);
  }

  /**
   * Direct Payment API
   * POST /api/v2/payment/direct
   */
  async createDirectPayment(req: DirectPaymentRequest): Promise<DirectPaymentData> {
    const envelope = await this.http.request<ApiResponse<DirectPaymentData>>({
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
  async createWithdrawal(req: WithdrawalRequest): Promise<WithdrawalData> {
    const envelope = await this.http.request<ApiResponse<WithdrawalData>>({
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
  async createHostedCheckout(
    req: HostedCheckoutRequest
  ): Promise<HostedCheckoutData> {
    const envelope = await this.http.request<ApiResponse<HostedCheckoutData>>({
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
  async getTransaction(id: string): Promise<TransactionDetail> {
    const envelope = await this.http.request<ApiResponse<TransactionDetail>>({
      method: "GET",
      url: `${this.baseUrl}/api/v2/payment/transaction/${encodeURIComponent(
        id
      )}`,
      headers: this.withAuthHeader(),
      timeoutMs: this.timeoutMs,
    });

    return this.unwrapResponse(envelope);
  }
}