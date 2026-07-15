// Temporary Phase 1 verification page.
// It is a Server Component (async): the fetch runs on the Next server, which
// calls the API. This is replaced by the real homepage in Phase 2.
import { getCategories, getProducts } from "@/lib/api/queries";

export default async function Home() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-4xl font-bold tracking-tight">Agromoreira</h1>
      <p className="text-lg text-zinc-600 dark:text-zinc-400">
        Ligação à API a funcionar 🎉
      </p>
      <p className="text-sm text-zinc-500">
        {products.length} produtos · {categories.length} categorias vindos de{" "}
        {process.env.NEXT_PUBLIC_API_URL}
      </p>
    </main>
  );
}
