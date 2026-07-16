import { NextResponse } from "next/server";
import getDb from "@/lib/db";
import { hashPin, getConfig, round2 } from "@/lib/utils";

export async function POST(req) {
  const { account_number, pin, currency, amount, destination_account } =
    await req.json();
  const db = getDb();
  const cfg = getConfig(db);

  if (destination_account === account_number) {
    return NextResponse.json(
      { error: "Vous ne pouvez pas vous envoyer de l'argent a vous-meme." },
      { status: 400 }
    );
  }

  const sender = db
    .prepare("SELECT * FROM clients WHERE account_number = ?")
    .get(account_number);
  if (!sender) {
    return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });
  }
  if (sender.pin_hash !== hashPin(pin)) {
    return NextResponse.json({ error: "Code PIN incorrect." }, { status: 401 });
  }
  const recipient = db
    .prepare("SELECT * FROM clients WHERE account_number = ?")
    .get(destination_account);
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

  const balCol = currency === "USD" ? "balance_usd" : "balance_cdf";
  const fee = round2(montant * cfg.transfer_fee_rate);
  const totalDebit = round2(montant + fee);

  if (sender[balCol] < totalDebit) {
    return NextResponse.json({ error: "Solde insuffisant." }, { status: 400 });
  }

  const senderNewBalance = round2(sender[balCol] - totalDebit);
  const recipientNewBalance = round2(recipient[balCol] + montant);

  const tx = db.transaction(() => {
    db.prepare(`UPDATE clients SET ${balCol} = ? WHERE account_number = ?`).run(
      senderNewBalance,
      account_number
    );
    db.prepare(`UPDATE clients SET ${balCol} = ? WHERE account_number = ?`).run(
      recipientNewBalance,
      destination_account
    );
    db.prepare(
      `INSERT INTO transactions (type, client_account, counterparty, currency, amount, fee, status, details)
       VALUES ('Envoi', ?, ?, ?, ?, ?, 'Reussi', ?)`
    ).run(
      account_number,
      destination_account,
      currency,
      -montant,
      fee,
      `Envoi vers ${destination_account}`
    );
    db.prepare(
      `INSERT INTO transactions (type, client_account, counterparty, currency, amount, fee, status, details)
       VALUES ('Reception', ?, ?, ?, ?, 0, 'Reussi', ?)`
    ).run(
      destination_account,
      account_number,
      currency,
      montant,
      `Reception depuis ${account_number}`
    );
  });
  tx();

  return NextResponse.json({
    success: true,
    message: `Envoi reussi. Montant: ${montant} ${currency}, Frais: ${fee} ${currency}. Nouveau solde: ${senderNewBalance} ${currency}.`,
    new_balance: senderNewBalance,
    fee,
  });
}
