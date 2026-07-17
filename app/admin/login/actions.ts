"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api/client";
import { ADMIN_HOME, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth";

export type LoginState = { error?: string };

/**
 * Exchanges the credentials for a JWT and stores it in an httpOnly cookie.
 *
 * This runs on the server, so the password never reaches the API from the
 * browser directly and the token never touches client-side JavaScript.
 */
export async function login(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Preencha o email e a palavra-passe." };
  }

  let token: string;
  try {
    const data = await apiFetch<{ access_token: string; token_type: string }>(
      "/auth/login",
      {
        method: "POST",
        // The API's login is an OAuth2 password form, not JSON — and it calls
        // the email field `username`.
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username: email, password }).toString(),
      },
    );
    token = data.access_token;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return { error: "Email ou palavra-passe incorretos." };
    }
    return { error: "Não foi possível iniciar sessão. Tente novamente." };
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true, // unreadable by browser JavaScript
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: "lax", // not sent on cross-site requests
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  // Outside the try/catch: redirect() works by throwing, so catching it here
  // would swallow the navigation.
  redirect(ADMIN_HOME);
}
