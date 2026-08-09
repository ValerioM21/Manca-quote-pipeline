export default async function extension() {
  // Tool 1 — search_quotes → route POST /api/sidekick/quotes
    /** @param {{ filter?: string, limit?: number }} args */
  shopify.tools.register("search_quotes", async ({ filter, limit }) => {
    const response = await fetch("/api/sidekick/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filter, limit }),
    });
    return response.json();
  });

  // Tool 2 — conversion_rate → route GET /api/sidekick/conversion-rate
  shopify.tools.register("conversion_rate", async () => {
    const response = await fetch("/api/sidekick/conversion-rate");
    return response.json();
  });
}