import { NextResponse } from "next/server";
import getDb from "@/lib/db";
import { hashPin } from "@/lib/utils";

export async function POST(req) {
  const { agent_code, pin } = await req.json();
  const db = getDb();

  const agent = db
    .prepare("SELECT * FROM agents WHERE agent_code = ?")
    .get(agent_code);

  if (!agent || agent.pin_hash !== hashPin(pin)) {
    return NextResponse.json(
      { error: "Code agent ou code PIN incorrect." },
      { status: 401 }
    );
  }

  delete agent.pin_hash;
  return NextResponse.json({ success: true, agent });
}
