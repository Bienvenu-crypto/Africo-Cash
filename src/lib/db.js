import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = path.join(DATA_DIR, "africocash.db");

let db;

function getDb() {
  if (db) return db;
  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  init(db);
  return db;
}

function init(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY,
      value REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS banks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      short_name TEXT
    );

    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_number TEXT UNIQUE NOT NULL,
      nom TEXT NOT NULL,
      postnom TEXT,
      prenom TEXT NOT NULL,
      province TEXT NOT NULL,
      ville TEXT NOT NULL,
      commune TEXT,
      quartier TEXT,
      avenue TEXT,
      numero_residence TEXT,
      profession TEXT,
      telephone TEXT NOT NULL,
      piece_type TEXT NOT NULL,
      piece_numero TEXT NOT NULL,
      pin_hash TEXT NOT NULL,
      balance_usd REAL NOT NULL DEFAULT 0,
      balance_cdf REAL NOT NULL DEFAULT 0,
      agent_inscripteur TEXT,
      status TEXT NOT NULL DEFAULT 'Actif',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS agents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_code TEXT UNIQUE NOT NULL,
      nom TEXT NOT NULL,
      postnom TEXT,
      prenom TEXT NOT NULL,
      boutique_nom TEXT NOT NULL,
      province TEXT NOT NULL,
      ville TEXT NOT NULL,
      commune TEXT,
      quartier TEXT,
      avenue TEXT,
      numero_boutique TEXT,
      gps_lat REAL,
      gps_lng REAL,
      telephone TEXT NOT NULL,
      piece_type TEXT NOT NULL,
      piece_numero TEXT NOT NULL,
      pin_hash TEXT NOT NULL,
      banque_partenaire TEXT,
      index_cantonnement_usd REAL NOT NULL DEFAULT 0,
      index_cantonnement_cdf REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'Actif',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS guichets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      bank_name TEXT NOT NULL,
      agence TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      cantonnement_usd REAL NOT NULL DEFAULT 250000,
      cantonnement_cdf REAL NOT NULL DEFAULT 500000000,
      status TEXT NOT NULL DEFAULT 'Operationnel',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      client_account TEXT,
      counterparty TEXT,
      currency TEXT NOT NULL,
      amount REAL NOT NULL,
      fee REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'Reussi',
      details TEXT,
      code_retrait TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const count = db.prepare("SELECT COUNT(*) AS c FROM config").get().c;
  if (count === 0) {
    const seed = db.prepare(
      "INSERT INTO config (key, value) VALUES (?, ?)"
    );
    const seedTx = db.transaction((rows) => {
      for (const [k, v] of rows) seed.run(k, v);
    });
    seedTx([
      ["withdrawal_rate", 0.015],
      ["transfer_fee_rate", 0.02],
      ["rate_usd_to_cdf", 2870],
      ["rate_cdf_to_usd", 2900],
      ["mobile_deposit_fee_rate", 0.0],
      ["mobile_withdrawal_fee_rate", 0.01],
      ["bank_atm_withdrawal_fee_rate", 0.015],
      ["bank_deposit_fee_rate", 0.01],
      ["bank_transfer_fee_rate", 0.015],
      ["regideso_fee_rate", 0.01],
      ["electricity_fee_rate", 0.01],
      ["telecom_tv_fee_rate", 0.005],
      ["merchant_fee_rate", 0.0],
      ["payment_fee_rate", 0.01],
    ]);
  }

  const bankCount = db.prepare("SELECT COUNT(*) AS c FROM banks").get().c;
  if (bankCount === 0) {
    const seed = db.prepare(
      "INSERT INTO banks (name, short_name) VALUES (?, ?)"
    );
    const seedTx = db.transaction((rows) => {
      for (const [n, s] of rows) seed.run(n, s);
    });
    seedTx([
      ["Rawbank", "RAW"],
      ["Equity BCDC", "EQ"],
      ["Trust Merchant Bank", "TMB"],
      ["Ecobank", "ECO"],
      ["FBNBank DRC", "FBN"],
    ]);
  }
}

export default getDb;
