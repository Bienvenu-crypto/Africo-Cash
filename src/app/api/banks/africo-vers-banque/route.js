import { NextResponse } from "next/server";
import getDb from "@/lib/db";
import { hashPin, getConfig, round2 } from "@/lib/utils";

export async function POST(req) {
  const { account_number, pin, bank_name, bank_account_number, currency, amount } =
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
  const montant = Number(amount);
  if (!montant || montant <= 0 || !bank_name || !bank_account_number) {
    return NextResponse.json({ error: "Donnees invalides." }, { status: 400 });
  }

  const balCol = currency === "USD" ? "balance_usd" : "balance_cdf";
  const fee = round2(montant * cfg.bank_transfer_fee_rate);
  const totalDebit = round2(montant + fee);

  if (client[balCol] < totalDebit) {
    return NextResponse.json({ error: "Solde insuffisant." }, { status: 400 });
  }

  const guichet = db
    .prepare("SELECT * FROM guichets WHERE bank_name = ? ORDER BY id LIMIT 1")
    .get(bank_name);

  const newBalance = round2(client[balCol] - totalDebit);

  const tx = db.transaction(() => {
    db.prepare(`UPDATE clients SET ${balCol} = ? WHERE account_number = ?`).run(
      newBalance,
      account_number
    );
    if (guichet) {
      const cantCol = currency === "USD" ? "cantonnement_usd" : "cantonnement_cdf";
      db.prepare(`UPDATE guichets SET ${cantCol} = ${cantCol} - ? WHERE code = ?`).run(
        totalDebit,
        guichet.code
      );
    }
    db.prepare(
      `INSERT INTO transactions (type, client_account, counterparty, currency, amount, fee, status, details)
       VALUES ('Africo vers Banque', ?, ?, ?, ?, ?, 'Reussi', ?)`
    ).run(
      account_number,
      `${bank_name} - ${bank_account_number}`,
      currency,
      -montant,
      fee,
      `Virement vers compte bancaire ${bank_account_number} (${bank_name}).`
    );
  });
  tx();

  return NextResponse.json({
    success: true,
    message: `Virement vers ${bank_name} reussi. Montant: ${montant} ${currency}, Frais: ${fee} ${currency}. Nouveau solde: ${newBalance} ${currency}.`,
    new_balance: newBalance,
    fee,
  });
}
