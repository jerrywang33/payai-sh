# Architecture

PayAI sits around x402 payment execution.

```text
Agent
  -> paid HTTP request
Resource server
  -> 402 Payment Required
PayAI
  -> parse quote
  -> evaluate grant
  -> call x402 payer only if allowed
x402
  -> sign, facilitate, verify, or settle payment
PayAI
  -> record receipt
```

## Components

### Grant

A grant defines what an agent is allowed to spend: budget, per-payment limit, merchants, purposes, and expiry.

### Quote

A quote is the payment requirement returned by a paid resource. PayAI normalizes x402 response bodies and payment headers into a `PaymentQuote`.

### Decision

A decision is created before payment. If denied, PayAI throws a `PayAIPolicyError` and does not call the payer.

### Payer

The payer callback is the x402 execution boundary. It receives the quote and payment headers, then integrates with a wallet, facilitator, or x402 client.

### Receipt

A receipt is recorded after the paid request succeeds. Receipts are meant for audit logs, task attribution, and spend tracking.

## Current Boundary

The first implementation includes local policy evaluation, an in-memory ledger, an x402 fetch wrapper, and a demo payer. Production systems should provide persistent storage, real x402 execution, and approval workflows.
