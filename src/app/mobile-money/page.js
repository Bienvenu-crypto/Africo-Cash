"use client";

import { useState } from "react";
import Image from "next/image";
import { Field, inputClass, PrimaryButton, Alert, Card, Modal, SectionHeading } from "@/components/ui";

const OPERATORS = [
  { key: "Airtel Money", color: "border-red-400/40", icon: "📶" },
  { key: "Vodacom M-Pesa", color: "border-red-500/40", icon: "📡" },
  { key: "Orange Money", color: "border-orange-400/40", icon: "🟠" },
  { key: "Africell Money", color: "border-fuchsia-400/40", icon: "💜" },
];

export default function MobileMoneyPage() {
  const [modal, setModal] = useState(null); // { operator, direction }
  const [accountNumber, setAccountNumber] = useState("");
  const [notice, setNotice] = useState("");

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

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {OPERATORS.map((op) => (
          <Card key={op.key} className={`border ${op.color}`}>
            <div className="text-3xl">{op.icon}</div>
            <h3 className="mt-3 font-bold">{op.key}</h3>
            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={() => setModal({ operator: op.key, direction: "deposit" })}
                className="rounded-lg bg-red-600/90 px-3 py-2 text-xs font-semibold hover:bg-red-600"
              >
                {op.key} vers Africo Cash
              </button>
              <button
                onClick={() => setModal({ operator: op.key, direction: "withdraw" })}
                className="rounded-lg bg-blue-600/90 px-3 py-2 text-xs font-semibold hover:bg-blue-600"
              >
                Africo Cash vers {op.key}
              </button>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-16 flex justify-center">
        <Image src="/images/mobilemoney.jpg" alt="Maquette Mobile Money Africo Cash" width={420} height={620} className="max-w-xs rounded-2xl border border-white/10 shadow-2xl" />
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
