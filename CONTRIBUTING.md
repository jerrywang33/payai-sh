# Contributing

Thanks for improving PayAI.

## Local Setup

```bash
npm install
npm run check
npm run demo
```

## Commit Style

Use the same lightweight Conventional Commit style as the rest of the repo:

- `feat: add policy primitive`
- `fix: handle x402 quote header`
- `docs: clarify grant schema`
- `test: cover budget denial`
- `chore: update package metadata`
- `ui: adjust website docs link`

## Development Notes

- Keep PayAI separate from x402 execution. PayAI decides whether payment is allowed; x402 executes payment.
- Keep wallet signing outside this repository unless it is clearly marked as an example.
- Add focused tests for policy behavior and x402 retry behavior.
- Update docs when public APIs, package names, schemas, or examples change.
