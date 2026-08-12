import { supabase } from "@/lib/supabase";

function check(error) {
  if (error) throw new Error(error.message);
}

function num(value) {
  return value == null ? value : Number(value);
}

function normalizeClient(row) {
  if (!row) return null;
  return {
    ...row,
    balance_usd: num(row.balance_usd),
    balance_cdf: num(row.balance_cdf),
  };
}

function normalizeGuichet(row) {
  if (!row) return null;
  return {
    ...row,
    cantonnement_usd: num(row.cantonnement_usd),
    cantonnement_cdf: num(row.cantonnement_cdf),
  };
}

export async function getConfigAsync() {
  const { data, error } = await supabase.from("config").select("key, value");
  check(error);
  const cfg = {};
  for (const row of data) cfg[row.key] = num(row.value);
  return cfg;
}

export async function updateConfigAsync(updates) {
  for (const [key, value] of Object.entries(updates)) {
    if (typeof value !== "number") continue;
    const { error } = await supabase.from("config").update({ value }).eq("key", key);
    check(error);
  }
}

export async function getClientByAccountAsync(accountNumber) {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("account_number", accountNumber)
    .maybeSingle();
  check(error);
  return normalizeClient(data);
}

export async function getAgentByCodeAsync(agentCode) {
  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .eq("agent_code", agentCode)
    .maybeSingle();
  check(error);
  return data;
}

export async function getGuichetByCodeAsync(code) {
  const { data, error } = await supabase
    .from("guichets")
    .select("*")
    .eq("code", code)
    .maybeSingle();
  check(error);
  return normalizeGuichet(data);
}

export async function getGuichetByBankNameAsync(bankName) {
  const { data, error } = await supabase
    .from("guichets")
    .select("*")
    .eq("bank_name", bankName)
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle();
  check(error);
  return normalizeGuichet(data);
}

export async function getAllGuichetsAsync() {
  const { data, error } = await supabase.from("guichets").select("*");
  check(error);
  return (data || []).map(normalizeGuichet);
}

export async function getAllClientsAsync() {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });
  check(error);
  return (data || []).map(normalizeClient);
}

export async function getAllAgentsAsync() {
  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .order("created_at", { ascending: false });
  check(error);
  return data || [];
}

export async function getAllBanksAsync() {
  const { data, error } = await supabase.from("banks").select("*").order("name");
  check(error);
  return data || [];
}

export async function getTransactionsForAccountAsync(account, limit = 100) {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("client_account", account)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit);
  check(error);
  return (data || []).map((row) => ({
    ...row,
    amount: num(row.amount),
    fee: num(row.fee),
  }));
}

export async function getAdminTransactionsAsync(dateFrom, dateTo) {
  let query = supabase
    .from("transactions")
    .select("*")
    .order("created_at", { ascending: false });

  if (dateFrom) query = query.gte("created_at", dateFrom);
  if (dateTo) query = query.lte("created_at", `${dateTo}T23:59:59`);

  const [{ data: transactions, error: txError }, { data: clients, error: clientError }] =
    await Promise.all([
      query,
      supabase.from("clients").select("account_number, prenom, postnom, nom"),
    ]);

  check(txError);
  check(clientError);

  const clientByAccount = Object.fromEntries(
    (clients || []).map((c) => [c.account_number, c])
  );

  return (transactions || []).map((tx) => {
    const client = clientByAccount[tx.client_account];
    const clientName = client
      ? `${client.prenom || ""} ${client.postnom || ""} ${client.nom || ""}`.replace(/\s+/g, " ").trim()
      : null;
    return {
      ...tx,
      amount: num(tx.amount),
      fee: num(tx.fee),
      client_name: clientName,
    };
  });
}

export async function accountNumberExistsAsync(accountNumber) {
  const { data, error } = await supabase
    .from("clients")
    .select("id")
    .eq("account_number", accountNumber)
    .maybeSingle();
  check(error);
  return Boolean(data);
}

export async function agentCodeExistsAsync(agentCode) {
  const { data, error } = await supabase
    .from("agents")
    .select("id")
    .eq("agent_code", agentCode)
    .maybeSingle();
  check(error);
  return Boolean(data);
}

export async function guichetCodeExistsAsync(code) {
  const { data, error } = await supabase
    .from("guichets")
    .select("id")
    .eq("code", code)
    .maybeSingle();
  check(error);
  return Boolean(data);
}

export async function insertClientAsync(data) {
  const { error } = await supabase.from("clients").insert({
    ...data,
    balance_usd: 0,
    balance_cdf: 0,
    status: "Actif",
  });
  check(error);
}

export async function insertAgentAsync(data) {
  const { error } = await supabase.from("agents").insert({
    ...data,
    status: "Actif",
  });
  check(error);
}

export async function insertGuichetAsync(data) {
  const { error } = await supabase.from("guichets").insert({
    ...data,
    status: "Operationnel",
  });
  check(error);
}

export async function insertTransactionAsync(data) {
  const { error } = await supabase.from("transactions").insert(data);
  check(error);
}

export async function updateClientBalanceAsync(accountNumber, balCol, newBalance) {
  const { error } = await supabase
    .from("clients")
    .update({ [balCol]: newBalance })
    .eq("account_number", accountNumber);
  check(error);
}

export async function updateClientDualBalanceAsync(
  accountNumber,
  debitCol,
  creditCol,
  debitBalance,
  creditBalance
) {
  const { error } = await supabase
    .from("clients")
    .update({
      [debitCol]: debitBalance,
      [creditCol]: creditBalance,
    })
    .eq("account_number", accountNumber);
  check(error);
}

export async function adjustGuichetCantonnementAsync(code, cantCol, delta) {
  const guichet = await getGuichetByCodeAsync(code);
  if (!guichet) return;
  const { error } = await supabase
    .from("guichets")
    .update({ [cantCol]: guichet[cantCol] + delta })
    .eq("code", code);
  check(error);
}

export async function transferFundsAsync(
  senderAccount,
  recipientAccount,
  currency,
  amount,
  fee
) {
  const { error } = await supabase.rpc("transfer_funds", {
    sender_account: senderAccount,
    recipient_account: recipientAccount,
    tx_currency: currency,
    tx_amount: amount,
    tx_fee: fee,
  });
  check(error);
}
