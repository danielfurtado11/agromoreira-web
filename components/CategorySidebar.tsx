"use client";

import Link from "next/link";
import type { Category } from "@/lib/api/types";
import { VIRTUAL_CATEGORIES } from "@/lib/virtual-categories";

/**
 * Left sidebar for the catalogue, flush against the viewport's left edge.
 * Rendered only while open — the collapse control lives here, to the right of
 * the "Categorias" heading; the button to re-open it lives in CatalogueView.
 *
 * The white bar stretches to full height (its right border reaches down to
 * the footer), while the category list inside is sticky and gets its own
 * scrollbar when it is taller than the screen — so a long list stays fully
 * reachable without scrolling the whole page.
 */
export function CategorySidebar({
  categories,
  activeCategory,
  onCollapse,
}: {
  categories: Category[];
  /** Raw `?categoria=` value: a numeric id, a virtual slug, or undefined. */
  activeCategory?: string;
  onCollapse: () => void;
}) {
  return (
    <aside className="w-56 shrink-0 self-stretch border-r border-line bg-white md:w-64">
      {/* `top`/`max-h` offset = `--catalogue-offset` (set in app/layout.tsx):
          the sticky header's height, plus the admin bar's when signed in —
          so the pinned list sits just below them and can scroll internally
          down to the bottom of the viewport. */}
      <div className="sticky top-[var(--catalogue-offset)] max-h-[calc(100vh-var(--catalogue-offset))] overflow-y-auto px-4 py-8">
        <div className="flex items-center justify-between gap-2 px-2">
          <h2 className="text-xs font-bold uppercase tracking-widest text-ink-soft">
            Categorias
          </h2>
          <button
            type="button"
            onClick={onCollapse}
            aria-label="Esconder categorias"
            className="-mr-1 rounded p-1 text-ink-soft transition hover:text-primary"
          >
            <CollapseIcon />
          </button>
        </div>

        <nav className="mt-3 flex flex-col gap-0.5">
          <CategoryLink
            href="/produtos"
            label="Todos"
            active={!activeCategory}
          />
          {/* Fixed collections first, then the real categories after a rule. */}
          {VIRTUAL_CATEGORIES.map((virtual) => (
            <CategoryLink
              key={virtual.slug}
              href={`/produtos?categoria=${virtual.slug}`}
              label={virtual.name}
              active={activeCategory === virtual.slug}
            />
          ))}
          {categories.length > 0 && (
            <div className="my-1 border-t border-line" />
          )}
          {categories.map((category) => (
            <CategoryLink
              key={category.id}
              href={`/produtos?categoria=${category.id}`}
              label={category.name}
              active={String(category.id) === activeCategory}
            />
          ))}
        </nav>
      </div>
    </aside>
  );
}

function CategoryLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-md px-3 py-2.5 text-sm font-medium transition ${
        active
          ? "bg-accent-soft text-accent-ink"
          : "text-ink-soft hover:bg-mist hover:text-ink"
      }`}
    >
      {label}
    </Link>
  );
}

/** Double chevron pointing left — "collapse the panel to the left". */
function CollapseIcon() {
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
      <path d="M11 17l-5-5 5-5" />
      <path d="M18 17l-5-5 5-5" />
    </svg>
  );
}
