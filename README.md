## LakiPay JavaScript/TypeScript SDK

JavaScript/TypeScript SDK for integrating with the **LakiPay core payment API** from your Node.js backends and serverless functions.

The SDK targets **Node.js / server environments**. **Do not** expose your API keys in browser code.

**Package:** [npm](https://www.npmjs.com/package/lakipay-js-sdk) | [GitHub](https://github.com/lakipay-co/lakipay-js-sdk)

**Requirements:**
- Node.js >= 14.0.0
- TypeScript >= 4.0.0 (optional, for TypeScript projects)

---

### 1. Installation

#### Install from npm 

```bash
npm install lakipay-js-sdk
# or
yarn add lakipay-js-sdk
# or
pnpm add lakipay-js-sdk
```
---

### 2. Initialization & Quick Start

```ts
import { LakipaySDK } from "lakipay-js-sdk";

const sdk = new LakipaySDK({
  apiKey: "pk_test_xxx:sk_test_xxx", // X-API-Key value: PUBLICKEY:SECRETKEY
  environment: "sandbox",            // "sandbox" | "production" | "custom"
  // Optional:
  // baseUrl: "https://custom.api.lakipay.co", // required if environment: "custom"
  // timeoutMs: 20000,
  // logRequests: true,
  // retries: 3,
  // backoffMs: 500,
});

// Example: simple direct payment
async function main() {
  const res = await sdk.payments.createDirectPayment({
    amount: 100.0,
    currency: "ETB",
    phone_number: "2519XXXXXXXX", // no leading '+'
    medium: "MPESA",
    description: "Payment for order #12345",
    reference: "ORDER-12345",
    callback_url: "https://yourwebsite.com/webhook",
  });

  console.log(res.status);                // "SUCCESS" | "ERROR"
  console.log(res.data?.transaction_id);  // "TXN-123456789"
}

main().catch(console.error);
```

High-level structure:

- **`sdk.payments`** – Direct payments, withdrawals, hosted checkout, transaction detail.
- **`sdk.webhooks`** – Webhook signature verification and event parsing.

---

### 3. Configuration

The constructor accepts a `LakipaySDKConfig` (from `src/types/config.ts`):

```ts
type Environment =  "production" ;

interface LakipaySDKConfig {
  apiKey: string;              // REQUIRED: "PUBLICKEY:SECRETKEY"
  environment?: Environment;   // default: "sandbox"
  baseUrl?: string;            // only for environment = "custom"
  timeoutMs?: number;          // default: 15000 ms
  logRequests?: boolean;       // default: false
  retries?: number;            // default: 2
  backoffMs?: number;          // default: 500 ms
  httpClient?: HttpClientLike; // optional custom HTTP client
}
```

### 3.1 Environments and Base URLs

- **`"production"`** → `https://api.lakipay.co`


### 3.2 API Key (X-API-Key Header)

All API requests require an API key in the `X-API-Key` header, as documented:

```http
X-API-Key: PUBLICKEY:SECRETKEY
```

**Important security notes:**

- Never expose `PUBLICKEY:SECRETKEY` in browser / mobile apps.
- Keep keys in environment variables or secure configuration management.
- Rotate keys regularly, use separate keys for sandbox and production.

---

### 4. Usage (Payments)

The payments client (`sdk.payments`) wraps the following LakiPay endpoints:

- `POST /api/v2/payment/direct`
- `POST /api/v2/payment/withdrawal`
- `POST /api/v2/payment/checkout`
- `GET  /api/v2/payment/transaction/{id}`

The SDK returns typed responses that map to your API documentation.

#### 4.1 Direct Payments

Initiate a direct payment through supported providers such as MPESA, TELEBIRR, CBE, ETHSWITCH, or CYBERSOURCE.

```ts
import { LakipaySDK, PaymentMethod, Currency } from "lakipay-js-sdk";

const sdk = new LakipaySDK({
  apiKey: process.env.LAKIPAY_API_KEY!,
  environment: "production",
});

const res = await sdk.payments.createDirectPayment({
  amount: 100.0,
  currency: Currency.ETB,             // "ETB"
  phone_number: "2519XXXXXXXX",       // no '+'
  medium: PaymentMethod.MPESA,        // "MPESA" | "TELEBIRR" | "CBE" | ...
  description: "Payment for order #12345",
  reference: "ORDER-12345",
  callback_url: "https://yourwebsite.com/webhook", // optional
  redirects: {
    success: "https://yourwebsite.com/payment/success",
    failed: "https://yourwebsite.com/payment/failed",
  },
  // For USD / CYBERSOURCE:
  // merchant_pays_fee: false,
});

if (res.status === "SUCCESS") {
  console.log("Transaction ID:", res.data?.transaction_id);
  console.log("Current status:", res.data?.status); // "PENDING", etc.
}
```

Key fields (per API docs):

- **`amount`**: decimal with 2 decimal places, e.g. `100.00`.
- **`currency`**: `"ETB"` or `"USD"`.
- **`phone_number`**: country code + number, without leading `+`, e.g. `"2519XXXXXXXX"`.
- **`medium`**: `"MPESA"`, `"TELEBIRR"`, `"CBE"`, `"ETHSWITCH"`, `"CYBERSOURCE"`.
- **`reference`**: your unique reference ID.
- **`callback_url`**: where LakiPay sends async status updates (optional).
- **`redirects`**: success / failed redirect URLs (optional).

#### 4.2 Withdrawals

Withdraw funds from your LakiPay account to customer accounts.

```ts
import { LakipaySDK, Currency, PaymentMethod } from "lakipay-js-sdk";

const sdk = new LakipaySDK({
  apiKey: process.env.LAKIPAY_API_KEY!,
  environment: "production",
});

const res = await sdk.payments.createWithdrawal({
  amount: 500.0,
  currency: Currency.ETB,
  phone_number: "2519XXXXXXXX",
  medium: PaymentMethod.MPESA,
  reference: "WITHDRAW-12345",
  callback_url: "https://yourwebsite.com/webhook", // optional
});

console.log("Withdrawal TXN:", res.data?.transaction_id);
console.log("Status:", res.data?.status); // "PENDING", etc.
```

Notes:

- Withdrawals require explicit permissions on your merchant account.
- Limits and processing times depend on provider and account tier.

#### 4.3 Hosted Checkout

Create a hosted checkout session that LakiPay renders for you.

```ts
import { LakipaySDK, Currency, PaymentMethod } from "lakipay-js-sdk";

const sdk = new LakipaySDK({
  apiKey: process.env.LAKIPAY_API_KEY!,
  environment: "sandbox",
});

const res = await sdk.payments.createHostedCheckout({
  amount: 1000.5,
  currency: Currency.ETB,
  description: "Payment for order #123",
  reference: "ORDER123456",
  phone_number: "2519XXXXXXXX",
  callback_url: "https://example.com/callback",
  redirects: {
    success: "https://example.com/success",
    failed: "https://example.com/failed",
  },
  supported_mediums: [
    PaymentMethod.MPESA,
    PaymentMethod.TELEBIRR,
    PaymentMethod.CBE,
  ],
});

// Backend should inspect res.data to get the hosted checkout URL (as defined by backend)
console.log("Hosted checkout response:", res.data);
```

Typical flow:

1. Your server creates a hosted checkout session.
2. It receives a URL in `res.data` (per backend implementation).
3. Your frontend redirects the customer to that URL.
4. LakiPay renders the payment UI and redirects back to your success/failure URLs.

#### 4.4 Transaction Details

Retrieve full details for a specific transaction by ID.

```ts
const txn = await sdk.payments.getTransaction("TXN-123456789");

console.log("Status:", txn.data?.status);       // "SUCCESS", "FAILED", "PENDING", "CANCELLED"
console.log("Amount:", txn.data?.amount);
console.log("Currency:", txn.data?.currency);
console.log("Medium:", txn.data?.medium);
console.log("Reference:", txn.data?.reference);
```

Use this endpoint to:

- Confirm final transaction status.
- Reconcile with your internal order system.
- Implement manual re-check flows from your admin dashboard.

---

### 5. Webhooks

LakiPay sends asynchronous notifications (DEPOSIT, WITHDRAWAL) to your webhook endpoint. The SDK provides helpers in `sdk.webhooks` to:

- Build the canonical string.
- Verify RSA-2048 signatures.
- Parse typed events.

#### 5.1 Security Model

From the API docs:

- Webhook payload includes a `signature` field (Base64-encoded).
- You must verify this using LakiPay’s RSA-2048 public key.
- Canonical string is built by:
  1. Filtering out the `signature` field.
  2. Sorting keys alphabetically.
  3. Concatenating as `key=value`.
  4. Joining with `&`.

The SDK’s `verifyAndParse` handles this for you.

#### 5.2 Example: Node / Express Webhook Handler

```ts
import express from "express";
import { LakipaySDK } from "lakipay-js-sdk";

const app = express();
app.use(express.json({ type: "*/*" }));

// Public key you download from the LakiPay dashboard
const LAKIPAY_WEBHOOK_PUBLIC_KEY = process.env.LAKIPAY_WEBHOOK_PUBLIC_KEY!;

const sdk = new LakipaySDK({
  apiKey: process.env.LAKIPAY_API_KEY!, // used for outbound calls
  environment: "production",
});

app.post("/lakipay/webhook", (req, res) => {
  const payload = req.body;
  const signature = payload.signature;

  try {
    const event = sdk.webhooks.verifyAndParse(
      payload,
      signature,
      LAKIPAY_WEBHOOK_PUBLIC_KEY
    );

    // event.event: "DEPOSIT" | "WITHDRAWAL"
    if (event.event === "DEPOSIT") {
      // update order / wallet for deposit
    } else if (event.event === "WITHDRAWAL") {
      // handle withdrawal status change
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Invalid LakiPay webhook:", err);
    res.sendStatus(400);
  }
});

app.listen(3000, () => {
  console.log("Webhook server listening on port 3000");
});
```

Best practices:

- Always verify the signature before trusting the webhook.
- Use HTTPS for webhook URLs.
- Use `transaction_id` as an idempotency key to handle duplicates.
- Respond quickly (within a few seconds) with HTTP 200 on success.

---

### 6. Error Handling

The SDK defines a `LakipayError` class (`src/types/errors.ts`) that you can use to distinguish API errors from generic exceptions.

```ts
import { LakipaySDK, LakipayError } from "lakipay-js-sdk";

const sdk = new LakipaySDK({
  apiKey: process.env.LAKIPAY_API_KEY!,
  environment: "sandbox",
});

try {
  const res = await sdk.payments.createDirectPayment({
    // ...
  });
} catch (err) {
  if (err instanceof LakipayError) {
    console.error("LakiPay API error:", {
      message: err.message,
      status: err.status,   // HTTP status: 400, 401, 500, ...
      code: err.code,       // API error_code: "INVALID_API_KEY", etc.
      details: err.details, // validation errors, etc.
    });
  } else {
    console.error("Unexpected error:", err);
  }
}
```

Common problems (from API docs):

- `INVALID_API_KEY` – missing or wrong API key.
- `INVALID_AMOUNT` – invalid amount format (must be decimal with 2 decimals).
- `INVALID_PHONE` – invalid phone number format.
- `INSUFFICIENT_BALANCE` – not enough funds for transaction + fees.
- `PROVIDER_ERROR` – downstream provider error; may be transient.

The internal HTTP client:

- Uses `AbortController` to enforce timeouts.
- Retries 5xx responses with exponential backoff.

You can control this via:

- `timeoutMs`
- `retries`
- `backoffMs`

---

