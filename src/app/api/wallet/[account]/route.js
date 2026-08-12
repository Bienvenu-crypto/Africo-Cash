import { NextResponse } from "next/server";
import {
  getClientByAccount,
  getTransactionsForAccount,
} from "@/lib/data";

export async function GET(req, { params }) {
  const { account } = await params;

  const client = await getClientByAccount(account);

  if (!client) {
    return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });
  }
  delete client.pin_hash;

  const transactions = await getTransactionsForAccount(account);

  return NextResponse.json({ client, transactions });
}
