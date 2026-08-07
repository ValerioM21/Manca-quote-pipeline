// app/models/quotes.server.ts
import db from "../db.server";

const OPEN = ["open", "invoice_sent"];
const DAY_MS = 86_400_000;

// Q1 — "Quanti preventivi ho ancora aperti?"
export async function getOpenQuotes(shop: string) {
  const where = { shop, deletedAt: null, status: { in: OPEN } };
  const [agg, first] = await Promise.all([
    db.draftQuote.aggregate({ where, _count: { _all: true }, _sum: { totalValue: true } }),
    db.draftQuote.findFirst({ where, select: { currency: true } }),
  ]);
  return {
    count: agg._count._all,
    totalValue: Number(agg._sum.totalValue ?? 0),
    currency: first?.currency ?? null,
  };
}

// Q2 — "Tasso di conversione preventivo → ordine, questo mese?"
export async function getConversionRateThisMonth(shop: string, now = new Date()) {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const base = { shop, shopifyCreatedAt: { gte: start } };
  const [created, converted] = await Promise.all([
    db.draftQuote.count({ where: base }),
    db.draftQuote.count({ where: { ...base, status: "completed" } }),
  ]);
  return { periodStart: start, created, converted, rate: created ? converted / created : 0 };
}

// Q3 — "Quali preventivi fermi da più di 7 giorni senza risposta?"
export async function getStaleQuotes(shop: string, days = 7, limit = 20, now = new Date()) {
  const cutoff = new Date(now.getTime() - days * DAY_MS);
  const where = { shop, deletedAt: null, status: { in: OPEN }, shopifyCreatedAt: { lt: cutoff } };
  const [count, rows] = await Promise.all([
    db.draftQuote.count({ where }),
    db.draftQuote.findMany({
      where,
      orderBy: { shopifyCreatedAt: "asc" },
      take: limit,
      select: { id: true, shopifyCreatedAt: true, totalValue: true, currency: true },
    }),
  ]);
  return {
    count,
    items: rows.map((r) => ({
      id: r.id,
      ageDays: Math.floor((now.getTime() - r.shopifyCreatedAt.getTime()) / DAY_MS),
      totalValue: Number(r.totalValue),
      currency: r.currency,
    })),
  };
}

// Q4 — "Quali preventivi eliminati / non convertiti?"
export async function getDeletedQuotes(shop: string, sinceDays = 90, limit = 20, now = new Date()) {
  const since = new Date(now.getTime() - sinceDays * DAY_MS);
  const where = { shop, deletedAt: { gte: since } };
  const [count, rows] = await Promise.all([
    db.draftQuote.count({ where }),
    db.draftQuote.findMany({
      where,
      orderBy: { deletedAt: "desc" },
      take: limit,
      select: { id: true, deletedAt: true, totalValue: true, currency: true, status: true },
    }),
  ]);
  return {
    count,
    items: rows.map((r) => ({
      id: r.id,
      deletedAt: r.deletedAt,
      totalValue: Number(r.totalValue),
      currency: r.currency,
      lastStatus: r.status,
    })),
  };
}