import assert from "node:assert/strict";
import test from "node:test";
import {
  MemorySpendingLedger,
  createReceipt,
  evaluatePayment,
} from "../dist/index.js";

const grant = {
  id: "grant_test",
  agentId: "agent_test",
  totalBudget: { amount: "1", currency: "USDC" },
  perPaymentLimit: { amount: "0.25", currency: "USDC" },
  allowedMerchants: ["data.example.com"],
  allowedPurposes: ["research"],
  expiresAt: "2099-01-01T00:00:00.000Z",
};

test("allows a quote within grant policy", () => {
  const ledger = new MemorySpendingLedger();
  const decision = evaluatePayment(
    grant,
    {
      merchant: "data.example.com",
      amount: { amount: "0.10", currency: "USDC" },
      purpose: "research",
    },
    ledger,
  );

  assert.equal(decision.allowed, true);
  assert.equal(decision.reason, "allowed");
});

test("denies a quote over the per-payment limit", () => {
  const ledger = new MemorySpendingLedger();
  const decision = evaluatePayment(
    grant,
    {
      merchant: "data.example.com",
      amount: { amount: "0.26", currency: "USDC" },
      purpose: "research",
    },
    ledger,
  );

  assert.equal(decision.allowed, false);
  assert.equal(decision.reason, "per_payment_limit_exceeded");
});

test("denies a merchant outside the allowlist", () => {
  const ledger = new MemorySpendingLedger();
  const decision = evaluatePayment(
    grant,
    {
      merchant: "unknown.example.com",
      amount: { amount: "0.10", currency: "USDC" },
      purpose: "research",
    },
    ledger,
  );

  assert.equal(decision.allowed, false);
  assert.equal(decision.reason, "merchant_not_allowed");
});

test("tracks spent budget through receipts", () => {
  const ledger = new MemorySpendingLedger();
  ledger.record(
    createReceipt({
      grant,
      quote: {
        merchant: "data.example.com",
        amount: { amount: "0.90", currency: "USDC" },
        purpose: "research",
      },
    }),
  );

  const decision = evaluatePayment(
    grant,
    {
      merchant: "data.example.com",
      amount: { amount: "0.11", currency: "USDC" },
      purpose: "research",
    },
    ledger,
  );

  assert.equal(decision.allowed, false);
  assert.equal(decision.reason, "budget_exceeded");
});
