# Schemas

The core package exports TypeScript interfaces for grants, quotes, decisions, receipts, and ledgers.

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
