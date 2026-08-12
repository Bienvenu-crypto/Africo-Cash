import { NextResponse } from "next/server";
import {
  getAgentByCode,
  getClientByAccount,
  getConfig,
  insertTransaction,
  runInTransaction,
  updateClientBalance,
} from "@/lib/data";
import { hashPin, round2 } from "@/lib/utils";

export async function POST(req) {
  const { account_number, pin, currency, amount, agent_code } =
    await req.json();
  const cfg = await getConfig();

  const client = await getClientByAccount(account_number);

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

  const agent = await getAgentByCode(agent_code);

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

  await runInTransaction(async () => {
    await updateClientBalance(account_number, balCol, newBalance);
    await insertTransaction({
      type: "Retrait",
      client_account: account_number,
      counterparty: agent_code,
      currency,
      amount: -montant,
      fee,
      status: "Reussi",
      details: `Retrait via agent ${agent_code} (${agent.boutique_nom})`,
    });
  });

  return NextResponse.json({
    success: true,
    message: `Retrait effectue. Montant: ${montant} ${currency}, Frais: ${fee} ${currency}. Nouveau solde: ${newBalance} ${currency}.`,
    new_balance: newBalance,
    fee,
  });
}
