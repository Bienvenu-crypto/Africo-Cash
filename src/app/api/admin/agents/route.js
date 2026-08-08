import { NextResponse } from "next/server";
import getDb from "@/lib/db";

export async function GET(req) {
  const db = getDb();

  try {
    const agents = db
      .prepare("SELECT * FROM agents ORDER BY created_at DESC")
      .all();

    // Remove sensitive data before sending
    const safeAgents = agents.map((agent) => {
      const { pin_hash, ...safeAgent } = agent;
      return safeAgent;
    });

    return NextResponse.json({ agents: safeAgents });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
