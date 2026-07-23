import { NextResponse } from "next/server";
import getDb from "@/lib/db";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const dateFrom = searchParams.get("from");
  const dateTo = searchParams.get("to");

  const db = getDb();

  try {
    let query = "SELECT * FROM transactions";
    const params = [];

    if (dateFrom && dateTo) {
      query += " WHERE created_at >= ? AND created_at <= ?";
      params.push(dateFrom, dateTo + " 23:59:59");
    } else if (dateFrom) {
      query += " WHERE created_at >= ?";
      params.push(dateFrom);
    } else if (dateTo) {
      query += " WHERE created_at <= ?";
      params.push(dateTo + " 23:59:59");
    }

    query += " ORDER BY created_at DESC";

    const transactions = db.prepare(query).all(...params);
    return NextResponse.json({ transactions });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
