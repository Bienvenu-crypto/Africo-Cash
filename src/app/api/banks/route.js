import { NextResponse } from "next/server";
import getDb from "@/lib/db";

export async function GET() {
  const db = getDb();
  const banks = db.prepare("SELECT * FROM banks ORDER BY name").all();
  return NextResponse.json({ banks });
}
