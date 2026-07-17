"use client";

import { useState } from "react";
import Image from "next/image";
import { Field, inputClass, PrimaryButton, Alert, Card, Modal, SectionHeading } from "@/components/ui";

const PARTNERS = [
  { key: "REGIDESO", icon: "💧", desc: "Eau — rechargement prépayé ou facture postpayée" },
  { key: "SOCODEE", icon: "🏠", desc: "Électricité" },
  { key: "SNEL VIRUNGA", icon: "⚡", desc: "Électricité — SNEL Virunga" },
  { key: "Internet", icon: "📶", desc: "Forfait internet — réactivation instantanée" },
  { key: "CANAL+", icon: "📺", desc: "Abonnement télévision" },
  { key: "Africo Market", icon: "🛒", desc: "Achats marchands / commande Africo Market" },
];

export default function PaiementsPage() {
  const [modal, setModal] = useState(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [notice, setNotice] = useState("");

  return (
    <div className="mx-auto max-w-5xl px-5 py-16 lg:px-8">
      <SectionHeading
        center
        title="Payez vos factures depuis votre solde Africo Cash"
        subtitle="Eau, électricité, internet, télévision et achats marchands, réglés en un instant."
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
      </Card>

      {notice && (
        <div className="mb-8 max-w-md">
          <Alert type="success">{notice}</Alert>
        </div>
      )}

      <div className="space-y-3">
        {PARTNERS.map((p) => (
          <div key={p.key} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
            <div className="flex items-center gap-4">
              <span className="text-2xl">{p.icon}</span>
              <div>
                <p className="font-bold">{p.key}</p>
                <p className="text-xs text-white/50">{p.desc}</p>
              </div>
            </div>
            <button onClick={() => setModal(p.key)} className="btn-gold rounded-full px-5 py-2 text-xs font-bold">
              Payer la facture
            </button>
          </div>
        ))}
      </div>

      <div className="mt-16 flex justify-center">
        <Image src="/images/payments.jpg" alt="Maquette Page paiements Africo Cash" width={420} height={620} className="max-w-xs rounded-2xl border border-white/10 shadow-2xl" />
      </div>

      <PayModal
        partner={modal}
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

function PayModal({ partner, accountNumber, onClose, onDone }) {
  const [reference, setReference] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!partner) return null;

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!accountNumber) {
      setError("Renseignez d'abord votre numéro Africo Cash ci-dessus.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/bills/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account_number: accountNumber, pin, partner, reference, currency, amount }),
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
    <Modal open={!!partner} onClose={onClose} title={`Payer la facture — ${partner}`}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Référence (n° compteur, n° carte, identifiant client)">
          <input className={inputClass} value={reference} onChange={(e) => setReference(e.target.value)} />
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
        <Field label="Code PIN Africo Cash">
          <input className={inputClass} type="password" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} />
        </Field>
        <Alert type="error">{error}</Alert>
        <PrimaryButton type="submit" className="w-full" disabled={loading}>
          {loading ? "Traitement…" : "Payer la facture"}
        </PrimaryButton>
      </form>
    </Modal>
  );
}
