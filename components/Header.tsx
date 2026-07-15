"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

// Public navigation links. "Contactos" is handled separately because it is
// styled as a button on desktop.
const NAV = [
  { href: "/", label: "Início" },
  { href: "/produtos", label: "Produtos" },
  { href: "/novidades", label: "Novidades" },
  { href: "/sobre", label: "Sobre" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 px-6 py-3">
        {/* Logo: crossfades between the company's two brands. Both images are
            marked decorative (alt="") since the link itself is labelled. */}
        <Link
          href="/"
          aria-label="AgroMoreira's e AgroFontaínhas — início"
          className="relative block h-12 w-36 shrink-0"
        >
          <Image
            src="/logos/logo_1.jpg"
            alt=""
            fill
            sizes="150px"
            className="object-contain object-left"
            priority
          />
          <Image
            src="/logos/logo_2.jpg"
            alt=""
            fill
            sizes="150px"
            className="logo-crossfade-top object-contain object-left"
            priority
          />
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-ink-soft transition hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/contactos"
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-deep"
          >
            Contactos
          </Link>
        </nav>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
          className="rounded-md p-2 text-ink transition hover:bg-mist md:hidden"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            {menuOpen ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile navigation */}
      {menuOpen && (
        <nav className="border-t border-line bg-white md:hidden">
          <ul className="mx-auto flex w-full max-w-[1440px] flex-col px-6 py-2">
            {[...NAV, { href: "/contactos", label: "Contactos" }].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="block py-2.5 text-sm font-medium text-ink-soft transition hover:text-primary"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
