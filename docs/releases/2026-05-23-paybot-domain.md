# PayBot Domain Deployment Notes

Date: 2026-05-23

This note records the current dual-domain website setup. It is not an npm package release.

## Outcome

- `payai.sh` and `www.payai.sh` continue to serve the PayAI website.
- `paybot.sh` and `www.paybot.sh` now serve the same codebase with PayBot-facing brand text.
- The npm package scope, GitHub repository, and SDK examples remain `@payai-sh/*`, `payai-sh`, `createPayAIFetch`, and `payaiFetch`.
- The top-right website navigation was restyled to match the lighter `jup.sh` pattern: `Docs`, GitHub icon, and X icon.
- X links point to `https://x.com/jerrydev90`.

## Cloudflare Setup

- Cloudflare Pages project: `payai-sh`
- Production branch used by direct uploads: `main`
- Pages domains:
  - `payai-sh.pages.dev`
  - `payai.sh`
  - `www.payai.sh`
  - `paybot.sh`
  - `www.paybot.sh`

The `paybot.sh` zone originally had proxied placeholder `A 192.0.2.1` records and a Page Rule redirecting `*paybot.sh/*` to `https://www.jup.sh/$2`. That redirect was removed, and both `paybot.sh` records were changed to proxied CNAMEs pointing at `payai-sh.pages.dev`.

## Runtime Branding

The site uses `_worker.js` in Cloudflare Pages to keep one static codebase while changing text by hostname.

For `paybot.sh` and `www.paybot.sh`, the Worker transforms text-like assets:

- `PAYAI` -> `PAYBOT`
- `PayAI` -> `PayBot`
- `payai` -> `paybot`

Then it restores product identifiers that must stay tied to the real package and repository:

- `paybot-sh` -> `payai-sh`
- `PayBotFetch` -> `PayAIFetch`
- `paybotFetch` -> `payaiFetch`

This keeps the browser tab, metadata, page copy, docs pages, and SVG social preview on the PayBot brand while preserving the real npm and GitHub surface.

## Files Changed

- `_worker.js`: hostname-aware PayBot transformation.
- `index.html`: lighter nav, X link, cache-busted CSS and OG image URL.
- `styles.css`: `jup.sh`-style right-side nav.
- `docs/_layouts/default.html`: docs nav source.
- `docs/*.html`: checked-in generated docs pages updated to match the layout.
- `docs/assets/docs.css`: docs nav icon styles.
- `og.svg`: revision marker so Cloudflare serves a fresh social preview asset.

## Verification

Local checks:

```bash
npm run check
node --check _worker.js
```

Both passed after the final changes.

Online checks after deploy:

- `https://payai.sh/` returns `200` and still shows `PayAI`.
- `https://paybot.sh/` returns `200` and shows `PayBot`.
- `https://payai.sh/docs/` returns the updated docs nav.
- `https://paybot.sh/docs/` shows `PayBot` but keeps `@payai-sh/*` examples and links.
- `https://paybot.sh/og.svg?v=20260523-payai-scope` shows `PayBot` with `@payai-sh/*`.

Most recent checked deployment during this work:

```text
https://ec8270e3.payai-sh.pages.dev
```

## Git

Committed implementation:

```text
8532e78 feat: add paybot domain branding
```

## Notes

- The Cloudflare token used locally could manage Pages and DNS but did not have cache purge permission for the `purge_cache` endpoint.
- To avoid stale social image caches, the root HTML references `og.svg?v=20260523-payai-scope`.
- No new npm package or GitHub repository was created for PayBot.
