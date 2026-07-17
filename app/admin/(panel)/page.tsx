import { logout } from "@/app/admin/actions";

export default function AdminPage() {
  return (
    <div className="mx-auto w-full max-w-[1100px] px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Administração</h1>
        <form action={logout}>
          <button
            type="submit"
            className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink-soft transition hover:border-primary hover:text-primary"
          >
            Terminar sessão
          </button>
        </form>
      </div>

      <p className="mt-6 text-ink-soft">
        Sessão iniciada. A gestão de conteúdos é o passo seguinte.
      </p>
    </div>
  );
}
