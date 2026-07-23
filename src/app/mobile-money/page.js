"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Field, inputClass, PrimaryButton, Alert, Card, Modal, SectionHeading } from "@/components/ui";

const OPERATORS = [
  { key: "Airtel Money", color: "border-red-400/40", image: "/images/operators/airtel.jpg", btnDeposit: "bg-[#e3000f]", btnWithdraw: "bg-[#0047a0]", name: "Airtel" },
  { key: "Vodacom M-Pesa", color: "border-red-500/40", image: "/images/operators/vodacom.jpg", btnDeposit: "bg-[#e60000]", btnWithdraw: "bg-[#0047a0]", name: "Vodacom" },
  { key: "Orange Money", color: "border-orange-400/40", image: "/images/operators/orange.jpg", btnDeposit: "bg-[#ff7900]", btnWithdraw: "bg-[#0047a0]", name: "Orange" },
  { key: "Africell Money", color: "border-fuchsia-400/40", image: "/images/operators/africell.jpg", btnDeposit: "bg-[#8b0e8b]", btnWithdraw: "bg-[#0047a0]", name: "Africell" },
];

export default function MobileMoneyPage() {
  const [modal, setModal] = useState(null); // { operator, direction }
  const [accountNumber, setAccountNumber] = useState("");
  const [notice, setNotice] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    async function fetchHistory() {
      if (!accountNumber) {
        setTransactions([]);
        return;
      }
      try {
        const res = await fetch(`/api/wallet/${accountNumber}`);
        if (res.ok) {
          const data = await res.json();
          const mobileMoneyTxs = (data.transactions || []).filter(
            (tx) => tx.type === "Depot Mobile Money" || tx.type === "Retrait Mobile Money"
          );
          setTransactions(mobileMoneyTxs);
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
  }, [showHistory, accountNumber]);

  const getOperatorColor = (operator) => {
    if (operator?.includes("Airtel")) return "text-red-600";
    if (operator?.includes("Vodacom")) return "text-red-600";
    if (operator?.includes("Orange")) return "text-orange-600";
    if (operator?.includes("Africell")) return "text-purple-600";
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
        title="Rechargez ou videz votre solde Africo Cash"
        subtitle="Interopérabilité directe avec Airtel Money, Vodacom M-Pesa, Orange Money et Africell Money."
      />

      <Card className="mb-8 max-w-md">
        <Field label="Votre numéro Africo Cash (8 chiffres)">
          <input
            className={inputClass}
            inputMode="numeric"
            maxLength={8}
            placeholder="48291054"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
          />
        </Field>
        <p className="mt-2 text-xs text-white/50">Requis pour effectuer une opération ci-dessous.</p>
      </Card>

      {notice && (
        <div className="mb-8 max-w-md">
          <Alert type="success">{notice}</Alert>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {OPERATORS.map((op) => (
          <Card key={op.key} className="bg-white border-0 shadow-sm p-4 flex flex-col items-center">
            <div className="h-24 w-full relative mb-2">
              <Image src={op.image} alt={op.key} fill className="object-contain" />
            </div>
            <div className="mt-4 flex w-full flex-col gap-2">
              <button
                onClick={() => setModal({ operator: op.key, direction: "deposit" })}
                className={`w-full rounded-md ${op.btnDeposit} px-2 py-2 text-sm font-semibold text-white hover:opacity-90 leading-tight`}
              >
                {op.name} vers<br />Africo Cash
              </button>
              <button
                onClick={() => setModal({ operator: op.key, direction: "withdraw" })}
                className={`w-full rounded-md ${op.btnWithdraw} px-2 py-2 text-sm font-semibold text-white hover:opacity-90 leading-tight`}
              >
                Africo Cash<br />vers {op.name}
              </button>
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
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-center">
                <thead>
                  <tr className="border-b border-gray-200 text-blue-900 font-bold">
                    <th className="pb-3 pt-2">Date</th>
                    <th className="pb-3 pt-2">Opérateur</th>
                    <th className="pb-3 pt-2">Type</th>
                    <th className="pb-3 pt-2">Montant</th>
                    <th className="pb-3 pt-2">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-6 text-gray-500">
                        {!accountNumber ? "Veuillez entrer votre numéro Africo Cash pour voir l'historique." : "Aucune transaction trouvée."}
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-gray-100 last:border-0 font-medium">
                        <td className="py-3 text-blue-900">{formatDate(tx.created_at)}</td>
                        <td className={`py-3 font-bold ${getOperatorColor(tx.counterparty)}`}>{tx.counterparty}</td>
                        <td className="py-3 text-blue-900">
                          {tx.type === "Depot Mobile Money" ? "Dépôt vers Africo Cash" : `Africo Cash → ${tx.counterparty}`}
                        </td>
                        <td className={`py-3 font-bold ${tx.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                          {tx.amount > 0 ? "+" : ""}{tx.amount} {tx.currency}
                        </td>
                        <td className={`py-3 ${tx.status === "Reussi" ? "text-green-600" : "text-orange-500"}`}>
                          <span className="flex items-center justify-center gap-1">
                            {tx.status === "Reussi" ? "✅" : "⏳"} {tx.status === "Reussi" ? "Réussi" : tx.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-center">
              <button className="bg-white border border-blue-200 text-blue-900 font-bold rounded-full px-6 py-1 hover:bg-gray-50 shadow-sm">
                Voir Plus ▾
              </button>
            </div>
          </div>
        )}
      </div>

      <OperationModal
        modal={modal}
        accountNumber={accountNumber}
        onClose={() => setModal(null)}
        onDone={(msg) => {
          setNotice(msg);
          setModal(null);
          // Rafraichir l'historique apres transaction
          if (showHistory) {
            setShowHistory(false);
            setTimeout(() => setShowHistory(true), 100);
          }
          setTimeout(() => setNotice(""), 6000);
        }}
      />
    </div>
  );
}

function OperationModal({ modal, accountNumber, onClose, onDone }) {
  const [mobileNumber, setMobileNumber] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!modal) return null;
  const isDeposit = modal.direction === "deposit";

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!accountNumber) {
      setError("Renseignez d'abord votre numéro Africo Cash ci-dessus.");
      return;
    }
    setLoading(true);
    try {
      const url = isDeposit ? "/api/mobilemoney/deposit" : "/api/mobilemoney/withdraw";
      const body = {
        account_number: accountNumber,
        operator: modal.operator,
        mobile_number: mobileNumber,
        currency,
        amount,
      };
      if (!isDeposit) body.pin = pin;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onDone(data.message);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={!!modal} onClose={onClose} title={isDeposit ? `${modal.operator} vers Africo Cash` : `Africo Cash vers ${modal.operator}`}>
      <form onSubmit={submit} className="space-y-4">
        <Field label={isDeposit ? "Numéro Mobile Money à débiter" : "Numéro bénéficiaire"}>
          <input className={inputClass} value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} placeholder="+243 8XX XXX XXX" />
        </Field>
        <Field label="Devise">
          <select className={inputClass} value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <option value="USD">USD</option>
            <option value="CDF">CDF</option>
          </select>
        </Field>
        <Field label="Montant">
          <input className={inputClass} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </Field>
        {!isDeposit && (
          <Field label="Code PIN Africo Cash">
            <input className={inputClass} type="password" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} />
          </Field>
        )}
        <Alert type="error">{error}</Alert>
        <PrimaryButton type="submit" className="w-full" disabled={loading}>
          {loading ? "Traitement…" : isDeposit ? "Envoyer la requête Push USSD" : "Valider le transfert"}
        </PrimaryButton>
      </form>
    </Modal>
  );
}
