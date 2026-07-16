import type { ReactNode } from "react";

/**
 * A small outlined link for an email address or a social profile. Shared by
 * the about and contacts pages so both look the same.
 */
export function ContactPill({
  href,
  external,
  children,
}: {
  href: string;
  external?: boolean;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-primary transition hover:border-primary hover:bg-mist"
    >
      {children}
    </a>
  );
}
