"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Stepper from "@/components/Stepper";
import SignatureBox from "@/components/SignatureBox";
import FacialCapture from "@/components/FacialCapture";
import { Field, inputClass, PrimaryButton, GhostButton, Alert, Card } from "@/components/ui";

const STEPS = ["Identité", "Profil & contact", "KYC & PIN", "Biométrie", "Confirmation"];

const PIECE_TYPES = ["Carte d'électeur", "Passeport", "Permis de conduire"];

export default function Inscription() {
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [otpSent, setOtpSent] = useState(null);
  const [otpInput, setOtpInput] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [facialOk, setFacialOk] = useState(false);
  const [signature, setSignature] = useState(null);

  const [form, setForm] = useState({
    nom: "",
    postnom: "",
    prenom: "",
    province: "",
    ville: "",
    commune: "",
    quartier: "",
    avenue: "",
    numero_residence: "",
    profession: "",
    telephone: "",
    piece_type: PIECE_TYPES[0],
    piece_numero: "",
    pin: "",
  });

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function sendOtp() {
    const code = String(Math.floor(1000 + Math.random() * 9000));
    setOtpSent(code);
    setOtpVerified(false);
    setOtpInput("");
  }

  const canNext = useMemo(() => {
    if (step === 1) return form.nom && form.prenom && form.province && form.ville;
    if (step === 2) return form.profession && form.telephone;
    if (step === 3)
      return (
        form.piece_type &&
        form.piece_numero &&
        /^\d{4}$|^\d{6}$/.test(form.pin) &&
        otpVerified
      );
    if (step === 4) return facialOk && signature;
    return true;
  }, [step, form, otpVerified, facialOk, signature]);

  async function submit() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/register/client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          otp_confirmed: true,
          facial_confirmed: true,
          signature_confirmed: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Une erreur est survenue.");
      setResult(data);
      setStep(6);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <div className="mx-auto max-w-lg px-5 py-24 text-center lg:px-8">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gold-500/15 text-3xl">🎉</div>
        <h1 className="text-3xl font-bold">Bienvenue chez Africo Cash</h1>
        <p className="mt-4 text-white/65">{result.message}</p>
        <Card className="mt-8">
          <p className="text-sm text-white/60">Votre numéro de compte Africo Cash</p>
          <p className="mt-2 text-4xl font-bold tracking-widest text-gold-300">{result.account_number}</p>
        </Card>
        <Link href="/portefeuille" className="btn-gold mt-8 inline-block rounded-full px-7 py-3.5 text-sm font-bold">
          Accéder à mon portefeuille
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-16 lg:px-8">
      <h1 className="text-3xl font-bold">Ouvrir un compte Africo Cash</h1>
      <p className="mt-2 text-white/60">
        Suivez les 5 étapes ci-dessous. Votre numéro de compte à 8 chiffres sera généré à la toute fin.
      </p>

      <div className="mt-10">
        <Stepper steps={STEPS} current={Math.min(step, 5)} />
      </div>

      <Card>
        {step === 1 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nom">
              <input className={inputClass} value={form.nom} onChange={(e) => update("nom", e.target.value)} />
            </Field>
            <Field label="Post-nom">
              <input className={inputClass} value={form.postnom} onChange={(e) => update("postnom", e.target.value)} />
            </Field>
            <Field label="Prénom">
              <input className={inputClass} value={form.prenom} onChange={(e) => update("prenom", e.target.value)} />
            </Field>
            <Field label="Province">
              <input className={inputClass} value={form.province} onChange={(e) => update("province", e.target.value)} />
            </Field>
            <Field label="Ville / Territoire">
              <input className={inputClass} value={form.ville} onChange={(e) => update("ville", e.target.value)} />
            </Field>
            <Field label="Commune">
              <input className={inputClass} value={form.commune} onChange={(e) => update("commune", e.target.value)} />
            </Field>
            <Field label="Quartier">
              <input className={inputClass} value={form.quartier} onChange={(e) => update("quartier", e.target.value)} />
            </Field>
            <Field label="Avenue">
              <input className={inputClass} value={form.avenue} onChange={(e) => update("avenue", e.target.value)} />
            </Field>
            <Field label="Numéro de résidence">
              <input className={inputClass} value={form.numero_residence} onChange={(e) => update("numero_residence", e.target.value)} />
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Profession">
              <input
                className={inputClass}
                placeholder="Motard, Commerçant, Enseignant…"
                value={form.profession}
                onChange={(e) => update("profession", e.target.value)}
              />
            </Field>
            <Field label="Numéro de téléphone physique">
              <input
                className={inputClass}
                placeholder="+243 9XX XXX XXX"
                value={form.telephone}
                onChange={(e) => update("telephone", e.target.value)}
              />
            </Field>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Type de pièce d'identité">
                <select className={inputClass} value={form.piece_type} onChange={(e) => update("piece_type", e.target.value)}>
                  {PIECE_TYPES.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </Field>
              <Field label="Numéro de la pièce">
                <input className={inputClass} value={form.piece_numero} onChange={(e) => update("piece_numero", e.target.value)} />
              </Field>
              <Field label="Code PIN secret (4 ou 6 chiffres)">
                <input
                  className={inputClass}
                  type="password"
                  inputMode="numeric"
                  value={form.pin}
                  onChange={(e) => update("pin", e.target.value.replace(/\D/g, ""))}
                />
              </Field>
            </div>

            <div className="rounded-lg border border-white/15 bg-white/5 p-4">
              <p className="text-sm font-medium text-white/80">Vérification du numéro par code OTP</p>
              {!otpSent ? (
                <GhostButton type="button" className="mt-3" onClick={sendOtp} disabled={!form.telephone}>
                  Envoyer le code OTP
                </GhostButton>
              ) : (
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <input
                    className={`${inputClass} w-32`}
                    placeholder="Code OTP"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setOtpVerified(otpInput === otpSent)}
                    className="rounded-full border border-white/25 px-4 py-2 text-xs font-semibold hover:border-gold-400 hover:text-gold-400"
                  >
                    Valider le code
                  </button>
                  <span className="text-xs text-white/50">Code de démonstration : {otpSent}</span>
                  {otpVerified && <span className="text-xs font-semibold text-emerald-300">✓ Numéro vérifié</span>}
                </div>
              )}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div>
              <p className="mb-2 text-sm font-medium text-white/80">Scan facial (biométrie)</p>
              <FacialCapture onChange={setFacialOk} />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-white/80">Signature graphique — validation des Termes &amp; Conditions</p>
              <SignatureBox onChange={setSignature} />
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-3 text-sm">
            <p className="text-white/70">Vérifiez vos informations avant la génération finale de votre numéro Africo Cash.</p>
            <div className="grid grid-cols-2 gap-3 rounded-lg bg-white/5 p-4">
              <p><span className="text-white/50">Nom complet : </span>{form.nom} {form.postnom} {form.prenom}</p>
              <p><span className="text-white/50">Téléphone : </span>{form.telephone}</p>
              <p><span className="text-white/50">Localisation : </span>{form.ville}, {form.province}</p>
              <p><span className="text-white/50">Profession : </span>{form.profession}</p>
              <p><span className="text-white/50">Pièce : </span>{form.piece_type} — {form.piece_numero}</p>
              <p><span className="text-white/50">Biométrie : </span>✓ Photo et signature enregistrées</p>
            </div>
          </div>
        )}

        <div className="mt-6">
          <Alert type="error">{error}</Alert>
        </div>

        <div className="mt-6 flex justify-between">
          <GhostButton type="button" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1}>
            Précédent
          </GhostButton>
          {step < 5 ? (
            <PrimaryButton type="button" onClick={() => setStep((s) => s + 1)} disabled={!canNext}>
              Suivant
            </PrimaryButton>
          ) : (
            <PrimaryButton type="button" onClick={submit} disabled={loading}>
              {loading ? "Création en cours…" : "Générer mon compte Africo Cash"}
            </PrimaryButton>
          )}
        </div>
      </Card>
    </div>
  );
}
