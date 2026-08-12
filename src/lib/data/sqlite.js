import getDb from "@/lib/db";

function db() {
  return getDb();
}

export function getConfigSync() {
  const rows = db().prepare("SELECT key, value FROM config").all();
  const cfg = {};
  for (const r of rows) cfg[r.key] = r.value;
  return cfg;
}

export function updateConfigSync(updates) {
  const stmt = db().prepare("UPDATE config SET value = ? WHERE key = ?");
  db().transaction((updatesObj) => {
    for (const [k, v] of Object.entries(updatesObj)) {
      if (typeof v === "number") stmt.run(v, k);
    }
  })(updates);
}

export function getClientByAccountSync(accountNumber) {
  return db().prepare("SELECT * FROM clients WHERE account_number = ?").get(accountNumber) || null;
}

export function getAgentByCodeSync(agentCode) {
  return db().prepare("SELECT * FROM agents WHERE agent_code = ?").get(agentCode) || null;
}

export function getGuichetByCodeSync(code) {
  return db().prepare("SELECT * FROM guichets WHERE code = ?").get(code) || null;
}

export function getGuichetByBankNameSync(bankName) {
  return db().prepare("SELECT * FROM guichets WHERE bank_name = ? ORDER BY id LIMIT 1").get(bankName) || null;
}

export function getAllGuichetsSync() {
  return db().prepare("SELECT * FROM guichets").all();
}

export function getAllClientsSync() {
  return db().prepare("SELECT * FROM clients ORDER BY created_at DESC").all();
}

export function getAllAgentsSync() {
  return db().prepare("SELECT * FROM agents ORDER BY created_at DESC").all();
}

export function getAllBanksSync() {
  return db().prepare("SELECT * FROM banks ORDER BY name").all();
}

export function getTransactionsForAccountSync(account, limit = 20) {
  return db()
    .prepare(
      `SELECT * FROM transactions
       WHERE client_account = ?
       ORDER BY created_at DESC, id DESC
       LIMIT ?`
    )
    .all(account, limit);
}

export function getAdminTransactionsSync(dateFrom, dateTo) {
  let query = `SELECT t.*, c.prenom || ' ' || COALESCE(c.postnom, '') || ' ' || c.nom AS client_name
    FROM transactions t
    LEFT JOIN clients c ON t.client_account = c.account_number`;
  const params = [];

  if (dateFrom && dateTo) {
    query += " WHERE t.created_at >= ? AND t.created_at <= ?";
    params.push(dateFrom, `${dateTo} 23:59:59`);
  } else if (dateFrom) {
    query += " WHERE t.created_at >= ?";
    params.push(dateFrom);
  } else if (dateTo) {
    query += " WHERE t.created_at <= ?";
    params.push(`${dateTo} 23:59:59`);
  }

  query += " ORDER BY t.created_at DESC";
  return db().prepare(query).all(...params);
}

export function accountNumberExistsSync(accountNumber) {
  return Boolean(
    db().prepare("SELECT 1 FROM clients WHERE account_number = ?").get(accountNumber)
  );
}

export function agentCodeExistsSync(agentCode) {
  return Boolean(
    db().prepare("SELECT 1 FROM agents WHERE agent_code = ?").get(agentCode)
  );
}

export function guichetCodeExistsSync(code) {
  return Boolean(db().prepare("SELECT 1 FROM guichets WHERE code = ?").get(code));
}

export function insertClientSync(data) {
  db().prepare(`
    INSERT INTO clients
      (account_number, nom, postnom, prenom, province, ville, commune, quartier, avenue,
       numero_residence, profession, telephone, piece_type, piece_numero, pin_hash,
       balance_usd, balance_cdf, agent_inscripteur, status)
    VALUES (@account_number, @nom, @postnom, @prenom, @province, @ville, @commune, @quartier, @avenue,
       @numero_residence, @profession, @telephone, @piece_type, @piece_numero, @pin_hash,
       0, 0, @agent_inscripteur, 'Actif')
  `).run(data);
}

export function insertAgentSync(data) {
  db().prepare(`
    INSERT INTO agents
      (agent_code, nom, postnom, prenom, boutique_nom, province, ville, commune, quartier,
       avenue, numero_boutique, gps_lat, gps_lng, telephone, piece_type, piece_numero,
       pin_hash, banque_partenaire, status)
    VALUES (@agent_code, @nom, @postnom, @prenom, @boutique_nom, @province, @ville, @commune, @quartier,
       @avenue, @numero_boutique, @gps_lat, @gps_lng, @telephone, @piece_type, @piece_numero,
       @pin_hash, @banque_partenaire, 'Actif')
  `).run(data);
}

export function insertGuichetSync(data) {
  db().prepare(
    `INSERT INTO guichets (code, bank_name, agence, password_hash, status)
     VALUES (@code, @bank_name, @agence, @password_hash, 'Operationnel')`
  ).run(data);
}

export function insertTransactionSync(data) {
  db().prepare(
    `INSERT INTO transactions (type, client_account, counterparty, currency, amount, fee, status, details, code_retrait)
     VALUES (@type, @client_account, @counterparty, @currency, @amount, @fee, @status, @details, @code_retrait)`
  ).run({
    code_retrait: null,
    ...data,
  });
}

export function updateClientBalanceSync(accountNumber, balCol, newBalance) {
  db().prepare(`UPDATE clients SET ${balCol} = ? WHERE account_number = ?`).run(
    newBalance,
    accountNumber
  );
}

export function updateClientDualBalanceSync(
  accountNumber,
  debitCol,
  creditCol,
  debitBalance,
  creditBalance
) {
  db().prepare(
    `UPDATE clients SET ${debitCol} = ?, ${creditCol} = ? WHERE account_number = ?`
  ).run(debitBalance, creditBalance, accountNumber);
}

export function adjustGuichetCantonnementSync(code, cantCol, delta) {
  db().prepare(`UPDATE guichets SET ${cantCol} = ${cantCol} + ? WHERE code = ?`).run(delta, code);
}

export function runTransactionSync(fn) {
  const tx = db().transaction(fn);
  tx();
}
