# PayAI

The payment policy layer for AI agents, built on x402.

PayAI does not replace x402. x402 executes paid HTTP requests. PayAI decides whether an autonomous agent is allowed to pay before the request is retried, then records a receipt after settlement.

```text
x402 answers: how does an agent pay?
PayAI answers: should this agent be allowed to pay?
```

## Packages

- `@payai-sh/core`: grants, policy checks, spending ledger, and receipts
- `@payai-sh/x402`: x402-compatible fetch wrapper with PayAI policy enforcement

## Example

```ts
import { createPayAIFetch } from "@payai-sh/x402";

const payaiFetch = createPayAIFetch({
  grant: {
    id: "grant_research",
    agentId: "research-agent",
    totalBudget: { amount: "10", currency: "USDC" },
    perPaymentLimit: { amount: "0.25", currency: "USDC" },
    allowedPurposes: ["research"],
    allowedMerchants: ["data.example.com"],
    expiresAt: "2026-06-01T00:00:00.000Z"
  },
  payer: async (request) => {
    // Delegate to an x402 client/facilitator integration.
    return request.fetch(request.paymentHeaders);
  }
});

const response = await payaiFetch("https://data.example.com/report", {
  purpose: "research"
});
```

## Run Locally

```bash
npm install
npm run check
npm run demo
```

`npm run demo` simulates the first MVP flow:

```text
agent requests paid API
API returns 402 Payment Required
PayAI checks grant and allows the payment
mock x402 payer retries the request
API returns the paid resource
PayAI records a receipt
```

## Status

Early scaffold. The first implementation focuses on the policy primitives and a rail adapter shape for x402 on Base USDC.

## Boundary

PayAI is:

- a policy layer for agent spending grants
- a receipt layer for agent payments
- a wrapper around payment rails such as x402

PayAI is not:

- a wallet
- a facilitator
- a new payment rail
