# Publishing

PayAI packages are intended to publish under the `@payai-sh` npm scope:

- `@payai-sh/core`
- `@payai-sh/x402`

Current public release:

- `@payai-sh/core` v0.0.3
- `@payai-sh/x402` v0.0.3

## Prerequisite

The npm account used for publishing must own or belong to the `payai-sh` npm organization/scope.

If publishing returns:

```text
404 Not Found - PUT https://registry.npmjs.org/@payai-sh%2fcore
```

then npm does not recognize the token as having publish access for `@payai-sh`.

If publishing returns:

```text
404 Not Found - PUT https://registry.npmjs.org/@payai-sh%2fcore - Scope not found
```

then the `payai-sh` npm organization/scope does not exist yet. Create the `payai-sh` organization in npm first, then generate or attach an automation token with publish rights for that organization.

## Verify

```bash
npm run check
npm run publish:dry-run
```

## Publish

Publish core first:

```bash
cd packages/core
npm publish --access public
```

Then publish the x402 adapter:

```bash
cd ../x402
npm publish --access public
```

## Token

Use an npm automation token with publish rights for the `@payai-sh` scope.

## Website Deployment Notes

The website is deployed through the Cloudflare Pages project `payai-sh`.

Current custom domains:

- `payai.sh`
- `www.payai.sh`
- `paybot.sh`
- `www.paybot.sh`

`paybot.sh` is a domain-level brand variant of the same codebase. It uses the same GitHub repository (`jerrywang33/payai`) and npm package scope (`@payai-sh/*`). See [PayBot Domain Deployment Notes](releases/2026-05-23-paybot-domain.md) for the Cloudflare DNS, Worker, and verification details.
