import { NextResponse } from "next/server";
import getDb from "@/lib/db";
import { hashPin, getConfig, round2 } from "@/lib/utils";

const FEE_KEY_BY_PARTNER = {
  REGIDESO: "regideso_fee_rate",
  SOCODEE: "electricity_fee_rate",
  "SNEL VIRUNGA": "electricity_fee_rate",
  Internet: "telecom_tv_fee_rate",
  "CANAL+": "telecom_tv_fee_rate",
  "Africo Market": "merchant_fee_rate",
};

export async function POST(req) {
  const { account_number, pin, partner, reference, currency, amount } =
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
  if (!montant || montant <= 0 || !partner || !reference) {
    return NextResponse.json({ error: "Donnees invalides." }, { status: 400 });
  }

  const feeKey = FEE_KEY_BY_PARTNER[partner] || "payment_fee_rate";
  const feeRate = cfg[feeKey] ?? cfg.payment_fee_rate;
  const fee = round2(montant * feeRate);
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
     VALUES ('Paiement Facture', ?, ?, ?, ?, ?, 'Reussi', ?)`
  ).run(
    account_number,
    partner,
    currency,
    -montant,
    fee,
    `Paiement ${partner} - reference ${reference}`
  );

  return NextResponse.json({
    success: true,
    message: `Paiement ${partner} confirme. Montant: ${montant} ${currency}, Frais: ${fee} ${currency}. Nouveau solde: ${newBalance} ${currency}.`,
    new_balance: newBalance,
    fee,
  });
}
