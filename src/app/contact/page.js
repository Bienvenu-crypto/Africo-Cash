"use client";

import { useState } from "react";
import { Field, inputClass, PrimaryButton, Card, Alert, SectionHeading } from "@/components/ui";

const OFFICES = [
  { city: "Goma, Nord-Kivu", phone: "+243 970 000 000" },
  { city: "Kinshasa, Gombe", phone: "+243 810 000 000" },
  { city: "Lubumbashi, Haut-Katanga", phone: "+243 990 000 000" },
];

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  function submit(e) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-16 lg:px-8">
      <SectionHeading eyebrow="Contact" title="Parlons de votre projet avec Africo Cash" center />

      <div className="grid gap-10 lg:grid-cols-2">
        <Card>
          {sent ? (
            <Alert type="success">
              Merci ! Votre message a été enregistré. Notre équipe vous recontactera très prochainement.
            </Alert>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <Field label="Nom complet">
                <input className={inputClass} required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </Field>
              <Field label="Adresse e-mail">
                <input className={inputClass} type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
              </Field>
              <Field label="Message">
                <textarea
                  className={`${inputClass} min-h-32`}
                  required
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                />
              </Field>
              <PrimaryButton type="submit" className="w-full">
                Envoyer le message
              </PrimaryButton>
            </form>
          )}
        </Card>

        <div className="space-y-6">
          {OFFICES.map((o) => (
            <Card key={o.city}>
              <p className="font-bold">{o.city}</p>
              <p className="mt-1 text-sm text-white/60">{o.phone}</p>
            </Card>
          ))}
          <Card>
            <p className="font-bold">Support client</p>
            <p className="mt-1 text-sm text-white/60">contact@africocash.cd</p>
            <p className="text-sm text-white/60">Disponible 7j/7</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
