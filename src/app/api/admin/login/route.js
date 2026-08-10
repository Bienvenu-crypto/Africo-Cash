import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { password } = await req.json();
    // Use environment variable for admin password, fallback to default if not set
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    if (password === adminPassword) {
      return NextResponse.json({ success: true, token: "admin-token-xyz" });
    }
    return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
