import crypto from "crypto";

export function hashPin(pin) {
  return crypto.createHash("sha256").update(String(pin)).digest("hex");
}

export function generateAccountNumber(db) {
  let num;
  let exists = true;
  while (exists) {
    num = String(Math.floor(10000000 + Math.random() * 90000000));
    exists = db
      .prepare("SELECT 1 FROM clients WHERE account_number = ?")
      .get(num);
  }
  return num;
}

export function generateAgentCode(db) {
  let code;
  let exists = true;
  while (exists) {
    const n = Math.floor(1000 + Math.random() * 9000);
    code = `AFR-AG-${n}`;
    exists = db.prepare("SELECT 1 FROM agents WHERE agent_code = ?").get(code);
  }
  return code;
}

export function generateWithdrawCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function getConfig(db) {
  const rows = db.prepare("SELECT key, value FROM config").all();
  const cfg = {};
  for (const r of rows) cfg[r.key] = r.value;
  return cfg;
}

export function round2(n) {
  return Math.round(n * 100) / 100;
}
