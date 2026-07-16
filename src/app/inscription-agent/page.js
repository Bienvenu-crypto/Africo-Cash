"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Stepper from "@/components/Stepper";
import SignatureBox from "@/components/SignatureBox";
import FacialCapture from "@/components/FacialCapture";
import { Field, inputClass, PrimaryButton, GhostButton, Alert, Card } from "@/components/ui";

const STEPS = ["Identité & business", "Contact & KYC", "Biométrie", "Confirmation"];
const PIECE_TYPES = ["Carte d'électeur", "Passeport", "Permis de conduire"];

export default function InscriptionAgent() {
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [gpsStatus, setGpsStatus] = useState("idle");
  const [facialOk, setFacialOk] = useState(false);
  const [signature, setSignature] = useState(null);

  const [form, setForm] = useState({
    nom: "",
    postnom: "",
    prenom: "",
    boutique_nom: "",
    province: "",
    ville: "",
    commune: "",
    quartier: "",
    avenue: "",
    numero_boutique: "",
    gps_lat: "",
    gps_lng: "",
    telephone: "",
    piece_type: PIECE_TYPES[0],
    piece_numero: "",
    pin: "",
  });

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function captureGps() {
    setGpsStatus("loading");
    if (!navigator.geolocation) {
      setGpsStatus("error");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        update("gps_lat", pos.coords.latitude.toFixed(6));
        update("gps_lng", pos.coords.longitude.toFixed(6));
        setGpsStatus("done");
      },
      () => setGpsStatus("error"),
      { timeout: 8000 }
    );
  }

  const canNext = useMemo(() => {
    if (step === 1) return form.nom && form.prenom && form.boutique_nom && form.province && form.ville && form.gps_lat && form.gps_lng;
    if (step === 2) return form.telephone && form.piece_type && form.piece_numero && /^\d{4}$|^\d{6}$/.test(form.pin);
    if (step === 3) return facialOk && signature;
    return true;
  }, [step, form, facialOk, signature]);

  async function submit() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/register/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          gps_lat: Number(form.gps_lat),
          gps_lng: Number(form.gps_lng),
          facial_confirmed: true,
          signature_confirmed: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Une erreur est survenue.");
      setResult(data);
      setStep(5);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <div className="mx-auto max-w-lg px-5 py-24 text-center lg:px-8">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gold-500/15 text-3xl">🏪</div>
        <h1 className="text-3xl font-bold">Compte Agent créé</h1>
        <p className="mt-4 text-white/65">{result.message}</p>
        <Card className="mt-8 space-y-3">
          <div>
            <p className="text-sm text-white/60">Code Agent</p>
            <p className="mt-1 text-3xl font-bold tracking-widest text-gold-300">{result.agent_code}</p>
          </div>
          <div>
            <p className="text-sm text-white/60">Banque partenaire liée</p>
            <p className="mt-1 text-lg font-semibold">{result.banque_partenaire}</p>
          </div>
        </Card>
        <Link href="/" className="btn-gold mt-8 inline-block rounded-full px-7 py-3.5 text-sm font-bold">
          Retour à l&apos;accueil
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-16 lg:px-8">
      <h1 className="text-3xl font-bold">Devenir Agent Africo Cash</h1>
      <p className="mt-2 text-white/60">
        Enregistrez votre point de service en 4 étapes. Votre code agent sera lié automatiquement à la banque partenaire la plus proche.
      </p>

      <div className="mt-10">
        <Stepper steps={STEPS} current={Math.min(step, 4)} />
      </div>

      <Card>
        {step === 1 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nom du gérant">
              <input className={inputClass} value={form.nom} onChange={(e) => update("nom", e.target.value)} />
            </Field>
            <Field label="Post-nom">
              <input className={inputClass} value={form.postnom} onChange={(e) => update("postnom", e.target.value)} />
            </Field>
            <Field label="Prénom">
              <input className={inputClass} value={form.prenom} onChange={(e) => update("prenom", e.target.value)} />
            </Field>
            <Field label="Nom commercial / boutique">
              <input className={inputClass} placeholder="Établissement Kivu Services" value={form.boutique_nom} onChange={(e) => update("boutique_nom", e.target.value)} />
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
            <Field label="Numéro de la boutique">
              <input className={inputClass} value={form.numero_boutique} onChange={(e) => update("numero_boutique", e.target.value)} />
            </Field>
            <div className="sm:col-span-2 rounded-lg border border-white/15 bg-white/5 p-4">
              <p className="text-sm font-medium text-white/80">Coordonnées GPS du point de vente (obligatoire)</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <GhostButton type="button" onClick={captureGps}>
                  📍 Capturer ma position
                </GhostButton>
                {gpsStatus === "loading" && <span className="text-xs text-white/50">Localisation en cours…</span>}
                {gpsStatus === "error" && <span className="text-xs text-red-300">Position indisponible — vérifiez les permissions du navigateur.</span>}
                {form.gps_lat && form.gps_lng && (
                  <span className="text-xs font-semibold text-emerald-300">
                    ✓ Lat {form.gps_lat}, Lng {form.gps_lng}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Numéro de téléphone agent">
              <input className={inputClass} placeholder="+243 9XX XXX XXX" value={form.telephone} onChange={(e) => update("telephone", e.target.value)} />
            </Field>
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
            <Field label="Code PIN agent (4 ou 6 chiffres)">
              <input
                className={inputClass}
                type="password"
                inputMode="numeric"
                value={form.pin}
                onChange={(e) => update("pin", e.target.value.replace(/\D/g, ""))}
              />
            </Field>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <p className="mb-2 text-sm font-medium text-white/80">Scan facial du gérant (obligatoire avant la signature)</p>
              <FacialCapture onChange={setFacialOk} />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-white/80">Signature graphique — contrat d&apos;adhésion Agent</p>
              <SignatureBox onChange={setSignature} />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3 text-sm">
            <p className="text-white/70">Vérifiez les informations avant la génération de votre code agent.</p>
            <div className="grid grid-cols-2 gap-3 rounded-lg bg-white/5 p-4">
              <p><span className="text-white/50">Gérant : </span>{form.nom} {form.postnom} {form.prenom}</p>
              <p><span className="text-white/50">Boutique : </span>{form.boutique_nom}</p>
              <p><span className="text-white/50">Localisation : </span>{form.ville}, {form.province}</p>
              <p><span className="text-white/50">GPS : </span>{form.gps_lat}, {form.gps_lng}</p>
              <p><span className="text-white/50">Téléphone : </span>{form.telephone}</p>
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
          {step < 4 ? (
            <PrimaryButton type="button" onClick={() => setStep((s) => s + 1)} disabled={!canNext}>
              Suivant
            </PrimaryButton>
          ) : (
            <PrimaryButton type="button" onClick={submit} disabled={loading}>
              {loading ? "Création en cours…" : "Créer mon compte Agent"}
            </PrimaryButton>
          )}
        </div>
      </Card>
    </div>
  );
}
