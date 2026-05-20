import {
  MemorySpendingLedger,
  createReceipt,
  evaluatePayment,
  type PaymentQuote,
  type PaymentReceipt,
  type SpendingGrant,
  type SpendingLedger,
} from "@payai-sh/core";

export interface PayAIFetchOptions extends RequestInit {
  purpose?: string;
  merchant?: string;
  resource?: string;
}

export interface X402PaymentRequest {
  originalRequest: Request;
  quote: PaymentQuote;
  paymentHeaders: Headers;
  fetch(headers: Headers): Promise<Response>;
}

export interface X402Payer {
  (request: X402PaymentRequest): Promise<Response>;
}

export interface CreatePayAIFetchOptions {
  grant: SpendingGrant;
  ledger?: SpendingLedger;
  fetch?: typeof fetch;
  payer: X402Payer;
  onReceipt?: (receipt: PaymentReceipt) => void | Promise<void>;
}

export function createPayAIFetch(options: CreatePayAIFetchOptions) {
  const baseFetch = options.fetch ?? fetch;
  const ledger = options.ledger ?? new MemorySpendingLedger();

  return async function payaiFetch(input: string | URL | Request, init: PayAIFetchOptions = {}): Promise<Response> {
    const request = toRequest(input, init);
    const retryRequest = request.clone();
    const firstResponse = await baseFetch(request);

    if (firstResponse.status !== 402) {
      return firstResponse;
    }

    const quote = await parseX402Quote(firstResponse, request, init);
    const decision = evaluatePayment(options.grant, quote, ledger);

    if (!decision.allowed) {
      throw new PayAIPolicyError(decision.reason, quote);
    }

    const paymentHeaders = new Headers();
    paymentHeaders.set("X-PayAI-Grant", options.grant.id);
    paymentHeaders.set("X-PayAI-Agent", options.grant.agentId);
    paymentHeaders.set("X-PayAI-Purpose", quote.purpose ?? "unspecified");

    const paidResponse = await options.payer({
      originalRequest: request,
      quote,
      paymentHeaders,
      fetch: async (headers) => {
        const retryHeaders = new Headers(retryRequest.headers);
        headers.forEach((value, key) => retryHeaders.set(key, value));
        return baseFetch(new Request(retryRequest, { headers: retryHeaders }));
      },
    });

    const receipt = createReceipt({
      grant: options.grant,
      quote,
      transactionHash: paidResponse.headers.get("X-Payment-Transaction") ?? undefined,
    });

    ledger.record(receipt);
    await options.onReceipt?.(receipt);

    return paidResponse;
  };
}

export class PayAIPolicyError extends Error {
  readonly quote: PaymentQuote;

  constructor(reason: string, quote: PaymentQuote) {
    super(`PayAI policy denied x402 payment: ${reason}`);
    this.name = "PayAIPolicyError";
    this.quote = quote;
  }
}

async function parseX402Quote(response: Response, request: Request, init: PayAIFetchOptions): Promise<PaymentQuote> {
  const header = response.headers.get("X-Accept-Payment") ?? response.headers.get("X-402-Payment-Required");
  const merchant = init.merchant ?? new URL(request.url).host;

  if (header) {
    const parsed = safeJsonParse(header);
    if (parsed && typeof parsed === "object") {
      return normalizeQuote(parsed as Record<string, unknown>, merchant, init);
    }
  }

  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    const parsed = await response.clone().json().catch(() => undefined);
    if (parsed && typeof parsed === "object") {
      return normalizeQuote(parsed as Record<string, unknown>, merchant, init);
    }
  }

  throw new Error("Unable to parse x402 payment requirements");
}

function normalizeQuote(raw: Record<string, unknown>, merchant: string, init: PayAIFetchOptions): PaymentQuote {
  const amount = String(raw.amount ?? raw.maxAmountRequired ?? raw.price ?? "");
  const currency = String(raw.currency ?? raw.asset ?? "USDC");
  if (!amount) throw new Error("x402 quote is missing amount");

  return {
    merchant: String(raw.merchant ?? raw.payTo ?? merchant),
    amount: {
      amount,
      currency,
    },
    purpose: init.purpose ?? stringOrUndefined(raw.purpose),
    resource: init.resource ?? stringOrUndefined(raw.resource),
    rail: "x402",
    network: stringOrUndefined(raw.network) ?? stringOrUndefined(raw.chain) ?? "base",
    expiresAt: stringOrUndefined(raw.expiresAt),
  };
}

function toRequest(input: string | URL | Request, init: RequestInit): Request {
  return input instanceof Request ? new Request(input, init) : new Request(input, init);
}

function safeJsonParse(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

function stringOrUndefined(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}
