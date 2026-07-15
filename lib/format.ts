// Formatting helpers for user-facing values.

/**
 * Formats a decimal string (e.g. "18.90") as EUR using Portuguese conventions,
 * producing "18,90 €". Prices arrive from the API as strings because the
 * backend stores them as Decimal, which JSON serialises as text.
 */
export function formatPrice(value: string): string {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(Number(value));
}

/** Formats an ISO date string as "15 de julho de 2026". */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-PT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}
