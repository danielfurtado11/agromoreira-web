import { logout } from "@/app/admin/actions";
import Link from "next/link";

const QUICK_START = [
  {
    title: "Comece pela base",
    text: "Confirme categorias e unidades antes de criar produtos. Isso evita ajustes repetidos mais tarde.",
  },
  {
    title: "Depois publique o catálogo",
    text: "Adicione produtos, imagens e descrições com calma. Um registo completo facilita a navegação no site.",
  },
  {
    title: "Mantenha o resto atualizado",
    text: "Use as áreas de lojas, funcionários, novidades e sobre para manter a informação visível e coerente.",
  },
];

const SHORTCUTS = [
  { href: "/admin/categorias", label: "Gerir categorias" },
  { href: "/admin/unidades", label: "Gerir unidades" },
  { href: "/admin/produtos", label: "Gerir produtos" },
  { href: "/admin/novidades", label: "Publicar novidades" },
];

export default function AdminPage() {
  return (
    <div className="mx-auto w-full max-w-[1100px] px-6 py-12">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold">Administração</h1>
          <p className="mt-4 text-ink-soft">
            Sessão iniciada. Use este espaço para manter o conteúdo do site
            organizado, atualizado e consistente antes de publicar novas
            informações.
          </p>
        </div>

        <form action={logout}>
          <button
            type="submit"
            className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink-soft transition hover:border-primary hover:text-primary"
          >
            Terminar sessão
          </button>
        </form>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {QUICK_START.map((item) => (
          <section
            key={item.title}
            className="rounded-3xl border border-line bg-white p-5 shadow-sm"
          >
            <h2 className="text-base font-semibold">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-ink-soft">{item.text}</p>
          </section>
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-line bg-mist/40 p-6">
          <h2 className="text-lg font-semibold">Ordem recomendada</h2>
          <ol className="mt-4 space-y-3 text-sm leading-6 text-ink-soft">
            <li>1. Configure categorias e unidades.</li>
            <li>2. Adicione ou atualize produtos com imagens e detalhes.</li>
            <li>3. Revise lojas, funcionários, novidades e a página sobre.</li>
          </ol>
        </section>

        <section className="rounded-3xl border border-line bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Atalhos rápidos</h2>
          <div className="mt-4 space-y-3">
            {SHORTCUTS.map((shortcut) => (
              <Link
                key={shortcut.href}
                href={shortcut.href}
                className="block rounded-2xl border border-line px-4 py-3 text-sm font-medium text-ink-soft transition hover:border-primary hover:text-primary"
              >
                {shortcut.label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
