"use client";

import { useState, type ReactNode } from "react";
import type { Category } from "@/lib/api/types";
import { CategorySidebar } from "./CategorySidebar";

/**
 * Client shell for the catalogue: holds the sidebar open/closed state. The
 * sidebar starts open on every visit (no persistence). It is collapsed from a
 * button inside its own header, and re-opened from a small tab that clings to
 * the viewport's left edge while collapsed.
 *
 * The product area is a CSS container (`@container`), and the grid inside it
 * (passed as `children`) uses container-query column counts. So collapsing
 * the sidebar widens this area and the grid gains columns automatically —
 * no JS wiring between the toggle and the grid is needed.
 */
export function CatalogueView({
  categories,
  activeCategory,
  title,
  children,
}: {
  categories: Category[];
  /** Raw `?categoria=` value: a numeric id, a virtual slug, or undefined. */
  activeCategory?: string;
  title: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex flex-1 items-stretch">
      {open ? (
        <CategorySidebar
          categories={categories}
          activeCategory={activeCategory}
          onCollapse={() => setOpen(false)}
        />
      ) : (
        // Collapsed: a tab hugging the left edge (no left border, rounded only
        // on the right + a soft shadow) so it looks like it peeks out from the
        // screen edge. Sticky, so it stays reachable while scrolling.
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Mostrar categorias"
          aria-expanded={false}
          className="sticky top-[var(--catalogue-offset)] z-10 flex h-11 w-9 shrink-0 items-center justify-center self-start rounded-r-lg border border-l-0 border-line bg-white text-ink-soft shadow-md transition hover:text-primary"
        >
          <MenuIcon />
        </button>
      )}

      <main className="@container flex-1 px-6 py-10">
        <h1 className="text-3xl font-bold">{title}</h1>
        <div className="mt-8">{children}</div>
      </main>
    </div>
  );
}

/** Three-line "menu" glyph, shown on the collapsed re-open tab. */
function MenuIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </svg>
  );
}
