import { NextResponse } from "next/server";
import { getAgentByCode } from "@/lib/data";
import { hashPin } from "@/lib/utils";

export async function POST(req) {
  const { agent_code, pin } = await req.json();

  const agent = await getAgentByCode(agent_code);

  if (!agent || agent.pin_hash !== hashPin(pin)) {
    return NextResponse.json(
      { error: "Code agent ou code PIN incorrect." },
      { status: 401 }
    );
  }

  delete agent.pin_hash;
  return NextResponse.json({ success: true, agent });
}
