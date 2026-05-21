export type Currency = "USDC" | "USDT" | (string & {});

export interface Money {
  amount: string;
  currency: Currency;
}

export interface SpendingGrant {
  id: string;
  agentId: string;
  totalBudget: Money;
  perPaymentLimit?: Money;
  allowedMerchants?: string[];
  allowedPurposes?: string[];
  expiresAt?: string;
}

export interface PaymentQuote {
  merchant: string;
  amount: Money;
  purpose?: string;
  resource?: string;
  rail?: string;
  network?: string;
  expiresAt?: string;
}

export interface PaymentDecision {
  allowed: boolean;
  reason: string;
  grantId: string;
  quote: PaymentQuote;
  spent: Money;
  remaining: Money;
}

export interface PaymentReceipt {
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

export interface ValidationIssue {
  path: string;
  message: string;
}

export interface SpendingLedger {
  getSpent(grantId: string): Money | undefined;
  record(receipt: PaymentReceipt): void;
  list(grantId?: string): PaymentReceipt[];
}

export class PayAIValidationError extends Error {
  readonly issues: ValidationIssue[];

  constructor(message: string, issues: ValidationIssue[]) {
    super(`${message}: ${issues.map((issue) => `${issue.path} ${issue.message}`).join("; ")}`);
    this.name = "PayAIValidationError";
    this.issues = issues;
  }
}

export class MemorySpendingLedger implements SpendingLedger {
  private readonly receipts: PaymentReceipt[] = [];

  getSpent(grantId: string): Money | undefined {
    const receipts = this.receipts.filter((receipt) => receipt.grantId === grantId);
    if (receipts.length === 0) return undefined;

    const currency = receipts[0]?.amount.currency ?? "USDC";
    const total = receipts.reduce((sum, receipt) => sum + toMinorUnits(receipt.amount), 0n);
    return fromMinorUnits(total, currency);
  }

  record(receipt: PaymentReceipt): void {
    this.receipts.push(receipt);
  }

  list(grantId?: string): PaymentReceipt[] {
    return grantId ? this.receipts.filter((receipt) => receipt.grantId === grantId) : [...this.receipts];
  }
}

export function validateMoney(value: unknown, path = "money"): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!isRecord(value)) {
    return [{ path, message: "must be an object" }];
  }

  if (!isString(value.amount)) {
    issues.push({ path: `${path}.amount`, message: "must be a decimal string" });
  } else if (!isValidAmount(value.amount)) {
    issues.push({ path: `${path}.amount`, message: "must be non-negative with up to 6 decimal places" });
  }

  if (!isString(value.currency) || value.currency.length === 0) {
    issues.push({ path: `${path}.currency`, message: "must be a non-empty string" });
  }

  return issues;
}

export function parseMoney(value: unknown, path = "money"): Money {
  const issues = validateMoney(value, path);
  if (issues.length) throw new PayAIValidationError("Invalid money", issues);
  return value as Money;
}

export function validateSpendingGrant(value: unknown, path = "grant"): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!isRecord(value)) {
    return [{ path, message: "must be an object" }];
  }

  issues.push(...requiredString(value.id, `${path}.id`));
  issues.push(...requiredString(value.agentId, `${path}.agentId`));
  issues.push(...validateMoney(value.totalBudget, `${path}.totalBudget`));

  if ("perPaymentLimit" in value && value.perPaymentLimit !== undefined) {
    issues.push(...validateMoney(value.perPaymentLimit, `${path}.perPaymentLimit`));
  }

  issues.push(...optionalStringArray(value.allowedMerchants, `${path}.allowedMerchants`));
  issues.push(...optionalStringArray(value.allowedPurposes, `${path}.allowedPurposes`));
  issues.push(...optionalIsoDate(value.expiresAt, `${path}.expiresAt`));

  return issues;
}

export function parseSpendingGrant(value: unknown, path = "grant"): SpendingGrant {
  const issues = validateSpendingGrant(value, path);
  if (issues.length) throw new PayAIValidationError("Invalid spending grant", issues);
  return value as SpendingGrant;
}

export function validatePaymentQuote(value: unknown, path = "quote"): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!isRecord(value)) {
    return [{ path, message: "must be an object" }];
  }

  issues.push(...requiredString(value.merchant, `${path}.merchant`));
  issues.push(...validateMoney(value.amount, `${path}.amount`));
  issues.push(...optionalString(value.purpose, `${path}.purpose`));
  issues.push(...optionalString(value.resource, `${path}.resource`));
  issues.push(...optionalString(value.rail, `${path}.rail`));
  issues.push(...optionalString(value.network, `${path}.network`));
  issues.push(...optionalIsoDate(value.expiresAt, `${path}.expiresAt`));

  return issues;
}

export function parsePaymentQuote(value: unknown, path = "quote"): PaymentQuote {
  const issues = validatePaymentQuote(value, path);
  if (issues.length) throw new PayAIValidationError("Invalid payment quote", issues);
  return value as PaymentQuote;
}

export function validatePaymentReceipt(value: unknown, path = "receipt"): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!isRecord(value)) {
    return [{ path, message: "must be an object" }];
  }

  issues.push(...requiredString(value.id, `${path}.id`));
  issues.push(...requiredString(value.grantId, `${path}.grantId`));
  issues.push(...requiredString(value.agentId, `${path}.agentId`));
  issues.push(...requiredString(value.merchant, `${path}.merchant`));
  issues.push(...validateMoney(value.amount, `${path}.amount`));
  issues.push(...optionalString(value.purpose, `${path}.purpose`));
  issues.push(...optionalString(value.rail, `${path}.rail`));
  issues.push(...optionalString(value.network, `${path}.network`));
  issues.push(...optionalString(value.resource, `${path}.resource`));
  issues.push(...optionalString(value.transactionHash, `${path}.transactionHash`));
  issues.push(...requiredIsoDate(value.createdAt, `${path}.createdAt`));

  return issues;
}

