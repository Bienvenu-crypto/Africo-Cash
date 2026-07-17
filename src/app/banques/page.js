"use client";

import { useState } from "react";
import Image from "next/image";
import { Field, inputClass, PrimaryButton, Alert, Card, Modal, SectionHeading } from "@/components/ui";

const BANKS = ["Rawbank", "Equity BCDC", "Trust Merchant Bank", "Ecobank", "FBNBank DRC"];

const ACTIONS = [
  { key: "retirer-cash", label: "Retirer le cash", color: "bg-slate-600/90 hover:bg-green-500" },
  { key: "banque-vers-africo", label: "Banque vers Africo", color: "bg-blue-600/90 hover:bg-green-500" },
  { key: "africo-vers-banque", label: "Africo vers banque", color: "bg-emerald-600/90 hover:bg-emerald-600" },
];

export default function BanquesPage() {
  const [modal, setModal] = useState(null); // { bank, action }
  const [accountNumber, setAccountNumber] = useState("");
  const [notice, setNotice] = useState("");

  return (
    <div className="mx-auto max-w-6xl px-5 py-16 lg:px-8">
      <SectionHeading
        center
        title="Interopérabilité directe avec vos comptes bancaires"
        subtitle="Rawbank, Equity BCDC, Trust Merchant Bank, Ecobank et FBNBank DRC connectées à votre portefeuille Africo Cash."
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

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {BANKS.map((bank) => (
          <Card key={bank}>
            <h3 className="font-bold">{bank}</h3>
            <div className="mt-4 flex flex-col gap-2">
              {ACTIONS.map((a) => (
                <button
                  key={a.key}
                  onClick={() => setModal({ bank, action: a.key })}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold text-white ${a.color}`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-16 flex justify-center">
        <Image src="/images/banks.jpg" alt="Maquette Banques partenaires Africo Cash" width={420} height={620} className="max-w-xs rounded-2xl border border-white/10 shadow-2xl" />
      </div>

      <BankModal
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

const TITLES = {
  "retirer-cash": (bank) => `Retirer le cash — ${bank}`,
  "banque-vers-africo": (bank) => `Banque vers Africo — ${bank}`,
  "africo-vers-banque": (bank) => `Africo vers banque — ${bank}`,
};

function BankModal({ modal, accountNumber, onClose, onDone }) {
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
          <p className="text-sm text-white/70">Présentez ce code au guichetier {bank} pour recevoir votre cash :</p>
          <p className="mt-4 text-4xl font-bold tracking-widest text-gold-300">{code}</p>
          <PrimaryButton className="mt-6 w-full" onClick={() => onDone(`Code de retrait généré : ${code}`)}>
            Fermer
          </PrimaryButton>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          {needsBankAccount && (
            <Field label="Numéro de compte bancaire">
              <input className={inputClass} value={bankAccountNumber} onChange={(e) => setBankAccountNumber(e.target.value)} />
            </Field>
          )}
          <Field label="Devise">
            <select className={inputClass} value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option value="USD">USD</option>
              <option value="CDF">CDF</option>
            </select>
          </Field>
          <Field label="Montant">
            <input className={inputClass} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </Field>
          {needsPin && (
            <Field label="Code PIN Africo Cash">
              <input className={inputClass} type="password" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} />
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
