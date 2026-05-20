import assert from "node:assert/strict";
import test from "node:test";
import { createPayAIFetch } from "../dist/index.js";

test("wraps a 402 response with policy check, payer, retry, and receipt", async () => {
  const grant = {
    id: "grant_test",
    agentId: "agent_test",
    totalBudget: { amount: "1", currency: "USDC" },
    perPaymentLimit: { amount: "0.25", currency: "USDC" },
    allowedMerchants: ["data.example.com"],
    allowedPurposes: ["research"],
  };
  const receipts = [];
  let calls = 0;

  const payaiFetch = createPayAIFetch({
    grant,
    onReceipt: (receipt) => receipts.push(receipt),
    fetch: async (request) => {
      calls += 1;
      if (!request.headers.has("X-Payment")) {
        return Response.json(
          {
            amount: "0.10",
            currency: "USDC",
            merchant: "data.example.com",
            network: "base",
          },
          { status: 402 },
        );
      }

      return Response.json(
        { ok: true },
        {
          headers: {
            "X-Payment-Transaction": "0xabc",
          },
        },
      );
    },
    payer: async (request) => {
      request.paymentHeaders.set("X-Payment", "mock-payment");
      return request.fetch(request.paymentHeaders);
    },
  });

  const response = await payaiFetch("https://data.example.com/report", {
    purpose: "research",
  });
  const body = await response.json();

  assert.equal(calls, 2);
  assert.equal(body.ok, true);
  assert.equal(receipts.length, 1);
  assert.equal(receipts[0].transactionHash, "0xabc");
  assert.equal(receipts[0].merchant, "data.example.com");
});

test("throws when policy denies the x402 quote", async () => {
  const payaiFetch = createPayAIFetch({
    grant: {
      id: "grant_test",
      agentId: "agent_test",
      totalBudget: { amount: "1", currency: "USDC" },
      allowedMerchants: ["approved.example.com"],
    },
    fetch: async () =>
      Response.json(
        {
          amount: "0.10",
          currency: "USDC",
          merchant: "data.example.com",
        },
        { status: 402 },
      ),
    payer: async () => {
      throw new Error("payer should not run");
    },
  });

  await assert.rejects(
    () => payaiFetch("https://data.example.com/report"),
    /merchant_not_allowed/,
  );
});