export function parsePaymentReceipt(value: unknown, path = "receipt"): PaymentReceipt {
  const issues = validatePaymentReceipt(value, path);
  if (issues.length) throw new PayAIValidationError("Invalid payment receipt", issues);
  return value as PaymentReceipt;
}

export function evaluatePayment(grant: SpendingGrant, quote: PaymentQuote, ledger: SpendingLedger): PaymentDecision {
  const spent = ledger.getSpent(grant.id) ?? { amount: "0", currency: grant.totalBudget.currency };
  const remaining = subtractMoney(grant.totalBudget, spent);

  if (grant.totalBudget.currency !== quote.amount.currency) {
    return denied("currency_mismatch", grant, quote, spent, remaining);
  }

  if (grant.expiresAt && Date.parse(grant.expiresAt) <= Date.now()) {
    return denied("grant_expired", grant, quote, spent, remaining);
  }

  if (quote.expiresAt && Date.parse(quote.expiresAt) <= Date.now()) {
    return denied("quote_expired", grant, quote, spent, remaining);
  }

  if (grant.allowedMerchants?.length && !grant.allowedMerchants.includes(quote.merchant)) {
    return denied("merchant_not_allowed", grant, quote, spent, remaining);
  }

  if (grant.allowedPurposes?.length && (!quote.purpose || !grant.allowedPurposes.includes(quote.purpose))) {
    return denied("purpose_not_allowed", grant, quote, spent, remaining);
  }

  if (grant.perPaymentLimit && compareMoney(quote.amount, grant.perPaymentLimit) > 0) {
    return denied("per_payment_limit_exceeded", grant, quote, spent, remaining);
  }

  if (compareMoney(quote.amount, remaining) > 0) {
    return denied("budget_exceeded", grant, quote, spent, remaining);
  }

  return {
    allowed: true,
    reason: "allowed",
    grantId: grant.id,
    quote,
    spent,
    remaining,
  };
}

export function createReceipt(input: {
  grant: SpendingGrant;
  quote: PaymentQuote;
  transactionHash?: string;
  id?: string;
  createdAt?: string;
}): PaymentReceipt {
  return {
    id: input.id ?? `receipt_${cryptoSafeId()}`,
    grantId: input.grant.id,
    agentId: input.grant.agentId,
    merchant: input.quote.merchant,
    amount: input.quote.amount,
    purpose: input.quote.purpose,
    rail: input.quote.rail,
    network: input.quote.network,
    resource: input.quote.resource,
    transactionHash: input.transactionHash,
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
}

export function compareMoney(left: Money, right: Money): number {
  assertSameCurrency(left, right);
  const leftMinor = toMinorUnits(left);
  const rightMinor = toMinorUnits(right);
  if (leftMinor === rightMinor) return 0;
  return leftMinor > rightMinor ? 1 : -1;
}

export function subtractMoney(left: Money, right: Money): Money {
  assertSameCurrency(left, right);
  return fromMinorUnits(toMinorUnits(left) - toMinorUnits(right), left.currency);
}

function denied(
  reason: string,
  grant: SpendingGrant,
  quote: PaymentQuote,
  spent: Money,
  remaining: Money,
): PaymentDecision {
  return {
    allowed: false,
    reason,
    grantId: grant.id,
    quote,
    spent,
    remaining,
  };
}

function assertSameCurrency(left: Money, right: Money): void {
  if (left.currency !== right.currency) {
    throw new Error(`Currency mismatch: ${left.currency} !== ${right.currency}`);
  }
}

function toMinorUnits(money: Money): bigint {
  if (!isValidAmount(money.amount)) {
    throw new Error(`Invalid money amount: ${money.amount}`);
  }

  const [whole = "0", fraction = ""] = money.amount.split(".");
  const paddedFraction = `${fraction}000000`.slice(0, 6);
  return BigInt(whole) * 1_000_000n + BigInt(paddedFraction);
}

function fromMinorUnits(value: bigint, currency: Currency): Money {
  const sign = value < 0n ? "-" : "";
  const absolute = value < 0n ? -value : value;
  const whole = absolute / 1_000_000n;
  const fraction = (absolute % 1_000_000n).toString().padStart(6, "0").replace(/0+$/, "");
  return {
    amount: `${sign}${whole.toString()}${fraction ? `.${fraction}` : ""}`,
    currency,
  };
}

function cryptoSafeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replaceAll("-", "").slice(0, 20);
  }

  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isValidAmount(value: string): boolean {
  return /^\d+(\.\d{1,6})?$/.test(value);
}

function requiredString(value: unknown, path: string): ValidationIssue[] {
  return isString(value) && value.length > 0 ? [] : [{ path, message: "must be a non-empty string" }];
}

function optionalString(value: unknown, path: string): ValidationIssue[] {
  return value === undefined || isString(value) ? [] : [{ path, message: "must be a string when provided" }];
}

function optionalStringArray(value: unknown, path: string): ValidationIssue[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) return [{ path, message: "must be an array of strings when provided" }];

  return value.flatMap((item, index) =>
    isString(item) && item.length > 0 ? [] : [{ path: `${path}[${index}]`, message: "must be a non-empty string" }],
  );
}

function optionalIsoDate(value: unknown, path: string): ValidationIssue[] {
  if (value === undefined) return [];
  return requiredIsoDate(value, path);
}

function requiredIsoDate(value: unknown, path: string): ValidationIssue[] {
  if (!isString(value) || Number.isNaN(Date.parse(value))) {
    return [{ path, message: "must be a valid ISO date string" }];
  }

  return [];
}
