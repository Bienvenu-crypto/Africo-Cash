/**
 * Restores local SQLite data into Supabase.
 * Usage: node --env-file=.env.local scripts/restore-to-supabase.js
 */
import Database from "better-sqlite3";
import { createClient } from "@supabase/supabase-js";
import path from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const dbPath = path.join(process.cwd(), "data", "africocash.db");
const sqlite = new Database(dbPath);

function omit(obj, keys) {
  const out = { ...obj };
  for (const key of keys) delete out[key];
  return out;
}

async function upsert(table, rows, onConflict) {
  if (!rows.length) return;
  const { error } = await supabase.from(table).upsert(rows, { onConflict });
  if (error) throw new Error(`${table}: ${error.message}`);
  console.log(`  ${table}: ${rows.length} row(s)`);
}

async function insert(table, rows) {
  if (!rows.length) return;
  const { error } = await supabase.from(table).insert(rows);
  if (error) throw new Error(`${table}: ${error.message}`);
  console.log(`  ${table}: ${rows.length} row(s)`);
}

async function main() {
  console.log("Reading from SQLite:", dbPath);

  const clients = sqlite.prepare("SELECT * FROM clients").all().map((row) =>
    omit(row, ["id"])
  );
  const agents = sqlite.prepare("SELECT * FROM agents").all().map((row) =>
    omit(row, ["id"])
  );
  const guichets = sqlite.prepare("SELECT * FROM guichets").all().map((row) =>
    omit(row, ["id"])
  );
  const transactions = sqlite.prepare("SELECT * FROM transactions").all().map((row) =>
    omit(row, ["id"])
  );
  const config = sqlite.prepare("SELECT * FROM config").all();
  const banks = sqlite.prepare("SELECT * FROM banks").all().map((row) =>
    omit(row, ["id"])
  );

  console.log("Restoring to Supabase...");
  await upsert("banks", banks, "name");
  await upsert("config", config, "key");
  await upsert("clients", clients, "account_number");
  await upsert("agents", agents, "agent_code");
  await upsert("guichets", guichets, "code");

  const { count, error: countError } = await supabase
    .from("transactions")
    .select("*", { count: "exact", head: true });
  if (countError) throw new Error(`transactions count: ${countError.message}`);

  if ((count || 0) === 0) {
    await insert("transactions", transactions);
  } else {
    console.log(`  transactions: skipped (${count} already exist)`);
  }

  console.log("Done.");
  console.log({
    clients: clients.length,
    agents: agents.length,
    guichets: guichets.length,
    transactions: transactions.length,
    config: config.length,
    banks: banks.length,
  });
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
