import { NextResponse } from "next/server";
import {
  getClientByAccount,
  getConfig,
  insertTransaction,
  updateClientBalance,
} from "@/lib/data";
import { round2 } from "@/lib/utils";

export async function POST(req) {
  const { account_number, operator, mobile_number, currency, amount } =
    await req.json();
  const cfg = await getConfig();

  const client = await getClientByAccount(account_number);
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

  await updateClientBalance(account_number, balCol, newBalance);
  await insertTransaction({
    type: "Depot Mobile Money",
    client_account: account_number,
    counterparty: operator,
    currency,
    amount: creditClient,
    fee,
    status: "Reussi",
    details: `Push USSD ${operator} depuis ${mobile_number}`,
  });

  return NextResponse.json({
    success: true,
    message: `Rechargement confirme via ${operator}. Credit: ${creditClient} ${currency}. Nouveau solde: ${newBalance} ${currency}.`,
    new_balance: newBalance,
  });
}
