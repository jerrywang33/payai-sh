# Agent Integration

Use `@payai-sh/x402` to wrap an agent's paid `fetch` calls.

```ts
import { createPayAIFetch } from "@payai-sh/x402";

const payaiFetch = createPayAIFetch({
  grant,
  payer: async (request) => {
    return request.fetch(request.paymentHeaders);
  },
  onReceipt: async (receipt) => {
    console.log("paid", receipt);
  }
});

const response = await payaiFetch("https://data.example.com/report", {
  purpose: "research"
});
```

## Recommended Caller Pattern

1. Give each agent a narrow grant.
2. Pass task purpose and resource metadata into `payaiFetch`.
3. Treat `PayAIPolicyError` as a stop or human-review branch.
4. Store receipts with the agent task id in your own system.
5. Keep real wallet signing inside the payer callback.

## Error Handling

```ts
try {
  const response = await payaiFetch(url, { purpose: "research" });
  return await response.json();
} catch (error) {
  if (error instanceof Error && error.name === "PayAIPolicyError") {
    return { status: "payment_denied", reason: error.message };
  }

  throw error;
}
```

## Production Notes

The default `MemorySpendingLedger` is for local demos and tests. Production agents should pass a persistent `SpendingLedger` implementation so budget checks survive process restarts.
