"use client";

import { useState } from "react";
import { Field, inputClass, PrimaryButton, GhostButton, Alert, Card, SectionHeading, Eyebrow } from "@/components/ui";
import { money } from "@/lib/format";

const BANKS = ["Rawbank", "Equity BCDC", "Trust Merchant Bank", "Ecobank", "FBNBank DRC"];

export default function GuichetPage() {
  const [mode, setMode] = useState("login"); // login | register
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [guichet, setGuichet] = useState(null);

  const [loginForm, setLoginForm] = useState({ code: "", password: "" });
  const [regForm, setRegForm] = useState({ bank_name: BANKS[0], agence: "", code: "", password: "" });

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/login/guichet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setGuichet(data.guichet);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/register/guichet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMode("login");
      setLoginForm({ code: regForm.code, password: "" });
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (guichet) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-16 lg:px-8">
        <Eyebrow>Guichet {guichet.code}</Eyebrow>
        <h1 className="mt-4 text-3xl font-bold">{guichet.bank_name} — {guichet.agence}</h1>
        <p className="mt-2 text-white/60">Statut : <span className="font-semibold text-emerald-300">{guichet.status}</span></p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <Card>
            <p className="text-sm text-white/60">Cantonnement USD</p>
            <p className="mt-2 text-3xl font-bold text-gold-300">{money(guichet.cantonnement_usd, "USD")}</p>
          </Card>
          <Card>
            <p className="text-sm text-white/60">Cantonnement CDF</p>
            <p className="mt-2 text-3xl font-bold text-gold-300">{money(guichet.cantonnement_cdf, "CDF")}</p>
          </Card>
        </div>

        <Card className="mt-6">
          <h3 className="font-bold">Rôle du guichet</h3>
          <p className="mt-2 text-sm leading-relaxed text-white/65">
            Le guichetier connecté avec ce Code Guichet valide les dépôts et retraits des clients Africo Cash
            à 8 chiffres. Les mouvements en miroir sur les comptes de cantonnement CDF et USD sont appliqués
            automatiquement lors des opérations « Retirer le cash », « Banque vers Africo » et « Africo vers banque »
            effectuées par les clients depuis la page Banques partenaires.
          </p>
        </Card>

        <GhostButton className="mt-8" onClick={() => setGuichet(null)}>Se déconnecter</GhostButton>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-5 py-16 lg:px-8">
      <SectionHeading
        eyebrow="Interface Banque"
        title={mode === "login" ? "Connexion Guichet Bancaire" : "Configuration d'un nouveau guichet"}
        subtitle={
          mode === "login"
            ? "Connectez-vous avec le Code du Guichet et le mot de passe attribué par l'administrateur Africo Group."
            : "Aucun profil nominatif requis : le Code du Guichet sert d'identifiant unique de connexion."
        }
      />

      <Card>
        {mode === "login" ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <Field label="Code du Guichet">
              <input className={inputClass} placeholder="EQ-GOM1-GUI3" value={loginForm.code} onChange={(e) => setLoginForm((f) => ({ ...f, code: e.target.value }))} />
            </Field>
            <Field label="Mot de passe">
              <input className={inputClass} type="password" value={loginForm.password} onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))} />
            </Field>
            <Alert type="error">{error}</Alert>
            <PrimaryButton type="submit" className="w-full" disabled={loading}>
              {loading ? "Connexion…" : "Se connecter"}
            </PrimaryButton>
            <p className="text-center text-sm text-white/50">
              Nouveau guichet ?{" "}
              <button type="button" onClick={() => { setMode("register"); setError(""); }} className="font-semibold text-gold-400 hover:underline">
                Le configurer ici
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <Field label="Banque partenaire">
              <select className={inputClass} value={regForm.bank_name} onChange={(e) => setRegForm((f) => ({ ...f, bank_name: e.target.value }))}>
                {BANKS.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </Field>
            <Field label="Succursale / Agence d'affectation">
              <input className={inputClass} placeholder="Agence Goma Volcan" value={regForm.agence} onChange={(e) => setRegForm((f) => ({ ...f, agence: e.target.value }))} />
            </Field>
            <Field label="Code du Guichet">
              <input className={inputClass} placeholder="EQ-GOM1-GUI3" value={regForm.code} onChange={(e) => setRegForm((f) => ({ ...f, code: e.target.value }))} />
            </Field>
            <Field label="Mot de passe de session">
              <input className={inputClass} type="password" value={regForm.password} onChange={(e) => setRegForm((f) => ({ ...f, password: e.target.value }))} />
            </Field>
            <Alert type="error">{error}</Alert>
            <PrimaryButton type="submit" className="w-full" disabled={loading}>
              {loading ? "Enregistrement…" : "Enregistrer le guichet"}
            </PrimaryButton>
            <p className="text-center text-sm text-white/50">
              Guichet déjà configuré ?{" "}
              <button type="button" onClick={() => { setMode("login"); setError(""); }} className="font-semibold text-gold-400 hover:underline">
                Se connecter
              </button>
            </p>
          </form>
        )}
      </Card>
    </div>
  );
}
