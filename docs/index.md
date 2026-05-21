---
title: Overview
description: Developer documentation for PayAI.
---

# PayAI Docs

The payment policy layer for AI agents, built on x402.

PayAI does not replace x402. x402 executes paid HTTP requests. PayAI decides whether an autonomous agent is allowed to pay before the request is retried, then records a receipt after settlement.

```text
x402 answers: how does an agent pay?
PayAI answers: should this agent be allowed to pay?
```

## Quick Start

Install the published packages:

```bash
npm install @payai-sh/core @payai-sh/x402
```

Use the x402 wrapper:

```ts
import { createPayAIFetch } from "@payai-sh/x402";

const payaiFetch = createPayAIFetch({
  grant,
  payer: async (request) => request.fetch(request.paymentHeaders)
});
```

## Read This First

1. [Getting Started]({{ '/getting-started/' | relative_url }}) - local setup, checks, and demo.
2. [Protocol Notes]({{ '/protocol/' | relative_url }}) - PayAI's relationship to x402.
3. [Architecture]({{ '/architecture/' | relative_url }}) - system boundary and request flow.
4. [Schemas]({{ '/schemas/' | relative_url }}) - grant, quote, decision, and receipt shapes.
5. [Agent Integration]({{ '/agent-integration/' | relative_url }}) - safe caller pattern for agents.
6. [Publishing]({{ '/publishing/' | relative_url }}) - package release process and npm status.

## Current Release

- `@payai-sh/core` v0.0.2
- `@payai-sh/x402` v0.0.2

## Boundary

PayAI is a policy and receipt layer. It is not a wallet, facilitator, or new payment rail.
