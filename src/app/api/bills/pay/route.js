import { NextResponse } from "next/server";
import {
  getClientByAccount,
  getConfig,
  insertTransaction,
  updateClientBalance,
} from "@/lib/data";
import { hashPin, round2 } from "@/lib/utils";

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
  const cfg = await getConfig();

  const client = await getClientByAccount(account_number);
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

  await updateClientBalance(account_number, balCol, newBalance);
  await insertTransaction({
    type: "Paiement Facture",
    client_account: account_number,
    counterparty: partner,
    currency,
    amount: -montant,
    fee,
    status: "Reussi",
    details: `Paiement ${partner} - reference ${reference}`,
  });

  return NextResponse.json({
    success: true,
    message: `Paiement ${partner} confirme. Montant: ${montant} ${currency}, Frais: ${fee} ${currency}. Nouveau solde: ${newBalance} ${currency}.`,
    new_balance: newBalance,
    fee,
  });
}
