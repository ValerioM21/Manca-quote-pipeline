# Manca: Quote Analytics

A Shopify app that turns draft-order data into answers merchants can ask **Shopify Sidekick** directly — open quotes, stale quotes, deleted quotes, and month-to-date quote-to-order conversion rate.

**Status:** currently in review on the Shopify App Store.

## The problem

Merchants who use draft orders as quotes — B2B, custom orders, wholesale — have no built-in way to see the health of their quote pipeline. Shopify admin doesn't surface "how many quotes are still open", "which ones have gone quiet", or "what's my quote-to-order conversion rate this month" as a native report. Today that means manually filtering and exporting draft orders to find out.

## How it works

The app listens to `draft_orders/create`, `draft_orders/update` and `draft_orders/delete` webhooks and keeps a denormalized `DraftQuote` table in sync (status, value, currency, timestamps, deletion date, days-to-convert). That data is then exposed two ways:

1. **A dashboard inside the embedded app** — four live metrics rendered with Polaris web components.
2. **Two authenticated endpoints Shopify Sidekick can call directly** as actions — `POST /api/sidekick/quotes` (filter: `open` / `stale` / `deleted`) and `GET /api/sidekick/conversion-rate`. Sidekick knows when to call them because the app declares an `extensions_summary` in `shopify.app.toml`, in plain language, describing what each action answers.

In practice: a merchant can ask Sidekick *"which quotes have gone more than a week without a response?"* and get a real answer pulled live from their own draft-order data.

## Architecture

| Piece | What it does |
|---|---|
| `app/routes/webhooks.draft-orders.tsx` | HMAC-verified webhook handler. Ingests create/update/delete, upserts into `DraftQuote`, computes days-to-convert at the moment a quote completes. |
| `app/models/quotes.server.ts` | Query layer: open quotes (count + value), monthly conversion rate, stale quotes (>7 days), deleted quotes (last 90 days). |
| `app/routes/api.sidekick.quotes.tsx` | Sidekick action. Session-token authenticated, CORS scoped to `extensions.shopifycdn.com`, handles its own OPTIONS preflight. |
| `app/routes/api.sidekick.conversion-rate.tsx` | Sidekick action, same auth/CORS pattern. |
| `app/routes/app._index.tsx` | Embedded dashboard — same four metrics, rendered for the merchant directly. |
| `shopify.app.toml` `[sidekick]` | Declares the natural-language summary Sidekick uses to decide when to call the two actions above. |
| `app/routes/webhooks.compliance.tsx` | The three mandatory GDPR topics, HMAC-verified. |
| `prisma/` | `DraftQuote` model + session storage (PostgreSQL). |

## Tech stack

- **Runtime:** Node.js 20+, TypeScript
- **Framework:** React Router 7 (`@shopify/shopify-app-react-router`)
- **UI:** Polaris web components, App Bridge — embedded in Shopify Admin
- **AI surface:** Shopify Sidekick actions — authenticated endpoints declared in `shopify.app.toml`, called directly by Sidekick
- **Data:** PostgreSQL via Prisma
- **Webhooks API:** 2026-10
- **Access scope:** `read_draft_orders` — nothing else
- **Hosting:** Render, automatic deploy on push to `main`

## Design decisions

A few choices here are deliberate, since the obvious alternative is wrong:

**A denormalized read model instead of querying Shopify live.** Webhooks keep a local `DraftQuote` table in sync, so every Sidekick question answers in milliseconds and doesn't spend the shop's Admin API rate limit each time a merchant asks something.

**CORS locked to `extensions.shopifycdn.com`.** The Sidekick action routes don't accept requests from anywhere else, since they return real per-shop business data, not public information.

**OPTIONS is unauthenticated, everything else isn't.** Preflight gets a fast 204. Every actual data request goes through `authenticate.admin`, the same as any other embedded-app request — one shop's session can never read another shop's numbers.

**Read-only scope.** The app requests `read_draft_orders` only. It never writes to a merchant's draft orders, so the worst case of a bug is a wrong number on a dashboard, not a corrupted quote.

**`daysToConvert` is computed once, at webhook time.** Storing it the moment a quote completes keeps the aggregate queries index-friendly instead of doing date math over every row on every request.

## Known limitations

Documented on purpose rather than left to be discovered:

- **No historical trend.** Conversion rate resets every calendar month; there's no month-over-month comparison yet.
- **Stale threshold (7 days) and deleted lookback (90 days) are hardcoded**, not merchant-configurable.
- **No pagination beyond the 50-item cap** on stale/deleted lists — fine for typical quote volumes, not built for stores with thousands of open quotes.
- **Single currency per query.** Totals aren't converted, so a shop quoting in multiple currencies will see mixed rows without conversion.

## Running locally

Requires Node.js 20.19+ and the Shopify CLI.

\`\`\`
npm install
npm run setup   # prisma generate && prisma migrate deploy
npm run dev     # shopify app dev
\`\`\`

`npm run dev` handles the tunnel, environment variables and app installation on your development store.

## Deployment

Deployed on Render as a web service. Required environment variables:

| Variable | Notes |
|---|---|
| `SHOPIFY_API_KEY` | From the Partner dashboard |
| `SHOPIFY_API_SECRET` | From the Partner dashboard — never committed |
| `SHOPIFY_APP_URL` | Public app URL |
| `DATABASE_URL` | PostgreSQL connection string |
| `NODE_ENV` | `production` |
| `SCOPES` | `read_draft_orders` |

Build runs `npm run setup && npm run start`, so migrations apply on every deploy. Pushing to `main` triggers a deploy automatically.

## Privacy and compliance

The app stores only draft-order metadata — status, value, currency and timestamps — no customer names, emails, or line-item content. The three mandatory compliance webhooks (`customers/data_request`, `customers/redact`, `shop/redact`) are implemented and HMAC-verified; requests with an invalid HMAC receive a 401.

---

Author: Valerio Manca — [github.com/ValerioM21](https://github.com/ValerioM21) · [LinkedIn](https://www.linkedin.com/in/valerio-manca-2690882b7)