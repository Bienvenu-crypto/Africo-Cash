import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
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

  // 1. Fetch config (transfer_fee_rate)
  const { data: configRows } = await supabase.from("config").select("key, value").eq("key", "transfer_fee_rate");
  const transferFeeRate = configRows?.[0]?.value || 0.02;

  // 2. Fetch sender
  const { data: sender } = await supabase
    .from("clients")
    .select("*")
    .eq("account_number", account_number)
    .single();

  if (!sender) return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });
  if (sender.pin_hash !== hashPin(pin)) return NextResponse.json({ error: "Code PIN incorrect." }, { status: 401 });

  // 3. Fetch recipient
  const { data: recipient } = await supabase
    .from("clients")
    .select("*")
    .eq("account_number", destination_account)
    .single();

  if (!recipient) {
    return NextResponse.json(
      { error: "Numero Africo Cash du destinataire introuvable." },
      { status: 404 }
    );
  }

  if (!["USD", "CDF"].includes(currency)) return NextResponse.json({ error: "Devise invalide." }, { status: 400 });
  const montant = Number(amount);
  if (!montant || montant <= 0) return NextResponse.json({ error: "Montant invalide." }, { status: 400 });

  const fee = round2(montant * transferFeeRate);
  
  // 4. Execute RPC Transaction
  const { error: rpcError } = await supabase.rpc('transfer_funds', {
    sender_account: account_number,
    recipient_account: destination_account,
    tx_currency: currency,
    tx_amount: montant,
    tx_fee: fee
  });

  if (rpcError) {
    return NextResponse.json({ error: rpcError.message || "Erreur lors de la transaction." }, { status: 400 });
  }

  const totalDebit = round2(montant + fee);
  const balCol = currency === "USD" ? "balance_usd" : "balance_cdf";
  const senderNewBalance = round2(sender[balCol] - totalDebit);

  return NextResponse.json({
    success: true,
    message: `Envoi reussi. Montant: ${montant} ${currency}, Frais: ${fee} ${currency}. Nouveau solde: ${senderNewBalance} ${currency}.`,
    new_balance: senderNewBalance,
    fee,
  });
}
