import { NextResponse } from "next/server";
import { getGuichetByCode } from "@/lib/data";
import { hashPin } from "@/lib/utils";

export async function POST(req) {
  const { code, password } = await req.json();

  const guichet = await getGuichetByCode(code);

  if (!guichet || guichet.password_hash !== hashPin(password)) {
    return NextResponse.json(
      { error: "Code de guichet ou mot de passe incorrect." },
      { status: 401 }
    );
  }

  delete guichet.password_hash;
  return NextResponse.json({ success: true, guichet });
}
