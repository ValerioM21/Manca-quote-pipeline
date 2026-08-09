import '@shopify/ui-extensions';

//@ts-ignore
declare module './src/index.js' {
  interface SearchInput {
    /**
     * Search query string
     */
    query?: string;
    /**
     * Cursor for pagination - returns elements after this cursor
     */
    after?: string;
    /**
     * Number of results to return (default: 10)
     */
    first?: number;
    [k: string]: unknown;
  }

  interface SearchOutput {
    results?: {
      /**
       * Unique identifier for the result
       */
      id: string;
      /**
       * The type/category of the result
       */
      type: string;
      /**
       * URL to view or edit the resource
       */
      url?: string;
      /**
       * Display title for the result
       */
      title?: string;
      [k: string]: unknown;
    }[];
    pageInfo?: {
      /**
       * Whether there are more results available
       */
      hasNextPage?: boolean;
      /**
       * Whether there are previous results available
       */
      hasPreviousPage?: boolean;
      /**
       * Cursor for the first item in results
       */
      startCursor?: string;
      /**
       * Cursor for the last item in results
       */
      endCursor?: string;
      [k: string]: unknown;
    };
    [k: string]: unknown;
  }

  interface ShopifyTools {
    /**
     * Search for data from this app's external data source
     */
    register(
      name: 'search',
      handler: (input: SearchInput) => SearchOutput | Promise<SearchOutput>,
    ): () => void;
  }

  const shopify: import('@shopify/ui-extensions/admin').WithGeneratedTools<
    import('@shopify/ui-extensions/admin.app.tools.data').Api,
    ShopifyTools
  >;
  const globalThis: { shopify: typeof shopify };
}
