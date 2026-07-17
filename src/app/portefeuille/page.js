"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Field, inputClass, PrimaryButton, Alert, Card, Modal, Eyebrow } from "@/components/ui";
import { money } from "@/lib/format";

function LoginCard({ onLogin }) {
  const [form, setForm] = useState({ account_number: "", pin: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/login/client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onLogin(data.client);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-5xl items-center gap-12 px-5 py-16 lg:grid-cols-2 lg:px-8">
      <div>

        <h1 className="mt-4 text-3xl font-bold">Accédez à votre portefeuille</h1>
        <p className="mt-3 text-white/60">
          Connectez-vous avec votre numéro Africo Cash à 8 chiffres et votre code PIN pour gérer votre solde.
        </p>
        <Image src="/images/wallet.jpg" alt="Portefeuille Africo Cash" width={420} height={620} className="mt-8 hidden max-w-[220px] rounded-2xl border border-white/10 shadow-2xl sm:block" />
      </div>

      <Card>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Numéro Africo Cash (8 chiffres)">
            <input
              className={inputClass}
              inputMode="numeric"
              maxLength={8}
              placeholder="48291054"
              value={form.account_number}
              onChange={(e) => setForm((f) => ({ ...f, account_number: e.target.value.replace(/\D/g, "") }))}
            />
          </Field>
          <Field label="Code PIN">
            <input
              className={inputClass}
              type="password"
              inputMode="numeric"
              value={form.pin}
              onChange={(e) => setForm((f) => ({ ...f, pin: e.target.value.replace(/\D/g, "") }))}
            />
          </Field>
          <Alert type="error">{error}</Alert>
          <PrimaryButton type="submit" className="w-full" disabled={loading}>
            {loading ? "Connexion…" : "Se connecter"}
          </PrimaryButton>
          <p className="text-center text-sm text-white/50">
            Pas encore de compte ?{" "}
            <Link href="/inscription" className="font-semibold text-gold-400 hover:text-green-400 hover:underline">
              Ouvrez-en un
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
}

function ScoreGauge({ score = 720 }) {
  const pct = Math.min(Math.max((score - 300) / (850 - 300), 0), 1);
  const angle = -90 + pct * 180;
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 110" className="w-48">
        <path d="M10 100 A90 90 0 0 1 190 100" fill="none" stroke="#3b1f14" strokeWidth="14" strokeLinecap="round" />
        <path d="M10 100 A90 90 0 0 1 190 100" fill="none" stroke="url(#grad)" strokeWidth="14" strokeLinecap="round"
          strokeDasharray={`${pct * 251} 251`} />
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#f4d888" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
        </defs>
        <line x1="100" y1="100" x2={100 + 65 * Math.cos((angle * Math.PI) / 180)} y2={100 + 65 * Math.sin((angle * Math.PI) / 180)} stroke="white" strokeWidth="3" />
        <circle cx="100" cy="100" r="5" fill="white" />
      </svg>
      <div className="-mt-4 flex w-48 justify-between text-xs text-white/50">
        <span>Faible</span>
        <span>Bon</span>
      </div>
      <p className="mt-2 text-3xl font-bold text-gold-300">{score}</p>
      <p className="text-sm">{"★".repeat(5)}</p>
    </div>
  );
}

const TX_LABELS = {
  Retrait: { icon: "🔴" },
  "Retrait Banque": { icon: "🏦" },
  "Retrait Mobile Money": { icon: "📱" },
  Envoi: { icon: "➡️" },
  Reception: { icon: "⬅️" },
  Conversion: { icon: "🔄" },
  "Depot Mobile Money": { icon: "📲" },
  "Banque vers Africo": { icon: "🏦" },
  "Africo vers Banque": { icon: "🏦" },
  "Paiement Facture": { icon: "🧾" },
};

export default function Portefeuille() {
  const [client, setClient] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [activeModal, setActiveModal] = useState(null);
  const [notice, setNotice] = useState("");

  async function refresh(account) {
    const res = await fetch(`/api/wallet/${account}`);
    const data = await res.json();
    if (res.ok) {
      setClient(data.client);
      setTransactions(data.transactions);
    }
  }

  function handleLogin(c) {
    setClient(c);
    refresh(c.account_number);
  }

  function afterOp(msg) {
    setNotice(msg);
    setActiveModal(null);
    refresh(client.account_number);
    setTimeout(() => setNotice(""), 6000);
  }

  if (!client) return <LoginCard onLogin={handleLogin} />;

  return (
    <div className="mx-auto max-w-xl px-5 py-10 lg:px-8">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-navy-800 to-navy-900 p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <Image src="/images/logo.jpg" alt="Africo Cash" width={140} height={40} className="h-9 w-auto rounded-sm object-contain mix-blend-lighten" />
          <button onClick={() => setClient(null)} className="text-xs text-white/50 hover:text-green-400">Déconnexion ⏻</button>
        </div>

        <h2 className="text-center text-lg font-semibold text-white/80">Portefeuille Africo Cash</h2>
        <p className="text-center text-white/60">{client.prenom} {client.nom}</p>

        <div className="mt-4 rounded-2xl bg-white p-5 text-navy-950">
          <p className="text-center text-sm font-semibold text-slate-600">Solde Principal</p>
          <p className="mt-3 text-center text-3xl font-bold">🇨🇩 {money(client.balance_usd, "USD")}</p>
          <div className="my-2 border-t border-slate-200" />
          <p className="text-center text-2xl font-bold">🇺🇸 {money(client.balance_cdf, "CDF")}</p>
        </div>

        {notice && (
          <div className="mt-4">
            <Alert type="success">{notice}</Alert>
          </div>
        )}

        <div className="mt-5 grid grid-cols-4 gap-3">
          <ActionButton color="bg-red-600" icon="💵" label="Retirer" onClick={() => setActiveModal("retirer")} />
          <ActionButton color="bg-blue-600" icon="✈️" label="Envoyer" onClick={() => setActiveModal("envoyer")} />
          <ActionButton color="bg-emerald-600" icon="🏛️" label="Dèposer" onClick={() => setActiveModal("deposer")} />
          <ActionButton color="bg-purple-600" icon="🔄" label="Convertir" onClick={() => setActiveModal("convertir")} />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-white p-4 text-navy-950">
            <p className="mb-2 text-sm font-bold text-slate-800">Historique des Transactions</p>
            <div className="max-h-56 space-y-2 overflow-y-auto no-scrollbar">
              {transactions.length === 0 && <p className="text-xs text-slate-500">Aucune transaction pour le moment.</p>}
              {transactions.map((t) => {
                const meta = TX_LABELS[t.type] || { icon: "•" };
                return (
                  <div key={t.id} className="flex items-center justify-between border-b border-slate-200 pb-1.5 text-xs">
                    <div>
                      <p className="font-semibold">{meta.icon} {t.type}</p>
                      <p className="text-slate-500">{new Date(t.created_at).toLocaleString("fr-FR")}</p>
                    </div>
                    <p className={`font-bold ${t.amount < 0 ? "text-red-600" : "text-emerald-600"}`}>
                      {t.amount < 0 ? "" : "+"}{money(t.amount, t.currency)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="rounded-2xl bg-white p-4 text-navy-950">
            <p className="mb-1 text-center text-sm font-bold text-slate-800">Votre Scoring</p>
            <ScoreGauge score={Math.min(850, 620 + transactions.length * 8)} />
          </div>
        </div>
      </div>

      <RetirerModal open={activeModal === "retirer"} client={client} onClose={() => setActiveModal(null)} onDone={afterOp} />
      <EnvoyerModal open={activeModal === "envoyer"} client={client} onClose={() => setActiveModal(null)} onDone={afterOp} />
      <ConvertirModal open={activeModal === "convertir"} client={client} onClose={() => setActiveModal(null)} onDone={afterOp} />
      <Modal open={activeModal === "deposer"} onClose={() => setActiveModal(null)} title="Déposer sur mon compte">
        <p className="text-sm text-white/70">
          Rechargez votre solde Africo Cash depuis un opérateur Mobile Money ou votre compte bancaire.
        </p>
        <div className="mt-5 flex flex-col gap-3">
          <Link href="/mobile-money" className="btn-gold rounded-full px-5 py-3 text-center text-sm font-bold">Recharger via Mobile Money</Link>
          <Link href="/banques" className="rounded-full border border-white/25 px-5 py-3 text-center text-sm font-semibold hover:border-green-400 hover:text-green-400">Recharger via ma banque</Link>
        </div>
      </Modal>
    </div>
  );
}

function ActionButton({ color, icon, label, onClick }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5">
      <span className={`flex h-12 w-12 items-center justify-center rounded-xl text-lg text-white ${color}`}>{icon}</span>
      <span className="text-[11px] font-semibold text-white">{label}</span>
    </button>
  );
}

function OpShell({ open, title, onClose, error, loading, onSubmit, children, submitLabel }) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <form onSubmit={onSubmit} className="space-y-4">
        {children}
        <Alert type="error">{error}</Alert>
        <PrimaryButton type="submit" className="w-full" disabled={loading}>
          {loading ? "Traitement…" : submitLabel}
        </PrimaryButton>
      </form>
    </Modal>
  );
}

function RetirerModal({ open, client, onClose, onDone }) {
  const [currency, setCurrency] = useState("USD");
  const [amount, setAmount] = useState("");
  const [agentCode, setAgentCode] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/wallet/retirer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account_number: client.account_number, pin, currency, amount, agent_code: agentCode }),
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
    <OpShell open={open} title="Retirer du cash" onClose={onClose} error={error} loading={loading} onSubmit={submit} submitLabel="Valider le retrait">
      <Field label="Devise">
        <select className={inputClass} value={currency} onChange={(e) => setCurrency(e.target.value)}>
          <option value="USD">USD</option>
          <option value="CDF">CDF</option>
        </select>
      </Field>
      <Field label="Montant">
        <input className={inputClass} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </Field>
      <Field label="Code Agent">
        <input className={inputClass} placeholder="AFR-AG-2045" value={agentCode} onChange={(e) => setAgentCode(e.target.value)} />
      </Field>
      <Field label="Code PIN">
        <input className={inputClass} type="password" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} />
      </Field>
    </OpShell>
  );
}

