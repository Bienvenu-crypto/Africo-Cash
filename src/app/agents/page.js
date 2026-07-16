import Link from "next/link";
import { SectionHeading, Card, Eyebrow } from "@/components/ui";

const BENEFITS = [
  { icon: "💰", title: "Revenus complémentaires", desc: "Percevez une commission sur chaque retrait cash effectué par vos clients." },
  { icon: "📍", title: "Liaison bancaire automatique", desc: "Vos coordonnées GPS déterminent automatiquement la banque partenaire la plus proche pour le cantonnement." },
  { icon: "🔒", title: "Sécurité biométrique", desc: "Scan facial et signature électronique protègent votre compte agent contre les usurpations." },
  { icon: "📊", title: "Historique complet", desc: "Suivez toutes vos opérations Africo Cash directement depuis votre espace agent." },
];

export default function AgentsPage() {
  return (
    <div>
      <section className="mx-auto max-w-5xl px-5 py-20 text-center lg:px-8">
        <Eyebrow>Réseau de distribution</Eyebrow>
        <h1 className="mt-4 text-4xl font-bold">Devenez Agent Africo Cash</h1>
        <p className="mx-auto mt-4 max-w-2xl text-white/65">
          Rejoignez le réseau d&apos;agents de proximité Africo Group : gérez les retraits cash de vos clients,
          touchez une commission sur chaque opération, et bénéficiez d&apos;une liaison automatique
          avec la banque partenaire la plus proche.
        </p>
        <Link href="/inscription-agent" className="btn-gold mt-8 inline-block rounded-full px-7 py-3.5 text-sm font-bold">
          Créer mon compte Agent
        </Link>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20 lg:px-8">
        <SectionHeading eyebrow="Avantages" title="Pourquoi devenir agent Africo ?" center />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((b) => (
            <Card key={b.title}>
              <div className="text-3xl">{b.icon}</div>
              <h3 className="mt-4 font-bold">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{b.desc}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
