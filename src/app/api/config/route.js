import { NextResponse } from "next/server";
import getDb from "@/lib/db";
import { getConfig } from "@/lib/utils";

export async function GET() {
  try {
    const db = getDb();
    const cfg = getConfig(db);
    return NextResponse.json({ config: cfg });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const updates = await req.json();
    const db = getDb();
    const stmt = db.prepare("UPDATE config SET value = ? WHERE key = ?");
    
    db.transaction((updatesObj) => {
      for (const [k, v] of Object.entries(updatesObj)) {
        if (typeof v === "number") {
          stmt.run(v, k);
        }
      }
    })(updates);

    return NextResponse.json({ success: true, message: "Tarifs mis à jour avec succès." });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
