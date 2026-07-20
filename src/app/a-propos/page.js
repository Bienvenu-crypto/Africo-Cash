import Image from "next/image";
import Link from "next/link";
import { SectionHeading, Card, Eyebrow } from "@/components/ui";

const ADVANTAGES = [
  { n: "01", title: "Sécurité d'abord", desc: "KYC complet, biométrie faciale, signature électronique et code PIN protègent chaque compte, client, agent ou guichet." },
  { n: "02", title: "Simple pour vous", desc: "Cinq étapes suffisent pour ouvrir un compte client ; votre numéro Africo Cash à 8 chiffres est généré instantanément." },
  { n: "03", title: "Pensé pour durer", desc: "Une architecture interconnectée aux banques et opérateurs Mobile Money, conçue pour grandir avec l'économie congolaise." },
  { n: "04", title: "Ancrage local", desc: "Basé en RDC, avec un réseau d'agents de proximité qui comprend les réalités du terrain à Goma, Kinshasa et au-delà." },
];

export default function AProposPage() {
  return (
    <div>
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 lg:grid-cols-2 lg:px-8">
        <div>

          <h1 className="mt-4 text-4xl font-bold leading-tight text-center">
            Le bras financier numérique du Groupe Africo
          </h1>
          <p className="mt-5 leading-relaxed text-white/65">
            Africo Cash est né de la volonté d&apos;Africo Group de rapprocher
            les services financiers des Congolais, où qu&apos;ils se trouvent.
            Notre plateforme relie clients, agents de proximité, opérateurs
            Mobile Money et banques partenaires dans un seul écosystème
            numérique sécurisé.
          </p>
          <p className="mt-4 leading-relaxed text-white/65">
            Chaque compte est protégé par un processus KYC rigoureux: pièce
            d&apos;identité, scan facial, signature électronique et code
            PIN; avant qu&apos;un numéro de compte unique à 8 chiffres ne
            soit généré et lié définitivement au titulaire.
          </p>
          <Link href="/comment-ca-marche" className="mt-6 inline-block rounded-full border border-green/25 px-6 py-3 text-sm font-semibold hover:border-green-400 hover:text-green-400">
            Voir le processus d&apos;inscription
          </Link>
        </div>
        <Image src="/images/banks.jpg" alt="Banques partenaires Africo Cash" width={420} height={620} className="mx-auto max-w-xs rounded-2xl border border-white/10 shadow-2xl" />
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20 lg:px-8">
        <SectionHeading title="L'avantage Africo" center />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {ADVANTAGES.map((a) => (
            <Card key={a.n}>
              <p className="text-3xl font-bold text-gold-400">{a.n}</p>
              <h3 className="mt-3 font-bold">{a.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{a.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-24 lg:px-8">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
          <h2 className="text-2xl font-bold">Notre mission</h2>
          <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-white/65">
            Rendre chaque transaction: retrait, envoi, conversion ou paiement
            de facture; aussi simple qu&apos;un message texte, tout en
            garantissant la sécurité et la traçabilité exigées par les
            institutions bancaires partenaires.
          </p>
        </div>
      </section>
    </div>
  );
}
