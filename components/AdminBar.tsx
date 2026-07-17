import Link from "next/link";
import { cookies } from "next/headers";
import { logout } from "@/app/admin/actions";
import { ADMIN_HOME, SESSION_COOKIE } from "@/lib/auth";

/**
 * A thin bar shown above the site while an admin is signed in, so it is always
 * obvious you are not browsing as a customer. Renders nothing for visitors —
 * signed out, it is not even present in the HTML.
 *
 * It sits *outside* the shop's chrome on purpose: dark, and with shortcuts
 * rather than shop navigation, so it reads as a tool. The rest of the page is
 * left untouched, so an admin still sees exactly what customers see.
 *
 * Not sticky, on purpose: a fixed bar would shift everything down and break
 * the catalogue sidebar's sticky offset, which is measured from the header.
 */
export async function AdminBar() {
  const cookieStore = await cookies();
  if (!cookieStore.get(SESSION_COOKIE)) return null;

  return (
    <div className="bg-ink text-white">
      <div className="mx-auto flex w-full max-w-[1800px] flex-wrap items-center justify-between gap-2 px-6 py-1.5 text-xs">
        <span className="flex items-center gap-2 font-semibold uppercase tracking-widest">
          <span
            className="h-1.5 w-1.5 rounded-full bg-accent"
            aria-hidden="true"
          />
          Modo administrador
        </span>

        <div className="flex items-center gap-4">
          <Link
            href={ADMIN_HOME}
            className="font-medium text-white/70 transition hover:text-white"
          >
            Painel
          </Link>
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
    </div>
  );
}
