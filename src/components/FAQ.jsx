"use client";

import { useState } from "react";
import { SectionHeading } from "@/components/ui";

const ITEMS = [
  {
    q: "Comment obtenir mon numéro Africo Cash à 8 chiffres ?",
    a: "Rendez-vous sur la page Inscription et suivez les 5 étapes : identité, profil et contact, pièce d'identité et code PIN, données biométriques, puis validation finale. Votre numéro est généré automatiquement dès la soumission complète.",
  },
  {
    q: "Quels sont les frais appliqués sur les transactions ?",
    a: "Chaque type d'opération (retrait, envoi, conversion, dépôt Mobile Money, virement bancaire, paiement de facture) applique un taux configuré par Africo Group, affiché avant chaque validation par code PIN.",
  },
  {
    q: "Puis-je devenir Agent Africo Cash ?",
    a: "Oui. Les commerçants et points de service peuvent s'inscrire comme Agent Africo, avec géolocalisation automatique liée à la banque partenaire la plus proche pour le cantonnement.",
  },
  {
    q: "Africo Cash est-il connecté à ma banque ?",
    a: "Africo Cash s'interconnecte avec Rawbank, Equity BCDC, TMB, Ecobank et FBNBank DRC pour les dépôts, retraits et virements entre votre compte bancaire et votre portefeuille.",
  },
  {
    q: "Que se passe-t-il si je perds mon téléphone ?",
    a: "Votre compte reste protégé par votre code PIN et vos données biométriques. Contactez le support Africo Cash pour bloquer temporairement votre compte.",
  },
];

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <section className="mx-auto max-w-4xl px-5 py-20 lg:px-8">
      <SectionHeading eyebrow="FAQ" title="Questions fréquentes" center />
      <div className="space-y-3">
        {ITEMS.map((item, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div key={item.q} className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
              <button
                onClick={() => setOpenIdx(isOpen ? -1 : idx)}
                className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold sm:text-base"
              >
                {item.q}
                <span className={`ml-4 text-gold-400 transition-transform ${isOpen ? "rotate-45" : ""}`}>＋</span>
              </button>
              {isOpen && (
                <p className="px-5 pb-5 text-sm leading-relaxed text-white/65">{item.a}</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
