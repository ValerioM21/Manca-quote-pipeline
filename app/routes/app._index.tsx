import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData, useRevalidator } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import {
  getOpenQuotes,
  getConversionRateThisMonth,
  getStaleQuotes,
  getDeletedQuotes,
} from "../models/quotes.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const [open, conversion, stale, deleted] = await Promise.all([
    getOpenQuotes(shop),
    getConversionRateThisMonth(shop),
    getStaleQuotes(shop),
    getDeletedQuotes(shop),
  ]);

  return { open, conversion, stale, deleted };
};

export default function Index() {
  const { open, conversion, stale, deleted } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();
  const isRefreshing = revalidator.state !== "idle";
  

  const fmtCurrency = (value: number, currency: string | null) =>
    currency
      ? new Intl.NumberFormat("en", { style: "currency", currency }).format(value)
      : value.toLocaleString("en");

  return (
    <s-page heading="Quote Analytics">
      <s-section heading="Open Quotes">
        <s-paragraph>
          You have <strong>{open.count}</strong> open quotes
          worth <strong>{fmtCurrency(open.totalValue, open.currency)}</strong>.
        </s-paragraph>
      </s-section>

      <s-section heading="Conversion Rate This Month">
        <s-paragraph>
          <strong>{(conversion.rate * 100).toFixed(1)}%</strong> conversion
          rate — {conversion.converted} converted out of {conversion.created} created
          this month.
        </s-paragraph>
      </s-section>

      <s-section heading="Stale Quotes">
        <s-paragraph>
          <strong>{stale.count}</strong> quotes have been open for over 7 days
          without a response.
        </s-paragraph>
      </s-section>

      <s-section heading="Deleted Quotes">
        <s-paragraph>
          <strong>{deleted.count}</strong> quotes were deleted in the last
          90 days.
        </s-paragraph>
      </s-section>

      <s-section>
        <s-button onClick={()=> revalidator.revalidate()} disabled={isRefreshing}>
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </s-button>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
