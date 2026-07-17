import Link from "next/link";

/**
 * An "add new" tile shown to signed-in admins at the start of a grid, linking
 * to the panel form that creates the item.
 *
 * Styled deliberately unlike the real cards — white, with a dashed green
 * outline instead of a solid fill — so it reads as a control rather than as
 * content a customer could click. Visitors never see it: the pages only render
 * it when `isAdmin()` is true.
 */
export function AddCard({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/40 bg-white p-6 text-center transition hover:-translate-y-1 hover:border-primary"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-primary/40 text-primary transition group-hover:border-primary">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </span>
      <span className="text-sm font-semibold text-primary">{label}</span>
    </Link>
  );
}
