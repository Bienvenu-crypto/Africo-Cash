import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { hashPin } from "@/lib/utils";

export async function POST(req) {
  const { account_number, pin } = await req.json();

  const { data: client, error } = await supabase
    .from("clients")
    .select("*")
    .eq("account_number", account_number)
    .single();

  if (error || !client || client.pin_hash !== hashPin(pin)) {
    return NextResponse.json(
      { error: "Numero de compte ou code PIN incorrect." },
      { status: 401 }
    );
  }
  if (client.status !== "Actif") {
    return NextResponse.json(
      { error: "Ce compte est suspendu. Contactez le support." },
      { status: 403 }
    );
  }

  delete client.pin_hash;
  return NextResponse.json({ success: true, client });
}
