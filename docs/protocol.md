# PayAI Protocol Notes

PayAI is a policy and receipt layer for autonomous agent payments.

It is designed to sit around x402:

```text
Agent -> PayAI policy check -> x402 payment -> PayAI receipt
```

## x402 Relationship

x402 is the payment execution layer. It defines how a paid HTTP resource asks for payment, how a client presents payment, and how that payment is verified.

PayAI does not replace x402. PayAI adds:

- grants: what an agent is allowed to spend
- policy checks: whether a specific x402 quote is allowed
- approvals: future human-in-the-loop escalation
- receipts: structured records tying payment to task, merchant, resource, and transaction

## Core Objects

### Grant

A spending grant is issued by a human or organization to an agent.

```json
{
  "id": "grant_research",
  "agentId": "research-agent",
  "totalBudget": { "amount": "10", "currency": "USDC" },
  "perPaymentLimit": { "amount": "0.25", "currency": "USDC" },
  "allowedMerchants": ["data.example.com"],
  "allowedPurposes": ["research"],
  "expiresAt": "2099-01-01T00:00:00.000Z"
}
```

### Quote

A quote represents a paid resource request.

```json
{
  "merchant": "data.example.com",
  "amount": { "amount": "0.05", "currency": "USDC" },
  "purpose": "research",
  "resource": "/report",
  "rail": "x402",
  "network": "base"
}
```

### Decision

A decision is produced before payment.

```json
{
  "allowed": true,
  "reason": "allowed",
  "grantId": "grant_research"
}
```

Denied reasons currently include:

- `currency_mismatch`
- `grant_expired`
- `quote_expired`
- `merchant_not_allowed`
- `purpose_not_allowed`
- `per_payment_limit_exceeded`
- `budget_exceeded`

### Receipt

A receipt is recorded after payment settlement or verification.

```json
{
  "id": "receipt_...",
  "grantId": "grant_research",
  "agentId": "research-agent",
  "merchant": "data.example.com",
  "amount": { "amount": "0.05", "currency": "USDC" },
  "purpose": "research",
  "rail": "x402",
  "network": "base",
  "resource": "/report",
  "transactionHash": "0x..."
}
```

## Current Boundary

PayAI is not a wallet, facilitator, or payment rail. The first implementation provides local policy enforcement and receipt recording. Production integrations should plug in a real x402 client, wallet, facilitator, approval service, and persistent ledger.
