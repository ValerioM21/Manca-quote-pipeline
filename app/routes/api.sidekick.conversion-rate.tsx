/* // app/routes/api.sidekick.conversion-rate.tsx
import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { getConversionRateThisMonth } from "../models/quotes.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session, cors } = await authenticate.admin(request);
  const { shop } = session;

  const r = await getConversionRateThisMonth(shop);
  return cors(Response.json({
    period: "current_month",
    periodStart: r.periodStart,
    quotesCreated: r.created,
    quotesConverted: r.converted,
    conversionRate: r.rate,   // frazione 0..1; lo diremo a Sidekick in instructions.md
  }));
} */

 // app/routes/api.sidekick.conversion-rate.tsx
import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { getConversionRateThisMonth } from "../models/quotes.server";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "https://extensions.shopifycdn.com",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Max-Age": "86400",
};

export async function loader({ request }: LoaderFunctionArgs) {
  // Preflight: rispondi subito, senza auth.
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const { session, cors } = await authenticate.admin(request);
  const { shop } = session;

  const t0 = Date.now();
  const r = await getConversionRateThisMonth(shop);
  console.log(`[sidekick] conversion_rate query_ms=${Date.now() - t0}`);

  return cors(Response.json({
    period: "current_month",
    periodStart: r.periodStart,
    quotesCreated: r.created,
    quotesConverted: r.converted,
    conversionRate: r.rate,
  }));
}