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
import { hashPin, round2 } from "@/lib/utils";

export async function POST(req) {
  const { account_number, pin, bank_name, bank_account_number, currency, amount } =
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
  if (!montant || montant <= 0 || !bank_name || !bank_account_number) {
    return NextResponse.json({ error: "Donnees invalides." }, { status: 400 });
  }

  const balCol = currency === "USD" ? "balance_usd" : "balance_cdf";
  const fee = round2(montant * cfg.bank_transfer_fee_rate);
  const totalDebit = round2(montant + fee);

  if (client[balCol] < totalDebit) {
    return NextResponse.json({ error: "Solde insuffisant." }, { status: 400 });
  }

  const guichet = await getGuichetByBankName(bank_name);
  const newBalance = round2(client[balCol] - totalDebit);

  await runInTransaction(async () => {
    await updateClientBalance(account_number, balCol, newBalance);
    if (guichet) {
      const cantCol = currency === "USD" ? "cantonnement_usd" : "cantonnement_cdf";
      await adjustGuichetCantonnement(guichet.code, cantCol, -totalDebit);
    }
    await insertTransaction({
      type: "Africo vers Banque",
      client_account: account_number,
      counterparty: `${bank_name} - ${bank_account_number}`,
      currency,
      amount: -montant,
      fee,
      status: "Reussi",
      details: `Virement vers compte bancaire ${bank_account_number} (${bank_name}).`,
    });
  });

  return NextResponse.json({
    success: true,
    message: `Virement vers ${bank_name} reussi. Montant: ${montant} ${currency}, Frais: ${fee} ${currency}. Nouveau solde: ${newBalance} ${currency}.`,
    new_balance: newBalance,
    fee,
  });
}
