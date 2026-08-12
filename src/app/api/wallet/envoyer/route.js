import { NextResponse } from "next/server";
import {
  getClientByAccount,
  getConfig,
  runMoneyTransfer,
} from "@/lib/data";
import { hashPin, round2 } from "@/lib/utils";

export async function POST(req) {
  const { account_number, pin, currency, amount, destination_account } =
    await req.json();

  if (destination_account === account_number) {
    return NextResponse.json(
      { error: "Vous ne pouvez pas vous envoyer de l'argent a vous-meme." },
      { status: 400 }
    );
  }

  const cfg = await getConfig();

  const sender = await getClientByAccount(account_number);

  if (!sender) {
    return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });
  }
  if (sender.pin_hash !== hashPin(pin)) {
    return NextResponse.json({ error: "Code PIN incorrect." }, { status: 401 });
  }

  const recipient = await getClientByAccount(destination_account);

  if (!recipient) {
    return NextResponse.json(
      { error: "Numero Africo Cash du destinataire introuvable." },
      { status: 404 }
    );
  }

  if (!["USD", "CDF"].includes(currency)) {
    return NextResponse.json({ error: "Devise invalide." }, { status: 400 });
  }
  const montant = Number(amount);
  if (!montant || montant <= 0) {
    return NextResponse.json({ error: "Montant invalide." }, { status: 400 });
  }

  const fee = round2(montant * cfg.transfer_fee_rate);
  const totalDebit = round2(montant + fee);
  const balCol = currency === "USD" ? "balance_usd" : "balance_cdf";

  if (sender[balCol] < totalDebit) {
    return NextResponse.json({ error: "Solde insuffisant." }, { status: 400 });
  }

  const senderNewBalance = round2(sender[balCol] - totalDebit);

  await runMoneyTransfer(
    account_number,
    destination_account,
    currency,
    montant,
    fee
  );

  return NextResponse.json({
    success: true,
    message: `Envoi reussi. Montant: ${montant} ${currency}, Frais: ${fee} ${currency}. Nouveau solde: ${senderNewBalance} ${currency}.`,
    new_balance: senderNewBalance,
    fee,
  });
}
