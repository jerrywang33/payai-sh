# @payai-sh/x402

x402-compatible fetch wrapper with PayAI policy enforcement.

```bash
npm install @payai-sh/x402
```

```ts
import { createPayAIFetch } from "@payai-sh/x402";
```

Use this package to wrap `fetch`, handle `402 Payment Required`, run a PayAI grant check, call your x402 payer adapter, and record a receipt.

Docs: https://payai.sh/docs/

License: MIT
