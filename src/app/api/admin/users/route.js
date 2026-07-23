import { NextResponse } from "next/server";
import getDb from "@/lib/db";

export async function GET(req) {
  const db = getDb();

  try {
    const users = db.prepare("SELECT * FROM clients ORDER BY created_at DESC").all();
    
    // Remove sensitive data before sending to client
    const safeUsers = users.map(user => {
      const { pin_hash, ...safeUser } = user;
      return safeUser;
    });

    return NextResponse.json({ users: safeUsers });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
