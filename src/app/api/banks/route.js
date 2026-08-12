import { NextResponse } from "next/server";
import { getAllBanks } from "@/lib/data";

export async function GET() {
  const banks = await getAllBanks();
  return NextResponse.json({ banks });
}
