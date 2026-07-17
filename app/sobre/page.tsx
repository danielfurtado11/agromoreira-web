// "About us" page: the two brands, the story text (the only required field in
// the about_us record), an optional video, the team, and the stores.
// Everything except the text is optional in the API, so each block only
// renders when there is data for it — an admin filling this in later just
// makes more of the page appear.
import type { Metadata } from "next";
import Image from "next/image";
import { getAboutUs, getEmployees, getStores } from "@/lib/api/queries";
import type { Employee, Store } from "@/lib/api/types";
import { sortByWeekday } from "@/lib/opening-hours";
import { ContactPill } from "@/components/ContactPill";
import { SectionHeading } from "@/components/SectionHeading";
import { VideoEmbed } from "@/components/VideoEmbed";

export const metadata: Metadata = {
  title: "Sobre nós · AgroMoreira's",
};

export default async function SobrePage() {
  const [about, employees, stores] = await Promise.all([
    getAboutUs(),
    getEmployees(),
    getStores(),
  ]);

  const hasContacts = Boolean(
    about.email || about.facebook_url || about.instagram_url,
  );

  return (
    <div className="mx-auto w-full max-w-[1100px] px-6 py-12">
      <h1 className="sr-only">Sobre nós</h1>

      {/* The two brands, side by side — the page's hero, so they scale up with
          the screen. They wrap onto separate lines on narrow screens. */}
      <div className="flex flex-wrap items-center justify-center gap-10 sm:gap-16">
        <div className="relative h-28 w-72 sm:h-36 sm:w-96 lg:h-44 lg:w-[28rem]">
          <Image
            src="/logos/logo_1.png"
            alt="AgroMoreira's"
            fill
            sizes="(min-width: 1024px) 448px, (min-width: 640px) 384px, 288px"
            className="object-contain"
            priority
          />
        </div>
        <div className="relative h-28 w-72 sm:h-36 sm:w-96 lg:h-44 lg:w-[28rem]">
          <Image
            src="/logos/logo_2.png"
            alt="AgroFontaínhas"
            fill
            sizes="(min-width: 1024px) 448px, (min-width: 640px) 384px, 288px"
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* The story, spanning the page's full width. */}
      <div className="mt-10 whitespace-pre-line text-center text-lg leading-relaxed text-ink-soft">
        {about.text}
      </div>

      {about.video_url && (
        <div className="mx-auto mt-10 max-w-[820px]">
          <VideoEmbed
            url={about.video_url}
            title="Vídeo sobre a Agromoreira"
          />
        </div>
      )}

      {employees.length > 0 && (
        <section className="mt-16 border-t border-line pt-12">
          <SectionHeading eyebrow="Equipa" title="Quem o atende" />
          {/* Flex + justify-center keeps the team centred on the page whatever
              the head count — a fixed grid would left-align a partial row. */}
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-12">
            {employees.map((employee) => (
              <EmployeeCard key={employee.id} employee={employee} />
            ))}
          </div>
        </section>
      )}

      {stores.length > 0 && (
        <section className="mt-16 border-t border-line pt-12">
          <SectionHeading eyebrow="Lojas" title="Onde nos encontra" />
          <div className="grid gap-6 sm:grid-cols-2">
            {stores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        </section>
      )}

      {hasContacts && (
        <section className="mt-16 border-t border-line pt-12">
          <SectionHeading eyebrow="Contactos" title="Fale connosco" />
          <div className="flex flex-wrap gap-3">
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
        </section>
      )}
    </div>
  );
}

function EmployeeCard({ employee }: { employee: Employee }) {
  return (
    <article className="w-64 text-center">
      <div className="relative mx-auto aspect-square w-44 overflow-hidden rounded-full bg-mist">
        {employee.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={employee.image_url}
            alt={employee.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <PersonIcon />
          </div>
        )}
      </div>

      <h3 className="mt-5 text-lg font-bold leading-tight">{employee.name}</h3>
      {employee.description && (
        <p className="mt-1.5 text-sm text-ink-soft">{employee.description}</p>
      )}
      <a
        href={`tel:${employee.contact.replace(/\s/g, "")}`}
        className="mt-2 inline-block text-sm font-semibold text-primary transition hover:text-primary-deep"
      >
        {employee.contact}
      </a>
      <p className="mt-1 text-xs text-ink-soft">{employee.store.name}</p>
    </article>
  );
}

function StoreCard({ store }: { store: Store }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-line bg-white">
      <div className="relative aspect-video bg-mist">
        {store.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={store.image_url}
            alt={store.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <LeafIcon />
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold">{store.name}</h3>
        <p className="mt-1 text-sm text-ink-soft">{store.address}</p>

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
      </div>
    </article>
  );
}

function PersonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-1/3 text-primary/25"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-5 0-9 2.7-9 6v2h18v-2c0-3.3-4-6-9-6Z" />
    </svg>
  );
}

function LeafIcon() {
  return (
    <svg
      viewBox="0 0 100 100"
      className="w-1/5 text-primary/25"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M50 8C30 20 18 40 22 66c2 14 12 24 26 26 0-24-2-44-14-60 18 10 30 28 30 52 14-6 22-22 20-40C102 30 78 14 50 8Z" />
    </svg>
  );
}
