/**
 * Marks a record hidden from the public site: an eye with a slash, matching
 * the icon used on the products list. The icon alone does not carry the
 * meaning — a native tooltip explains it on hover and the sr-only text keeps
 * it announced by screen readers.
 */
export function HiddenBadge() {
  return (
    <span
      title="Oculto — não aparece no site"
      className="flex h-5 w-5 items-center justify-center rounded-full bg-mist text-ink-soft"
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
      <span className="sr-only">Oculto</span>
    </span>
  );
}
