// Opening hours arrive from the API as a JSON object, whose key order is not
// guaranteed. These helpers keep the days in the natural Monday-to-Sunday
// order wherever hours are listed (footer, about page, ...).

const WEEKDAY_ORDER = [
  "segunda",
  "terça",
  "quarta",
  "quinta",
  "sexta",
  "sábado",
  "domingo",
];

/** Sorts `Object.entries(opening_hours)` into Monday-to-Sunday order. */
export function sortByWeekday(
  entries: [string, unknown][],
): [string, unknown][] {
  const rank = (day: string) => {
    const index = WEEKDAY_ORDER.indexOf(day.toLowerCase());
    return index === -1 ? WEEKDAY_ORDER.length : index;
  };
  return [...entries].sort(([a], [b]) => rank(a) - rank(b));
}
