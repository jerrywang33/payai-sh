# Security Policy

PayAI is a policy and receipt layer for agent payments. It is not a wallet, custodian, or x402 facilitator.

## Supported Versions

Security fixes target the latest published npm versions:

- `@payai-sh/core`
- `@payai-sh/x402`

## Payment Boundary

PayAI does not sign transactions or custody private keys. The `payer` callback passed to `createPayAIFetch` is responsible for integrating with a wallet, x402 client, or facilitator.

Production integrations should:

- use least-privilege spending grants;
- persist receipts in an append-only or auditable store;
- require human approval for unfamiliar merchants, large payments, or sensitive purposes;
- validate x402 payment requirements before signing;
- keep wallet keys outside hosted PayAI policy services.

## Reporting

Please report sensitive issues privately through the repository maintainer instead of opening a public issue.
