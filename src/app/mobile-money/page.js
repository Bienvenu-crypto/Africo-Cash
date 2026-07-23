"use client";

import { useState } from "react";
import Image from "next/image";
import { Field, inputClass, PrimaryButton, Alert, Card, Modal, SectionHeading } from "@/components/ui";

const OPERATORS = [
  { key: "Airtel Money", color: "border-red-400/40", image: "/images/operators/airtel.jpg", btnDeposit: "bg-[#e3000f]", btnWithdraw: "bg-[#0047a0]", name: "Airtel" },
  { key: "Vodacom M-Pesa", color: "border-red-500/40", image: "/images/operators/vodacom.jpg", btnDeposit: "bg-[#e60000]", btnWithdraw: "bg-[#0047a0]", name: "Vodacom" },
  { key: "Orange Money", color: "border-orange-400/40", image: "/images/operators/orange.jpg", btnDeposit: "bg-[#ff7900]", btnWithdraw: "bg-[#0047a0]", name: "Orange" },
  { key: "Africell Money", color: "border-fuchsia-400/40", image: "/images/operators/africell.jpg", btnDeposit: "bg-[#8b0e8b]", btnWithdraw: "bg-[#0047a0]", name: "Africell" },
];

const MOCK_HISTORY = [
  { id: 1, date: "07/07/2026", operator: "Airtel Money", operatorColor: "text-red-600", type: "Dépôt vers Africo Cash", amount: "+50 USD", amountColor: "text-green-600", status: "Réussi", statusIcon: "✅", statusColor: "text-green-600" },
  { id: 2, date: "06/07/2026", operator: "Vodacom M-Pesa", operatorColor: "text-blue-900", type: "Africo Cash → Vodacom", amount: "-20 USD", amountColor: "text-red-600", status: "En attente", statusIcon: "⏳", statusColor: "text-orange-500" },
  { id: 3, date: "05/07/2026", operator: "Orange Money", operatorColor: "text-blue-900", type: "Retrait mobile", amount: "-10 USD", amountColor: "text-red-600", status: "Réussi", statusIcon: "✅", statusColor: "text-green-600" },
];

export default function MobileMoneyPage() {
  const [modal, setModal] = useState(null); // { operator, direction }
  const [accountNumber, setAccountNumber] = useState("");
  const [notice, setNotice] = useState("");
  const [showHistory, setShowHistory] = useState(false);

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
                {op.name} vers<br/>Africo Cash
              </button>
              <button
                onClick={() => setModal({ operator: op.key, direction: "withdraw" })}
                className={`w-full rounded-md ${op.btnWithdraw} px-2 py-2 text-sm font-semibold text-white hover:opacity-90 leading-tight`}
              >
                Africo Cash<br/>vers {op.name}
              </button>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-12">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center text-xl font-bold text-blue-900 bg-white px-4 py-2 rounded-t-lg border-b-2 border-blue-100 w-full md:w-auto"
        >
          Historique des Transactions
          <span className="ml-2 border-t-2 border-blue-900 w-full flex-1 md:w-48 hidden md:block"></span>
        </button>

        {showHistory && (
          <div className="bg-white rounded-b-lg rounded-tr-lg shadow-sm overflow-hidden p-4">
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
                  {MOCK_HISTORY.map((row) => (
                    <tr key={row.id} className="border-b border-gray-100 last:border-0 font-medium">
                      <td className="py-3 text-blue-900">{row.date}</td>
                      <td className={`py-3 font-bold ${row.operatorColor}`}>{row.operator}</td>
                      <td className="py-3 text-blue-900">{row.type}</td>
                      <td className={`py-3 font-bold ${row.amountColor}`}>{row.amount}</td>
                      <td className={`py-3 ${row.statusColor}`}>
                        <span className="flex items-center justify-center gap-1">
                          {row.statusIcon} {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
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
