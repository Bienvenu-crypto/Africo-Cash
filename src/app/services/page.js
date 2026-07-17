import Link from "next/link";
import Image from "next/image";
import { SectionHeading, Card, Eyebrow } from "@/components/ui";

const SERVICES = [
  {
    href: "/portefeuille",
    img: "/images/wallet.jpg",
    title: "Portefeuille Africo Cash",
    desc: "Un solde en USD et en CDF, disponible en permanence.",
    points: [
      "Retirer : transformez votre solde virtuel en espèces chez un agent",
      "Envoyer : transfert instantané vers un autre numéro Africo Cash",
      "Convertir : change instantané USD ⇄ CDF au taux du jour",
    ],
  },
  {
    href: "/mobile-money",
    img: "/images/mobilemoney.jpg",
    title: "Passerelles Mobile Money",
    desc: "Interopérabilité avec les quatre grands opérateurs de la RDC.",
    points: [
      "Airtel Money, Vodacom M-Pesa, Orange Money, Africell Money",
      "Rechargement par Push USSD vers votre solde Africo Cash",
      "Transfert de votre solde vers un compte Mobile Money",
    ],
  },
  {
    href: "/banques",
    img: "/images/banks.jpg",
    title: "Banques partenaires",
    desc: "Rawbank, Equity BCDC, TMB, Ecobank, FBNBank DRC.",
    points: [
      "Retirer le cash au guichet avec un code de retrait unique",
      "Banque vers Africo : rechargez depuis votre compte bancaire",
      "Africo vers banque : virement direct vers un compte bancaire",
    ],
  },
  {
    href: "/paiements",
    img: "/images/payments.jpg",
    title: "Paiement de factures",
    desc: "Services publics, télécoms et achats marchands en un instant.",
    points: [
      "REGIDESO, SOCODEE, SNEL Virunga (eau et électricité)",
      "Internet et CANAL+ avec réactivation instantanée",
      "Achats marchands via Africo Market",
    ],
  },
];

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-16 lg:px-8">
      <SectionHeading

        title="Un écosystème financier complet"
        subtitle="Quatre modules connectés à votre portefeuille Africo Cash, disponibles où que vous soyez en RDC."
        center
      />

      <div className="space-y-14">
        {SERVICES.map((s, i) => (
          <div key={s.href} className={`grid items-center gap-10 lg:grid-cols-2 ${i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""}`}>
            <Card>

              <h2 className="mt-3 text-2xl font-bold">{s.title}</h2>
              <p className="mt-2 text-white/60">{s.desc}</p>
              <ul className="mt-4 space-y-2 text-sm text-white/65">
                {s.points.map((p) => (
                  <li key={p} className="flex gap-2">
                    <span className="text-gold-400">•</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
              <Link href={s.href} className="btn-gold mt-6 inline-block rounded-full px-6 py-2.5 text-sm font-bold">
                Accéder à ce service
              </Link>
            </Card>
            <Image src={s.img} alt={s.title} width={420} height={620} className="mx-auto max-w-[240px] rounded-2xl border border-white/10 shadow-2xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
