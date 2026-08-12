import { NextResponse } from "next/server";
import { guichetCodeExists, insertGuichet } from "@/lib/data";
import { hashPin } from "@/lib/utils";

export async function POST(req) {
  const { bank_name, agence, code, password } = await req.json();

  if (!bank_name || !agence || !code || !password) {
    return NextResponse.json({ error: "Champs manquants." }, { status: 400 });
  }

  if (await guichetCodeExists(code)) {
    return NextResponse.json(
      { error: "Ce code de guichet existe deja." },
      { status: 409 }
    );
  }

  await insertGuichet({
    code,
    bank_name,
    agence,
    password_hash: hashPin(password),
  });

  return NextResponse.json({
    success: true,
    message: `Guichet ${code} enregistre. Statut : Operationnel.`,
  });
}
