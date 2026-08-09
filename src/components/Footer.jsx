import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-blue-900 bg-blue-900 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 lg:grid-cols-4 lg:px-8">
        <div>
          <Image
            src="/images/logo.jpg"
            alt="Africo Cash"
            width={160}
            height={45}
            className="h-10 w-auto rounded-sm object-contain"
          />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-blue-100">
            Le portefeuille numérique d&apos;Africo Group : envoyez, retirez,
            convertissez et payez vos factures en toute confiance, partout en
            République Démocratique du Congo.
          </p>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-blue-200">
            Liens utiles
          </h4>
          <ul className="space-y-2 text-sm text-blue-100">
            <li><Link href="/a-propos" className="hover:text-white transition-colors">À propos</Link></li>
            <li><Link href="/services" className="hover:text-white transition-colors">Nos services</Link></li>
            <li><Link href="/comment-ca-marche" className="hover:text-white transition-colors">Comment ça marche</Link></li>
            <li><Link href="/agents" className="hover:text-white transition-colors">Devenir Agent Africo</Link></li>
            <li><Link href="/guichet" className="hover:text-white transition-colors">Espace Guichet Bancaire</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-blue-200">
            Services
          </h4>
          <ul className="space-y-2 text-sm text-blue-100">
            <li><Link href="/portefeuille" className="hover:text-white transition-colors">Portefeuille Africo Cash</Link></li>
            <li><Link href="/mobile-money" className="hover:text-white transition-colors">Mobile Money</Link></li>
            <li><Link href="/banques" className="hover:text-white transition-colors">Banques partenaires</Link></li>
            <li><Link href="/paiements" className="hover:text-white transition-colors">Paiement de factures</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-blue-200">
            Contact
          </h4>
          <ul className="space-y-2 text-sm text-blue-100">
            <li>+243 970 000 000 (RDC)</li>
            <li>contact@africocash.cd</li>
            <li>Goma, Nord-Kivu, RDC</li>
            <li>Kinshasa, Gombe, RDC</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-blue-800 px-5 py-6 flex flex-col sm:flex-row items-center justify-between text-xs text-blue-200 lg:px-8">
        <p>© {new Date().getFullYear()} Africo Cash — Une marque d&apos;Africo Group. Tous droits réservés.</p>
      </div>
    </footer>
  );
}
