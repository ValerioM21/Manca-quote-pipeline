## When to use these tools

Use these tools for questions about draft-order quotes — the quote and
estimate pipeline, not finalized orders. Two tools are available:

- `search_quotes` — lists or counts quotes by their pipeline state.
- `conversion_rate` — reports how many quotes turned into orders this month.

## Choosing a tool

- "How many quotes are still open?" → `search_quotes` with filter `open`.
- "Which quotes have had no response for over a week?" / "stale quotes"
  → `search_quotes` with filter `stale`.
- "Which quotes did the customer delete?" / "lost quotes"
  → `search_quotes` with filter `deleted`.
- "What's my quote-to-order conversion rate this month?" → `conversion_rate`.

## Reading search_quotes results

`count` is always the true total for the filter, even when the returned
list is shorter than the total.

- Filter `open` returns a summary only: `count`, `totalValue`, and
  `currency`. There is no per-quote list — answer how many and the total
  value from these fields.
- Filters `stale` and `deleted` return `count` plus a `quotes` list. Each
  stale quote has `ageDays` (days since it was created). Each deleted quote
  has `deletedAt` and `lastStatus` (its state before the customer deleted it).
- `stale` means an open quote with no customer response for more than 7 days.
- Monetary `totalValue` amounts are expressed in the store's `currency`.

## Reading conversion_rate results

`conversionRate` is a fraction between 0 and 1 — present it as a percentage
(for example, 0.34 is 34%). `quotesCreated` and `quotesConverted` are the
counts it is derived from, for the current calendar month.