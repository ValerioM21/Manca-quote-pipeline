/* // app/routes/api.sidekick.quotes.tsx
import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { getOpenQuotes, getStaleQuotes, getDeletedQuotes } from "../models/quotes.server";

export async function action({ request }: ActionFunctionArgs) {
  const { session, cors } = await authenticate.admin(request);
  const { shop } = session;

  const body = await request.json().catch(() => ({}));
  const filter = body?.filter;
  const cap = Math.min(Math.max(Number(body?.limit) || 25, 1), 50);
 

  switch (filter) {
    case "open": {
      const r = await getOpenQuotes(shop);
      return cors(Response.json({ filter, count: r.count, totalValue: r.totalValue, currency: r.currency }));
    }
    case "stale": {
      const r = await getStaleQuotes(shop, 7, cap);
      return cors(Response.json({ filter, count: r.count, quotes: r.items }));
    }
    case "deleted": {
      const r = await getDeletedQuotes(shop, 90, cap);
      return cors(Response.json({ filter, count: r.count, quotes: r.items }));
    }
    default:
      return cors(Response.json({ error: "invalid filter; use open, stale, or deleted" }, { status: 400 }));
  }
} */

 // app/routes/api.sidekick.quotes.tsx
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { getOpenQuotes, getStaleQuotes, getDeletedQuotes } from "../models/quotes.server";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "https://extensions.shopifycdn.com",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Max-Age": "86400",
};

// Risponde al preflight OPTIONS (e a qualunque GET/OPTIONS) senza auth.
export async function loader({ request }: LoaderFunctionArgs) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  return new Response(null, { status: 405, headers: CORS_HEADERS });
}

export async function action({ request }: ActionFunctionArgs) {
  const { session, cors } = await authenticate.admin(request);
  const { shop } = session;

  const body = await request.json().catch(() => ({}));
  const filter = body?.filter;
  const cap = Math.min(Math.max(Number(body?.limit) || 25, 1), 50);

  const t0 = Date.now();
  let payload;
  switch (filter) {
    case "open": {
      const r = await getOpenQuotes(shop);
      payload = { filter, count: r.count, totalValue: r.totalValue, currency: r.currency };
      break;
    }
    case "stale": {
      const r = await getStaleQuotes(shop, 7, cap);
      payload = { filter, count: r.count, quotes: r.items };
      break;
    }
    case "deleted": {
      const r = await getDeletedQuotes(shop, 90, cap);
      payload = { filter, count: r.count, quotes: r.items };
      break;
    }
    default:
      return cors(Response.json({ error: "invalid filter; use open, stale, or deleted" }, { status: 400 }));
  }
  console.log(`[sidekick] search_quotes filter=${filter} query_ms=${Date.now() - t0}`);
  return cors(Response.json(payload));
}