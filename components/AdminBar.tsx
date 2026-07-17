import { cookies } from "next/headers";
import { logout } from "@/app/admin/actions";
import { SESSION_COOKIE } from "@/lib/auth";

/**
 * A thin bar shown above the site while an admin is signed in, so it is always
 * obvious you are not browsing as a customer. Renders nothing for visitors —
 * signed out, it is not even present in the HTML.
 *
 * It sits *outside* the shop's chrome on purpose: dark, and with shortcuts
 * rather than shop navigation, so it reads as a tool. The rest of the page is
 * left untouched, so an admin still sees exactly what customers see.
 *
 * Sticky, at a fixed h-9 (36px), so it stays visible above the shop's own
 * sticky header while scrolling. Header.tsx offsets itself below this height
 * when signed in, and the catalogue's `--catalogue-offset` CSS variable (set
 * in app/layout.tsx) adds it on top of the header height for anything that
 * pins itself below the header.
 */
export async function AdminBar() {
  const cookieStore = await cookies();
  if (!cookieStore.get(SESSION_COOKIE)) return null;

  return (
    <div className="sticky top-0 z-40 bg-ink text-white">
      <div className="mx-auto flex h-9 w-full max-w-[1800px] items-center justify-between gap-2 px-6 text-xs">
        <span className="flex items-center gap-2 font-semibold uppercase tracking-widest">
          <span
            className="h-1.5 w-1.5 rounded-full bg-accent"
            aria-hidden="true"
          />
          Modo administrador
        </span>

        <form action={logout}>
          <button
            type="submit"
            className="font-medium text-white/70 transition hover:text-white"
          >
            Terminar sessão
          </button>
        </form>
      </div>
    </div>
  );
}
