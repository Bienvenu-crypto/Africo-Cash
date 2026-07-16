import { NextResponse } from "next/server";
import getDb from "@/lib/db";
import { getConfig, round2 } from "@/lib/utils";

export async function POST(req) {
  const { account_number, operator, mobile_number, currency, amount } =
    await req.json();
  const db = getDb();
  const cfg = getConfig(db);

  const client = db
    .prepare("SELECT * FROM clients WHERE account_number = ?")
    .get(account_number);
  if (!client) {
    return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });
  }
  const montant = Number(amount);
  if (!montant || montant <= 0 || !mobile_number) {
    return NextResponse.json({ error: "Donnees invalides." }, { status: 400 });
  }

  const fee = round2(montant * cfg.mobile_deposit_fee_rate);
  const creditClient = round2(montant - fee);
  const balCol = currency === "USD" ? "balance_usd" : "balance_cdf";
  const newBalance = round2(client[balCol] + creditClient);

  db.prepare(`UPDATE clients SET ${balCol} = ? WHERE account_number = ?`).run(
    newBalance,
    account_number
  );

  db.prepare(
    `INSERT INTO transactions (type, client_account, counterparty, currency, amount, fee, status, details)
     VALUES ('Depot Mobile Money', ?, ?, ?, ?, ?, 'Reussi', ?)`
  ).run(
    account_number,
    operator,
    currency,
    creditClient,
    fee,
    `Push USSD ${operator} depuis ${mobile_number}`
  );

  return NextResponse.json({
    success: true,
    message: `Rechargement confirme via ${operator}. Credit: ${creditClient} ${currency}. Nouveau solde: ${newBalance} ${currency}.`,
    new_balance: newBalance,
  });
}
