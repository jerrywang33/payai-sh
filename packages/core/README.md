# @payai-sh/core

Grants, policy checks, spending ledgers, and receipts for autonomous agent payments.

```bash
npm install @payai-sh/core
```

```ts
import { MemorySpendingLedger, evaluatePayment } from "@payai-sh/core";
```

Use this package when you need PayAI's policy primitives without the x402 fetch wrapper.

Runtime validation helpers are included:

```ts
import { parseSpendingGrant, parsePaymentQuote } from "@payai-sh/core";
```

Docs: https://payai.sh/docs/

License: MIT
