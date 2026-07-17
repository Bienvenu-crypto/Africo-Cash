import Link from "next/link";
import { SectionHeading, Card, Eyebrow } from "@/components/ui";

const CLIENT_STEPS = [
  {
    n: "1",
    title: "Identité de base et localisation",
    items: ["Nom, post-nom, prénom", "Province, Ville/Territoire, Commune, Quartier, Avenue, N° de résidence"],
  },
  {
    n: "2",
    title: "Profil socio-professionnel et contact",
    items: ["Profession (motard, commerçant, enseignant…)", "Numéro de téléphone physique pour les alertes et codes"],
  },
  {
    n: "3",
    title: "Pièce d'identité et sécurité (KYC & PIN)",
    items: ["Carte d'électeur, passeport ou permis de conduire", "Numéro de la pièce", "Code PIN secret (4 ou 6 chiffres)", "Code OTP reçu par SMS"],
  },
  {
    n: "4",
    title: "Données biométriques et accord légal",
    items: ["Scan facial via la caméra de l'appareil", "Signature graphique tactile (Signature Pad)"],
  },
  {
    n: "5",
    title: "Génération finale 🚀",
    items: [
      "Numéro Africo Cash unique à 8 chiffres généré automatiquement",
      "Statut du compte : Actif",
      "SMS de bienvenue avec le numéro de compte",
      "Traçabilité liée à l'agent inscripteur",
    ],
  },
];

const AGENT_STEPS = [
  {
    n: "1",
    title: "Identité du gérant et localisation business",
    items: ["Nom, post-nom, prénom du gérant", "Nom commercial de la boutique", "Adresse complète du point physique", "Coordonnées GPS capturées automatiquement"],
  },
  {
    n: "2",
    title: "Contact et sécurité (KYC)",
    items: ["Numéro de téléphone agent", "Pièce d'identité du gérant", "Code PIN agent (4 ou 6 chiffres)"],
  },
  {
    n: "3",
    title: "Données biométriques et accord légal",
    items: ["Scan facial du gérant (obligatoire avant la signature)", "Signature graphique tactile"],
  },
  {
    n: "4",
    title: "Algorithme de proximité et liaison automatique 🚀",
    items: [
      "Génération du code agent unique (ex : AFR-AG-2045)",
      "Calcul de la banque partenaire la plus proche via GPS",
      "Double indexation aux comptes de cantonnement CDF et USD",
      "Statut : Actif",
    ],
  },
];

const GUICHET_STEPS = [
  {
    n: "1",
    title: "Identification de la banque et du guichet",
    items: ["Banque partenaire (Equity BCDC, Rawbank…)", "Succursale / agence d'affectation", "Code du guichet — identifiant unique de connexion"],
  },
  {
    n: "2",
    title: "Droits d'accès de trésorerie",
    items: ["Mot de passe de session", "Liaison automatique aux comptes de cantonnement CDF et USD selon la banque"],
  },
  {
    n: "3",
    title: "Fin du processus",
    items: ["Enregistrement dans la table Guichet_Bancaire", "Statut : Opérationnel; connexion via Code Guichet + mot de passe"],
  },
];

function StepList({ steps }) {
  return (
    <div className="space-y-5">
      {steps.map((s) => (
        <Card key={s.n} className="flex gap-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-500/15 text-lg font-bold text-gold-300">
            {s.n}
          </div>
          <div>
            <h3 className="font-bold">{s.title}</h3>
            <ul className="mt-2 space-y-1 text-sm leading-relaxed text-white/65">
              {s.items.map((it) => (
                <li key={it} className="flex gap-2">
                  <span className="text-gold-400">•</span>
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      ))}
    </div>
  );
}

export default function CommentCaMarche() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-16 lg:px-8">
      <div className="text-center">

        <h1 className="mt-4 text-4xl font-bold">Comment ça marche</h1>
        <p className="mx-auto mt-4 max-w-2xl text-white/65">
          L&apos;inscription sur Africo Cash suit un ordre strict, étape par
          étape. Aucune étape ne peut être sautée, et le numéro de compte
          n&apos;est généré qu&apos;à la toute fin.
        </p>
      </div>

      <section className="mt-16">
        <SectionHeading title="Enregistrement du compte utilisateur" center />
        <StepList steps={CLIENT_STEPS} />
        <div className="mt-6 text-center">
          <Link href="/inscription" className="btn-gold inline-block rounded-full px-7 py-3.5 text-sm font-bold">
            Ouvrir mon compte client
          </Link>
        </div>
      </section>

      <section className="mt-20">
        <SectionHeading title="Enregistrement de l'Agent (le distributeur)" center />
        <StepList steps={AGENT_STEPS} />
        <div className="mt-6 text-center">
          <Link href="/inscription-agent" className="rounded-full border border-white/25 px-7 py-3.5 text-sm font-semibold hover:border-gold-400 hover:text-gold-400">
            Devenir Agent Africo
          </Link>
        </div>
      </section>

      <section className="mt-20">
        <SectionHeading title="Configuration du guichet (interface banque)" subtitle="Plus besoin de profils nominatifs pour les employés de banque : le système identifie directement le guichet de l'institution partenaire." center />
        <StepList steps={GUICHET_STEPS} />
        <div className="mt-6 text-center">
          <Link href="/guichet" className="rounded-full border border-white/25 px-7 py-3.5 text-sm font-semibold hover:border-gold-400 hover:text-gold-400">
            Accéder à l&apos;espace Guichet
          </Link>
        </div>
      </section>
    </div>
  );
}
