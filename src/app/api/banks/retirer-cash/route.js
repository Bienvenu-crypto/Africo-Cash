import { NextResponse } from "next/server";
import getDb from "@/lib/db";
import { hashPin, getConfig, round2, generateWithdrawCode } from "@/lib/utils";

export async function POST(req) {
  const { account_number, pin, bank_name, currency, amount } =
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
  if (!montant || montant <= 0 || !bank_name) {
    return NextResponse.json({ error: "Donnees invalides." }, { status: 400 });
  }

  const balCol = currency === "USD" ? "balance_usd" : "balance_cdf";
  const fee = round2(montant * cfg.bank_atm_withdrawal_fee_rate);
  const totalDebitClient = round2(montant + fee);

  if (client[balCol] < totalDebitClient) {
    return NextResponse.json({ error: "Solde insuffisant." }, { status: 400 });
  }

  const guichet = db
    .prepare("SELECT * FROM guichets WHERE bank_name = ? ORDER BY id LIMIT 1")
    .get(bank_name);

  const code_retrait = generateWithdrawCode();
  const newBalance = round2(client[balCol] - totalDebitClient);

  const tx = db.transaction(() => {
    db.prepare(`UPDATE clients SET ${balCol} = ? WHERE account_number = ?`).run(
      newBalance,
      account_number
    );
    if (guichet) {
      const cantCol = currency === "USD" ? "cantonnement_usd" : "cantonnement_cdf";
      db.prepare(`UPDATE guichets SET ${cantCol} = ${cantCol} - ? WHERE code = ?`).run(
        totalDebitClient,
        guichet.code
      );
    }
    db.prepare(
      `INSERT INTO transactions (type, client_account, counterparty, currency, amount, fee, status, details, code_retrait)
       VALUES ('Retrait Banque', ?, ?, ?, ?, ?, 'Reussi', ?, ?)`
    ).run(
      account_number,
      bank_name,
      currency,
      -montant,
      fee,
      `Retrait cash au guichet ${bank_name}`,
      code_retrait
    );
  });
  tx();

  return NextResponse.json({
    success: true,
    code_retrait,
    message: `Code de retrait genere : ${code_retrait}. Presentez-le au guichetier ${bank_name}. Nouveau solde : ${newBalance} ${currency}.`,
    new_balance: newBalance,
    fee,
  });
}
