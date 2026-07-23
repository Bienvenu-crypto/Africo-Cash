import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { password } = await req.json();
    // Use a hardcoded password for now as agreed
    if (password === "admin123") {
      return NextResponse.json({ success: true, token: "admin-token-xyz" });
    }
    return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
