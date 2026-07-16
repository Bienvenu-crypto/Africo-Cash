import Image from "next/image";
import Link from "next/link";
import { SectionHeading, Card, Eyebrow } from "@/components/ui";
import FAQ from "@/components/FAQ";

const SERVICES = [
  {
    href: "/portefeuille",
    icon: "💳",
    title: "Portefeuille Africo Cash",
    desc: "Retirez, envoyez et convertissez votre solde USD / CDF instantanément depuis votre téléphone.",
  },
  {
    href: "/mobile-money",
    icon: "📱",
    title: "Mobile Money",
    desc: "Rechargez ou videz votre solde vers Airtel Money, Vodacom M-Pesa, Orange Money et Africell Money.",
  },
  {
    href: "/banques",
    icon: "🏦",
    title: "Banques partenaires",
    desc: "Retirez du cash au guichet, ou transférez entre votre compte bancaire et Africo Cash.",
  },
  {
    href: "/paiements",
    icon: "🧾",
    title: "Paiement de factures",
    desc: "Payez REGIDESO, SOCODEE, SNEL Virunga, Internet, CANAL+ et vos achats Africo Market.",
  },
];

const ADVANTAGES = [
  {
    n: "01",
    title: "Sécurité renforcée",
    desc: "KYC complet, scan facial, signature électronique et code PIN protègent chaque compte.",
  },
  {
    n: "02",
    title: "Rapide et simple",
    desc: "Ouvrez un compte en 5 étapes et obtenez votre numéro Africo Cash à 8 chiffres instantanément.",
  },
  {
    n: "03",
    title: "Réseau d'agents de proximité",
    desc: "Des agents Africo dans chaque quartier, liés automatiquement à la banque partenaire la plus proche.",
  },
  {
    n: "04",
    title: "Interopérable",
    desc: "Connecté aux opérateurs Mobile Money et aux grandes banques de la RDC pour une liquidité totale.",
  },
];

export default function Home() {
  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-gold-500/20 blur-3xl" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-2 lg:px-8 lg:py-28">
          <div className="animate-fade-up">

            <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-5xl">
              Votre argent, <span className="gold-text">partout</span>, à
              tout moment.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/70">
              Africo Cash est le portefeuille numérique du Groupe Africo :
              envoyez de l&apos;argent, retirez du cash chez un agent,
              convertissez USD en CDF ou CDF en USD et payez vos factures; le tout depuis
              votre téléphone.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/inscription" className="btn-gold rounded-full px-7 py-3.5 text-sm font-bold shadow-lg shadow-gold-500/20">
                Ouvrir un compte gratuitement
              </Link>
              <Link href="/comment-ca-marche" className="rounded-full border border-white/25 px-7 py-3.5 text-sm font-semibold text-white/90 hover:border-gold-400 hover:text-gold-400">
                Comment ça marche
              </Link>
            </div>
            <div className="mt-12 flex flex-wrap gap-8">
              <div>
                <p className="text-3xl font-bold text-gold-300">5</p>
                <p className="text-sm text-white/60">Banques partenaires</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gold-300">4</p>
                <p className="text-sm text-white/60">Opérateurs Mobile Money</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gold-300">24/7</p>
                <p className="text-sm text-white/60">Disponibilité du service</p>
              </div>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xs animate-fade-up [animation-delay:150ms]">
            <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-br from-gold-400/25 to-blue-500/10 blur-2xl" />
            <Image
              src="/images/wallet.jpg"
              alt="Portefeuille Africo Cash sur smartphone"
              width={720}
              height={1080}
              className="w-full rounded-[2rem] border border-white/10 shadow-2xl"
              priority
            />
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <SectionHeading
          eyebrow="Nos services"
          title="Tout ce dont vous avez besoin dans un seul portefeuille"
          subtitle="Quatre modules connectés pour gérer votre argent au quotidien, sans jamais quitter Africo Cash."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((s) => (
            <Link key={s.href} href={s.href} className="group">
              <Card className="h-full transition hover:border-gold-400/50 hover:bg-white/10">
                <div className="text-3xl">{s.icon}</div>
                <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{s.desc}</p>
                <span className="mt-4 inline-block text-sm font-semibold text-gold-400 group-hover:underline">
                  Découvrir →
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* ABOUT TEASER */}
      <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <div className="grid items-center gap-12 rounded-3xl border border-white/10 bg-white/5 p-8 lg:grid-cols-2 lg:p-14">
          <div>
            <Eyebrow>À propos d&apos;Africo Cash</Eyebrow>
            <h2 className="mt-4 text-3xl font-bold leading-tight">
              Le bras financier numérique du Groupe Africo
            </h2>
            <p className="mt-4 leading-relaxed text-white/65">
              Née de la volonté d&apos;Africo Group de faciliter l&apos;accès
              aux services financiers en République Démocratique du Congo,
              Africo Cash relie clients, agents de proximité, opérateurs
              Mobile Money et banques partenaires dans un seul écosystème
              sécurisé.
            </p>
            <Link href="/a-propos" className="mt-6 inline-block rounded-full border border-white/25 px-6 py-3 text-sm font-semibold hover:border-gold-400 hover:text-gold-400">
              En savoir plus sur nous
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {ADVANTAGES.slice(0, 4).map((a) => (
              <div key={a.n} className="rounded-2xl border border-white/10 bg-navy-900/60 p-5">
                <p className="text-2xl font-bold text-gold-400">{a.n}</p>
                <p className="mt-2 font-semibold">{a.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARTNER BANKS STRIP */}
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <p className="mb-6 text-center text-sm uppercase tracking-widest text-white/50">
          Interopérable avec les principales institutions de la RDC
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-white/70">
          {["Rawbank", "Equity BCDC", "TMB", "Ecobank", "FBNBank DRC", "Airtel Money", "Vodacom M-Pesa", "Orange Money", "Africell Money"].map((n) => (
            <span key={n} className="text-sm font-semibold">{n}</span>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="mx-auto max-w-7xl px-5 pb-8 lg:px-8">
        <div className="flex flex-col items-center gap-6 rounded-3xl bg-gradient-to-r from-gold-500 via-gold-400 to-gold-300 p-10 text-center text-navy-950 lg:flex-row lg:justify-between lg:text-left">
          <div>
            <h3 className="text-2xl font-bold">Prêt à ouvrir votre compte Africo Cash ?</h3>
            <p className="mt-2 text-navy-900/80">Cinq étapes, un numéro unique à 8 chiffres, et votre argent est à portée de main.</p>
          </div>
          <Link href="/inscription" className="whitespace-nowrap rounded-full bg-navy-950 px-7 py-3.5 text-sm font-bold text-white hover:bg-navy-800">
            Commencer maintenant
          </Link>
        </div>
      </section>

      <FAQ />
    </div>
  );
}
