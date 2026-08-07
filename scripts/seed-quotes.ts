// scripts/seed-quotes.ts
// Attrezzo di sviluppo: popola il DB con ~280 preventivi finti e
// cronometra le 4 query. NON fa parte dell'app. Si lancia a mano.
import db from "../app/db.server";
import * as quotes from "../app/models/quotes.server";

const SHOP = "manca-quote-pipeline-dev.myshopify.com";
const N = 280;
const DAY_MS = 86_400_000;

// numero casuale fra a e b
const rnd = (a: number, b: number) => a + Math.random() * (b - a);

async function main() {
  // 1. Parti pulito: via le righe di seed precedenti di questo shop.
  await db.draftQuote.deleteMany({ where: { shop: SHOP } });

  const now = Date.now();

  // 2. Genera N preventivi con date ed esiti realistici.
  const rows = Array.from({ length: N }, (_, i) => {
    const createdAt = new Date(now - rnd(0, 60) * DAY_MS); // negli ultimi 60 giorni

    const roll = Math.random();
    let status = "open";
    let completedAt: Date | null = null;
    let daysToConvert: number | null = null;
    let deletedAt: Date | null = null;

    if (roll < 0.35) {
      // 35% convertiti
      status = "completed";
      const d = Math.floor(rnd(0, 20));
      completedAt = new Date(createdAt.getTime() + d * DAY_MS);
      daysToConvert = d;
    } else if (roll < 0.5) {
      // 15% eliminati
      deletedAt = new Date(createdAt.getTime() + rnd(1, 15) * DAY_MS);
    } else if (roll < 0.7) {
      // 20% invoice_sent (il restante 30% resta "open")
      status = "invoice_sent";
    }

    return {
      id: `gid://shopify/DraftOrder/seed-${i}`,
      shop: SHOP,
      status,
      totalValue: rnd(50, 3000).toFixed(2),
      currency: "EUR",
      shopifyCreatedAt: createdAt,
      completedAt,
      daysToConvert,
      deletedAt,
    };
  });

  // 3. Scrivi tutte le righe in un colpo solo.
  await db.draftQuote.createMany({ data: rows });
  console.log(`Inserite ${rows.length} righe.`);

  // 4. Cronometra le 4 query.
  const t = performance.now();
  const [q1, q2, q3, q4] = await Promise.all([
    quotes.getOpenQuotes(SHOP),
    quotes.getConversionRateThisMonth(SHOP),
    quotes.getStaleQuotes(SHOP),
    quotes.getDeletedQuotes(SHOP),
  ]);
  const ms = performance.now() - t;

  console.log(`\n4 query in ${ms.toFixed(1)} ms\n`);
  console.log("Q1 aperti:      ", q1);
  console.log("Q2 conversione: ", { ...q2, rate: q2.rate.toFixed(2) });
  console.log("Q3 fermi >7gg:  ", `count=${q3.count}, mostrati=${q3.items.length}`);
  console.log("Q4 eliminati:   ", `count=${q4.count}, mostrati=${q4.items.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());