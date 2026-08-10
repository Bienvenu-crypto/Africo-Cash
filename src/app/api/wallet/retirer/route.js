import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { hashPin, round2 } from "@/lib/utils";

export async function POST(req) {
  const { account_number, pin, currency, amount, agent_code } =
    await req.json();

  // 1. Fetch client
  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("account_number", account_number)
    .single();

  if (!client) return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });
  if (client.pin_hash !== hashPin(pin)) return NextResponse.json({ error: "Code PIN incorrect." }, { status: 401 });
  if (!["USD", "CDF"].includes(currency)) return NextResponse.json({ error: "Devise invalide." }, { status: 400 });

  const montant = Number(amount);
  if (!montant || montant <= 0) return NextResponse.json({ error: "Montant invalide." }, { status: 400 });

  // 2. Fetch agent
  const { data: agent } = await supabase
    .from("agents")
    .select("*")
    .eq("agent_code", agent_code)
    .single();

  if (!agent) return NextResponse.json({ error: "Code agent introuvable." }, { status: 404 });

  // 3. Fetch config
  const { data: configRows } = await supabase.from("config").select("key, value").eq("key", "withdrawal_rate");
  const withdrawalRate = configRows?.[0]?.value || 0.015;

  const fee = round2(montant * withdrawalRate);
  const totalDebit = round2(montant + fee);
  const balCol = currency === "USD" ? "balance_usd" : "balance_cdf";

  if (client[balCol] < totalDebit) {
    return NextResponse.json({ error: "Solde insuffisant." }, { status: 400 });
  }

  const newBalance = round2(client[balCol] - totalDebit);

  // 4. Update Client Balance
  const { error: updateError } = await supabase
    .from("clients")
    .update({ [balCol]: newBalance })
    .eq("account_number", account_number);

  if (updateError) return NextResponse.json({ error: "Erreur lors de la mise à jour du solde." }, { status: 500 });

  // 5. Insert Transaction
  await supabase.from("transactions").insert({
    type: "Retrait",
    client_account: account_number,
    counterparty: agent_code,
    currency,
    amount: -montant,
    fee,
    status: "Reussi",
    details: `Retrait via agent ${agent_code} (${agent.boutique_nom})`,
  });

  return NextResponse.json({
    success: true,
    message: `Retrait effectue. Montant: ${montant} ${currency}, Frais: ${fee} ${currency}. Nouveau solde: ${newBalance} ${currency}.`,
    new_balance: newBalance,
    fee,
  });
}
