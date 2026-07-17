"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LOGIN_PATH, SESSION_COOKIE } from "@/lib/auth";

/** Signs out by dropping the session cookie. The API token simply expires. */
export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect(LOGIN_PATH);
}
