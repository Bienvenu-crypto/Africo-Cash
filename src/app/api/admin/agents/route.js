import { NextResponse } from "next/server";
import { getAllAgents } from "@/lib/data";

export async function GET() {
  try {
    const agents = await getAllAgents();
    const safeAgents = agents.map(({ pin_hash, ...safeAgent }) => safeAgent);
    return NextResponse.json({ agents: safeAgents });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
