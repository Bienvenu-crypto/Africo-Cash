import * as sqlite from "./sqlite";
import * as supabase from "./supabase";

export function useSupabase() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}

function pick(asyncName) {
  const syncName = asyncName.replace(/Async$/, "Sync");
  return async (...args) =>
    useSupabase() ? supabase[asyncName](...args) : sqlite[syncName](...args);
}

export const getConfig = pick("getConfigAsync");
export const updateConfig = pick("updateConfigAsync");
export const getClientByAccount = pick("getClientByAccountAsync");
export const getAgentByCode = pick("getAgentByCodeAsync");
export const getGuichetByCode = pick("getGuichetByCodeAsync");
export const getGuichetByBankName = pick("getGuichetByBankNameAsync");
export const getAllGuichets = pick("getAllGuichetsAsync");
export const getAllClients = pick("getAllClientsAsync");
export const getAllAgents = pick("getAllAgentsAsync");
export const getAllBanks = pick("getAllBanksAsync");
export const getTransactionsForAccount = pick("getTransactionsForAccountAsync");
export const getAdminTransactions = pick("getAdminTransactionsAsync");
export const accountNumberExists = pick("accountNumberExistsAsync");
export const agentCodeExists = pick("agentCodeExistsAsync");
export const guichetCodeExists = pick("guichetCodeExistsAsync");
export const insertClient = pick("insertClientAsync");
export const insertAgent = pick("insertAgentAsync");
export const insertGuichet = pick("insertGuichetAsync");
export const insertTransaction = pick("insertTransactionAsync");
export const updateClientBalance = pick("updateClientBalanceAsync");
export const updateClientDualBalance = pick("updateClientDualBalanceAsync");
export const adjustGuichetCantonnement = pick("adjustGuichetCantonnementAsync");

export async function generateAccountNumber() {
  let num;
  do {
    num = String(Math.floor(10000000 + Math.random() * 90000000));
  } while (await accountNumberExists(num));
  return num;
}

export async function generateAgentCode() {
  let code;
  do {
    const n = Math.floor(1000 + Math.random() * 9000);
    code = `AFR-AG-${n}`;
  } while (await agentCodeExists(code));
  return code;
}

export async function runMoneyTransfer(senderAccount, recipientAccount, currency, amount, fee) {
  if (useSupabase()) {
    await supabase.transferFundsAsync(
      senderAccount,
      recipientAccount,
      currency,
      amount,
      fee
    );
    return;
  }

  sqlite.runTransactionSync(() => {
    const sender = sqlite.getClientByAccountSync(senderAccount);
    const recipient = sqlite.getClientByAccountSync(recipientAccount);
    const balCol = currency === "USD" ? "balance_usd" : "balance_cdf";
    const totalDebit = amount + fee;
    sqlite.updateClientBalanceSync(
      senderAccount,
      balCol,
      Math.round((sender[balCol] - totalDebit) * 100) / 100
    );
    sqlite.updateClientBalanceSync(
      recipientAccount,
      balCol,
      Math.round((recipient[balCol] + amount) * 100) / 100
    );
    sqlite.insertTransactionSync({
      type: "Envoi",
      client_account: senderAccount,
      counterparty: recipientAccount,
      currency,
      amount: -amount,
      fee,
      status: "Reussi",
      details: `Envoi vers ${recipientAccount}`,
    });
    sqlite.insertTransactionSync({
      type: "Reception",
      client_account: recipientAccount,
      counterparty: senderAccount,
      currency,
      amount,
      fee: 0,
      status: "Reussi",
      details: `Reception de ${senderAccount}`,
    });
  });
}

export async function runInTransaction(fn) {
  if (useSupabase()) {
    await fn();
    return;
  }
  sqlite.runTransactionSync(fn);
}
