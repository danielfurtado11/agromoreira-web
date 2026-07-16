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
          className="group relative hidden shrink-0 text-sm font-semibold text-primary sm:inline-block"
        >
          {link.label}
          {/* Underline bar that grows from left to right on hover, hinting the
              link is clickable (replaces the old arrow). */}
          <span className="absolute -bottom-1 left-0 h-0.5 w-0 rounded-full bg-primary transition-all duration-300 group-hover:w-full" />
        </Link>
      )}
    </header>
  );
}
