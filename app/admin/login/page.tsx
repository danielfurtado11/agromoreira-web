import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="mx-auto w-full max-w-md px-6 py-16">
      <h1 className="text-2xl font-bold">Área de administração</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Inicie sessão para gerir o conteúdo do site.
      </p>
      <LoginForm />
    </div>
  );
}
