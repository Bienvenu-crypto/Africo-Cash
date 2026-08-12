import { NextResponse } from "next/server";
import {
  getClientByAccount,
  getConfig,
  insertTransaction,
  updateClientBalance,
} from "@/lib/data";
import { hashPin, round2 } from "@/lib/utils";

export async function POST(req) {
  const { account_number, pin, operator, mobile_number, currency, amount } =
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
  if (!montant || montant <= 0 || !mobile_number) {
    return NextResponse.json({ error: "Donnees invalides." }, { status: 400 });
  }

  const fee = round2(montant * cfg.mobile_withdrawal_fee_rate);
  const totalDebit = round2(montant + fee);
  const balCol = currency === "USD" ? "balance_usd" : "balance_cdf";

  if (client[balCol] < totalDebit) {
    return NextResponse.json({ error: "Solde insuffisant." }, { status: 400 });
  }

  const newBalance = round2(client[balCol] - totalDebit);
  await updateClientBalance(account_number, balCol, newBalance);
  await insertTransaction({
    type: "Retrait Mobile Money",
    client_account: account_number,
    counterparty: operator,
    currency,
    amount: -montant,
    fee,
    status: "Reussi",
    details: `Transfert vers ${operator} - ${mobile_number}`,
  });

  return NextResponse.json({
    success: true,
    message: `Transfert vers ${operator} reussi. Montant: ${montant} ${currency}, Frais: ${fee} ${currency}. Nouveau solde: ${newBalance} ${currency}.`,
    new_balance: newBalance,
  });
}
