"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

const INITIAL_STATE: LoginState = {};

const FIELD_CLASS =
  "mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-primary";

/**
 * The login form. A Client Component only because it needs the pending state
 * and the error message — the credentials themselves are handled by the
 * `login` Server Action.
 */
export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, INITIAL_STATE);

  return (
    <form action={formAction} className="mt-8 space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={FIELD_CLASS}
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Palavra-passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={FIELD_CLASS}
        />
      </div>

      {state.error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-deep disabled:opacity-60"
      >
        {pending ? "A entrar..." : "Entrar"}
      </button>
    </form>
  );
}
