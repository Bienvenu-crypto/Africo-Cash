"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/a-propos", label: "À propos" },
  { href: "/services", label: "Services" },
  { href: "/comment-ca-marche", label: "Comment ça marche" },
  { href: "/agents", label: "Devenir Agent" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/logo.jpg"
            alt="Africo Cash by Africo Group"
            width={170}
            height={48}
            className="h-10 w-auto rounded-sm object-contain"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {LINKS.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`nav-link text-sm font-medium ${active ? "active" : "text-black"}`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/portefeuille"
            className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-black transition hover:border-green-400 hover:text-green-400"
          >
            Mon Portefeuille
          </Link>
          <Link
            href="/inscription"
            className="btn-gold rounded-full px-5 py-2 text-sm shadow-lg transition"
          >
            Ouvrir un compte
          </Link>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-black lg:hidden hover:border-green-400 hover:text-green-400 transition-colors"
          aria-label="Menu"
        >
          <span className="text-xl">{open ? "✕" : "☰"}</span>
        </button>
      </div>

      {open && (
        <div className="border-t border-gray-200 bg-white px-5 pb-5 lg:hidden">
          <nav className="flex flex-col gap-4 pt-4">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`nav-link block py-2 text-sm font-medium ${pathname === l.href ? "active" : "text-black"}`}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/portefeuille"
              onClick={() => setOpen(false)}
              className="rounded-full border border-gray-300 text-black px-4 py-2 text-center text-sm font-semibold hover:border-green-400 hover:text-green-400 transition-colors"
            >
              Mon Portefeuille
            </Link>
            <Link
              href="/inscription"
              onClick={() => setOpen(false)}
              className="btn-gold rounded-full px-5 py-2 text-center text-sm"
            >
              Ouvrir un compte
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
