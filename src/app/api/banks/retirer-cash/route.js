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
import { generateWithdrawCode, hashPin, round2 } from "@/lib/utils";

export async function POST(req) {
  const { account_number, pin, bank_name, currency, amount } =
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
  if (!montant || montant <= 0 || !bank_name) {
    return NextResponse.json({ error: "Donnees invalides." }, { status: 400 });
  }

  const balCol = currency === "USD" ? "balance_usd" : "balance_cdf";
  const fee = round2(montant * cfg.bank_atm_withdrawal_fee_rate);
  const totalDebitClient = round2(montant + fee);

  if (client[balCol] < totalDebitClient) {
    return NextResponse.json({ error: "Solde insuffisant." }, { status: 400 });
  }

  const guichet = await getGuichetByBankName(bank_name);
  const code_retrait = generateWithdrawCode();
  const newBalance = round2(client[balCol] - totalDebitClient);

  await runInTransaction(async () => {
    await updateClientBalance(account_number, balCol, newBalance);
    if (guichet) {
      const cantCol = currency === "USD" ? "cantonnement_usd" : "cantonnement_cdf";
      await adjustGuichetCantonnement(guichet.code, cantCol, -totalDebitClient);
    }
    await insertTransaction({
      type: "Retrait Banque",
      client_account: account_number,
      counterparty: bank_name,
      currency,
      amount: -montant,
      fee,
      status: "Reussi",
      details: `Retrait cash au guichet ${bank_name}`,
      code_retrait,
    });
  });

  return NextResponse.json({
    success: true,
    code_retrait,
    message: `Code de retrait genere : ${code_retrait}. Presentez-le au guichetier ${bank_name}. Nouveau solde : ${newBalance} ${currency}.`,
    new_balance: newBalance,
    fee,
  });
}
