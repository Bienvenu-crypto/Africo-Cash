import { NextResponse } from "next/server";
import { getConfig, updateConfig } from "@/lib/data";

export async function GET() {
  try {
    const cfg = await getConfig();
    return NextResponse.json({ config: cfg });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const updates = await req.json();
    await updateConfig(updates);
    return NextResponse.json({ success: true, message: "Tarifs mis à jour avec succès." });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
