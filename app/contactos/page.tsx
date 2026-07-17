// Contacts page: how to reach the business — email/social, the stores
// (address, hours and a link to open the address in Google Maps) and each
// staff member's phone. Read-only: there is no contact form, so no backend
// endpoint is involved.
import type { Metadata } from "next";
import { getAboutUs, getEmployees, getStores } from "@/lib/api/queries";
import type { Store } from "@/lib/api/types";
import { sortByWeekday } from "@/lib/opening-hours";
import { ContactPill } from "@/components/ContactPill";
import { SectionHeading } from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "Contactos · AgroMoreira's",
};

/** Opens the address in Google Maps — a plain link, so the page stays free of
 *  Google's embed scripts and needs no API key. */
function googleMapsUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    address,
  )}`;
}

export default async function ContactosPage() {
  const [about, employees, stores] = await Promise.all([
    getAboutUs(),
    getEmployees(),
    getStores(),
  ]);

  const hasContacts = Boolean(
    about && (about.email || about.facebook_url || about.instagram_url),
  );

  return (
    <div className="mx-auto w-full max-w-[1100px] px-6 py-12">
      <h1 className="text-3xl font-bold">Contactos</h1>
      <p className="mt-2 text-ink-soft">
        Fale connosco ou visite-nos numa das nossas lojas.
      </p>

      {about && hasContacts && (
        <div className="mt-6 flex flex-wrap gap-3">
          {about.email && (
            <ContactPill href={`mailto:${about.email}`}>
              {about.email}
            </ContactPill>
          )}
          {about.facebook_url && (
            <ContactPill href={about.facebook_url} external>
              Facebook
            </ContactPill>
          )}
          {about.instagram_url && (
            <ContactPill href={about.instagram_url} external>
              Instagram
            </ContactPill>
          )}
        </div>
      )}

      {/* The catalogue has no cart or checkout, so spell out how ordering
          actually works instead of leaving visitors hunting for a buy button. */}
      <div className="mt-8 rounded-2xl border border-accent/40 bg-accent-soft p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-base font-bold text-accent-ink">
          <BagIcon />
          Encomendas
        </h2>
        <p className="mt-2 max-w-[70ch] text-sm leading-relaxed text-accent-ink">
          Para encomendar qualquer produto do catálogo, contacte-nos por
          telefone ou email — pode falar diretamente com um dos nossos
          funcionários, aqui em baixo. Preparamos a encomenda e avisamos assim
          que estiver pronta para levantar na loja.
        </p>
      </div>

      {stores.length > 0 && (
        <section className="mt-12 border-t border-line pt-10">
          <SectionHeading eyebrow="Lojas" title="Onde nos encontra" />
          <div className="grid gap-6 sm:grid-cols-2">
            {stores.map((store) => (
              <StoreContactCard key={store.id} store={store} />
            ))}
          </div>
        </section>
      )}

      {employees.length > 0 && (
        <section className="mt-12 border-t border-line pt-10">
          <SectionHeading eyebrow="Equipa" title="Fale diretamente connosco" />
          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
            {employees.map((employee) => (
              <li
                key={employee.id}
                className="flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <div>
                  <p className="font-semibold">{employee.name}</p>
                  <p className="text-sm text-ink-soft">{employee.store.name}</p>
                </div>
                <a
                  href={`tel:${employee.contact.replace(/\s/g, "")}`}
                  className="text-sm font-semibold text-primary transition hover:text-primary-deep"
                >
                  {employee.contact}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function StoreContactCard({ store }: { store: Store }) {
  return (
    <article className="rounded-2xl border border-line bg-white p-5">
      <h2 className="text-lg font-bold">{store.name}</h2>
      <p className="mt-1 text-sm text-ink-soft">{store.address}</p>

      <a
        href={googleMapsUrl(store.address)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition hover:text-primary-deep"
      >
        <MapPinIcon />
        Ver no mapa
      </a>

      {store.opening_hours && (
        <dl className="mt-4 space-y-1 text-sm">
          {sortByWeekday(Object.entries(store.opening_hours)).map(
            ([day, hours]) => (
              <div
                key={day}
                className="flex justify-between gap-3 border-b border-line/60 py-1 last:border-0"
              >
                <dt className="capitalize text-ink-soft">{day}</dt>
                <dd className="font-medium tabular-nums">{String(hours)}</dd>
              </div>
            ),
          )}
        </dl>
      )}
    </article>
  );
}

function BagIcon() {
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
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
