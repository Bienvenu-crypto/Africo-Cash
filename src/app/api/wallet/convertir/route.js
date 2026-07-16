import { NextResponse } from "next/server";
import getDb from "@/lib/db";
import { hashPin, getConfig, round2 } from "@/lib/utils";

export async function POST(req) {
  const { account_number, pin, sens, amount } = await req.json();
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
  if (!montant || montant <= 0) {
    return NextResponse.json({ error: "Montant invalide." }, { status: 400 });
  }
  if (!["USD_TO_CDF", "CDF_TO_USD"].includes(sens)) {
    return NextResponse.json({ error: "Sens de conversion invalide." }, { status: 400 });
  }

  let debitCol, creditCol, debitAmount, creditAmount, tauxApplique;

  if (sens === "USD_TO_CDF") {
    debitCol = "balance_usd";
    creditCol = "balance_cdf";
    tauxApplique = cfg.rate_usd_to_cdf;
    debitAmount = montant;
    creditAmount = round2(montant * cfg.rate_usd_to_cdf);
  } else {
    debitCol = "balance_cdf";
    creditCol = "balance_usd";
    tauxApplique = cfg.rate_cdf_to_usd;
    debitAmount = montant;
    creditAmount = round2(montant / cfg.rate_cdf_to_usd);
  }

  if (client[debitCol] < debitAmount) {
    return NextResponse.json({ error: "Solde insuffisant." }, { status: 400 });
  }

  const newDebitBalance = round2(client[debitCol] - debitAmount);
  const newCreditBalance = round2(client[creditCol] + creditAmount);

  const tx = db.transaction(() => {
    db.prepare(
      `UPDATE clients SET ${debitCol} = ?, ${creditCol} = ? WHERE account_number = ?`
    ).run(newDebitBalance, newCreditBalance, account_number);

    db.prepare(
      `INSERT INTO transactions (type, client_account, counterparty, currency, amount, fee, status, details)
       VALUES ('Conversion', ?, ?, ?, ?, 0, 'Reussi', ?)`
    ).run(
      account_number,
      "Africo Cash",
      sens === "USD_TO_CDF" ? "USD->CDF" : "CDF->USD",
      debitAmount,
      `Conversion ${sens === "USD_TO_CDF" ? "USD vers CDF" : "CDF vers USD"} au taux ${tauxApplique}. Credite: ${creditAmount}`
    );
  });
  tx();

  return NextResponse.json({
    success: true,
    message: `Conversion reussie au taux de ${tauxApplique}. Vous recevez ${creditAmount} ${
      sens === "USD_TO_CDF" ? "CDF" : "USD"
    }.`,
    new_balance_usd: sens === "USD_TO_CDF" ? newDebitBalance : newCreditBalance,
    new_balance_cdf: sens === "USD_TO_CDF" ? newCreditBalance : newDebitBalance,
  });
}