function EnvoyerModal({ open, client, onClose, onDone }) {
  const [currency, setCurrency] = useState("USD");
  const [amount, setAmount] = useState("");
  const [destination, setDestination] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/wallet/envoyer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account_number: client.account_number, pin, currency, amount, destination_account: destination }),
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
    <OpShell open={open} title="Envoyer de l'argent" onClose={onClose} error={error} loading={loading} onSubmit={submit} submitLabel="Valider l'envoi">
      <Field label="Numéro Africo Cash du destinataire">
        <input className={inputClass} inputMode="numeric" maxLength={8} value={destination} onChange={(e) => setDestination(e.target.value.replace(/\D/g, ""))} />
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
      <Field label="Code PIN">
        <input className={inputClass} type="password" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} />
      </Field>
    </OpShell>
  );
}

function ConvertirModal({ open, client, onClose, onDone }) {
  const [sens, setSens] = useState("USD_TO_CDF");
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/wallet/convertir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account_number: client.account_number, pin, sens, amount }),
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
    <OpShell open={open} title="Convertir mon solde" onClose={onClose} error={error} loading={loading} onSubmit={submit} submitLabel="Valider la conversion">
      <Field label="Sens de conversion">
        <select className={inputClass} value={sens} onChange={(e) => setSens(e.target.value)}>
          <option value="USD_TO_CDF">USD → CDF</option>
          <option value="CDF_TO_USD">CDF → USD</option>
        </select>
      </Field>
      <Field label="Montant">
        <input className={inputClass} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </Field>
      <Field label="Code PIN">
        <input className={inputClass} type="password" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} />
      </Field>
    </OpShell>
  );
}
