import Link from "next/link";

// Sections of the panel, in dependency order: categories and units must exist
// before a product can be created, and a store before an employee.
const SECTIONS = [
  { href: "/admin", label: "Início" },
  { href: "/admin/categorias", label: "Categorias" },
  { href: "/admin/unidades", label: "Unidades" },
  { href: "/admin/produtos", label: "Produtos" },
  { href: "/admin/lojas", label: "Lojas" },
  { href: "/admin/funcionarios", label: "Funcionários" },
  { href: "/admin/novidades", label: "Novidades" },
  { href: "/admin/anuncios", label: "Anúncios" },
  { href: "/admin/marcas", label: "Marcas" },
  { href: "/admin/sobre", label: "Sobre" },
];

/**
 * Shell for the signed-in panel. Lives in a `(panel)` route group so the login
 * page — which must not show this navigation — stays outside it, without any
 * of these paths changing.
 */
export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-6 py-10">
      <nav className="flex flex-wrap gap-2 border-b border-line pb-4">
        {SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="rounded-full px-3 py-1.5 text-sm font-medium text-ink-soft transition hover:bg-mist hover:text-ink"
          >
            {section.label}
          </Link>
        ))}
      </nav>

      <div className="pt-8">{children}</div>
    </div>
  );
}
