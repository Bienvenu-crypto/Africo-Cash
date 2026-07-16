import { NextResponse } from "next/server";
import getDb from "@/lib/db";
import { getConfig, round2 } from "@/lib/utils";

export async function POST(req) {
  const { account_number, bank_name, bank_account_number, currency, amount } =
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
  if (!montant || montant <= 0 || !bank_name || !bank_account_number) {
    return NextResponse.json({ error: "Donnees invalides." }, { status: 400 });
  }

  const balCol = currency === "USD" ? "balance_usd" : "balance_cdf";
  const creditClient = montant; // le client recoit l'integralite, les frais sont supportes par la banque externe
  const fee = round2(montant * cfg.bank_deposit_fee_rate);
  const newBalance = round2(client[balCol] + creditClient);

  const guichet = db
    .prepare("SELECT * FROM guichets WHERE bank_name = ? ORDER BY id LIMIT 1")
    .get(bank_name);

  const tx = db.transaction(() => {
    db.prepare(`UPDATE clients SET ${balCol} = ? WHERE account_number = ?`).run(
      newBalance,
      account_number
    );
    if (guichet) {
      const cantCol = currency === "USD" ? "cantonnement_usd" : "cantonnement_cdf";
      db.prepare(`UPDATE guichets SET ${cantCol} = ${cantCol} + ? WHERE code = ?`).run(
        montant,
        guichet.code
      );
    }
    db.prepare(
      `INSERT INTO transactions (type, client_account, counterparty, currency, amount, fee, status, details)
       VALUES ('Banque vers Africo', ?, ?, ?, ?, ?, 'Reussi', ?)`
    ).run(
      account_number,
      `${bank_name} - ${bank_account_number}`,
      currency,
      creditClient,
      fee,
      `Rechargement depuis compte bancaire ${bank_account_number} (${bank_name}). Commission Africo: ${fee} ${currency} (payee par la banque).`
    );
  });
  tx();

  return NextResponse.json({
    success: true,
    message: `Rechargement confirme depuis ${bank_name}. Credit: ${creditClient} ${currency}. Nouveau solde : ${newBalance} ${currency}.`,
    new_balance: newBalance,
  });
}
