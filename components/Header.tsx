"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ADMIN_HOME } from "@/lib/auth";

// Public navigation links. "Contactos" is handled separately because it is
// styled as a button on desktop.
const NAV = [
  { href: "/", label: "Início" },
  { href: "/produtos", label: "Produtos" },
  { href: "/novidades", label: "Novidades" },
  { href: "/sobre", label: "Sobre" },
];

type HeaderProps = {
  /** Whether the signed-in admin session cookie is present (checked server-side in layout.tsx, since it's httpOnly and unreadable here). */
  isAdmin?: boolean;
};

export function Header({ isAdmin = false }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navItems = isAdmin
    ? [...NAV, { href: ADMIN_HOME, label: "Administração" }]
    : NAV;

  return (
    // `top-9` matches the admin bar's h-9, so the two stack flush with no gap
    // or overlap while both are sticky.
    <header
      className={`sticky z-30 border-b border-line bg-white/85 backdrop-blur ${isAdmin ? "top-9" : "top-0"}`}
    >
      <div className="mx-auto flex w-full max-w-[1800px] items-center justify-between gap-4 px-6 py-3">
        {/* Logo: crossfades between the company's two brands. Both images are
            marked decorative (alt="") since the link itself is labelled. */}
        <Link
          href="/"
          aria-label="AgroMoreira's e AgroFontaínhas — início"
          className="relative block h-16 w-48 shrink-0"
        >
          <Image
            src="/logos/logo_1.png"
            alt=""
            fill
            sizes="200px"
            className="logo-a object-contain object-left"
            priority
          />
          <Image
            src="/logos/logo_2.png"
            alt=""
            fill
            sizes="200px"
            className="logo-b object-contain object-left"
            priority
          />
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative text-sm font-medium text-ink-soft transition hover:text-primary"
            >
              {item.label}
              {/* Underline bar that grows on hover — same effect as the
                  "see all" links. Contactos is excluded (it is a button). */}
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 rounded-full bg-primary transition-all duration-300 group-hover:w-full" />
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
          <ul className="mx-auto flex w-full max-w-[1800px] flex-col px-6 py-2">
            {[...navItems, { href: "/contactos", label: "Contactos" }].map((item) => (
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
