// Opening hours arrive from the API as a JSON object, whose key order is not
// guaranteed. These helpers keep the days in the natural Monday-to-Sunday
// order wherever hours are listed (footer, about page, ...).

/** Weekday keys in display order — also the fields of the admin hours form. */
export const WEEKDAY_ORDER = [
  "segunda",
  "terça",
  "quarta",
  "quinta",
  "sexta",
  "sábado",
  "domingo",
] as const;

/** Sorts `Object.entries(opening_hours)` into Monday-to-Sunday order. */
export function sortByWeekday(
  entries: [string, unknown][],
): [string, unknown][] {
  const rank = (day: string) => {
    // Widened to string[]: indexOf on the `as const` tuple would only accept
    // the seven exact literals, but `day` is whatever the API sent.
    const index = (WEEKDAY_ORDER as readonly string[]).indexOf(
      day.toLowerCase(),
    );
    return index === -1 ? WEEKDAY_ORDER.length : index;
  };
  return [...entries].sort(([a], [b]) => rank(a) - rank(b));
}
