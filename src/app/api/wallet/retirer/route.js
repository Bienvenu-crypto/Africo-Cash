import { NextResponse } from "next/server";
import getDb from "@/lib/db";
import { hashPin, getConfig, round2 } from "@/lib/utils";

export async function POST(req) {
  const { account_number, pin, currency, amount, agent_code } =
    await req.json();
  const db = getDb();
  const cfg = getConfig(db);

  const client = db
    .prepare("SELECT * FROM clients WHERE account_number = ?")
    .get(account_number);
  if (!client) {
    return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });
  }
  if (client.pin_hash !== hashPin(pin)) {
    return NextResponse.json({ error: "Code PIN incorrect." }, { status: 401 });
  }
  if (!["USD", "CDF"].includes(currency)) {
    return NextResponse.json({ error: "Devise invalide." }, { status: 400 });
  }
  const montant = Number(amount);
  if (!montant || montant <= 0) {
    return NextResponse.json({ error: "Montant invalide." }, { status: 400 });
  }
  const agent = db
    .prepare("SELECT * FROM agents WHERE agent_code = ?")
    .get(agent_code);
  if (!agent) {
    return NextResponse.json({ error: "Code agent introuvable." }, { status: 404 });
  }

  const fee = round2(montant * cfg.withdrawal_rate);
  const totalDebit = round2(montant + fee);
  const balCol = currency === "USD" ? "balance_usd" : "balance_cdf";

  if (client[balCol] < totalDebit) {
    return NextResponse.json({ error: "Solde insuffisant." }, { status: 400 });
  }

  const newBalance = round2(client[balCol] - totalDebit);
  db.prepare(`UPDATE clients SET ${balCol} = ? WHERE account_number = ?`).run(
    newBalance,
    account_number
  );

  db.prepare(
    `INSERT INTO transactions (type, client_account, counterparty, currency, amount, fee, status, details)
     VALUES ('Retrait', ?, ?, ?, ?, ?, 'Reussi', ?)`
  ).run(
    account_number,
    agent_code,
    currency,
    -montant,
    fee,
    `Retrait via agent ${agent_code} (${agent.boutique_nom})`
  );

  return NextResponse.json({
    success: true,
    message: `Retrait effectue. Montant: ${montant} ${currency}, Frais: ${fee} ${currency}. Nouveau solde: ${newBalance} ${currency}.`,
    new_balance: newBalance,
    fee,
  });
}
