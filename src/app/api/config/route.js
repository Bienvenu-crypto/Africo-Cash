import { NextResponse } from "next/server";
import getDb from "@/lib/db";
import { getConfig } from "@/lib/utils";

export async function GET() {
  const db = getDb();
  return NextResponse.json({ config: getConfig(db) });
}
