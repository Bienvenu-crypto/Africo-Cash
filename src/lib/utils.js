import crypto from "crypto";

export function hashPin(pin) {
  return crypto.createHash("sha256").update(String(pin)).digest("hex");
}

export function generateWithdrawCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function round2(n) {
  return Math.round(n * 100) / 100;
}
