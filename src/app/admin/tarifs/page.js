"use client";

import { useState, useEffect } from "react";
import { Field, inputClass, PrimaryButton, Alert, SectionHeading } from "@/components/ui";

const CONFIG_LABELS = {
  withdrawal_rate: "Taux de retrait agent (%)",
  transfer_fee_rate: "Frais d'envoi de compte à compte (%)",
  rate_usd_to_cdf: "Taux de change USD → CDF",
  rate_cdf_to_usd: "Taux de change CDF → USD",
  mobile_deposit_fee_rate: "Frais de dépôt depuis Mobile Money (%)",
  mobile_withdrawal_fee_rate: "Frais de retrait vers Mobile Money (%)",
  bank_atm_withdrawal_fee_rate: "Frais de retrait GAB / Guichet Banque (%)",
  bank_deposit_fee_rate: "Frais de dépôt depuis Banque (%)",
  bank_transfer_fee_rate: "Frais d'envoi vers Banque (%)",
  regideso_fee_rate: "Frais de paiement REGIDESO (%)",
  electricity_fee_rate: "Frais de paiement Électricité (%)",
  telecom_tv_fee_rate: "Frais de paiement Télécom & TV (%)",
  merchant_fee_rate: "Frais marchands (%)",
  payment_fee_rate: "Frais de paiement standard (%)",
};

export default function AdminTarifs() {
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        if (data.config) setConfig(data.config);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    // Convert values to numbers
    const payload = {};
    for (const [k, v] of Object.entries(config)) {
      payload[k] = Number(v);
    }

    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setNotice(data.message);
      setTimeout(() => setNotice(""), 5000);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  function handleChange(key, val) {
    setConfig((prev) => ({ ...prev, [key]: val }));
  }

  if (loading) return <div className="p-20 text-center">Chargement des tarifs...</div>;

  return (
    <div className="mx-auto max-w-4xl px-5 py-16 lg:px-8">
      <SectionHeading
        center
        title="Administration : Configuration des Tarifs"
        subtitle="Modifiez ici les taux de commission, les frais et les taux de change appliqués par défaut dans l'application."
      />

      <form onSubmit={handleSave} className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl sm:p-8">
        <div className="grid gap-6 sm:grid-cols-2">
          {Object.entries(config).map(([key, val]) => (
            <Field key={key} label={CONFIG_LABELS[key] || key}>
              <input
                className={inputClass}
                type="number"
                step="0.0001"
                value={val}
                onChange={(e) => handleChange(key, e.target.value)}
              />
            </Field>
          ))}
        </div>

        <div className="mt-8">
          {notice && <Alert type="success" className="mb-4">{notice}</Alert>}
          {error && <Alert type="error" className="mb-4">{error}</Alert>}
          
          <PrimaryButton type="submit" disabled={saving} className="w-full sm:w-auto">
            {saving ? "Enregistrement..." : "Enregistrer les modifications"}
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
}
