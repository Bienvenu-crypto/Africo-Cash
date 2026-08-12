import { NextResponse } from "next/server";
import { getAdminTransactions } from "@/lib/data";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const dateFrom = searchParams.get("from");
  const dateTo = searchParams.get("to");

  try {
    const transactions = await getAdminTransactions(dateFrom, dateTo);
    return NextResponse.json({ transactions });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
