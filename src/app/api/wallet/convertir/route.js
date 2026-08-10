import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { hashPin, round2 } from "@/lib/utils";

export async function POST(req) {
  const { account_number, pin, sens, amount } = await req.json();

  // 1. Fetch Client
  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("account_number", account_number)
    .single();

  if (!client) return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });
  if (client.pin_hash !== hashPin(pin)) return NextResponse.json({ error: "Code PIN incorrect." }, { status: 401 });

  const montant = Number(amount);
  if (!montant || montant <= 0) return NextResponse.json({ error: "Montant invalide." }, { status: 400 });
  if (!["USD_TO_CDF", "CDF_TO_USD"].includes(sens)) return NextResponse.json({ error: "Sens de conversion invalide." }, { status: 400 });

  // 2. Fetch config for rates
  const { data: configRows } = await supabase.from("config").select("key, value").in("key", ["rate_usd_to_cdf", "rate_cdf_to_usd"]);
  const cfg = configRows.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {});

  let debitCol, creditCol, debitAmount, creditAmount, tauxApplique;

  if (sens === "USD_TO_CDF") {
    debitCol = "balance_usd";
    creditCol = "balance_cdf";
    tauxApplique = cfg.rate_usd_to_cdf || 2870;
    debitAmount = montant;
    creditAmount = round2(montant * tauxApplique);
  } else {
    debitCol = "balance_cdf";
    creditCol = "balance_usd";
    tauxApplique = cfg.rate_cdf_to_usd || 2900;
    debitAmount = montant;
    creditAmount = round2(montant / tauxApplique);
  }

  if (client[debitCol] < debitAmount) return NextResponse.json({ error: "Solde insuffisant." }, { status: 400 });

  const newDebitBalance = round2(client[debitCol] - debitAmount);
  const newCreditBalance = round2(client[creditCol] + creditAmount);

  // 3. Update Client Balances
  const { error: updateError } = await supabase
    .from("clients")
    .update({ [debitCol]: newDebitBalance, [creditCol]: newCreditBalance })
    .eq("account_number", account_number);

  if (updateError) return NextResponse.json({ error: "Erreur lors de la mise à jour des soldes." }, { status: 500 });

  // 4. Insert Transaction
  await supabase.from("transactions").insert({
    type: "Conversion",
    client_account: account_number,
    counterparty: "Africo Cash",
    currency: sens === "USD_TO_CDF" ? "USD->CDF" : "CDF->USD",
    amount: debitAmount,
    fee: 0,
    status: "Reussi",
    details: `Conversion ${sens === "USD_TO_CDF" ? "USD vers CDF" : "CDF vers USD"} au taux ${tauxApplique}. Credite: ${creditAmount}`,
  });

  return NextResponse.json({
    success: true,
    message: `Conversion reussie au taux de ${tauxApplique}. Vous recevez ${creditAmount} ${sens === "USD_TO_CDF" ? "CDF" : "USD"}.`,
    new_balance_usd: sens === "USD_TO_CDF" ? newDebitBalance : newCreditBalance,
    new_balance_cdf: sens === "USD_TO_CDF" ? newCreditBalance : newDebitBalance,
  });
}
