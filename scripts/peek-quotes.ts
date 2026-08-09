// scripts/peek-quotes.ts — mostra le righe attualmente nel DB
import db from "../app/db.server";

async function main() {
  const rows = await db.draftQuote.findMany({ orderBy: { rowUpdatedAt: "desc" } });
  console.log(`${rows.length} righe:\n`);
  for (const r of rows) {
    console.log({
      id: r.id,
      status: r.status,
      total: Number(r.totalValue),
      currency: r.currency,
      created: r.shopifyCreatedAt,
      completedAt: r.completedAt,
      deletedAt: r.deletedAt,
    });
  }
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());