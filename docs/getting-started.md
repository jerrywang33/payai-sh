# Getting Started

## Use From npm

Install the published packages:

```bash
npm install @payai-sh/core @payai-sh/x402
```

## Run Locally

Clone the repository and install dependencies:

```bash
npm install
```

Run checks:

```bash
npm run check
```

Run the demo:

```bash
npm run demo
```

The demo simulates:

1. An agent requests a paid API.
2. The API returns `402 Payment Required`.
3. PayAI parses the quote and checks the grant.
4. A mock x402 payer adds payment headers.
5. The API returns the paid resource.
6. PayAI records a receipt.

## Packages

### `@payai-sh/core`

Core policy primitives:

- `SpendingGrant`
- `PaymentQuote`
- `PaymentDecision`
- `PaymentReceipt`
- `MemorySpendingLedger`
- `evaluatePayment`
- `createReceipt`

### `@payai-sh/x402`

Fetch wrapper for x402-like paid resources:

- detects `402` responses
- parses payment requirements from JSON response body or payment headers
- runs PayAI policy before payment
- calls a provided payer adapter
- records receipts after successful retry

## Minimal Example

```ts
import { createPayAIFetch } from "@payai-sh/x402";

const payaiFetch = createPayAIFetch({
  grant,
  payer: async (request) => {
    request.paymentHeaders.set("X-Payment", "mock-payment");
    return request.fetch(request.paymentHeaders);
  }
});

const response = await payaiFetch("https://data.example.com/report", {
  purpose: "research"
});
```
