import { getAboutUs, getStores } from "@/lib/api/queries";

// Opening hours come from a JSON object, whose key order is not guaranteed.
// This keeps the days in the natural Monday-to-Sunday order.
const WEEKDAY_ORDER = [
  "segunda",
  "terça",
  "quarta",
  "quinta",
  "sexta",
  "sábado",
  "domingo",
];

function sortByWeekday(entries: [string, unknown][]): [string, unknown][] {
  const rank = (day: string) => {
    const index = WEEKDAY_ORDER.indexOf(day.toLowerCase());
    return index === -1 ? WEEKDAY_ORDER.length : index;
  };
  return [...entries].sort(([a], [b]) => rank(a) - rank(b));
}

/**
 * Site footer. Fetches the stores (address + opening hours) and the "about us"
 * record (contacts) on the server, so every page shows up-to-date store info.
 */
export async function Footer() {
  const [stores, about] = await Promise.all([getStores(), getAboutUs()]);

  return (
    <footer className="mt-16 border-t border-line bg-mist">
      <div className="mx-auto grid w-full max-w-[1440px] gap-8 px-6 py-12 md:grid-cols-4">
        <div>
          <p className="text-lg font-bold text-primary">
            AgroMoreira&apos;s · AgroFontaínhas
          </p>
          <p className="mt-2 max-w-xs text-sm text-ink-soft">
            Agricultura, ferragens, rações e produtos de limpeza. Empresa
            familiar ao serviço da região há mais de 30 anos.
          </p>
        </div>

        {stores.map((store) => (
          <div key={store.id}>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-ink-soft">
              {store.name}
            </h3>
            <p className="mt-2 text-sm">{store.address}</p>
            {store.opening_hours && (
              <dl className="mt-2 space-y-0.5 text-sm text-ink-soft">
                {sortByWeekday(Object.entries(store.opening_hours)).map(
                  ([day, hours]) => (
                  <div key={day} className="flex justify-between gap-3">
                    <dt className="capitalize">{day}</dt>
                    <dd className="tabular-nums">{String(hours)}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        ))}

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-ink-soft">
            Contactos
          </h3>
          <ul className="mt-2 space-y-1 text-sm">
            {about.email && (
              <li>
                <a
                  href={`mailto:${about.email}`}
                  className="transition hover:text-primary"
                >
                  {about.email}
                </a>
              </li>
            )}
            {about.facebook_url && (
              <li>
                <a
                  href={about.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-primary"
                >
                  Facebook
                </a>
              </li>
            )}
            {about.instagram_url && (
              <li>
                <a
                  href={about.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-primary"
                >
                  Instagram
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col justify-between gap-2 px-6 py-4 text-xs text-ink-soft sm:flex-row">
          <span>
            © {new Date().getFullYear()} AgroMoreira&apos;s · AgroFontaínhas
          </span>
          <span>Moreira · Portugal</span>
        </div>
      </div>
    </footer>
  );
}
