import { NextResponse } from "next/server";
import getDb from "@/lib/db";

export async function GET(req, { params }) {
  const { account } = await params;
  const db = getDb();

  const client = db
    .prepare("SELECT * FROM clients WHERE account_number = ?")
    .get(account);

  if (!client) {
    return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });
  }
  delete client.pin_hash;

  const transactions = db
    .prepare(
      `SELECT * FROM transactions
       WHERE client_account = ?
       ORDER BY created_at DESC, id DESC
       LIMIT 20`
    )
    .all(account);

  return NextResponse.json({ client, transactions });
}
