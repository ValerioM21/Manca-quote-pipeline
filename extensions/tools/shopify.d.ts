import '@shopify/ui-extensions';

//@ts-ignore
declare module './src/index.js' {
  interface SearchQuotesInput {
    /**
     * Which quotes to return: 'open' (awaiting customer), 'stale' (open and untouched for more than 7 days), or 'deleted' (deleted by the customer).
     */
    filter: 'open' | 'stale' | 'deleted';
    /**
     * Maximum number of quotes to include in the list. The total count is always returned regardless of this limit. Defaults to 50.
     */
    limit?: number;
    [k: string]: unknown;
  }

  type SearchQuotesOutput = unknown;
  interface ConversionRateInput {
    [k: string]: unknown;
  }

  type ConversionRateOutput = unknown;
  interface ShopifyTools {
    /**
     * List draft-order quotes filtered by pipeline state. Use filter 'open' for quotes still awaiting the customer, 'stale' for open quotes with no customer response for more than 7 days, and 'deleted' for quotes the customer deleted. Returns a total count plus each quote's creation date, total value, currency, and age in days, so it also answers 'how many' questions.
     */
    register(
      name: 'search_quotes',
      handler: (
        input: SearchQuotesInput,
      ) => SearchQuotesOutput | Promise<SearchQuotesOutput>,
    ): () => void;
    /**
     * Report the quote-to-order conversion rate for the current calendar month. Returns the number of quotes that converted to orders, the total number of quotes created this month, and the resulting conversion rate as a fraction.
     */
    register(
      name: 'conversion_rate',
      handler: (
        input: ConversionRateInput,
      ) => ConversionRateOutput | Promise<ConversionRateOutput>,
    ): () => void;
  }

  const shopify: import('@shopify/ui-extensions/admin').WithGeneratedTools<
    import('@shopify/ui-extensions/admin.app.tools.data').Api,
    ShopifyTools
  >;
  const globalThis: { shopify: typeof shopify };
}
