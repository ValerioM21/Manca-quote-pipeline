import db from "../app/db.server";

async function main(){
    const r = await db.draftQuote.deleteMany({});

    console.log(`Cancellate ${r.count} righe`);

    
}
main().catch((e) => {console.error(e); process.exit(1);}).finally(() => db.$disconnect());