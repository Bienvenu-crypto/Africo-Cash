import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req, { params }) {
  const { account } = await params;

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("*")
    .eq("account_number", account)
    .single();

  if (clientError || !client) {
    return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });
  }
  delete client.pin_hash;

  const { data: transactions, error: txError } = await supabase
    .from("transactions")
    .select("*")
    .eq("client_account", account)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(20);

  return NextResponse.json({ client, transactions: transactions || [] });
}
