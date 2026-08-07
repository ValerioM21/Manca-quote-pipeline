// app/routes/webhooks.draft-orders.tsx  → risponde su /webhooks/draft-orders
// È una "resource route": nessun export default (non rende una pagina),
// solo una action che gestisce la richiesta POST di Shopify.
import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";

const DAY_MS = 86_400_000;

export const action = async ({ request }: ActionFunctionArgs) => {
  // authenticate.webhook verifica l'HMAC: se il messaggio non è
  // firmato davvero da Shopify, risponde 401 da solo. È la nostra
  // garanzia che il payload non è falsificato.
  const { shop, topic, payload } = await authenticate.webhook(request);

  // Il webhook porta l'id numerico; noi normalizziamo a GID.
  const gid = `gid://shopify/DraftOrder/${payload.id}`;

  switch (topic) {
    case "DRAFT_ORDERS_CREATE":
    case "DRAFT_ORDERS_UPDATE": {
      const status = (payload.status as string) ?? "open";
      const createdAt = payload.created_at ? new Date(payload.created_at) : new Date();
      const completedAt = payload.completed_at ? new Date(payload.completed_at) : null;

      // Se è stato convertito, calcoliamo i giorni creazione → conversione.
      let daysToConvert: number | null = null;
      if (status === "completed" && completedAt) {
        daysToConvert = Math.max(0, Math.round((completedAt.getTime() - createdAt.getTime()) / DAY_MS));
      }

      const data = {
        shop,
        status,
        totalValue: String(payload.total_price ?? "0"),
        currency: (payload.currency as string) ?? "",
        completedAt,
        daysToConvert,
      };

      // upsert = "aggiorna se esiste, altrimenti crea".
      await db.draftQuote.upsert({
        where: { id: gid },
        create: { id: gid, shopifyCreatedAt: createdAt, ...data },
        update: data,
      });
      break;
    }

    case "DRAFT_ORDERS_DELETE": {
      // Il payload di delete è minimo (~ solo l'id): marchiamo la riga esistente.
      await db.draftQuote.updateMany({
        where: { id: gid, shop },
        data: { deletedAt: new Date() },
      });
      break;
    }
  }

  return new Response(); // 200: conferma a Shopify che abbiamo ricevuto.
};