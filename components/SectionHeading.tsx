import Link from "next/link";

/**
 * Reusable section header: a small eyebrow, a title, and an optional "see all"
 * link aligned to the right.
 */
export function SectionHeading({
  eyebrow,
  title,
  link,
}: {
  eyebrow: string;
  title: string;
  link?: { href: string; label: string };
}) {
  return (
    <header className="mb-8 flex items-end justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-accent-ink">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-3xl font-bold tracking-tight">{title}</h2>
      </div>

      {link && (
        <Link
          href={link.href}
          className="group hidden shrink-0 items-center gap-1 text-sm font-semibold text-primary sm:inline-flex"
        >
          {link.label}
          <span className="transition-transform group-hover:translate-x-1">
            →
          </span>
        </Link>
      )}
    </header>
  );
}
