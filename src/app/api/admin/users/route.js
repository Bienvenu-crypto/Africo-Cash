import { NextResponse } from "next/server";
import { getAllClients } from "@/lib/data";

export async function GET() {
  try {
    const users = await getAllClients();
    const safeUsers = users.map(({ pin_hash, ...safeUser }) => safeUser);
    return NextResponse.json({ users: safeUsers });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
