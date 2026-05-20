import { createPayAIFetch } from "../../packages/x402/dist/index.js";

const grant = {
  id: "grant_research",
  agentId: "research-agent",
  totalBudget: { amount: "10", currency: "USDC" },
  perPaymentLimit: { amount: "0.25", currency: "USDC" },
  allowedMerchants: ["data.example.com"],
  allowedPurposes: ["research"],
  expiresAt: "2099-01-01T00:00:00.000Z",
};

const payaiFetch = createPayAIFetch({
  grant,
  fetch: paidApi,
  payer: async (request) => {
    console.log("policy: allowed");
    console.log(`payment: mock x402 payment for ${request.quote.amount.amount} ${request.quote.amount.currency}`);

    request.paymentHeaders.set("X-Payment", "mock-x402-payment");
    return request.fetch(request.paymentHeaders);
  },
  onReceipt: (receipt) => {
    console.log("receipt:", {
      id: receipt.id,
      amount: receipt.amount,
      merchant: receipt.merchant,
      purpose: receipt.purpose,
      transactionHash: receipt.transactionHash,
    });
  },
});

const response = await payaiFetch("https://data.example.com/report", {
  purpose: "research",
});
const report = await response.json();

console.log("agent received:", report);

async function paidApi(request) {
  const url = new URL(request.url);
  if (url.host !== "data.example.com") {
    return Response.json({ error: "not_found" }, { status: 404 });
  }

  if (!request.headers.has("X-Payment")) {
    console.log("api: returning 402 payment requirement");
    return Response.json(
      {
        amount: "0.05",
        currency: "USDC",
        merchant: "data.example.com",
        network: "base",
        resource: url.pathname,
      },
      { status: 402 },
    );
  }

  console.log("api: payment verified, returning report");
  return Response.json(
    {
      title: "Agent payment rails brief",
      summary: "x402 executes the payment. PayAI enforces the grant and records the receipt.",
    },
    {
      headers: {
        "X-Payment-Transaction": "0xpayai_demo",
      },
    },
  );
}
