import { NextResponse } from "next/server";
import getDb from "@/lib/db";
import { hashPin } from "@/lib/utils";

export async function POST(req) {
  const { bank_name, agence, code, password } = await req.json();
  const db = getDb();

  if (!bank_name || !agence || !code || !password) {
    return NextResponse.json({ error: "Champs manquants." }, { status: 400 });
  }

  const exists = db.prepare("SELECT 1 FROM guichets WHERE code = ?").get(code);
  if (exists) {
    return NextResponse.json(
      { error: "Ce code de guichet existe deja." },
      { status: 409 }
    );
  }

  db.prepare(
    `INSERT INTO guichets (code, bank_name, agence, password_hash, status)
     VALUES (?, ?, ?, ?, 'Operationnel')`
  ).run(code, bank_name, agence, hashPin(password));

  return NextResponse.json({
    success: true,
    message: `Guichet ${code} enregistre. Statut : Operationnel.`,
  });
}
