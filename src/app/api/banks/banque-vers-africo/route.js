import { NextResponse } from "next/server";
import {
  adjustGuichetCantonnement,
  getClientByAccount,
  getConfig,
  getGuichetByBankName,
  insertTransaction,
  runInTransaction,
  updateClientBalance,
} from "@/lib/data";
import { round2 } from "@/lib/utils";

export async function POST(req) {
  const { account_number, bank_name, bank_account_number, currency, amount } =
    await req.json();
  const cfg = await getConfig();

  const client = await getClientByAccount(account_number);
  if (!client) {
    return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });
  }
  const montant = Number(amount);
  if (!montant || montant <= 0 || !bank_name || !bank_account_number) {
    return NextResponse.json({ error: "Donnees invalides." }, { status: 400 });
  }

  const balCol = currency === "USD" ? "balance_usd" : "balance_cdf";
  const creditClient = montant;
  const fee = round2(montant * cfg.bank_deposit_fee_rate);
  const newBalance = round2(client[balCol] + creditClient);

  const guichet = await getGuichetByBankName(bank_name);

  await runInTransaction(async () => {
    await updateClientBalance(account_number, balCol, newBalance);
    if (guichet) {
      const cantCol = currency === "USD" ? "cantonnement_usd" : "cantonnement_cdf";
      await adjustGuichetCantonnement(guichet.code, cantCol, montant);
    }
    await insertTransaction({
      type: "Banque vers Africo",
      client_account: account_number,
      counterparty: `${bank_name} - ${bank_account_number}`,
      currency,
      amount: creditClient,
      fee,
      status: "Reussi",
      details: `Rechargement depuis compte bancaire ${bank_account_number} (${bank_name}). Commission Africo: ${fee} ${currency} (payee par la banque).`,
    });
  });

  return NextResponse.json({
    success: true,
    message: `Rechargement confirme depuis ${bank_name}. Credit: ${creditClient} ${currency}. Nouveau solde : ${newBalance} ${currency}.`,
    new_balance: newBalance,
  });
}
