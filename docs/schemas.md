# Schemas

The core package exports TypeScript interfaces for grants, quotes, decisions, receipts, and ledgers.

It also exports runtime validation helpers:

- `validateMoney`
- `parseMoney`
- `validateSpendingGrant`
- `parseSpendingGrant`
- `validatePaymentQuote`
- `parsePaymentQuote`
- `validatePaymentReceipt`
- `parsePaymentReceipt`

`validate*` returns a list of issues. `parse*` returns the typed object or throws `PayAIValidationError`.

## Money

```ts
interface Money {
  amount: string;
  currency: string;
}
```

Amounts are decimal strings. The current implementation supports up to 6 decimal places.

## SpendingGrant

```ts
interface SpendingGrant {
  id: string;
  agentId: string;
  totalBudget: Money;
  perPaymentLimit?: Money;
  allowedMerchants?: string[];
  allowedPurposes?: string[];
  expiresAt?: string;
}
```

```ts
import { parseSpendingGrant } from "@payai-sh/core";

const grant = parseSpendingGrant(json);
```

## PaymentQuote

```ts
interface PaymentQuote {
  merchant: string;
  amount: Money;
  purpose?: string;
  resource?: string;
  rail?: string;
  network?: string;
  expiresAt?: string;
}
```

## PaymentDecision

```ts
interface PaymentDecision {
  allowed: boolean;
  reason: string;
  grantId: string;
  quote: PaymentQuote;
  spent: Money;
  remaining: Money;
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

## PaymentReceipt

```ts
interface PaymentReceipt {
  id: string;
  grantId: string;
  agentId: string;
  merchant: string;
  amount: Money;
  purpose?: string;
  rail?: string;
  network?: string;
  resource?: string;
  transactionHash?: string;
  createdAt: string;
}
```
