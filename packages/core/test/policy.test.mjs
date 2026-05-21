import assert from "node:assert/strict";
import test from "node:test";
import {
  MemorySpendingLedger,
  PayAIValidationError,
  createReceipt,
  evaluatePayment,
  parsePaymentQuote,
  parsePaymentReceipt,
  parseSpendingGrant,
  validateSpendingGrant,
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

test("denies currency mismatch without throwing", () => {
  const ledger = new MemorySpendingLedger();
  const decision = evaluatePayment(
    grant,
    {
      merchant: "data.example.com",
      amount: { amount: "0.10", currency: "USDT" },
      purpose: "research",
    },
    ledger,
  );

  assert.equal(decision.allowed, false);
  assert.equal(decision.reason, "currency_mismatch");
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

test("validates and parses spending grants", () => {
  const parsed = parseSpendingGrant(grant);
  assert.equal(parsed.id, "grant_test");

  const issues = validateSpendingGrant({
    id: "",
    agentId: "agent_test",
    totalBudget: { amount: "-1", currency: "" },
    allowedMerchants: ["data.example.com", ""],
    expiresAt: "not-a-date",
  });

  assert.deepEqual(
    issues.map((issue) => issue.path),
    ["grant.id", "grant.totalBudget.amount", "grant.totalBudget.currency", "grant.allowedMerchants[1]", "grant.expiresAt"],
  );
});

test("throws structured validation errors for invalid quotes", () => {
  assert.throws(
    () =>
      parsePaymentQuote({
        merchant: "data.example.com",
        amount: { amount: "0.1234567", currency: "USDC" },
      }),
    (error) => {
      assert.equal(error instanceof PayAIValidationError, true);
      assert.equal(error.issues[0].path, "quote.amount.amount");
      return true;
    },
  );
});

test("parses payment receipts", () => {
  const receipt = createReceipt({
    grant,
    quote: {
      merchant: "data.example.com",
      amount: { amount: "0.10", currency: "USDC" },
      purpose: "research",
    },
    transactionHash: "0xabc",
    createdAt: "2099-01-01T00:00:00.000Z",
  });

  assert.equal(parsePaymentReceipt(receipt).transactionHash, "0xabc");
});
