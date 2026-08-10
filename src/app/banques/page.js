"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Field, inputClass, PrimaryButton, Alert, Card, Modal, SectionHeading } from "@/components/ui";

const BANKS = [
  { name: "Rawbank", logo: "/images/banks/rawbank.jpg" },
  { name: "Equity BCDC", logo: "/images/banks/equity.jpg" },
  { name: "Trust Merchant Bank", logo: "/images/banks/tmb.jpg" },
  { name: "Ecobank", logo: "/images/banks/ecobank.jpg" },
  { name: "FBNBank DRC", logo: "/images/banks/fbn.jpg" }
];

const ACTIONS = [
  { key: "retirer-cash", label: "Retirer le cash", color: "bg-slate-600/90 hover:bg-green-500" },
  { key: "banque-vers-africo", label: "Banque vers Africo", color: "bg-blue-600/90 hover:bg-green-500" },
  { key: "africo-vers-banque", label: "Africo vers banque", color: "bg-emerald-600/90 hover:bg-emerald-600" },
];

export default function BanquesPage() {
  const [modal, setModal] = useState(null); // { bank, action }
  const [accountNumber, setAccountNumber] = useState("");
  const [notice, setNotice] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [visibleCount, setVisibleCount] = useState(5);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    async function fetchHistory() {
      if (!accountNumber || accountNumber.length < 8) {
        setTransactions([]);
        return;
      }
      try {
        const res = await fetch(`/api/wallet/${accountNumber}`);
        if (res.ok) {
          const data = await res.json();
          const bankTxs = (data.transactions || []).filter(
            (tx) => tx.type === "Retrait Banque" || tx.type === "Africo vers Banque" || tx.type === "Banque vers Africo"
          );
          setTransactions(bankTxs);
        } else {
          setTransactions([]);
        }
      } catch (e) {
        setTransactions([]);
      }
    }
    if (showHistory) {
      fetchHistory();
    }
  }, [accountNumber, refreshCounter, showHistory]);

  const getBankColor = (bank) => {
    if (bank?.includes("Rawbank")) return "text-blue-900";
    if (bank?.includes("Equity")) return "text-red-700";
    if (bank?.includes("TMB") || bank?.includes("Trust")) return "text-blue-800";
    if (bank?.includes("Ecobank")) return "text-blue-900";
    if (bank?.includes("FBNBank")) return "text-blue-900";
    return "text-blue-900";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR");
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-16 lg:px-8">
      <SectionHeading
        center
        title="Interopérabilité directe avec vos comptes bancaires"
        subtitle="Rawbank, Equity BCDC, Trust Merchant Bank, Ecobank et FBNBank DRC connectées à votre portefeuille Africo Cash."
      />

      {notice && (
        <div className="mb-8 max-w-md">
          <Alert type="success">{notice}</Alert>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {BANKS.map((bank) => (
          <Card key={bank.name}>
            <div className="mb-4 flex h-16 items-center justify-center rounded bg-white p-2">
              <Image src={bank.logo} alt={bank.name} width={120} height={48} className="max-h-full w-auto object-contain" />
            </div>
            <h3 className="font-bold">{bank.name}</h3>
            <div className="mt-4 flex flex-col gap-2">
              {ACTIONS.map((a) => (
                <button
                  key={a.key}
                  onClick={() => setModal({ bank: bank.name, action: a.key })}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold text-white ${a.color}`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-12">
        <div className="flex justify-center mb-4">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-xl font-bold text-blue-900 hover:text-blue-700 transition-colors bg-white px-6 py-2 rounded-lg shadow-sm"
          >
            Historique des Transactions {showHistory ? "▾" : "▸"}
          </button>
        </div>

        {showHistory && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden p-4">
          <div className="mb-6 max-w-sm mx-auto">
            <label className="block">
              <span className="mb-1.5 block text-sm font-bold text-blue-900">
                Votre numéro Africo Cash (8 chiffres)
              </span>
              <input autoComplete="off"
                className="w-full rounded-lg border border-blue-200 bg-gray-50 px-3.5 py-2.5 outline-none ring-blue-500 focus:ring-2 focus:border-blue-500 font-bold text-lg transition"
                style={{ color: "#2563eb" }}
                inputMode="numeric"
                maxLength={8}
                placeholder="48291054"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
              />
            </label>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-center">
              <thead>
                <tr className="border-b border-gray-200 text-blue-900 font-bold">
                  <th className="pb-3 pt-2">Date</th>
                  <th className="pb-3 pt-2">Banque</th>
                  <th className="pb-3 pt-2">Type</th>
                  <th className="pb-3 pt-2">Montant</th>
                  <th className="pb-3 pt-2">Statut</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-6 text-gray-500">
                      {accountNumber.length < 8 ? "Veuillez entrer votre numéro Africo Cash (8 chiffres) pour voir l'historique." : "Aucune transaction trouvée."}
                    </td>
                  </tr>
                ) : (
                  transactions.slice(0, visibleCount).map((tx) => {
                    let typeLabel = tx.type;
                    if (tx.type === "Banque vers Africo") typeLabel = "Dépôt vers Africo Cash";
                    if (tx.type === "Retrait Banque") typeLabel = "Retrait cash";
                    if (tx.type === "Africo vers Banque") typeLabel = "Africo Cash → Banque";

                    const isPositive = tx.amount > 0;

                    return (
                      <tr key={tx.id} className="border-b border-gray-100 last:border-0 font-medium">
                        <td className="py-3 text-blue-900">{formatDate(tx.created_at)}</td>
                        <td className={`py-3 font-bold ${getBankColor(tx.counterparty)}`}>{tx.counterparty.split(" - ")[0]}</td>
                        <td className="py-3 text-blue-900">{typeLabel}</td>
                        <td className={`py-3 font-bold ${isPositive ? "text-green-600" : "text-red-600"}`}>
                          {isPositive ? "+" : ""}{tx.amount} {tx.currency}
                        </td>
                        <td className={`py-3 ${tx.status === "Reussi" ? "text-green-600" : "text-orange-500"}`}>
                          <span className="flex items-center justify-center gap-1">
                            {tx.status === "Reussi" ? "✅" : "⏳"} {tx.status === "Reussi" ? "Réussi" : tx.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {transactions.length > 0 && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setVisibleCount(c => c + 5)}
                className="bg-white border border-blue-200 text-blue-900 font-bold rounded-full px-6 py-1 hover:bg-gray-50 shadow-sm"
              >
                Voir Plus ▾
              </button>
            </div>
          )}
        </div>
        )}
      </div>

      <BankModal
        modal={modal}
        accountNumber={accountNumber}
        setAccountNumber={setAccountNumber}
        onClose={() => setModal(null)}
        onDone={(msg) => {
          setNotice(msg);
          setModal(null);
          setRefreshCounter(c => c + 1);
          setTimeout(() => setNotice(""), 6000);
        }}
      />
    </div>
  );
}

const TITLES = {
  "retirer-cash": (bank) => `Retirer le cash — ${bank}`,
  "banque-vers-africo": (bank) => `Banque vers Africo — ${bank}`,
  "africo-vers-banque": (bank) => `Africo vers banque — ${bank}`,
};

function BankModal({ modal, accountNumber, setAccountNumber, onClose, onDone }) {
  const [currency, setCurrency] = useState("USD");
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState(null);

  if (!modal) return null;
  const { bank, action } = modal;
  const needsBankAccount = action !== "retirer-cash";
  const needsPin = action !== "banque-vers-africo";

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!accountNumber) {
      setError("Renseignez d'abord votre numéro Africo Cash ci-dessus.");
      return;
    }
    setLoading(true);
    try {
      const body = { account_number: accountNumber, bank_name: bank, currency, amount };
      if (needsPin) body.pin = pin;
      if (needsBankAccount) body.bank_account_number = bankAccountNumber;
      const res = await fetch(`/api/banks/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.code_retrait) {
        setCode(data.code_retrait);
      } else {
        onDone(data.message);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={!!modal} onClose={onClose} title={TITLES[action](bank)}>
      {code ? (
        <div className="text-center">
          <p className="text-sm text-gray-600">Présentez ce code au guichetier {bank} pour recevoir votre cash :</p>
          <p className="mt-4 text-4xl font-bold tracking-widest text-blue-600">{code}</p>
          <PrimaryButton className="mt-6 w-full" onClick={() => onDone(`Code de retrait généré : ${code}`)}>
            Fermer
          </PrimaryButton>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Field label="Votre numéro Africo Cash (8 chiffres)">
            <input autoComplete="off"
              className={`${inputClass} !font-bold !text-lg tracking-wider`}
              style={{ color: "#60a5fa" }}
              inputMode="numeric"
              maxLength={8}
              placeholder="48291054"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
            />
          </Field>
          {needsBankAccount && (
            <Field label="Numéro de compte bancaire">
              <input autoComplete="off" className={inputClass} value={bankAccountNumber} onChange={(e) => setBankAccountNumber(e.target.value)} />
            </Field>
          )}
          <Field label="Devise">
            <select className={inputClass} value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option value="USD">USD</option>
              <option value="CDF">CDF</option>
            </select>
          </Field>
          <Field label="Montant">
            <input autoComplete="off" className={inputClass} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </Field>
          {needsPin && (
            <Field label="Code PIN Africo Cash">
              <input autoComplete="off" className={inputClass} type="password" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} />
            </Field>
          )}
          <Alert type="error">{error}</Alert>
          <PrimaryButton type="submit" className="w-full" disabled={loading}>
            {loading ? "Traitement…" : "Valider"}
          </PrimaryButton>
        </form>
      )}
    </Modal>
  );
}
