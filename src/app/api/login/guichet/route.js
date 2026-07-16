import { NextResponse } from "next/server";
import getDb from "@/lib/db";
import { hashPin } from "@/lib/utils";

export async function POST(req) {
  const { code, password } = await req.json();
  const db = getDb();

  const guichet = db.prepare("SELECT * FROM guichets WHERE code = ?").get(code);

  if (!guichet || guichet.password_hash !== hashPin(password)) {
    return NextResponse.json(
      { error: "Code de guichet ou mot de passe incorrect." },
      { status: 401 }
    );
  }

  delete guichet.password_hash;
  return NextResponse.json({ success: true, guichet });
}
