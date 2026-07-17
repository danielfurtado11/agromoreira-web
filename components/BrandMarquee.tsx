import { readdirSync } from "node:fs";
import path from "node:path";
import Image from "next/image";

// Where the partner-brand logos live. Any image dropped in `public/brands/`
// is picked up automatically — no code change needed to add or remove a brand.
const BRANDS_DIR = path.join(process.cwd(), "public", "brands");
const IMAGE_RE = /\.(png|jpe?g|webp|avif|svg)$/i;

type Brand = { src: string; name: string };

/**
 * Lists the logo files in `public/brands/`, alphabetically. Runs on the server.
 * If the folder is missing (none added yet), returns an empty list instead of
 * throwing, so the section simply doesn't render until there are brands.
 */
function getBrands(): Brand[] {
  try {
    return readdirSync(BRANDS_DIR)
      .filter((file) => IMAGE_RE.test(file))
      .sort((a, b) => a.localeCompare(b))
      .map((file) => ({
        src: `/brands/${file}`,
        // Filename → readable alt text: "fitofor-pro.png" → "fitofor pro".
        name: file.replace(IMAGE_RE, "").replace(/[-_]+/g, " ").trim(),
      }));
  } catch {
    return [];
  }
}

/**
 * Homepage strip of partner-brand logos that scrolls continuously left → right.
 * The animation is pure CSS (see `.brand-marquee-*` in globals.css): the list
 * is rendered twice so the track can loop seamlessly.
 */
export function BrandMarquee() {
  const brands = getBrands();
  if (brands.length === 0) return null;

  // Two identical halves: as the first scrolls out, the second takes its place,
  // so the reset is invisible. The second half is decorative (aria-hidden).
  const loop = [...brands, ...brands];

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
            const isDuplicate = i >= brands.length;
            return (
              <li
                key={`${brand.src}-${i}`}
                aria-hidden={isDuplicate}
                className="relative h-12 w-36 shrink-0 md:h-16 md:w-48"
              >
                <Image
                  src={brand.src}
                  alt={isDuplicate ? "" : brand.name}
                  fill
                  sizes="192px"
                  // Logos are tiny static assets; skip the optimizer so every
                  // format (incl. SVG) is served as-is on any host.
                  unoptimized
                  className="object-contain"
                />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
