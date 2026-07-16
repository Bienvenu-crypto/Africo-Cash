import { NextResponse } from "next/server";
import getDb from "@/lib/db";
import { hashPin } from "@/lib/utils";

export async function POST(req) {
  const { account_number, pin } = await req.json();
  const db = getDb();

  const client = db
    .prepare("SELECT * FROM clients WHERE account_number = ?")
    .get(account_number);

  if (!client || client.pin_hash !== hashPin(pin)) {
    return NextResponse.json(
      { error: "Numero de compte ou code PIN incorrect." },
      { status: 401 }
    );
  }
  if (client.status !== "Actif") {
    return NextResponse.json(
      { error: "Ce compte est suspendu. Contactez le support." },
      { status: 403 }
    );
  }

  delete client.pin_hash;
  return NextResponse.json({ success: true, client });
}
