import { getBrands } from "@/lib/api/queries";
import type { Brand } from "@/lib/api/types";

/** A brand with a logo — the only kind that belongs in a logo strip. */
type BrandWithLogo = Brand & { image_url: string };

/**
 * Homepage strip of partner-brand logos that scrolls continuously left → right.
 *
 * Brands are managed in the admin (name, logo, order, visibility); the API
 * returns only the active ones, already ordered by display_order. The animation
 * is pure CSS (see `.brand-marquee-*` in globals.css): the list is rendered
 * twice so the track can loop seamlessly.
 */
export async function BrandMarquee() {
  const brands = await getBrands();
  const logos = brands.filter(
    (brand): brand is BrandWithLogo => Boolean(brand.image_url),
  );
  if (logos.length === 0) return null;

  // Two identical halves: as the first scrolls out, the second takes its place,
  // so the reset is invisible. The second half is decorative (aria-hidden).
  const loop = [...logos, ...logos];

  return (
    <section className="border-t border-line py-12">
      <p className="mb-8 text-center text-xs font-semibold uppercase tracking-widest text-accent-ink">
        Marcas que trabalhamos
      </p>

      {/* `group` lets the track pause on hover; the edge mask fades logos in and
          out instead of hard-cutting them at the container edges. */}
      <div className="brand-marquee group relative overflow-hidden">
        <ul className="brand-marquee-track flex items-center gap-12">
          {loop.map((brand, i) => {
            const isDuplicate = i >= logos.length;
            return (
              <li
                key={`${brand.id}-${i}`}
                aria-hidden={isDuplicate}
                className="flex h-12 w-36 shrink-0 items-center justify-center md:h-16 md:w-48"
              >
                {/* Remote logo served from the bucket — a plain <img>, like the
                    store and employee photos elsewhere in the admin. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={brand.image_url}
                  alt={isDuplicate ? "" : brand.name}
                  className="max-h-full max-w-full object-contain"
                />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
